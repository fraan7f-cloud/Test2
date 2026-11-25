// Identidad visual de Joyería Centro Suizo (ver brand-notes.md para el origen de cada valor).
export const COLORS = {
  gold: '#C8A84B', // --cs-gold (centro-suizo-luxury.css)
  goldLight: '#E2C878', // --cs-gold-light
  dark: '#080809', // --cs-dark
  warmGray: '#5C5850', // --header-light-text-color
  taupe: '#BCAF9B', // --flickity-arrow-color
  champagne: '#DEC69D', // dominante en fotografía de campaña
  ivory: '#F3F2EE', // dominante en fotografía de campaña
  white: '#FFFFFF',
  cardBorder: 'rgba(200, 168, 75, .35)', // --cs-card-border
} as const;

export const FONTS = {
  display: 'Marcellus, serif', // alternativa libre al logotipo
  body: 'Barlow, sans-serif', // fuente real del sitio
  script: 'Allura, cursive', // acentos caligráficos de campaña
} as const;

// Oro "metálico": degradado con zona de brillo que se desplaza para simular un reflejo.
export const GOLD_GRADIENT =
  'linear-gradient(105deg, #6E5019 0%, #A9852F 14%, #C8A84B 26%, #E2C878 38%, #FFF4D2 47%, #E2C878 56%, #C8A84B 68%, #9C7A2C 84%, #6E5019 100%)';

// Ritmo musical: 72 BPM a 30 fps → 1 tiempo = 25 frames, 1 compás = 100 frames.
export const BEAT = 25;
export const BAR = 100;

// Curvas de movimiento del sitio (--cs-ease-out / --cs-ease-in-out)
export const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
export const EASE_IN_OUT: [number, number, number, number] = [0.77, 0, 0.175, 1];
