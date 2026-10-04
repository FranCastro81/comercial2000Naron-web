# Comercial 2000 Narón · Tienda online

Tienda responsive con catálogo filtrable, buscador sin distinción de tildes, ordenación, fichas con galería de imágenes, carrito persistente, cantidades, resumen de compra, servicios, galería de trabajos y formulario de contacto.

**Presentación del proyecto:** [DEMO.md](DEMO.md), con capturas actuales, funcionalidades, recorrido guiado e instrucciones de ejecución.

## Abrir la tienda

Requiere Node.js 22 o superior. No necesita instalar dependencias.

```sh
npm start
```

Visita **http://localhost:3000**. La aplicación utiliza módulos y una API: debe abrirse mediante el servidor, no haciendo doble clic en `index.html`.

```sh
npm test
```

## Estado del contenido

Se ha abierto el perfil público con un navegador y se han importado sus fotografías a `assets/`. La biografía describe **equitación, ropa de trabajo, pieles, paraguas y carteras**, y publica la dirección **Rua Álvaro Paradela n.º 1, Narón, 15570**. La web se ha adaptado a esa actividad.

Se han incorporado también las fotos de la carpeta **`C:\Users\astra\OneDrive\Documentos\fotos web comerciial2000`**, incluidas las imágenes pertinentes de sus carpetas de historias guardadas. El catálogo ahora contiene **34 fichas** organizadas en seis categorías: monturas, equitación, ropa y calzado, cuidados y pieles, campo y establo, y complementos. Los precios y existencias permanecen como `null` y la interfaz muestra «Consultar precio» o «A confirmar».

Las fotos aportadas se han convertido a WebP con miniaturas específicas para el catálogo. El escaparate utiliza ahora la foto de 898 × 898 facilitada en las historias guardadas. Las panderetas siguen contando solo con una miniatura. El detalle de botas es un recorte de la misma foto, identificado en la ficha. Los modelos diferentes se muestran en fichas separadas. Cada ficha permite abrir su foto completa.

Las fuentes se documentan en `INSTAGRAM.md`, `FOTOS.md`, `assets/instagram-sources.json` y `assets/local-photo-sources.json`. La galería incluye ocho imágenes: escaparate, reparación de correas, pieles, monturas, comunidad ecuestre, feria de Moeche, herraduras y salida a caballo, con ampliación y navegación por teclado. El catálogo carga primero 12 fichas y permite mostrar más; los filtros y la búsqueda consultan el catálogo completo. El contenido de la carpeta original fue eliminado por el usuario; las copias de `assets/` siguen funcionando.

### Incorporar las fotos y datos

- Guarda las fotografías para la web en `assets/` con nombres sencillos, por ejemplo `montura-01.webp`. Conserva los originales en una copia de respaldo y documenta la procedencia. El servidor acepta SVG, WebP, PNG y JPG/JPEG.
- Amplía `products` y `projects` en `catalog.js` con las referencias y fotos originales que facilite la empresa. Las fotos ya importadas son locales: no dependen de URLs temporales de Instagram.
- Los precios se expresan en **céntimos**: `24900` equivale a 249,00. El valor `null` indica precio desconocido. Confirma precios e impuestos y completa el stock antes de activar el catálogo para compras.
- Completa `shop.phone`, `shop.address`, `shop.hours` y `shop.whatsapp` (número internacional, solo dígitos).
- Ajusta los textos de hero, servicios, historia, galería y condiciones en `index.html` y `app.js`.
- `shop.catalogReady` debe permanecer en `false` hasta confirmar precios, variantes, existencias y condiciones. Al pasar a `true`, desaparece el aviso de preparación. Los pagos también requieren precios y existencias numéricos y la configuración de la pasarela.

## Carrito y checkout

El carrito funciona y se conserva localmente cuando el navegador permite almacenamiento. El checkout muestra la selección y consulta al servidor. Actualmente **no realiza cobros ni confirma pedidos** porque la pasarela, los precios y las existencias están pendientes. Si una línea no tiene precio, el subtotal se muestra como «A confirmar».

El servidor incluye un adaptador opcional para **Stripe Checkout**. No está activado ni presupone que Stripe sea la pasarela elegida. Para otra pasarela, se debe sustituir el adaptador de `/api/checkout`, su verificación de pago y la validación de la URL en `app.js`.

Si se elige Stripe:

