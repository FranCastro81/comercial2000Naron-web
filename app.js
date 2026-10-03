import { shop, products, projects, money } from './catalog.js';
import { restoreCart } from './commerce.mjs';
import { escapeHTML, renderProductCards, renderProjectCards } from './storefront.mjs';

const $ = selector => document.querySelector(selector);
const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const storageKey = 'comerciial2000-cart-v1';
const checkoutStorageKey = 'comerciial2000-checkout-v1';
let cart = [];
try { cart = restoreCart(JSON.parse(localStorage.getItem(storageKey) || '[]')); } catch { /* El almacenamiento es opcional. */ }
let category = 'Todos';
let displayLimit = 12;
let activeProduct = null;
let toastTimer;
let checkoutSubmitting = false;
let status = { paymentReady: false, contactReady: false, demo: !shop.catalogReady };
const quantityLimit = product => Math.min(product.stock ?? 99, 99);
const requestJSON = (url, options = {}) => fetch(url, { ...options, signal: AbortSignal.timeout(15000) });
document.addEventListener('error', event => {
  const image = event.target;
  if (!(image instanceof HTMLImageElement) || image.src.endsWith('/assets/image-unavailable.svg')) return;
  image.src = '/assets/image-unavailable.svg';
}, true);
$('#product-grid').insertAdjacentHTML('afterend', '<div class="collection-more"><button class="button secondary" id="load-more">Ver más productos →</button></div>');

function notify(text) {
  $('#toast').textContent = text;
  $('#toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3500);
}
function showDialog(id) { closeMenu(); document.getElementById(id).showModal(); }
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.close).close()));
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
}));

function renderFilters() {
  $('#filters').innerHTML = ['Todos', ...new Set(products.map(product => product.category))].map(name => `<button data-category="${escapeHTML(name)}" class="${name === category ? 'active' : ''}" aria-pressed="${name === category}">${name === 'Todos' ? 'Todos los productos' : escapeHTML(name)}</button>`).join('');
}
function renderProducts() {
  const hasPrices = products.some(product => product.price !== null);
  $('#sort').querySelectorAll('option[value^="price-"]').forEach(option => { option.disabled = !hasPrices; });
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const query = normalize($('#search').value.trim());
  const visible = products.filter(product => (category === 'Todos' || product.category === category) && normalize(`${product.name} ${product.category} ${product.subtitle} ${product.description}`).includes(query));
  const sort = $('#sort').value;
  if (sort === 'price-asc' || sort === 'price-desc') visible.sort((a, b) => a.price === null ? (b.price === null ? 0 : 1) : b.price === null ? -1 : (sort === 'price-asc' ? a.price - b.price : b.price - a.price));
  if (sort === 'name') visible.sort((a, b) => a.name.localeCompare(b.name, shop.locale));
  $('#product-grid').innerHTML = renderProductCards(visible.slice(0, displayLimit));
  $('#results-count').textContent = `${Math.min(displayLimit, visible.length)} de ${visible.length} ${visible.length === 1 ? 'producto' : 'productos'}`;
  $('#load-more').hidden = visible.length <= displayLimit;
  $('#load-more').textContent = `Ver más productos (${Math.max(0, visible.length - displayLimit)}) →`;
  $('#empty-state').hidden = visible.length > 0;
}
$('#filters').addEventListener('click', event => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  category = button.dataset.category;
  displayLimit = 12;
  renderFilters(); renderProducts();
  $('#filters').querySelectorAll('button').forEach(filter => { if (filter.dataset.category === category) filter.focus(); });
});
$('#search').addEventListener('input', () => { displayLimit = 12; renderProducts(); });
$('#sort').addEventListener('change', () => { displayLimit = 12; renderProducts(); });
$('#reset-filters').addEventListener('click', () => { category = 'Todos'; displayLimit = 12; $('#search').value = ''; renderFilters(); renderProducts(); $('#search').focus(); });
$('#load-more').addEventListener('click', () => { const previous = displayLimit; displayLimit += 12; renderProducts(); $('#product-grid').querySelectorAll('.product-image')[previous]?.focus(); });
document.querySelectorAll('[data-browse-category]').forEach(link => link.addEventListener('click', () => { category = link.dataset.browseCategory; displayLimit = 12; $('#search').value = ''; renderFilters(); renderProducts(); }));

