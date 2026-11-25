import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Fuentes descargadas de Google Fonts (OFL) y guardadas en public/fonts para un render sin red.
const faces: {family: string; file: string; weight: string}[] = [
  {family: 'Marcellus', file: 'Marcellus-400.woff2', weight: '400'},
  {family: 'Barlow', file: 'Barlow-300.woff2', weight: '300'},
  {family: 'Barlow', file: 'Barlow-400.woff2', weight: '400'},
  {family: 'Barlow', file: 'Barlow-500.woff2', weight: '500'},
  {family: 'Barlow', file: 'Barlow-600.woff2', weight: '600'},
  {family: 'Allura', file: 'Allura-400.woff2', weight: '400'},
];

export const fontsReady = Promise.all(
  faces.map((f) =>
    loadFont({family: f.family, url: staticFile(`fonts/${f.file}`), weight: f.weight}),
  ),
);
