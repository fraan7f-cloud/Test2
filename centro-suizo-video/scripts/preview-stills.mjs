// Renderiza fotogramas sueltos para revisar el video sin renderizarlo entero.
// Uso: node scripts/preview-stills.mjs <carpeta-salida> <seg1> <seg2> ... [--scale=0.5] [--browser=/ruta/chrome]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter((a) => a.startsWith('--')).map((a) => a.slice(2).split('=')));
const [outDir, ...times] = args.filter((a) => !a.startsWith('--'));
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts')});
const browserExecutable = flags.browser ?? null;
const composition = await selectComposition({serveUrl, id: 'CentroSuizo', browserExecutable});
for (const s of times) {
	const frame = Math.min(composition.durationInFrames - 1, Math.round(Number(s) * composition.fps));
	const output = path.join(outDir, `t${String(s).padStart(5, '0')}.jpg`);
	await renderStill({serveUrl, composition, frame, output, imageFormat: 'jpeg', scale: Number(flags.scale ?? 0.5), browserExecutable});
	console.log(output);
}
