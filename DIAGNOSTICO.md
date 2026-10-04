# Diagnóstico y reparación de Comercial 2000 Narón

Fecha: 2 de octubre de 2026.

## Revisión actual: diagnóstico, prioridades y resultado

Se volvió a revisar el código y a ejecutar la web mediante un servidor HTTP nuevo. El catálogo actual tiene **34 fichas, seis categorías y ocho imágenes de galería**. La auditoría inicial comprobó **76 rutas de imagen** (fotos completas, miniaturas de productos e imágenes estáticas; las pruebas Node verifican además las miniaturas de galería): ninguna falló. No se detectaron excepciones JavaScript ni desbordamiento horizontal en los tamaños examinados.

### Reparaciones de esta revisión

| Prioridad | Problema detectado | Solución implementada |
| --- | --- | --- |
| Alta | La verificación de cualquier sesión pagada de la tienda vaciaba el carrito actual, aunque correspondiese a otra selección. | `server.mjs` devuelve el identificador de la sesión iniciada. `app.js` conserva temporalmente ese identificador y los artículos enviados en `sessionStorage`. Solo vacía el carrito si el servidor confirma el pago y coinciden la sesión y toda la selección actual. Si cambió o el almacenamiento no está disponible, conserva el carrito. Esto no sustituye un registro de pedidos. |
| Alta | Con el resumen de compra abierto, los cambios desde otra pestaña actualizaban el carrito pero dejaban el resumen antiguo. | Resumen sincronizado, aviso para revisar los cambios y acción desactivada al quedar vacío. Durante una solicitud de checkout, los cambios no permiten iniciar otra solicitud simultánea. |
| Media | Sin JavaScript, el menú móvil estaba oculto y su botón no funcionaba. Otros controles seguían pareciendo utilizables. | Alternativa CSS con navegación visible, carrito/cuenta y controles de filtrado ocultos. Las 34 fichas y ocho enlaces de galería siguen accesibles desde el HTML del servidor. El formulario permanece desactivado. |
| Media | Las fichas perdían `aria-haspopup="dialog"` al regenerarse con filtros, búsqueda o carga progresiva. | Atributo generado por el componente compartido `storefront.mjs` en todos los enlaces de fichas interactivas. |
| Media | «Comprar ahora» prometía una compra aunque el pago estaba desactivado. El texto estático decía que no se había definido la moneda, aunque es EUR. | CTA «Explorar productos» mientras el pago está desactivado; vuelve a «Comprar ahora» si la API confirma disponibilidad de pago. Texto de checkout coherente con el euro y los datos pendientes. |
| Media | Se podía ordenar por precio aunque todos los importes fueran desconocidos. | Las opciones de precio se desactivan hasta que exista algún precio; destacados y nombre siguen disponibles. |
| Media | Una consulta preparada podía persistir al volver a enviar el formulario; faltaba confirmación explícita de que preparar no significa enviar. | Se limpia el resultado previo antes de cada intento y se anuncia el estado. Un error de envío conserva los campos y vuelve a habilitar el botón. |
| Baja | Etiquetas de portada/galería y descripción de imagen de 6–9 px. | Tamaños aumentados a 10–12 px y franja superior adaptable. Se mantienen campos de 16 px en móvil, controles táctiles principales de 44 px y movimiento reducido. |
| Baja | Al activar el catálogo se sustituían los textos alternativos específicos por descripciones genéricas. | Se mantienen los textos descriptivos reales de la montura y el escaparate. |
| Baja | Año vacío sin JavaScript y datos de teléfono/horario solo actualizados por el navegador. | Año, dirección, teléfono y horario renderizados desde el servidor; los datos desconocidos siguen como «Por configurar». |
| Baja | El pie llamaba «Trabajos realizados» a una galería que también contiene productos y comunidad; descripción SEO y documentación desactualizadas. | Pie «Tienda y galería», meta description ajustada al catálogo visible y actualización de `README.md` y `FOTOS.md`. Se documenta que el usuario eliminó los originales, mientras las copias locales continúan disponibles. |

### Rendimiento y contenido visual

