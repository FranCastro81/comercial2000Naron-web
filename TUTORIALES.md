# Tutoriales de Comercial 2000 Narón

## Apartado de la web

La sección `#tutoriales` aparece después de Servicios y tiene accesos desde el menú principal y el pie de página. Funciona también sin JavaScript y enlaza a la historia destacada de la tienda:

https://www.instagram.com/stories/highlights/17878004970056771/

El enlace se obtuvo del elemento etiquetado «Ver historia destacada Tutoriales» en `Tutoriales/Historias • Instagram3.html`. No se ejecutó el código guardado de Instagram ni se publicó esa carpeta como recursos de la web.

## Material recibido

La carpeta `Tutoriales/` contiene dos archivos HTML, 13 CSS, 306 archivos `.descargar`, 29 JPG y 19 WebP. No contiene archivos MP4, WebM, MOV o M4V.

El reproductor de la página guardada tiene como origen una URL `blob:` de Instagram: apunta a datos temporales de aquella sesión del navegador, no a un archivo conservado en la carpeta. Los `.descargar` inspeccionados son código JavaScript; el campo `video_versions` del HTML está en `null` y no se encontró una URL de vídeo descargable.

Por eso la sección ofrece acceso a Instagram, pero todavía no reproduce vídeos dentro de la web. Instagram puede solicitar inicio de sesión.

## Para incorporar reproducción local

Facilitar los vídeos originales MP4 (H.264/AAC) o WebM, preferiblemente con títulos descriptivos, dentro de `Tutoriales/`. Guardar la página de Instagram como HTML no descarga necesariamente sus vídeos.

Cuando estén disponibles, se podrán importar versiones para la web a rutas directas de `assets/`, registrar su procedencia, configurar el servidor para servir vídeo con peticiones parciales HTTP y añadir reproductores con controles, `playsinline` y sin reproducción automática. Si hay explicación hablada, facilitar también subtítulos o transcripción.
