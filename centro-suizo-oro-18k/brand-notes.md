# Brand notes — Joyería Centro Suizo

**Fuente principal:** web oficial https://joyeriacentrosuizo.cl/ (tienda Shopify), leída el 25/11/2026.
Claude en Chrome no estaba disponible en esta sesión. Por eso la web se analizó desde su código: el HTML, la hoja de estilos propia `centro-suizo-luxury.css` y las imágenes de su CDN. No se inventó ningún dato: cada valor sale de una URL que se cita abajo.

## Quién es
- **Joyería Centro Suizo**, de Arica, Chile. Firma: "Joyería Centro Suizo — Joyas desde 1979".
- Tiene tres tiendas: Arturo Prat 478 y 18 de Septiembre 172 en Arica, y Almirante Latorre 708 en Iquique.
- Propuesta de valor, en textos literales de la barra de beneficios: **"Oro 18K certificado · Calidad garantizada en cada pieza"**, **"Garantía de por vida · Ajuste y mantenimiento incluidos"**, **"Asesoría personalizada · Te ayudamos a encontrar la pieza perfecta"** y **"Tres tiendas físicas · Visítanos en Iquique y Arica"**.
- Productos: argollas de matrimonio, anillos de compromiso (también con diamantes), aros para adulto y para bebé, cadenas, pulseras y colgantes. **Todo en oro 18kt.**

## Paleta de colores (HEX exactos)
| Rol | HEX | De dónde sale |
|---|---|---|
| Oro de marca (principal) | `#C8A84B` | `--cs-gold` en `centro-suizo-luxury.css`: hover, bordes de producto, subrayado del menú |
| Oro claro / brillo | `#E2C878` | `--cs-gold-light` en `centro-suizo-luxury.css` |
| Negro de lujo | `#080809` | `--cs-dark`: degradados sobre fotos del slideshow y texto sobre oro |
| Gris cálido de texto | `#5C5850` | `--header-light-text-color` en el `<head>` del sitio |
| Taupe de acento | `#BCAF9B` | `--flickity-arrow-color` (flechas del carrusel) |
| Blanco | `#FFFFFF` | Fondo de las tarjetas de producto |
| Champagne (fotografía) | `#DEC69D` / `#EBD8AF` | Colores dominantes medidos en la pieza de campaña "Pulseras" |
| Marfil (fotografía) | `#F3F2EE` / `#EAE5DD` | Colores dominantes medidos en la pieza "Se sienten!" |

**Conclusión:** la marca combina **oro sobre negro profundo** (el código del sitio) con **fotografía en tonos champagne y marfil**. El video usa `#080809` como fondo, `#C8A84B` y `#E2C878` para el oro, y marfil y champagne para los textos y los brillos.

## Tipografías
| Uso en la marca | Fuente original | Alternativa en Google Fonts usada en el video |
|---|---|---|
| Texto y botones del sitio | **Barlow** (`font-family: Barlow` en el CSS) | **Barlow**, la misma fuente, que es libre |
| Logotipo "CENTRO SUIZO" | Romana versal con remates triangulares, abiertos y elegantes. Es una fuente gráfica sin nombre publicado | **Marcellus**: versales de inspiración clásica, la más parecida a los trazos del logo |
| Títulos de campaña en script ("Nueva colección", "Detalles que marcan") | Caligrafía de autor en las piezas de Instagram | **Allura**, solo para acentos breves |

Los botones del sitio van en **mayúsculas con espaciado amplio** (`letter-spacing:.08em; text-transform:uppercase`). El video replica ese recurso en los rótulos.

## Logotipos
- **Isotipo de diamante** con líneas de facetas, sobre la palabra **CENTRO SUIZO** en versales, rombos decorativos a los lados de "SUIZO" y la bajada "Desde 1979 · Joyas".
- Archivos oficiales usados:
  - `logo_centro.jpg`, blanco sobre negro, 1080×1080: https://joyeriacentrosuizo.cl/cdn/shop/files/logo_centro.jpg
  - `logo_blanco.avif`, logo completo con bajada, del header: https://joyeriacentrosuizo.cl/cdn/shop/files/logo_blanco.avif
