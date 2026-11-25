// Renderiza fotogramas clave para revisión visual: node scripts/preview-stills.mjs 50 180 ...
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const frames = process.argv.slice(2).map(Number);
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'CentroSuizo18K', browserExecutable});
for (const frame of frames) {
  await renderStill({composition, serveUrl, frame, output: `out/still-${String(frame).padStart(4, '0')}.jpg`, imageFormat: 'jpeg', jpegQuality: 85, scale: 0.5, browserExecutable});
  console.log('frame', frame);
}