function openProduct(id) {
  activeProduct = products.find(product => product.id === id);
  if (!activeProduct) return;
  const product = activeProduct;
  $('#product-detail').innerHTML = `<div class="product-detail-layout"><div><div class="detail-image ${product.thumbnailOriginal ? 'thumbnail-original' : ''}"><img id="detail-main-image" src="${escapeHTML(product.images[0])}" alt="${escapeHTML(product.imageLabels?.[0] || product.name)}"></div><p class="detail-caption" id="detail-caption">${escapeHTML(product.imageLabels?.[0] || product.name)}</p><div class="detail-thumbnails" role="group" aria-label="Fotografías de este producto">${product.images.map((image, index) => `<button data-image="${index}" class="${index === 0 ? 'active' : ''}" aria-pressed="${index === 0}" aria-label="Ver imagen ${index + 1}: ${escapeHTML(product.imageLabels?.[index] || product.name)}"><img src="${escapeHTML(index === 0 ? product.thumbnail || image : image)}" alt="" loading="lazy"></button>`).join('')}</div><a class="text-link detail-original" href="${escapeHTML(product.images[0])}" target="_blank" rel="noopener noreferrer">Abrir fotografía completa ↗</a></div><div class="detail-copy"><p class="product-category">${escapeHTML(product.category)}</p><h2 id="product-title">${escapeHTML(product.name)}</h2><p>${escapeHTML(product.description)}</p><div class="detail-price">${product.price === null ? 'Consultar precio' : money(product.price)}</div><dl class="detail-specs">${product.specs.map(([key, value]) => `<div><dt>${escapeHTML(key)}</dt><dd>${escapeHTML(value)}</dd></div>`).join('')}</dl><button class="button primary full-width" data-add="${product.id}">Añadir al carrito ${icon('cart')}</button><p>${status.demo ? 'Fotografías reales. Precio, variantes y disponibilidad por confirmar.' : 'Consulta las condiciones de envío y compra antes de realizar tu pedido.'}</p><a class="text-link" href="${escapeHTML(product.source)}" target="_blank" rel="noopener noreferrer">${escapeHTML(product.sourceLabel || 'Ver el perfil de la tienda')} ↗</a></div></div>`;
  const add = $('#product-detail [data-add]');
  add.disabled = product.stock === 0;
  if (add.disabled) add.textContent = 'Agotado · Consulta con la tienda';
  showDialog('product-dialog');
}
$('#product-detail').addEventListener('click', event => {
  const button = event.target.closest('[data-image]');
  if (!button || !activeProduct) return;
  const index = Number(button.dataset.image);
  $('#detail-main-image').src = activeProduct.images[index];
  $('#detail-main-image').alt = activeProduct.imageLabels?.[index] || `${activeProduct.name} · imagen ${index + 1}`;
  $('#detail-caption').textContent = $('#detail-main-image').alt;
  $('.detail-original').href = activeProduct.images[index];
  document.querySelectorAll('[data-image]').forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); });
});
document.addEventListener('click', event => {
  const detail = event.target.closest('[data-detail]');
  const add = event.target.closest('[data-add]');
  if (detail && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) { event.preventDefault(); openProduct(detail.dataset.detail); }
  if (add) addToCart(add.dataset.add);
});

