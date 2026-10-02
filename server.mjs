import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { shop, products, projects } from './catalog.js';
import { validateCart } from './commerce.mjs';
import { renderProductCards, renderProjectCards, escapeHTML } from './storefront.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const staticFiles = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/styles.css', ['styles.css', 'text/css; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/catalog.js', ['catalog.js', 'text/javascript; charset=utf-8']],
  ['/commerce.mjs', ['commerce.mjs', 'text/javascript; charset=utf-8']],
  ['/storefront.mjs', ['storefront.mjs', 'text/javascript; charset=utf-8']]
]);
const send = (response, status, data) => {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(data));
};
const paymentReady = env => shop.catalogReady && products.every(product => Number.isSafeInteger(product.price) && product.price > 0 && Number.isSafeInteger(product.stock) && product.stock >= 0) && env.PAYMENT_PROVIDER === 'stripe' && Boolean(env.STRIPE_SECRET_KEY && env.PUBLIC_URL && /^\d+$/.test(env.SHIPPING_CENTS || '') && /^[A-Z]{2}(,[A-Z]{2})*$/.test(env.SHIPPING_COUNTRIES || ''));

async function readJSON(request) {
  if (!/^application\/json(?:;|$)/i.test(request.headers['content-type'] || '')) throw new Error('Se requiere contenido JSON.');
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 20000) throw new Error('La solicitud es demasiado grande.');
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new Error('La solicitud JSON no es válida.'); }
}

async function stripeRequest(endpoint, env, params) {
  const response = await fetch(`https://api.stripe.com/v1/${endpoint}`, {
    method: params ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, ...(params ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}) },
    body: params?.toString(), signal: AbortSignal.timeout(15000)
  });
  const data = await response.json();
  if (!response.ok) throw new Error('La pasarela no ha podido procesar la solicitud. Revisa su configuración.');
  return data;
}