1. Copia `.env.example` a `.env` y configura `PAYMENT_PROVIDER=stripe`, la clave privada de servidor y `PUBLIC_URL` (dominio público HTTPS en producción).
2. Define `SHIPPING_CENTS` y `SHIPPING_COUNTRIES`. Los precios del catálogo se tratan como importes finales con impuestos incluidos; confirma la política fiscal correspondiente.
3. Sustituye el catálogo, confirma moneda y condiciones y establece `shop.catalogReady=true`.
4. Prueba primero con claves de test y tarjetas de prueba oficiales de Stripe.

El servidor recalcula el importe desde el catálogo, valida referencias y cantidades y crea una sesión alojada en la pasarela. No recibe números de tarjeta. La página de retorno verifica el estado directamente con Stripe: una URL de éxito por sí sola no confirma el pago. El carrito solo se vacía automáticamente si coinciden la sesión iniciada en esa pestaña y la selección enviada, conservada temporalmente en `sessionStorage`; una selección modificada o un enlace de otra sesión se conservan.

**Gestión de pedidos:** esta base no incluye una base de datos de pedidos, reserva de existencias ni automatización de envíos. Para operar una tienda con inventario compartido, añadir persistencia y un webhook firmado de la pasarela para registrar pagos y actualizar stock de forma idempotente, incluso si el comprador no vuelve a la web. Mientras tanto, los pagos de un eventual piloto deben gestionarse desde el panel de la pasarela. La pasarela sigue pendiente de elegir.

## Tutoriales

El apartado `#tutoriales`, accesible desde el menú y el pie, enlaza a la historia destacada Tutoriales de Comercial 2000 Narón. La carpeta `Tutoriales/` recibida contiene páginas guardadas de Instagram, imágenes y código, pero no los archivos de vídeo. Para incorporar reproducción dentro de la web se necesitan los originales MP4 o WebM. La revisión y procedencia del enlace están documentadas en `TUTORIALES.md`.

## Contacto y cuenta

Sin canal configurado, el formulario prepara un texto para copiar, sin afirmar que se ha enviado. Para enviar consultas, configura `CONTACT_WEBHOOK_URL` con un endpoint HTTPS de la empresa que reciba `{ name, email, message, source }` y confirme la entrega con un estado 2xx. El servidor no almacena las consultas.

El icono de cuenta abre información para compradores invitados. No se ha implementado registro, autenticación ni historial de pedidos.

Los paneles de aviso legal, privacidad y compra contienen textos provisionales que deben completarse con la información de la empresa. Las tipografías se cargan desde Google Fonts; el resto de recursos de muestra son locales.

## Archivos

- `index.html`, `styles.css`, `app.js`: interfaz.
- `catalog.js`: catálogo y datos públicos editables.
- `commerce.mjs`: validación y recuperación del carrito.
- `storefront.mjs`: HTML compartido del catálogo y galería, utilizado por servidor y navegador.
- `server.mjs`: servidor y endpoints de pago/contacto.
- `assets/`: fotografías locales optimizadas, miniaturas y manifiestos de procedencia.
- `tests/`: pruebas de importes, cantidades y endpoints.

Las claves privadas se configuran únicamente en `.env`, nunca en los archivos de navegador. El servidor sirve una lista limitada de archivos y no expone `.env` ni el código del servidor. Para publicación, utiliza un servicio de Node.js o un proxy HTTPS; el servidor escucha por defecto en `127.0.0.1`.

## Reparaciones y verificación

El servidor entrega las 34 fichas y la galería en el HTML inicial, también accesibles sin JavaScript. El navegador activa los filtros, los diálogos y la carga progresiva de 12 productos. Sin JavaScript, el menú móvil permanece visible, las fotografías son enlaces normales y el formulario permanece desactivado para evitar envíos accidentales por URL. La ordenación por precio se desactiva cuando todos los precios son desconocidos. El resumen de selección se actualiza cuando cambia el carrito en otra pestaña.

Las tarjetas del catálogo, carrito, servicios y galería usan las miniaturas existentes; las vistas ampliadas mantienen las fotos completas y sus etiquetas. Si falla una imagen, la interfaz muestra `assets/image-unavailable.svg`. Los recursos públicos incluyen `ETag` y admiten respuestas `304` al revalidar, sin fijar cachés largas que oculten cambios.

`PUBLIC_URL` debe ser el origen real al publicar: también genera la URL canónica y las URLs absolutas de Open Graph. No configures localhost como URL pública de producción. Reinicia Node después de cambiar módulos compartidos o configuración.

El diagnóstico, los resultados de las pruebas y los pendientes están en `DIAGNOSTICO.md`. `npm test` comprueba además agotados, cantidades acumuladas, HTML inicial, caché y todas las imágenes referenciadas. Las comprobaciones de interfaz requieren navegador y servidor HTTP.