- Las imágenes de tarjetas, carrito, servicios y galería utilizan miniaturas WebP; las fotos completas se reservan para portada, banner, tienda y ampliaciones. No se eliminaron archivos archivados: no se descargan si no se referencian y documentan importaciones anteriores.
- Las ocho fotos completas de galería suman **1.314.330 bytes**; sus miniaturas, **415.668 bytes**: aproximadamente **68 % menos bytes de imagen en las tarjetas**, no un 68 % menos de tiempo de carga de toda la web.
- La foto de detalle más pesada sigue siendo `local-cubos-establo.webp`, **433.372 bytes**; su tarjeta carga una miniatura. Es candidata a futuras versiones responsivas si se incorporan nuevas fotografías originales.
- La portada tiene prioridad de descarga alta y dimensiones intrínsecas declaradas. Las tarjetas y secciones reservan espacio con proporciones y alturas CSS; las imágenes inferiores usan carga diferida.
- El script es un módulo ESM y no bloquea el análisis del HTML. Se mantienen `ETag`/304 y el formateador monetario compartido. Las fuentes de Google son una dependencia externa y su hoja de estilo puede retrasar el primer renderizado: alojarlas localmente y aplicar compresión HTTP en el proxy son mejoras pendientes de despliegue.
- Fotografías reales importadas localmente: la web no depende de URLs temporales del CDN de Instagram. La consulta pública actual del perfil devolvió únicamente «Instagram», insuficiente para verificar nuevos contenidos o datos. Los enlaces conservan el perfil y las publicaciones documentadas; la disponibilidad de Instagram depende del servicio y de la sesión del visitante.
- Se conservan los identificadores de producto, el recorte etiquetado de botas y la miniatura original de panderetas. No se infieren existencias a partir de las fotos. No se encontraron vídeos en la revisión previa y después se vació la carpeta original a petición del usuario.

### Pendientes priorizados para activar ventas

1. **Bloqueantes comerciales:** confirmar precios en céntimos, stock por referencia, variantes/tallas, moneda, impuestos, gastos y destinos de envío, plazos, devoluciones y garantías. Actualmente todos los precios y existencias son `null` y `shop.catalogReady` es `false`.
2. **Bloqueantes operativos:** elegir pasarela; implementar pedidos persistentes, reserva/actualización de stock y webhook firmado e idempotente de pagos. El adaptador opcional de Stripe y la consulta de retorno no constituyen un sistema completo de pedidos.
3. **Configuración:** completar teléfono, WhatsApp, email y horario en `catalog.js`; configurar `CONTACT_WEBHOOK_URL` si se desea envío real. Sin ese canal, el formulario solo prepara texto. La cuenta continúa siendo información para invitados.
4. **Publicación:** configurar `PUBLIC_URL` con el dominio HTTPS definitivo, completar la información legal y las condiciones reales, probar la pasarela en entorno de test y verificar el circuito pedido/pago/inventario antes de activar cobros. Los pasos del adaptador están en `README.md` y `.env.example`.
5. **Mejoras siguientes:** URLs individuales de producto y sitemap para búsquedas específicas; datos estructurados con datos verificados, sin ofertas/precios ficticios; imagen social horizontal; fuentes locales; fotos de mayor resolución para panderetas y variantes; copias de respaldo de las fuentes visuales.

**Conclusión:** funcional como catálogo y selección para consultar. La base de checkout está preparada para configurar y probar la pasarela, pero **la tienda todavía no está lista para cobrar y gestionar ventas reales**. No se activó ningún pago ni se inventaron datos para hacerlo.

### Verificación final de esta revisión

- `npm test`: ocho pruebas correctas; sintaxis de `app.js`, `server.mjs`, `catalog.js`, `commerce.mjs` y `storefront.mjs` correcta.
- Edge/Playwright: filtros de seis categorías, búsqueda, carga 12/24/34, ordenación por nombre, 34 fichas y fotografías, galería de ocho imágenes, navegación por flechas, carrito, recarga, dos pestañas, copia alternativa, contacto y enlaces internos.
- Responsive: documento, carrito y ficha sin desbordamiento horizontal en 320, 375, 420, 600, 760, 768, 820, 1024 y 1440 px; revisión visual mediante capturas de móvil y escritorio.
- Comprobaciones adicionales: CTAs de monturas/equitación/ropa, ARIA después de filtrar, precio desconocido, resumen actualizado o vacío entre pestañas, consultas sucesivas y error de envío, navegación móvil sin JS, año en HTML inicial.
- Pagos **simulados en el navegador**, sin llamadas de cobro: bloqueo de redirección externa a Stripe, conservación de la sesión enviada, retorno pagado coincidente/ajeno/con carrito modificado y retorno sin pago. No son pruebas de cobros reales ni de webhooks.
- Fallos de API/imagen simulados: selección operativa y marcador local de imagen. Las APIs sin configuración siguen rechazando cobros y envíos, en lugar de simular éxitos.
- Pendiente: Safari/iPhone, Firefox y mediciones de LCP/CLS/INP en el alojamiento de producción. No se afirma una puntuación Lighthouse ni una certificación universal.

## Historial de la primera auditoría

Los apartados siguientes documentan las reparaciones previas, cuando la galería tenía seis imágenes. La revisión actual y sus métricas se describen arriba.

## Alcance y estado inicial