function cartLines() { return cart.map(item => ({ ...item, product: products.find(product => product.id === item.id) })); }
function lineTotal(product, quantity) { return product.price === null ? null : product.price * quantity; }
function cartTotal() { return cartLines().some(item => item.product.price === null) ? null : cartLines().reduce((total, item) => total + item.quantity * item.product.price, 0); }
function persistCart() {
  try { localStorage.setItem(storageKey, JSON.stringify(cart)); } catch { /* Carrito en memoria si el navegador bloquea el almacenamiento. */ }
  renderCart();
}
function addToCart(id) {
  const product = products.find(product => product.id === id);
  if (!product) return;
  const existing = cart.find(item => item.id === id);
  if (product.stock === 0) return notify('Este producto está agotado. Consulta con la tienda.');
  if ((existing?.quantity || 0) >= quantityLimit(product)) return notify('Has alcanzado el límite de unidades de la selección.');
  if (existing) existing.quantity += 1; else cart.push({ id, quantity: 1 });
  persistCart(); notify(`${product.name} añadido al carrito.`);
}
function renderCart() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  $('#cart-count').textContent = count;
  $('#open-cart').setAttribute('aria-label', `Abrir carrito, ${count} artículos`);
  $('#cart-items').innerHTML = cart.length ? cartLines().map(({ product, quantity }) => `<article class="cart-item"><img src="${escapeHTML(product.thumbnail || product.images[0])}" alt="${escapeHTML(product.name)}" decoding="async"><div><h3>${escapeHTML(product.name)}</h3><p>${product.price === null ? 'Precio y disponibilidad a consultar' : `${money(product.price)} por unidad`}</p><div class="quantity-control"><button data-quantity="${product.id}" data-delta="-1" aria-label="Reducir cantidad de ${escapeHTML(product.name)}">−</button><span>${quantity}</span><button data-quantity="${product.id}" data-delta="1" aria-label="Aumentar cantidad de ${escapeHTML(product.name)}" ${quantity >= quantityLimit(product) ? 'disabled' : ''}>+</button></div></div><div class="cart-item-price">${money(lineTotal(product, quantity))}<button class="remove-item" data-remove="${product.id}" aria-label="Eliminar ${escapeHTML(product.name)} del carrito">Eliminar</button></div></article>`).join('') : '<div class="empty-state"><h3>Tu carrito está esperando.</h3><p>Explora el catálogo y añade tu primera selección.</p><button class="button secondary" id="cart-explore">Ver productos →</button></div>';
  $('#cart-summary').hidden = !cart.length;
  $('#cart-subtotal').textContent = money(cartTotal());
  $('#cart-copy').hidden = true;
  if (!cart.length) $('#cart-explore').addEventListener('click', () => { $('#cart-dialog').close(); location.hash = 'productos'; });
  if ($('#checkout-dialog').open) {
    renderCheckoutSummary();
    $('#checkout-status').textContent = 'La selección se ha actualizado desde otra pestaña. Revisa el resumen.';
  }
}
$('#open-cart').addEventListener('click', () => { renderCart(); showDialog('cart-dialog'); });
$('#cart-items').addEventListener('click', event => {
  const control = event.target.closest('[data-quantity]');
  const remove = event.target.closest('[data-remove]');
  if (!control && !remove) return;
  const id = control?.dataset.quantity || remove.dataset.remove;
  const item = cart.find(item => item.id === id);
  if (!item) return;
  if (remove) cart = cart.filter(item => item.id !== id);
  else {
    const product = products.find(product => product.id === id);
    item.quantity = Math.min(quantityLimit(product), item.quantity + Number(control.dataset.delta));
    if (!item.quantity) cart = cart.filter(item => item.id !== id);
  }
  persistCart();
  const next = [...$('#cart-items').querySelectorAll('[data-quantity]')].find(button => button.dataset.quantity === id && !button.disabled);
  (next || $('[data-close="cart-dialog"]')).focus();
});
async function copyText(text, fallback) {
  try { await navigator.clipboard.writeText(text); notify('Texto copiado. Puedes compartirlo con la empresa.'); }
  catch { fallback.hidden = false; fallback.value = text; fallback.focus(); fallback.select(); notify('Texto seleccionado. Usa Copiar o Ctrl/Cmd + C.'); }
}
function copySelection() {
  return copyText(`Hola, Comercial 2000 Narón. Me gustaría consultar por:\n\n${cartLines().map(({ product, quantity }) => `${quantity} × ${product.name}: ${money(lineTotal(product, quantity))}`).join('\n')}\n\nSubtotal: ${money(cartTotal())}\nPor favor, confirmad modelo, talla, precio, disponibilidad, impuestos y envío. Gracias.`, $('#cart-copy'));
}
$('#copy-cart').addEventListener('click', copySelection);

function renderCheckoutState() {
  $('.checkout-info').innerHTML = status.paymentReady
    ? '<strong>Checkout alojado por la pasarela</strong><p>El importe final y el envío se calculan en el servidor. Introducirás los datos de pago en la página de la pasarela.</p>'
    : '<strong>Precio y disponibilidad por confirmar</strong><p>Puedes copiar tu selección y compartirla con la tienda para confirmar modelos, tallas, precios y envío. Todavía no se realiza ningún cobro.</p>';
  $('#pay-button').textContent = status.paymentReady ? 'Ir al pago seguro →' : 'Copiar selección para consultar →';
  $('#checkout-button').textContent = status.paymentReady ? 'Continuar al checkout →' : 'Revisar selección y consultar →';
  $('#catalog-cta').firstChild.textContent = status.paymentReady ? 'Comprar ahora ' : 'Explorar productos ';
}

function renderCheckoutSummary() {
  $('#checkout-summary').innerHTML = cart.length
    ? cartLines().map(({ product, quantity }) => `<div class="checkout-line"><span>${quantity} × ${escapeHTML(product.name)}</span><strong>${money(lineTotal(product, quantity))}</strong></div>`).join('') + `<div class="checkout-total"><span>Subtotal</span><span>${money(cartTotal())}</span></div>`
    : '<p>Tu selección está vacía. Añade productos desde el catálogo.</p>';
  $('#pay-button').disabled = !cart.length || checkoutSubmitting;
}

