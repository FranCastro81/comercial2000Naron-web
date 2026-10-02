# Distribución de las fotografías facilitadas

Carpeta de origen: `C:\Users\astra\OneDrive\Documentos\fotos web comerciial2000`.

Se revisaron 179 archivos de imagen de la carpeta y sus historias guardadas, correspondientes a 71 imágenes únicas. Se seleccionaron 40 fotografías útiles para la web y se prepararon copias WebP y miniaturas. La relación entre cada archivo de origen y sus versiones está en `assets/local-photo-sources.json`.

## Criterio visual

- **Portada:** montura negra dentro del local. Conecta la equitación con una imagen real de la tienda.
- **Banner:** montura de salto; su botón filtra la categoría Monturas.
- **Sobre nosotros:** fotografía del escaparate de 898 × 898, mostrada completa.
- **Servicios:** silla Ludomar para equitación; correas con el anuncio de reparaciones para arreglos; botas FAL para ropa y calzado.
- **Galería:** escaparate, reparación de correas, pieles, montura portuguesa, comunidad ecuestre, feria de Moeche, herraduras y accesorios en el local y salida a caballo. Cada imagen puede ampliarse y recorrerse con los botones o las flechas del teclado.
- **Catálogo:** 34 fichas agrupadas por el contenido visible de las fotografías.

## Categorías

| Categoría | Contenido |
| --- | --- |
| Monturas | Silla Ludomar, montura de salto, monturas negras y montura portuguesa infantil |
| Equitación | Salvacruz, riendas, manta, serretas, cuerda y soporte de montura |
| Ropa y calzado | Botas de neopreno, botas FAL, pantalón Issaline, chaleco, botín, zapato y plantillas |
| Cuidados y pieles | Cuidados del caballo, grasa para cuero, pieles, hilo encerado y producto Diptron |
| Campo y establo | Cubos, comedero, bebedero, caldero, anilla y piqueta |
| Complementos | Botas de vino, navajas y panderetas |

## Tratamiento de las imágenes

- El usuario eliminó el contenido de la carpeta original tras confirmar el alcance del borrado. Las versiones WebP, miniaturas y manifiestos conservados en `assets/` siguen disponibles y son los recursos utilizados por la web.
- Las versiones de detalle tienen como máximo 1600 px en el lado mayor, sin ampliar imágenes pequeñas.
- Las miniaturas se preparan con el producto completo centrado, sin recortarlo para llenar la tarjeta.
- Algunos recortes eliminan franjas de interfaz, espacio vacío o el fondo de una captura, conservando el artículo. Sus coordenadas se registran en el manifiesto.
- La ficha conserva el nombre o la marca solo cuando se identifica en la imagen; medidas, disponibilidad y otros datos se consultan con la tienda.
- Las fotos de modelos distintos tienen fichas separadas. Las imágenes de contexto se usan en las secciones visuales.

Para sustituir una foto, modifica `catalog.js` y guarda el archivo en `assets/` con un nombre sin espacios. Los precios y el stock se configuran por separado.

## Comprobación de vídeos

La revisión de la carpeta y sus cuatro subcarpetas de historias guardadas no encontró archivos MP4, WebM, MOV, M4V, AVI ni MKV. Los archivos `.descargar` son código de Instagram, no vídeos. Guardar la página HTML de una historia no conserva necesariamente su vídeo; para incorporarlo a la web hace falta el archivo de vídeo original.

La foto denominada `local-calzado-tienda.webp` en la importación muestra cajas de herraduras y accesorios ecuestres; en la galería se identifica por su contenido visible, conservando su nombre y procedencia originales.