Se revisaron `index.html`, `styles.css`, `app.js`, `catalog.js`, `commerce.mjs`, `server.mjs`, las pruebas, las rutas públicas y los manifiestos de fotografías. La web utiliza Node.js 22+, módulos ESM y archivos locales, sin dependencias de ejecución ni compilación.

La comprobación inicial en Edge confirmó que las 73 imágenes entonces referenciadas respondían con HTTP 200, que el catálogo se iniciaba con 12 tarjetas y que no había errores JavaScript ni desbordamiento horizontal en 320, 375, 760, 768, 820, 1024 y 1440 px. Las reparaciones siguientes abordan problemas reales y limitaciones detectadas; no se detectó una caída general de la web.

## Problemas encontrados y reparaciones

| Prioridad | Diagnóstico | Reparación aplicada |
| --- | --- | --- |
| Alta | Catálogo y galería vacíos en el HTML inicial: dependencia completa de JavaScript para descubrir el contenido. | `storefront.mjs` genera el mismo HTML en servidor y navegador. El servidor incluye las 34 fichas y seis imágenes de galería; JavaScript mantiene filtros, diálogos y carga progresiva. |
| Alta | `restoreCart` podía conservar un producto agotado con cantidad cero; stock superior a 99 y referencias duplicadas permitían superar el límite global de selección. | Se descartan agotados, se aplica el límite de 99 de forma coherente en servidor y navegador y se suman cantidades sin desbordar enteros. |
| Alta | El checkout invitaba a comprobar un pago que ya se sabía desactivado, terminando en un error de API. | Sin pago configurado, el flujo revisa y copia la selección para consultar. Con pago configurado conserva el checkout alojado. |
| Media | Al cambiar la foto en una ficha, «Abrir fotografía completa» seguía apuntando a la primera imagen. | El enlace se actualiza con la foto seleccionada y se mantienen las etiquetas que identifican recortes. |
| Media | La llegada de `/api/status` regeneraba las tarjetas aunque no cambiase su contenido, pudiendo perder foco o interacción. | La respuesta actualiza los controles de checkout sin sustituir el catálogo. |
| Media | Borrar todo el almacenamiento en otra pestaña no actualizaba el carrito, porque `storage.key` puede ser `null`. | Se trata también el evento de vaciado del almacenamiento. |
| Media | API del navegador sin tiempo máximo de espera. | Solicitudes con límite de 15 segundos; un fallo del estado no impide explorar o preparar la selección. |
| Media | Miniaturas de galería y carrito descargaban fotografías completas. Algunas imágenes de servicios también. | Se utilizan miniaturas WebP existentes; las vistas ampliadas siguen usando las versiones completas. |
| Media | Recursos públicos sin `ETag`: no había validación condicional para evitar retransmitir archivos sin cambios. | `ETag`, `If-None-Match`, respuestas `304` y longitud coherente en GET/HEAD. Se conserva `no-cache` para revalidar cambios. |
| Media | Tipografía muy pequeña y controles de 26–33 px, especialmente cantidades y cierre de diálogos. | Controles principales de al menos 44 px, tipografía más legible y campos de 16 px en móvil para evitar el zoom automático de iOS. |
| Media | Tres columnas en tablets reducían el espacio de tarjetas; dos tarjetas en móviles muy estrechos dejaban textos y acciones comprimidos. | Dos columnas entre 761 y 1100 px; una columna hasta 420 px. Se mejora el ajuste del carrito y de los diálogos. |
| Media | Fondo desplazable al abrir un diálogo y miniaturas sin ajuste para series de fotos más largas. | Bloqueo del desplazamiento del documento, alto máximo relativo al viewport y miniaturas que pueden pasar a otra línea. |
| Media | Faltaban metadatos sociales y URL canónica. | Open Graph y tarjeta social; canonical, URL social e imagen absoluta generadas desde `PUBLIC_URL`. |
| Baja | Sin alternativa visual cuando falla una imagen. | Marcador local `assets/image-unavailable.svg`, sin depender de otro servicio. |
| Baja | Se creaba un formateador monetario nuevo para cada importe. | Una instancia compartida de `Intl.NumberFormat`. |

Los enlaces de fotografías y galería funcionan como enlaces normales sin JavaScript. Los botones de añadir se activan al generar las tarjetas en el navegador; sin JavaScript permanecen ocultos. El formulario se habilita cuando su script está listo. El catálogo sin JavaScript incluye una explicación y la dirección de la tienda.

## Fotografías e Instagram