$('#checkout-button').addEventListener('click', () => {
  if (!cart.length) return;
  $('#cart-dialog').close();
  renderCheckoutSummary();
  $('#checkout-status').textContent = '';
  renderCheckoutState();
  showDialog('checkout-dialog');
});
$('#pay-button').addEventListener('click', async () => {
  if (!cart.length || checkoutSubmitting) return;
  if (!status.paymentReady) {
    $('#checkout-dialog').close();
    $('#open-cart').click();
    return copySelection();
  }
  $('#pay-button').disabled = true;
  checkoutSubmitting = true;
  const submittedItems = cart.map(item => ({ ...item }));
  $('#checkout-status').textContent = 'Comprobando la configuración de pago…';
  try {
    const response = await requestJSON('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: submittedItems }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'No se ha podido iniciar el pago.');
    const url = new URL(data.url);
    if (url.protocol !== 'https:' || url.hostname !== 'checkout.stripe.com') throw new Error('La dirección de pago no es válida.');
    try { sessionStorage.setItem(checkoutStorageKey, JSON.stringify({ sessionId: data.sessionId, items: submittedItems })); } catch { /* Sin almacenamiento no se vaciará automáticamente el carrito. */ }
    location.assign(url.href);
  } catch (error) { $('#checkout-status').textContent = error.message; }
  finally { checkoutSubmitting = false; $('#pay-button').disabled = !cart.length; }
});

$('#open-account').addEventListener('click', () => {
  $('#info-title').textContent = 'Tu espacio.';
  $('#info-content').innerHTML = '<p>Puedes explorar la tienda y preparar tu compra como invitado. Tu carrito se conserva en este navegador cuando el almacenamiento local está disponible.</p><p>El registro de cuentas y el historial de pedidos todavía no están habilitados.</p><a href="#contacto" id="account-contact">Consultar con la empresa →</a>';
  $('#account-contact').addEventListener('click', () => $('#info-dialog').close());
  showDialog('info-dialog');
});
const legal = {
  legal: ['Aviso legal', 'Información pendiente de completar con la razón social, identificación fiscal, domicilio y datos del titular de Comercial 2000 Narón.'],
  privacy: ['Privacidad', 'Esta vista previa guarda únicamente la selección del carrito en el almacenamiento local del navegador. Las consultas se preparan en tu dispositivo. Si se configura el envío, se comunicarán al canal de la empresa. Las fuentes externas se cargan desde Google Fonts. La política definitiva deberá incluir el responsable, las finalidades, los plazos de conservación y el contacto para ejercer tus derechos.'],
  conditions: ['Condiciones de compra', 'Las fotografías se han importado del perfil público de la empresa. Los precios, variantes y existencias todavía no están confirmados y el pago online no está habilitado. Los impuestos, los gastos de envío, los plazos, las devoluciones y las garantías se publicarán con los datos facilitados por la tienda.']
};
document.querySelectorAll('[data-legal]').forEach(button => button.addEventListener('click', () => {
  const [title, text] = legal[button.dataset.legal];
  $('#info-title').textContent = title;
  $('#info-content').textContent = text;
  showDialog('info-dialog');
}));

$('#contact-form').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const payload = Object.fromEntries(new FormData(form));
  for (const key of ['name', 'email', 'message']) payload[key] = payload[key].trim();
  if (!payload.name || !payload.message) return notify('Completa tu nombre y tu consulta.');
  $('#contact-status').textContent = '';
  $('#contact-result').hidden = true;
  $('#contact-message').value = '';
  if (!status.contactReady) {
    $('#contact-result').hidden = false;
    $('#contact-message').value = `Hola, Comercial 2000 Narón.\nSoy ${payload.name}. Mi email es ${payload.email}.\n\n${payload.message}`;
    $('#contact-message').focus();
    $('#contact-status').textContent = 'Consulta preparada. Cópiala y compártela con la tienda; todavía no se ha enviado.';
    return;
  }
  $('#contact-submit').disabled = true;
  try {
    const response = await requestJSON('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'No se ha podido enviar la consulta.');
    $('#contact-status').textContent = 'Consulta enviada al canal de la empresa.';
    form.reset();
  } catch (error) { $('#contact-status').textContent = error.message; }
  finally { $('#contact-submit').disabled = false; }
});
$('#copy-contact').addEventListener('click', () => copyText($('#contact-message').value, $('#contact-message')));

