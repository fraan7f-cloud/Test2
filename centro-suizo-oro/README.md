# Centro Suizo: "¿Tu anillo es de oro puro?" (50 s, Remotion)

- `brand-notes.md`: investigación de marca (paleta, fuentes, fuentes de cada asset).
- `guion.md`: tema, datos y guion por escena.
- `entrega/centro-suizo-quilates-50s.mp4`: video final, 1080×1920, 30 fps, 50 s, H.264 + AAC.

## Previsualizar y renderizar
```bash
npm i
npx remotion studio            # vista previa editable
npx remotion render CentroSuizoQuilates out/video.mp4
```
En entornos sin internet, agregá `--browser-executable=<ruta a Chrome>`.

Estructura del código: `src/theme.tsx` (paleta, fuentes, fondo, tarjetas de vidrio, subtítulos), `src/illustrations.tsx` (anillo, lingote, sellos, disco de 24 partes, balanza en SVG), `src/scenes.tsx` (las 9 escenas) y `src/Composition.tsx` (línea de tiempo y música). La música (`public/music.wav`) es original, sintetizada para este proyecto.
