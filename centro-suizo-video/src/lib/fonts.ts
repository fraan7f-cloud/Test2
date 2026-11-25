import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

export const SANS = 'Montserrat';
export const SERIF = 'Cinzel';
export const SCRIPT = 'Cormorant Garamond';

const montserrat = [500, 600, 700, 800, 900].map((w) =>
	loadFont({family: SANS, url: staticFile(`fonts/montserrat-latin-${w}-normal.woff2`), weight: String(w)}),
);
const cinzel = [500, 700].map((w) =>
	loadFont({family: SERIF, url: staticFile(`fonts/cinzel-latin-${w}-normal.woff2`), weight: String(w)}),
);
const cormorant = [500, 600].map((w) =>
	loadFont({
		family: SCRIPT,
		url: staticFile(`fonts/cormorant-garamond-latin-${w}-italic.woff2`),
		weight: String(w),
		style: 'italic',
	}),
);

export const fontsReady = Promise.all([...montserrat, ...cinzel, ...cormorant]);

export const COLORS = {
	gold: '#F3C969',
	goldDeep: '#C8902A',
	goldLight: '#FFE9B0',
	navy: '#0B1033',
	ink: '#141A4A',
	white: '#FFFFFF',
	good: '#3DDC84',
	bad: '#FF5470',
};
