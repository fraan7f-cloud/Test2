# Centro Suizo · "¿Qué significa 18K?" — spot de 50 s en Remotion

Video publicitario vertical (1080×1920, 30 fps, 1500 frames = **50,00 s**) para **Joyería Centro Suizo** (Arica · Iquique, Chile).

**Video final (animación 2D):** `Renders/centro-suizo-oro-18k-2d.mp4`
Versión anterior, en motion graphics: `Renders/centro-suizo-oro-18k.mp4`. Su código quedó en el historial de git, en el commit anterior.

## Estilo de animación 2D
Ilustración vectorial plana con sombreado en tonos de oro (`src/components/Illustration.tsx`), animada con principios clásicos de animación 2D: anticipación, estiramiento y aplastamiento, rebote, arcos y acción secundaria.
- Gancho: una pepita cae, rebota y estalla en el "18K".
- Semilla: una rama de algarrobo cuya vaina se abre y suelta la semilla sobre la balanza.
- 24 partes: un lingote que se parte en 24 lingotitos.
- Comparación: tubos que se llenan de oro líquido.
- ¿Por qué no 24K?: un martillo abolla el anillo de 24K, y gotas de oro, plata y cobre caen al crisol.
- Sello 750: punzón y martillo graban el sello.
- Cierre: un joyero se abre y deja salir los productos.

## Estructura del proyecto
```
brand-notes.md              Investigación de marca: colores HEX, tipografías, logos, tono y fuentes
guion.md                    Tema elegido, datos verificados y guion escena por escena
research/
  originals/                Assets originales descargados de joyeriacentrosuizo.cl
  assets-sources.json       URL de origen de cada asset
public/
  brand/                    Logos oficiales (recoloreados a dorado o blanco, con fondo transparente)
  products/                 Fotos de producto y campaña de la marca
  fonts/                    Marcellus, Barlow y Allura (Google Fonts, OFL)
  audio/                    Música y efectos ORIGINALES (generados por script)
scripts/
  prepare_assets.py         Descarga y procesa los assets de la marca
  generate_audio.py         Sintetiza la música y los efectos desde cero (numpy)
  preview-stills.mjs        Renderiza fotogramas de control
src/
  theme.ts                  Paleta, fuentes, ritmo (72 BPM = 25 frames por tiempo) y curvas
  CentroSuizo18K.tsx        Línea de tiempo: escenas, música y efectos sincronizados
  components/               Ilustraciones 2D, texto de oro, fondo con destellos, tarjetas de producto, etc.
  scenes/S1…S7              Una escena por archivo
Renders/                    MP4 final
```

## Cómo reproducirlo
```bash
npm install
python3 scripts/prepare_assets.py   # assets de la marca (necesita acceso a joyeriacentrosuizo.cl)
python3 scripts/generate_audio.py   # música y efectos
npm run studio                      # vista previa interactiva
npm run render                      # MP4 en Renders/
```