- Fuente oficial: <https://www.instagram.com/comerciial2000/>.
- Se conservaron los originales, las fichas y sus identificadores. La procedencia sigue documentada en `FOTOS.md`, `INSTAGRAM.md` y los dos manifiestos de `assets/`.
- La consulta pública actual de Instagram no devolvió contenido legible suficiente para verificar publicaciones nuevas. No se realizó una nueva importación ni se atribuyeron productos o servicios adicionales.
- Las fotos de la tienda ya están integradas como archivos locales, evitando enlaces de CDN de Instagram que caducan o requieren sesión.
- Se mantienen las fotos de modelos diferentes separadas y la identificación del recorte de botas y de la miniatura de panderetas de 150 px.
- Las seis tarjetas de galería pasan de **720.726 a 240.690 bytes**, aproximadamente **67 % menos de datos de imagen**, cuando se cargan todas. Esto mide el peso de esas tarjetas, no una mejora del 67 % de toda la página ni de sus tiempos de carga.
- La fotografía de detalle más pesada detectada fue `local-cubos-establo.webp`, de 433.372 bytes. Se conserva para ampliación; su tarjeta utiliza miniatura y carga diferida.

## Verificación realizada

### Automatización Node

```sh
npm test
node --check app.js
node --check server.mjs
node --check storefront.mjs
```

Ocho pruebas cubren precios del servidor, cantidades, carrito corrupto, precios desconocidos, agotados/límite de selección, HTML inicial/caché, imágenes referenciadas y API de compra/contacto/archivos privados.

### Interfaz con Playwright y Microsoft Edge

- Filtros de las seis categorías, búsqueda sin tildes, resultados vacíos y restablecimiento.
- Carga de 12, 24 y 34 fichas y ordenación alfabética.
- Apertura de las 34 fichas; carga de sus fotos; cambio al recorte y actualización del enlace a la imagen completa.
- Añadir, aumentar, eliminar, persistir tras recarga y sincronizar el carrito entre dos pestañas, incluido el vaciado de `localStorage`.
- Revisión de selección sin pagos y copia alternativa con el portapapeles denegado.
- Galería de seis fotos, navegación circular, flechas del teclado y cierre con Escape.
- Preparación de consulta de contacto y destinos de enlaces internos.
- Menú móvil y ausencia de desbordamiento del documento, carrito y ficha en anchos de 320, 375, 420, 600, 760, 768, 820, 1024 y 1440 px.
- Catálogo de 34 fichas y galería de seis enlaces sin JavaScript.
- Fallo simulado de la API de estado y de una miniatura: catálogo y carrito siguen operativos y aparece la imagen alternativa.
- Revisión de capturas de escritorio y móvil. No se detectaron excepciones JavaScript durante las comprobaciones.

Estas pruebas verifican Edge y los tamaños indicados. No equivalen a una certificación en todos los dispositivos: queda por ejecutar una revisión en Safari/iPhone y Firefox reales antes de publicar. No se midieron Core Web Vitals en producción ni se probaron cobros reales.

## Pendientes necesarios para vender

1. Confirmar precios, existencias, tallas/modelos y condiciones de venta. `null` sigue significando desconocido; no se ha sustituido por cero ni por precios inventados.
2. Facilitar teléfono, WhatsApp, email y horario reales. La dirección existente procede de las fuentes verificadas.
3. Definir pasarela y configuración de producción; completar la gestión persistente de pedidos, stock y confirmación por webhook antes de operar ventas online.
4. Configurar el canal de contacto si se desea enviar consultas desde el formulario. Actualmente prepara texto para compartir.
5. Completar avisos legales y condiciones con la información real de la empresa.

## Prevención y mejoras adicionales

- Ejecutar `npm test` al modificar catálogo, fotos o servidor: las rutas y archivos de imagen se comprueban automáticamente.
- Utilizar el servidor HTTP y reiniciar Node al cambiar los módulos compartidos. No verificar `app.js` importándolo directamente desde Node ni abrir la web por `file://`.
- Conservar identificadores de producto y la clave `comerciial2000-cart-v1` para respetar carritos guardados.
- Usar miniaturas en tarjetas y fotos completas solo donde se amplían; documentar siempre la procedencia de recortes.
- Mantener `PUBLIC_URL` alineada con el dominio HTTPS definitivo para canonical, Open Graph y validación de origen.
- Repetir las comprobaciones de filtros, carrito, ficha, galería y móvil tras cambios de HTML/CSS.
- Crear páginas individuales de producto con URL estable y contenido renderizado en servidor para SEO de búsquedas específicas. Añadir sitemap y datos estructurados cuando se definan esas URLs y los datos comerciales.
- Medir LCP, CLS e INP en el alojamiento real y revisar compresión HTTP/Brotli en el proxy de producción. Las fotos más grandes ya se reservan para detalle.
- Valorar alojar localmente las fuentes de Google y preparar una imagen social horizontal específica. Actualmente hay fuentes de sistema de respaldo; no se ha eliminado esa dependencia externa.
- Obtener fotos de alta resolución para panderetas y variantes por modelo/talla; añadir canales de consulta reales es la mejora inmediata con más impacto comercial.
