// Fotografías clasificadas de la carpeta facilitada por la empresa.
export const shop = {
  name: 'Comerciial 2000',
  instagram: 'https://www.instagram.com/comerciial2000/',
  catalogReady: false,
  currency: 'EUR',
  locale: 'es-ES',
  email: '', phone: '', whatsapp: '', address: 'Rua Álvaro Paradela n.º 1, 15570 Narón', hours: '',
  heroImage: 'assets/local-montura-negra.webp',
  aboutImage: 'assets/local-escaparate.webp'
};

const photo = name => `assets/local-${name}.webp`;
function item(id, name, category, image, subtitle, specs = [], options = {}) {
  return {
    id, name, category, subtitle,
    description: `${subtitle} Fotografía facilitada por la tienda. Consulta las opciones, el precio y la disponibilidad antes de realizar tu elección.`,
    price: null, stock: null, images: [photo(image)], thumbnail: photo(`${image}-thumb`),
    imageLabels: [name], source: shop.instagram, sourceLabel: 'Ver el perfil de la tienda',
    specs: [...specs, ['Precio y existencias', 'Consultar']], badge: '', ...options
  };
}

export const products = [
  item('botas-neopreno', 'Botas de neopreno', 'Ropa y calzado', 'botas-neopreno', 'Una selección de modelos y colores en el expositor de la tienda.', [['Material anunciado', 'Neopreno'], ['Tallas y modelos', 'Consultar']], { images: [photo('botas-neopreno'), 'assets/instagram-botas-detalle.webp'], imageLabels: ['Expositor de botas de neopreno', 'Detalle recortado de la misma fotografía'], source: 'https://www.instagram.com/comerciial2000/p/Dbp0I-SN9FQ/', sourceLabel: 'Ver publicación original', badge: 'En nuestra tienda' }),
  item('montura-ludomar', 'Silla Ludomar 18″', 'Monturas', 'montura-ludomar', 'Silla de uso general, identificada como Ludomar de 18 pulgadas en la fotografía.', [['Marca visible', 'Ludomar'], ['Medida anunciada', '18 pulgadas']], { badge: 'Equitación' }),
  item('botas-fal', 'Botas de seguridad FAL', 'Ropa y calzado', 'botas-fal', 'Calzado de seguridad FAL con acabado marrón y cordones.', [['Marca anunciada', 'FAL'], ['Tallas', 'Consultar']]),
  item('montura-salto', 'Montura de salto', 'Monturas', 'montura-salto', 'Montura de salto en tono marrón, fotografiada en la tienda.', [['Modalidad anunciada', 'Salto'], ['Medida', 'Consultar']]),
  item('salvacruz-zaldi', 'Salvacruz Zaldi', 'Equitación', 'salvacruz-zaldi', 'Protector de cruz Zaldi de PVC, según el texto de la imagen.', [['Marca anunciada', 'Zaldi'], ['Material anunciado', 'PVC']]),
  item('chaleco-reflectante', 'Chaleco reflectante', 'Ropa y calzado', 'chaleco-reflectante', 'Chaleco amarillo con bandas reflectantes y talla M anunciada.', [['Talla fotografiada', 'M'], ['Color', 'Amarillo']]),
  item('cuidados-caballo', 'Cuidados del caballo', 'Cuidados y pieles', 'cuidados-caballo', 'Selección de productos de cuidado. Consulta cada presentación por separado.', [['Presentaciones', 'Consultar'], ['Venta', 'Consultar productos individuales']]),
  item('grasa-cuero', 'Grasa para cuero Marjoman', 'Cuidados y pieles', 'grasa-cuero', 'Producto de mantenimiento del cuero con marca Marjoman visible.', [['Marca visible', 'Marjoman'], ['Formato', 'Consultar']]),
  item('riendas', 'Riendas negras', 'Equitación', 'riendas', 'Riendas con mosquetones, fotografiadas sobre el suelo de la tienda.', [['Color', 'Negro'], ['Medidas', 'Consultar']]),
  item('cubos-establo', 'Cubos para establo', 'Campo y establo', 'cubos-establo', 'Cubos rojos y azules mostrados sobre un cerramiento.', [['Colores fotografiados', 'Rojo y azul'], ['Capacidad', 'Consultar']]),
  item('navajas-tradicionales', 'Navajas tradicionales', 'Complementos', 'navajas-tradicionales', 'Tres modelos con mangos y tamaños diferentes en una misma fotografía.', [['Modelos', 'Consultar cada pieza']]),
  item('pieles-colores', 'Pieles de colores', 'Cuidados y pieles', 'pieles-colores', 'Detalle de la piel verde incluida en la imagen de pieles de colores.', [['Colores en la imagen original', 'Verde, naranja y rosa'], ['Formato y material', 'Consultar']], { badge: 'Materiales' }),
  item('montura-negra', 'Montura negra', 'Monturas', 'montura-negra', 'Montura negra con asiento pespunteado, fotografiada dentro del local.', [['Color', 'Negro'], ['Modelo y medida', 'Consultar']]),
  item('montura-portuguesa', 'Montura portuguesa infantil', 'Monturas', 'montura-portuguesa', 'Montura portuguesa de niño, con asiento rojo según la imagen.', [['Tipo anunciado', 'Portuguesa de niño'], ['Medida', 'Consultar']]),
  item('montura-asiento-negro', 'Montura de asiento negro', 'Monturas', 'montura-asiento-negro', 'Otra montura negra con detalle del asiento y sus acabados.', [['Modelo y medida', 'Consultar']]),
  item('manta-caballo', 'Manta impermeable', 'Equitación', 'manta-caballo', 'Manta anunciada para un caballo de 1,55 m. Confirma la medida adecuada.', [['Descripción fotografiada', 'Para caballo de 1,55 m']]),
  item('serretas', 'Serretas', 'Equitación', 'serretas', 'Selección de serretas con diferentes acabados y correas.', [['Modelos y medidas', 'Consultar']]),
  item('cuerda-amarilla', 'Cuerda amarilla', 'Equitación', 'cuerda-amarilla', 'Rollos de cuerda amarilla. Consulta el diámetro, la longitud y su aplicación.', [['Color', 'Amarillo'], ['Diámetro y longitud', 'Consultar']]),
  item('soporte-montura', 'Soporte de pared para montura', 'Equitación', 'soporte-montura', 'Soporte rojo de pared mostrado en la imagen de referencia del producto.', [['Color', 'Rojo'], ['Fijación', 'Consultar']]),
  item('pantalon-issaline', 'Pantalón Issaline Stretch', 'Ropa y calzado', 'pantalon-issaline', 'Pantalón gris en su embalaje original Issaline Stretch.', [['Marca', 'Issaline'], ['Referencia visible', '8730 080'], ['Talla del embalaje', 'M']]),
  item('botas-fal-goretex', 'Botas FAL Gore-Tex', 'Ropa y calzado', 'botas-fal-goretex', 'Botas FAL anunciadas con Gore-Tex en el texto de la fotografía.', [['Marca anunciada', 'FAL'], ['Tallas', 'Consultar']]),
  item('zapato-trabajo', 'Zapato de trabajo', 'Ropa y calzado', 'zapato-trabajo', 'Zapato negro con detalles verdes. Consulta su modelo y certificaciones.', [['Color fotografiado', 'Negro y verde'], ['Modelo y talla', 'Consultar']]),
  item('botin-clean-lady', 'Botín Clean Lady gris', 'Ropa y calzado', 'botin-clean-lady', 'Imagen de la ficha del botín gris; no es una fotografía de una unidad en stock.', [['Presentación', 'Ficha fotografiada'], ['Tallas indicadas', '36–41 EUR']]),
  item('plantillas-robusta', 'Plantillas Robusta AYR', 'Ropa y calzado', 'plantillas-robusta', 'Plantillas Robusta AYR Integral High fotografiadas en su embalaje.', [['Marca visible', 'Robusta'], ['Modelo visible', 'AYR Integral High']]),
  item('hilo-encerado', 'Hilo encerado', 'Cuidados y pieles', 'hilo-encerado', 'Bobinas de hilo encerado en diferentes colores.', [['Colores', 'Consultar'], ['Longitud de bobina', 'Consultar']]),
  item('botas-vino', 'Botas de vino', 'Complementos', 'botas-vino', 'Tres piezas de piel con cordones y tapón mostradas en la fotografía.', [['Capacidad y acabado', 'Consultar']]),
  item('navaja-negra', 'Navaja negra', 'Complementos', 'navaja-negra', 'Navaja de acabado negro mostrada abierta en la foto de producto.', [['Modelo y dimensiones', 'Consultar']]),
  item('cuidado-diptron', 'Producto Diptron', 'Cuidados y pieles', 'cuidado-diptron', 'Envase Diptron con pulverizador. Consulta la referencia y las indicaciones de su etiqueta.', [['Marca visible', 'Diptron'], ['Presentación', 'Pulverizador']]),
  item('comedero', 'Comedero con barras', 'Campo y establo', 'comedero', 'Recipiente rectangular con barras, fotografiado en la tienda.', [['Medidas y montaje', 'Consultar']]),
  item('bebedero', 'Bebedero de pared', 'Campo y establo', 'bebedero', 'Imagen de referencia de un recipiente de pared con mecanismo interior.', [['Modelo y conexión', 'Consultar']]),
  item('caldero', 'Caldero metálico', 'Campo y establo', 'caldero', 'Recipiente metálico con asas laterales.', [['Capacidad', 'Consultar'], ['Material exacto', 'Consultar']]),
  item('anilla-amarre', 'Anilla de amarre', 'Campo y establo', 'anilla-amarre', 'Anilla metálica con placa de fijación, según la imagen de referencia.', [['Dimensiones y fijación', 'Consultar']]),
  item('piqueta', 'Piqueta con anilla', 'Campo y establo', 'piqueta', 'Piqueta metálica con anilla, mostrada en la fotografía facilitada.', [['Longitud y aplicación', 'Consultar']]),
  item('panderetas', 'Panderetas', 'Complementos', 'panderetas', 'Panderetas de 7 y 9 ferreñas en la miniatura de la historia destacada.', [['Variantes anunciadas', '7 y 9 ferreñas']], { thumbnailOriginal: true, imageLabels: ['Miniatura original: panderetas'], source: 'https://www.instagram.com/stories/highlights/18035641805309893/', sourceLabel: 'Ver historia destacada' })
];

