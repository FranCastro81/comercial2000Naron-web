import { money } from './catalog.js';

export const escapeHTML = text => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

export function renderProjectCards(projects) {
  return projects.map((project, index) => `<a class="work-card" href="/${escapeHTML(project.image)}" data-project="${index}" aria-label="Ampliar fotografía: ${escapeHTML(project.title)}"><img src="/${escapeHTML(project.thumbnail || project.image)}" alt="${escapeHTML(project.title)}" loading="lazy" decoding="async"><span class="work-caption"><span>${escapeHTML(project.label)}</span><strong>${escapeHTML(project.title)} ↗</strong></span></a>`).join('');
}

// Un mismo catálogo HTML para el servidor y para los filtros del navegador.
export function renderProductCards(products, { interactive = true } = {}) {
  return products.map(product => {
    const name = escapeHTML(product.name);
    const soldOut = product.stock === 0;
    return `<article class="product-card"><a class="product-image ${product.thumbnailOriginal ? 'thumbnail-original' : ''}" href="/${escapeHTML(product.images[0])}" data-detail="${product.id}" ${interactive ? 'aria-haspopup="dialog"' : ''} aria-label="Ver fotografía y ficha de ${name}"><img src="/${escapeHTML(product.thumbnail || product.images[0])}" alt="${escapeHTML(product.imageLabels?.[0] || product.name)}" loading="lazy" decoding="async">${product.badge ? `<span class="product-badge">${escapeHTML(product.badge)}</span>` : ''}</a><div class="product-info"><p class="product-category">${escapeHTML(product.category)}</p><h3><a class="product-title" href="#contacto" data-detail="${product.id}" ${interactive ? 'aria-haspopup="dialog"' : ''}>${name}</a></h3><p class="product-description">${escapeHTML(product.subtitle)}</p><div class="product-bottom"><span class="product-price">${product.price === null ? 'Consultar precio' : money(product.price)}</span><button class="add-button" data-add="${product.id}" aria-label="${soldOut ? 'Agotado:' : 'Añadir al carrito'} ${name}" ${soldOut ? 'disabled' : ''} ${interactive ? '' : 'hidden'}><svg class="icon" aria-hidden="true"><use href="#i-cart"/></svg> ${soldOut ? 'Agotado' : 'Añadir al carrito'}</button></div></div></article>`;
  }).join('');
}