const menuButton = $('#menu-toggle');
const navigation = $('#navigation');
function closeMenu() { navigation.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Abrir menú'); }
menuButton.addEventListener('click', () => { const open = navigation.classList.toggle('open'); menuButton.setAttribute('aria-expanded', String(open)); menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú'); });
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && navigation.classList.contains('open')) { closeMenu(); menuButton.focus(); } });
window.matchMedia('(min-width:1001px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
window.addEventListener('storage', event => {
  if (event.key !== storageKey && event.key !== null) return;
  try { cart = restoreCart(JSON.parse(event.newValue || '[]')); renderCart(); } catch { /* Ignorar datos no válidos. */ }
});
$('#year').textContent = new Date().getFullYear();
$('#hero-image').src = shop.heroImage;
$('#about-image').src = shop.aboutImage;
$('#work-grid').innerHTML = renderProjectCards(projects);
document.querySelectorAll('[data-detail], [data-project]').forEach(link => link.setAttribute('aria-haspopup', 'dialog'));
let activeProjectIndex = 0;
function renderProject(index) {
  activeProjectIndex = (index + projects.length) % projects.length;
  const project = projects[activeProjectIndex];
  $('#gallery-title').textContent = project.title;
  $('#gallery-label').textContent = project.label;
  $('#gallery-image').src = project.image;
  $('#gallery-image').alt = project.title;
  $('#gallery-count').textContent = `${activeProjectIndex + 1} / ${projects.length}`;
}
$('#work-grid').addEventListener('click', event => { const link = event.target.closest('[data-project]'); if (link && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) { event.preventDefault(); renderProject(Number(link.dataset.project)); showDialog('gallery-dialog'); } });
$('#gallery-prev').addEventListener('click', () => renderProject(activeProjectIndex - 1));
$('#gallery-next').addEventListener('click', () => renderProject(activeProjectIndex + 1));
document.addEventListener('keydown', event => { if (!$('#gallery-dialog').open) return; if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); renderProject(activeProjectIndex + (event.key === 'ArrowLeft' ? -1 : 1)); } });
$('#contact-phone').textContent = shop.phone || 'Por configurar';
$('#contact-address').textContent = shop.address || 'Por configurar';
$('#contact-hours').textContent = shop.hours || 'Por configurar';
if (shop.whatsapp && /^\d{8,15}$/.test(shop.whatsapp)) { $('#whatsapp-link').href = `https://wa.me/${shop.whatsapp}`; $('#whatsapp-link').hidden = false; $('#whatsapp-note').hidden = true; }
renderFilters(); renderProducts(); renderCart();
renderCheckoutState();
$('#contact-submit').disabled = false;
document.documentElement.classList.remove('no-js');
requestJSON('/api/status').then(response => { if (!response.ok) throw new Error('Estado no disponible.'); return response.json(); }).then(data => {
  status = data;
  $('#demo-banner').hidden = !data.demo;
    if (!data.demo) $('#catalog-note').textContent = 'Consulta el importe final, el envío y las condiciones de compra antes de pagar.';
  if (data.contactReady) { $('#contact-submit').innerHTML = 'Enviar consulta <span aria-hidden="true">↗</span>'; $('#contact-form .form-note').textContent = 'Tu consulta se enviará al canal de contacto configurado por la empresa. No incluyas datos de pago.'; }
  renderCheckoutState();
}).catch(() => { /* La vista previa sigue funcionando si la API no está disponible. */ });

const params = new URLSearchParams(location.search);
if (params.get('payment') === 'cancelled') notify('Pago cancelado. Tu carrito se conserva.');
if (params.get('payment') === 'success') {
  $('#info-title').textContent = 'Estado del pago';
  $('#info-content').textContent = 'Comprobando el pago con la pasarela…';
  showDialog('info-dialog');
  requestJSON(`/api/payment-status?session_id=${encodeURIComponent(params.get('session_id') || '')}`).then(async response => {
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'No se ha podido verificar el pago.');
    $('#info-content').textContent = data.paid ? 'La pasarela confirma el pago. Conserva el recibo enviado por la pasarela y contacta con la empresa para el seguimiento.' : 'El pago aún no figura como completado. Consulta el estado con la empresa.';
    if (data.paid) {
      let pending;
      try { pending = JSON.parse(sessionStorage.getItem(checkoutStorageKey) || 'null'); } catch { /* No asociar pagos sin referencia local válida. */ }
      if (pending?.sessionId === params.get('session_id') && JSON.stringify(pending.items) === JSON.stringify(cart)) {
        cart = []; persistCart();
        try { sessionStorage.removeItem(checkoutStorageKey); } catch { /* Almacenamiento opcional. */ }
      } else {
        $('#info-content').textContent += ' Tu selección actual se conserva porque no se ha podido asociar exactamente a esta sesión de pago.';
      }
    }
  }).catch(error => { $('#info-content').textContent = error.message; });
}
