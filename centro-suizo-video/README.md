# Centro Suizo · Cómo elegir el anillo de compromiso

Video vertical (1080×1920, 30 fps, ~60 s) con motion graphics, hecho con
[Remotion](https://www.remotion.dev). Es la versión animada del video original
de Centro Suizo:

- intro con el logo dibujándose y revelándose
- logo de Centro Suizo visible durante todo el video
- subtítulos animados palabra por palabra
- se quitó la parte del certificado / "acta de nacimiento"
- cierre nuevo: *"Si conoces a alguien que está pensando en pedir matrimonio,
  mándale este video. ¡Centro Suizo podría ser parte de su historia!"*
- sucursal **Arturo Prat 478** (chip fijo + cierre con la foto del local)
- música y efectos de sonido sintetizados (whooshes, brillos, monedas…)

## Estructura

| Ruta | Qué es |
| --- | --- |
| `assets-src/narracion_original.flac` | narración extraída del video original |
| `assets-src/cierre_voz.wav` | frase final hablada (**provisoria**, ver abajo) |
| `scripts/build_audio.py` | arma la mezcla final y la línea de tiempo |
| `scripts/make_placeholder_voice.py` | genera la voz provisoria del cierre |
| `scripts/preview-stills.mjs` | renderiza fotogramas sueltos para revisar |
| `public/audio/master.wav` | mezcla final (voz + música + efectos) |
| `src/data/timeline.json` | escenas y tiempos de cada palabra (generado) |
| `src/scenes/` | las 13 escenas |
| `src/components/`, `src/gfx/` | fondo, subtítulos, logo, diamante, anillo, estuche… |

## Voz del cierre

La frase final usa por ahora una **voz sintética genérica** (no es la del
narrador). Para usar la misma voz del video original:

1. Genera o graba la frase con la misma voz (por ejemplo, en la misma app de
   voz con la que se hizo el video original).
2. Reemplaza `assets-src/cierre_voz.wav` con ese audio.
3. Vuelve a armar el audio y renderiza (pasos de abajo). Las escenas, los
   subtítulos y los efectos se reajustan solos a la duración nueva.

## Regenerar

```bash
# audio + línea de tiempo (requiere numpy, scipy, soundfile)
python scripts/build_audio.py

# vista previa interactiva
npm run dev

# render final
npx remotion render CentroSuizo out/centro-suizo-anillo-compromiso.mp4 --crf=19
```
