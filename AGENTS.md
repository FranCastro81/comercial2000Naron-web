# Instrucciones del repositorio

## Ejecución y verificación

- Ejecuta los comandos desde la carpeta de este repositorio, no desde la ubicación predeterminada de la sesión, `C:\Users\astra`.
- Node.js 22 o superior; módulos ESM nativos, sin dependencias ni paso de compilación. `npm start` carga el archivo opcional `.env` mediante `--env-file-if-exists` y sirve `http://localhost:3000` en `127.0.0.1`. No se admite abrir `index.html` mediante `file://`.
- `npm test` ejecuta las pruebas de Node. Para una prueba concreta: `node --test --test-name-pattern="precio desconocido" tests/shop.test.mjs`. Comprobaciones de sintaxis: `node --check app.js` y `node --check server.mjs`. No hay comandos configurados de lint ni comprobación de tipos.
- Las pruebas de API importan `createServer({})`, utilizan un puerto local efímero y no necesitan un servidor de desarrollo en marcha ni credenciales de pago. Asumen el catálogo actual sin precios y con las compras desactivadas; cambiar ese estado requiere actualizar los datos de prueba y las aserciones correspondientes.
- `npm test` comprueba la lógica comercial y la API, no la interfaz en el navegador. Para cambios visuales, verifica filtros, carga de más productos, diálogos de producto y galería, persistencia del carrito y ausencia de desbordamiento horizontal en móvil mediante el servidor. `app.js` necesita el DOM y no puede importarse directamente en Node como prueba básica de funcionamiento.

## Arquitectura y archivos servidos

- `catalog.js` se comparte entre navegador y servidor: contiene los datos públicos de la tienda, productos, proyectos y formato de importes. `commerce.mjs` también se sirve al navegador; no incluyas credenciales ni importaciones exclusivas del servidor en ninguno de los dos.
- `app.js` utiliza directamente los identificadores y atributos `data-*` de `index.html`; al cambiar el HTML, revisa sus selectores. Los productos y la galería se generan desde el catálogo, pero las imágenes de servicios y promociones también tienen referencias estáticas en `index.html`.
- Reinicia Node después de editar `catalog.js`, `commerce.mjs`, `storefront.mjs`, `server.mjs` o `.env`: el servidor mantiene los módulos importados en caché y no tiene recarga automática, aunque el navegador obtenga los archivos modificados al actualizar la página.
- `server.mjs` sirve una lista explícita de archivos permitidos en `staticFiles`. Añade allí los nuevos módulos del navegador. Los recursos deben usar rutas directas `/assets/<nombre>.<svg|webp|png|jpg|jpeg>`, con nombres formados únicamente por letras ASCII, números, guiones y guiones bajos; no se sirven espacios, subcarpetas, extensiones en mayúsculas ni manifiestos JSON.
- La política CSP del servidor bloquea scripts y estilos incrustados, así como llamadas del navegador a API de otros orígenes. `PUBLIC_URL` determina el origen permitido para solicitudes POST; mantenlo coherente con la URL del navegador al cambiar de puerto o dominio.

## Catálogo, fotografías y pagos

- La marca es **Comercial 2000 Narón**, una tienda de equitación y ropa de trabajo en Narón. Utiliza el catálogo y las fuentes de fotos verificadas, en lugar del concepto anterior de maquinaria de ejemplo.
- Los precios son céntimos enteros; `null` significa desconocido, no cero. Las existencias con valor `null` también son desconocidas; el límite de selección de 99 unidades no acredita disponibilidad. Conserva los identificadores de producto: los carritos del navegador los guardan bajo `comerciial2000-cart-v1`.
- Lee `FOTOS.md` y `assets/local-photo-sources.json` antes de modificar fotos; `INSTAGRAM.md` y `assets/instagram-sources.json` documentan las importaciones públicas anteriores. Conserva los originales y la procedencia de los recortes. Separa los modelos distintos, identifica recortes y miniaturas, y utiliza `thumbnail` en las tarjetas e `images`/`imageLabels` en las vistas completas del producto.
- Los pagos permanecen desactivados hasta configurar precios y existencias reales, `shop.catalogReady` y las variables de entorno necesarias. La configuración está en `README.md` y `.env.example`; no sustituyas datos desconocidos por valores inventados para habilitar las compras.
- La integración de Stripe comprende los endpoints de inicio y consulta de pago de `server.mjs` y la restricción de redirección a `checkout.stripe.com` de `app.js`; cambiar de proveedor requiere actualizar los tres puntos. La URL de retorno, por sí sola, no demuestra que se haya pagado. No hay base de datos de pedidos, reserva de existencias ni webhook de pagos.
- Sin `CONTACT_WEBHOOK_URL`, el formulario de contacto prepara texto para copiar, pero no lo envía. El icono de cuenta muestra información para invitados, no autenticación ni historial de pedidos; mantén esas distinciones en los textos de la interfaz.

## Memoria 
- Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones 
tomadas. 
- Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su 
porqué) y errores a evitar. 
- Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte. 
- Si algo se convierte en una regla permanente, propón moverlo a `AGENTS.md` en lugar de 
dejarlo en la memoria. 
- No guardes nunca datos sensibles (claves, tokens, datos personales).
-Siempre: actualizar `MEMORY.md` al terminar cada tarea.