export function createServer(env = process.env) {
  const requests = new Map();
  return http.createServer(async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'");
    const url = new URL(request.url, 'http://localhost');
    try {
      if (request.method === 'GET' && url.pathname === '/api/status') return send(response, 200, { paymentReady: paymentReady(env), contactReady: Boolean(env.CONTACT_WEBHOOK_URL), demo: !shop.catalogReady, currency: shop.currency });
      if (request.method === 'POST' && url.pathname.startsWith('/api/')) {
        const origin = request.headers.origin;
        const allowedOrigin = env.PUBLIC_URL ? new URL(env.PUBLIC_URL).origin : `http://${request.headers.host}`;
        if (origin && origin !== allowedOrigin) return send(response, 403, { error: 'Origen de la solicitud no permitido.' });
        const now = Date.now();
        for (const [key, value] of requests) if (value.until < now) requests.delete(key);
        const key = request.socket.remoteAddress;
        const quota = requests.get(key) || { count: 0, until: now + 60000 };
        quota.count += 1;
        requests.set(key, quota);
        if (quota.count > 30) return send(response, 429, { error: 'Demasiadas solicitudes. Inténtalo dentro de un minuto.' });
      }
      if (request.method === 'POST' && url.pathname === '/api/checkout') {
        const payload = await readJSON(request);
        let lines;
        try { lines = validateCart(payload?.items); }
        catch (error) { return send(response, 400, { error: error.message }); }
        if (!paymentReady(env)) return send(response, 503, { error: 'El pago aún no está habilitado: falta confirmar los precios, las existencias y la pasarela. No se ha realizado ningún cobro.' });
        try { lines = validateCart(payload.items, products, { requirePrices: true }); }
        catch (error) { return send(response, 400, { error: error.message }); }
        const base = new URL(env.PUBLIC_URL).origin;
        const params = new URLSearchParams({
          mode: 'payment', success_url: `${base}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${base}/?payment=cancelled`, billing_address_collection: 'required',
          'metadata[shop]': 'comerciial2000', 'payment_intent_data[metadata][shop]': 'comerciial2000'
        });
        lines.forEach(({ product, quantity }, index) => {
          const prefix = `line_items[${index}]`;
          params.set(`${prefix}[quantity]`, quantity);
          params.set(`${prefix}[price_data][currency]`, shop.currency.toLowerCase());
          params.set(`${prefix}[price_data][unit_amount]`, product.price);
          params.set(`${prefix}[price_data][product_data][name]`, product.name);
          params.set(`${prefix}[price_data][product_data][metadata][product_id]`, product.id);
        });
        env.SHIPPING_COUNTRIES.split(',').forEach((country, index) => params.set(`shipping_address_collection[allowed_countries][${index}]`, country));
        params.set('shipping_options[0][shipping_rate_data][type]', 'fixed_amount');
        params.set('shipping_options[0][shipping_rate_data][fixed_amount][amount]', env.SHIPPING_CENTS);
        params.set('shipping_options[0][shipping_rate_data][fixed_amount][currency]', shop.currency.toLowerCase());
        params.set('shipping_options[0][shipping_rate_data][display_name]', 'Envío');
        const session = await stripeRequest('checkout/sessions', env, params);
        return send(response, 200, { url: session.url, sessionId: session.id });
      }
      if (request.method === 'GET' && url.pathname === '/api/payment-status') {
        if (!paymentReady(env)) return send(response, 503, { error: 'La pasarela de pago no está configurada.' });
        const id = url.searchParams.get('session_id') || '';
        if (!/^cs_(?:test_|live_)?[A-Za-z0-9]{10,200}$/.test(id)) return send(response, 400, { error: 'La referencia de pago no es válida.' });
        const session = await stripeRequest(`checkout/sessions/${encodeURIComponent(id)}`, env);
        if (session.metadata?.shop !== 'comerciial2000' || session.currency !== shop.currency.toLowerCase()) return send(response, 400, { error: 'Este pago no corresponde a la tienda.' });
        return send(response, 200, { paid: session.payment_status === 'paid' });
      }
      if (request.method === 'POST' && url.pathname === '/api/contact') {
        const data = await readJSON(request);
        if (!data || typeof data.name !== 'string' || !data.name.trim() || data.name.length > 100 || typeof data.email !== 'string' || data.email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || typeof data.message !== 'string' || !data.message.trim() || data.message.length > 3000) return send(response, 400, { error: 'Revisa el nombre, el email y el mensaje.' });
        if (!env.CONTACT_WEBHOOK_URL) return send(response, 503, { error: 'El canal de contacto todavía no está configurado.' });
        const destination = new URL(env.CONTACT_WEBHOOK_URL);
        if (destination.protocol !== 'https:') throw new Error('El canal de contacto debe utilizar HTTPS.');
        const delivered = await fetch(destination, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: data.name.trim(), email: data.email.trim(), message: data.message.trim(), source: shop.name }), signal: AbortSignal.timeout(10000) });
        if (!delivered.ok) return send(response, 502, { error: 'No se pudo entregar la consulta. Inténtalo de nuevo.' });
        return send(response, 200, { ok: true });
      }
      if (url.pathname.startsWith('/api/')) return send(response, 404, { error: 'Ruta no disponible.' });
      if (!['GET', 'HEAD'].includes(request.method)) return send(response, 405, { error: 'Método no permitido.' });
      let file = staticFiles.get(url.pathname);
      // Solo servir imágenes de assets: nunca .env, código de servidor ni archivos privados.
      if (!file && /^\/assets\/[a-zA-Z0-9_-]+\.(svg|webp|png|jpe?g)$/.test(url.pathname)) {
        const extension = path.extname(url.pathname).slice(1);
        const types = { svg: 'image/svg+xml', webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg' };
        file = [url.pathname.slice(1), types[extension]];
      }
      if (!file) return send(response, 404, { error: 'Página no encontrada.' });
      const filename = path.join(root, file[0]);
      let content;
      let etag;
      if (file[0] === 'index.html') {
        const html = await readFile(filename, 'utf8');
        const metadata = env.PUBLIC_URL && /^https?:\/\//.test(env.PUBLIC_URL) ? `<link rel="canonical" href="${escapeHTML(new URL('/', env.PUBLIC_URL).href)}"><meta property="og:url" content="${escapeHTML(new URL('/', env.PUBLIC_URL).href)}"><meta property="og:image" content="${escapeHTML(new URL(shop.heroImage, env.PUBLIC_URL).href)}">` : '';
        content = Buffer.from(html
          .replace('<div class="product-grid" id="product-grid"></div>', `<div class="product-grid" id="product-grid">${renderProductCards(products, { interactive: false })}</div>`)
          .replace('<div class="work-grid" id="work-grid"></div>', `<div class="work-grid" id="work-grid">${renderProjectCards(projects)}</div>`)
          .replace('<span id="results-count" aria-live="polite"></span>', `<span id="results-count" aria-live="polite">${products.length} productos</span>`)
          .replace('id="contact-address">Por configurar', `id="contact-address">${escapeHTML(shop.address || 'Por configurar')}`)
          .replace('id="contact-phone">Por configurar', `id="contact-phone">${escapeHTML(shop.phone || 'Por configurar')}`)
          .replace('id="contact-hours">Por configurar', `id="contact-hours">${escapeHTML(shop.hours || 'Por configurar')}`)
          .replace('<span id="year"></span>', `<span id="year">${new Date().getFullYear()}</span>`)
          .replace('id="contact-submit"', 'id="contact-submit" disabled')
          .replace('Activa JavaScript para ver el catálogo y utilizar el carrito.', 'Puedes ver las fotografías y consultar los productos con la tienda a través de Instagram. Activa JavaScript para usar los filtros, las fichas y el carrito.')
          .replace('<!-- public-metadata -->', metadata));
        etag = `"${createHash('sha256').update(content).digest('hex')}"`;
      } else {
        const info = await stat(filename);
        etag = `W/"${info.size.toString(16)}-${info.mtimeMs.toString(16)}"`;
      }
      response.setHeader('Content-Type', file[1]);
      response.setHeader('Cache-Control', 'no-cache');
      response.setHeader('ETag', etag);
      if (request.headers['if-none-match']?.split(',').some(tag => tag.trim().replace(/^W\//, '') === etag.replace(/^W\//, '') || tag.trim() === '*')) {
        response.writeHead(304);
        return response.end();
      }
      content ??= await readFile(filename);
      response.setHeader('Content-Length', content.length);
      response.writeHead(200);
      response.end(request.method === 'HEAD' ? undefined : content);
    } catch (error) {
      if (error.code === 'ENOENT') return send(response, 404, { error: 'Archivo no encontrado.' });
      if (error.message?.includes('JSON') || error.message?.includes('grande')) return send(response, 400, { error: error.message });
      send(response, 502, { error: 'No se pudo completar la solicitud. Comprueba la configuración del servidor.' });
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3000);
  createServer().listen(port, '127.0.0.1', () => console.log(`Comerciial 2000 disponible en http://localhost:${port}`));
}