- Las versiones `public/brand/logo-dorado.png` y `logo-completo-dorado.png` son el **mismo logo oficial**, solo recoloreado al dorado `#E2C878` y con fondo transparente. No se cambió el dibujo.

## Fotografía
- **Producto:** joyas de oro amarillo sobre fondo gris muy claro (`#F4F4F4`), con luz suave, sombras cortas y encuadre cenital o en 3/4.
- **Campaña:** telas de satén champagne, flores blancas y manos con joyas. Usa luz cálida y difusa, y el logo pequeño y centrado.
- **Conclusión:** la marca es luminosa y cálida, no "bling". El video usa brillos sutiles, reflejos suaves y movimientos lentos.

## Tono de comunicación
- Tutea a la clienta, con una calidez cercana y local: "Te ayudamos a encontrar la pieza perfecta", "Entérate primero", "Visítanos". En Instagram se presenta como "La Joyería de los Ariqueños".
- Es emotivo y breve en campaña: **"Hay decisiones que no se explican. Se sienten!"**, **"Detalles que marcan la diferencia"**, **"Un vínculo eterno"**, **"El anillo que dirá que sí"**.
- Es concreto y técnico en producto: "Peso 10.0 gramos", "Oro 18K certificado".
- **Para el video:** frases cortas y emotivas, datos simples y precisos, tuteo y cierre con su propia frase de campaña.

## Assets recopilados (todos publicados por la marca en su web)
La lista completa con URLs está en `research/assets-sources.json`. Los originales están en `research/originals/` y las versiones listas para usar en `public/`.

| Archivo en `public/` | Qué es | URL de origen (CDN joyeriacentrosuizo.cl/cdn/shop/files/) |
|---|---|---|
| products/argollas_bicolor.jpg | Argolla bi color oro blanco y amarillo 18kt | c07573_c75c0051795d4cfea1c157d00f4a47ae_mv2.png |
| products/argollas_media_cana.jpg | Argollas 18kt | c07573_440698da35ec4d6aaf117191e01d9430_mv2.png |
| products/argollas_tallado.jpg | Argollas tallado 18kt | c07573_4925e414264b44bbaca6cabdd7ae8ef8_mv2.png |
| products/argollas_circon.jpg | Argollas con circón 18kt | c07573_8b93c54953784d1aa617f55641fb39bc_mv2.png |
| products/argollas_triple_circon.jpg | Argollas con circones 18kt | c07573_e63c31cc04db43caa8ff8effa68da905_mv2.png |
| products/aros_bolita.jpg | Aros bolita 18kt | c07573_3aefdff95ccd4aefb48eca3230ae5e7e_mv2.png |
| products/aros_perla.jpg | Aros perla cultivada 18kt | c07573_1ec532aebb9246eda535d8ef29f70ba7_mv2.png |
| products/cadena_bolitas.jpg | Cadena bolitas 18kt | c07573_cf4b39bd0adc418bb8d1229cec7e0169_mv2.png |
| products/campana_pulseras.jpg | Pieza de campaña "Pulseras" | CENTRO_SUIZO_2.png |
| products/campana_se_sienten.jpg | Pieza de campaña "Se sienten!" | 3_437f65e6-f000-4c03-9a54-092358ac4fa6.png |

Fuentes tipográficas: Barlow, Marcellus y Allura vienen de Google Fonts (licencia SIL Open Font License) y están en `public/fonts/`.

**Nota legal:** las imágenes y los logos son propiedad de Joyería Centro Suizo. Se usan solo en esta pieza hecha para la marca. Conviene que la marca confirme la autorización antes de publicar el video.
