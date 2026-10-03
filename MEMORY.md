# MEMORY.md — Contexto persistente del agente

## Identidad del proyecto
- **Nombre del proyecto:** Comercial 2000 Narón — Tienda online y presencia web.
- **Objetivo:** Web moderna, responsive y orientada a ventas, con productos reales, carrito y contacto sencillo.

## Negocio y marca
- **Empresa:** Comercial 2000 Narón, en Narón (Galicia).
- **Actividad verificada:** Equitación, ropa y calzado de trabajo, pieles y complementos. El concepto inicial de maquinaria no corresponde al catálogo real.
- **Idioma y tono:** Español para público de España/Galicia; profesional, cercano, claro y orientado a compras y consultas.
- **Estilo visual:** Colores neutros, verde oscuro y acentos naranja, coherentes con las fotografías reales.

## Fuentes visuales y contenido
- **Instagram oficial:** https://www.instagram.com/comerciial2000/
- El usuario facilitó la carpeta `fotos web comerciial2000` y pidió distribuir las imágenes con lógica según su contenido.
- Se seleccionaron 40 fotografías y se prepararon versiones WebP y miniaturas. Los originales de la carpeta facilitada fueron eliminados por petición expresa del usuario; las copias del proyecto siguen en `assets/`.
- **Distribución:** Montura negra en portada; montura de salto en el banner; escaparate en «Sobre nosotros»; fotos relacionadas en servicios y fichas.
- **Procedencia:** `FOTOS.md` y `assets/local-photo-sources.json`; la importación pública anterior está documentada en `INSTAGRAM.md` y `assets/instagram-sources.json`.

## Estado actual
- Nombre actualizado por petición del usuario a Comercial 2000 Narón en textos, metadatos, cabecera, pie y documentación. Se conservan los enlaces oficiales de Instagram y las claves del carrito.
- Catálogo de 34 fichas en seis categorías: Monturas, Equitación, Ropa y calzado, Cuidados y pieles, Campo y establo, y Complementos.
- Catálogo y galería renderizados desde el servidor con `storefront.mjs`; sin JS se muestran 34 fichas. El navegador mantiene filtros, carga progresiva de 12 fichas, diálogos y carrito persistente.
- Galería ampliable de ocho imágenes: local, reparación de correas, pieles, monturas, comunidad ecuestre, feria de Moeche, herraduras en la tienda y salida a caballo.
- El banner permite filtrar las monturas. Las fichas permiten abrir la fotografía completa.
- Sin canal configurado, el contacto prepara texto para copiar; la cuenta es información para invitados, sin registro ni historial.
- Node.js 22+, ESM y sin dependencias. Ejecución mediante `npm start`; las instrucciones técnicas están en `AGENTS.md` y `README.md`.
- Carpeta `.opencode/commands/` creada en la raíz del proyecto; actualmente vacía, pendiente de definir comandos.
- Auditoría actual y reparaciones en `DIAGNOSTICO.md`: ocho imágenes de galería con miniaturas (-68 % de bytes), ETag/304, Open Graph/canonical desde `PUBLIC_URL`, controles táctiles, agotados y límite de 99 coherente.
- Verificación: Edge/Playwright cubrió 34 fichas, filtros, galería, carrito entre pestañas, contacto, fallos de API/fotos y anchos de 320–1440 px. Ocho pruebas Node y sintaxis de módulos; Safari/Firefox y métricas de producción pendientes.

## Pendientes y decisiones
- Precios y existencias están en `null`; `shop.catalogReady` sigue en `false`. Los importes desconocidos se muestran como «Consultar precio» o «A confirmar» para evitar presentar precios inventados como reales.
- El usuario dejó la pasarela **«Por definir»**. Existe un adaptador opcional de Stripe, pero los cobros no están activados.
- Faltan teléfono, WhatsApp, email, horario, variantes y condiciones de venta confirmadas por la empresa.
- Para operar ventas reales faltan la configuración de pago y la gestión persistente de pedidos e inventario indicada en `README.md`.
- Las fotos de modelos distintos se mantienen separadas; un recorte se identifica como detalle, no como otra toma. La galería distingue productos, reparaciones y comunidad para no atribuir trabajos no verificados.
- Sin pago habilitado, el checkout revisa y copia la selección para consultar. La web sigue sin contador de visitas.
- Última tarea: corregida tarjeta Ropa de trabajo. Foto clara sobre fondo neutro y tarjeta completa como enlace a Ropa y calzado; clic en imagen/título/texto y Enter verificados a 320–1440 px. Regresión Edge/Playwright correcta; captura de servicios y DEMO.md actualizados.
- No hay archivos de vídeo en la carpeta ni en las cuatro subcarpetas de historias; los `.descargar` son código de Instagram. Se necesitan los vídeos originales para incorporarlos.
- `local-calzado-tienda.webp` muestra herraduras y accesorios, no calzado: se conserva el archivo y se identifica correctamente en la galería.
- Última acción: eliminado permanentemente todo el contenido de `fotos web comerciial2000`, tras confirmar ese alcance con el usuario; se verificó que la carpeta está vacía.
- Apertura de la web corregida: el servidor estaba apagado. Se arrancó Node desde el proyecto y se abrió `http://localhost:3000` en el navegador; HTTP 200 y verificación Edge/Playwright correcta tras borrar los originales. Abrir la carpeta en Explorer no abre la web; necesita servidor HTTP.
- Reparaciones actuales: menú móvil sin JS, ARIA persistente en fichas, resumen sincronizado entre pestañas, ordenación por precio desactivada sin precios, CTA acorde al pago, consultas sucesivas limpias y textos/documentación corregidos.
- El retorno pagado solo vacía el carrito si coinciden sesión y selección enviadas, guardadas temporalmente en `sessionStorage`; conserva selecciones cambiadas o ajenas. Verificado con respuestas simuladas, sin cobros reales. No sustituye pedidos persistentes ni webhook.
- Servidor local reiniciado y navegador abierto con la versión reparada; API confirma pago y envío de contacto desactivados. La web es funcional para consultar, pero aún no está lista para operar ventas reales.
- `Tutoriales/` contiene HTML, imágenes y código de Instagram, sin vídeos. El reproductor guardado usa `blob:` y no conserva el vídeo. Reproducción local bloqueada hasta recibir MP4/WebM; detalles en `TUTORIALES.md`.
- La sección enlaza al destacado Tutoriales verificado en el HTML: `https://www.instagram.com/stories/highlights/17878004970056771/`. Se abrió `http://localhost:3000/#tutoriales`; servidor iniciado en ventana PowerShell con `npm start`.
- `git checkout -b demo` falló porque `mi-proyecto` no es un repositorio Git. No se creó la rama ni se inicializó Git.
- Demo: 12 capturas reales en `docs/demo/` (escritorio 1440 × 1000 y móvil 375 × 812), sin datos personales. Verificados 20 enlaces locales, archivos PNG, recorrido de captura y ocho pruebas Node. Las capturas son documentación, no recursos de la tienda.