export const projects = [
  { title: 'Nuestra tienda en Narón', image: photo('escaparate'), label: 'LOCAL Y ESCAPARATE', source: shop.instagram },
  { title: 'Reparación de correas', image: photo('reparacion-cinchas'), label: 'ARREGLOS · CONSULTA TU CASO', source: shop.instagram },
  { title: 'Texturas y colores', image: photo('pieles-colores'), label: 'PIELES Y MATERIALES', source: shop.instagram },
  { title: 'Monturas con personalidad', image: photo('montura-portuguesa'), label: 'NUESTRA SELECCIÓN', source: shop.instagram },
  { title: 'Comunidad ecuestre', image: photo('comunidad-ecuestre'), label: 'VIDA A CABALLO', source: shop.instagram },
  { title: 'Feria de Moeche', image: photo('feria-moeche'), label: 'ENCUENTROS Y AFICIONES', source: shop.instagram },
  { title: 'Herraduras y accesorios en la tienda', image: photo('calzado-tienda'), label: 'EQUITACIÓN EN EL LOCAL', source: shop.instagram },
  { title: 'Una salida a caballo', image: photo('ruta-caballo'), label: 'AFICIÓN Y COMUNIDAD', source: shop.instagram }
].map(project => ({ ...project, thumbnail: project.image.replace('.webp', '-thumb.webp') }));

const currencyFormat = new Intl.NumberFormat(shop.locale, { style: 'currency', currency: shop.currency });
export const money = cents => cents === null ? 'A confirmar' : currencyFormat.format(cents / 100);
