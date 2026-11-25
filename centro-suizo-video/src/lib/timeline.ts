import data from '../data/timeline.json';

export type Word = {
	text: string;
	emph: boolean;
	start: number;
	end: number;
	seg: number;
	chunk: number;
};

export type SceneId =
	| 'intro'
	| 'estuche'
	| 'tamano'
	| 'luz'
	| 'dinero'
	| 'color'
	| 'pureza'
	| 'truco'
	| 'talla'
	| 'brilla'
	| 'cta'
	| 'historia'
	| 'outro';

export type SceneInfo = {id: SceneId; start: number; end: number};

export const TIMELINE = data as {
	fps: number;
	total: number;
	intro: number;
	ctaStart: number;
	ctaEnd: number;
	outroStart: number;
	scenes: SceneInfo[];
	words: Word[];
};

export const WORDS = TIMELINE.words;

export const scene = (id: SceneId): SceneInfo => {
	const s = TIMELINE.scenes.find((x) => x.id === id);
	if (!s) {
		throw new Error(`Scene ${id} not found`);
	}
	return s;
};

const norm = (t: string) => t.replace(/^[¿¡]+|[?!.,:;]+$/g, '').toLowerCase();

/** Momento (segundos globales) en que se dice una palabra. */
export const word = (text: string, occurrence = 1): Word => {
	let k = 0;
	for (const w of WORDS) {
		if (norm(w.text) === text.toLowerCase()) {
			k++;
			if (k === occurrence) {
				return w;
			}
		}
	}
	throw new Error(`Word "${text}" #${occurrence} not found`);
};

/** inicio de la palabra */
export const at = (text: string, occurrence = 1) => word(text, occurrence).start;
