import { products } from './catalog.js';

export function validateCart(items, catalogue = products, { requirePrices = false } = {}) {
  if (!Array.isArray(items) || !items.length || items.length > 100) throw new Error('El carrito está vacío o no es válido.');
  const quantities = new Map();
  for (const item of items) {
    if (!item || typeof item.id !== 'string' || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) throw new Error('Hay una cantidad no válida en el carrito.');
    quantities.set(item.id, (quantities.get(item.id) || 0) + item.quantity);
  }
  return [...quantities].map(([id, quantity]) => {
    const product = catalogue.find(product => product.id === id);
    if (!product) throw new Error('Un producto ya no está disponible.');
    if (quantity > Math.min(product.stock ?? 99, 99)) throw new Error(`La cantidad de ${product.name} supera el límite de selección o la disponibilidad del catálogo.`);
    if (requirePrices && (!Number.isSafeInteger(product.price) || product.price < 1 || !Number.isSafeInteger(product.stock))) throw new Error(`Falta confirmar el precio o las existencias de ${product.name}.`);
    return { product, quantity, total: product.price === null ? null : product.price * quantity };
  });
}

export function restoreCart(value, catalogue = products) {
  if (!Array.isArray(value)) return [];
  const clean = new Map();
  for (const item of value) {
    const product = catalogue.find(product => product.id === item?.id);
    if (!product || product.stock === 0 || !Number.isSafeInteger(item.quantity) || item.quantity < 1) continue;
    const limit = Math.min(product.stock ?? 99, 99);
    const previous = clean.get(product.id)?.quantity || 0;
    clean.set(product.id, { id: product.id, quantity: previous + Math.min(item.quantity, limit - previous) });
  }
  return [...clean.values()];
}
