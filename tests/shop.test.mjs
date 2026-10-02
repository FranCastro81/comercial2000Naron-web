import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCart, restoreCart } from '../commerce.mjs';
import { readFile } from 'node:fs/promises';
import { products, projects, shop } from '../catalog.js';
import { createServer } from '../server.mjs';

const pricedProducts = products.map((product, index) => ({ ...product, price: (index + 1) * 1500, stock: 8 }));

test('el servidor usa el precio del catálogo y agrupa cantidades duplicadas', () => {
  const lines = validateCart([{ id: products[0].id, quantity: 1, price: 1 }, { id: products[0].id, quantity: 2 }], pricedProducts, { requirePrices: true });
  assert.equal(lines.length, 1);
  assert.equal(lines[0].total, pricedProducts[0].price * 3);
});
test('rechaza referencias inexistentes, cantidades manipuladas y exceso de stock', () => {
  for (const items of [[], [{ id: 'inexistente', quantity: 1 }], [{ id: products[0].id, quantity: -1 }], [{ id: products[0].id, quantity: 1.5 }], [{ id: products[0].id, quantity: 9 }], [{ id: products[0].id, quantity: 5 }, { id: products[0].id, quantity: 5 }]]) assert.throws(() => validateCart(items, pricedProducts));
});
test('recupera un carrito sin conservar datos corruptos ni cantidades excesivas', () => {
  assert.deepEqual(restoreCart(null), []);
  const restored = restoreCart([{ id: 'desconocido', quantity: 1 }, { id: products[0].id, quantity: -5 }, { id: products[1].id, quantity: 999 }, { id: products[1].id, quantity: 1 }], pricedProducts);
  assert.deepEqual(restored, [{ id: products[1].id, quantity: pricedProducts[1].stock }]);
});
test('un precio desconocido no se convierte en cero ni permite cobrar', () => {
  const items = [{ id: products[0].id, quantity: 2 }];
  assert.equal(validateCart(items)[0].total, null);
  assert.throws(() => validateCart(items, products, { requirePrices: true }), /confirmar el precio/);
  assert.equal(restoreCart([{ id: products[0].id, quantity: 999 }])[0].quantity, 99);
});
test('descarta agotados al recuperar el carrito y limita a 99 incluso con existencias superiores', () => {
  const catalogue = [{ ...products[0], stock: 0 }, { ...products[1], stock: 500 }];
  assert.deepEqual(restoreCart([{ id: catalogue[0].id, quantity: 2 }, { id: catalogue[1].id, quantity: Number.MAX_SAFE_INTEGER }, { id: catalogue[1].id, quantity: Number.MAX_SAFE_INTEGER }], catalogue), [{ id: catalogue[1].id, quantity: 99 }]);
  assert.throws(() => validateCart([{ id: catalogue[1].id, quantity: 60 }, { id: catalogue[1].id, quantity: 60 }], catalogue), /límite de selección/);
});
test('HTML inicial contiene todo el catálogo y las rutas públicas permiten revalidar la caché', async t => {
  const server = createServer({ PUBLIC_URL: 'https://tienda.example' });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(base);
  const html = await response.text();
  assert.equal((html.match(/class="product-card"/g) || []).length, products.length);
  assert.match(html, /rel="canonical" href="https:\/\/tienda.example\/"/);
  for (const route of ['/', '/app.js', '/storefront.mjs', '/styles.css', '/assets/local-montura-negra.webp']) {
    const original = await fetch(base + route);
    const etag = original.headers.get('etag');
    assert.ok(etag);
    const cached = await fetch(base + route, { headers: { 'If-None-Match': etag } });
    assert.equal(cached.status, 304);
    assert.equal(await cached.text(), '');
    const head = await fetch(base + route, { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
    assert.equal(head.headers.get('content-length'), original.headers.get('content-length'));
  }
});
test('todas las fotografías del catálogo, galería y HTML se sirven como imágenes', async t => {
  const server = createServer({});
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const assets = new Set([shop.heroImage, shop.aboutImage, 'assets/image-unavailable.svg', ...products.flatMap(product => [product.thumbnail, ...product.images]), ...projects.flatMap(project => [project.image, project.thumbnail]), ...Array.from(html.matchAll(/src="(assets\/[^"<>]+)"/g), match => match[1])]);
  for (const asset of assets) {
    const response = await fetch(`${base}/${asset}`);
    assert.equal(response.status, 200, asset);
    assert.match(response.headers.get('content-type'), /^image\//, asset);
    assert.ok((await response.arrayBuffer()).byteLength > 0, asset);
  }
});
test('API: demo sin cobros, validación del carrito, contacto honesto y archivos privados protegidos', async t => {
  const server = createServer({});
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (route, data, headers = {}) => fetch(base + route, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(data) });
  const status = await (await fetch(base + '/api/status')).json();
  assert.equal(status.demo, true);
  assert.equal(status.paymentReady, false);
  const checkout = await post('/api/checkout', { items: [{ id: products[0].id, quantity: 1 }] });
  assert.equal(checkout.status, 503);
  assert.match((await checkout.json()).error, /ningún cobro/);
  assert.equal((await post('/api/checkout', { items: [{ id: 'fake', quantity: 1 }] })).status, 400);
  assert.equal((await post('/api/checkout', { items: [{ id: products[0].id, quantity: 1 }] }, { Origin: 'https://otra-web.example' })).status, 403);
  assert.equal((await post('/api/contact', { name: 'Ana', email: 'no válido', message: 'Hola' })).status, 400);
  assert.equal((await post('/api/contact', { name: 'Ana', email: 'ana@example.com', message: 'Consulta' })).status, 503);
  for (const file of ['/.env', '/server.mjs', '/package.json', '/tests/shop.test.mjs']) assert.equal((await fetch(base + file)).status, 404);
  for (const file of ['/', '/app.js', '/commerce.mjs', '/assets/instagram-botas.webp', '/assets/instagram-botas-detalle.webp', '/assets/instagram-equitacion.webp', '/assets/instagram-campo.webp', '/assets/instagram-01.jpg']) assert.equal((await fetch(base + file)).status, 200);
});
