import {useId} from 'react';

/** id seguro para usar en url(#id) dentro de SVG */
export const useSvgId = (prefix: string) => {
	const raw = useId();
	return `${prefix}-${raw.replace(/[^a-zA-Z0-9_-]/g, '')}`;
};

export type Pt = [number, number];

export const pts = (p: Pt[]) => p.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ');

/** triangulación "cremallera" entre dos polilíneas ordenadas por x */
export const zipper = (a: Pt[], b: Pt[]): Pt[][] => {
	const nx = (p: Pt[], i: number) => (p[i][0] - p[0][0]) / (p[p.length - 1][0] - p[0][0] || 1);
	const out: Pt[][] = [];
	let i = 0;
	let j = 0;
	while (i < a.length - 1 || j < b.length - 1) {
		const advA = j === b.length - 1 || (i < a.length - 1 && nx(a, i + 1) <= nx(b, j + 1));
		if (advA) {
			out.push([a[i], b[j], a[i + 1]]);
			i++;
		} else {
			out.push([a[i], b[j], b[j + 1]]);
			j++;
		}
	}
	return out;
};

/** pseudo-aleatorio determinista */
export const rand = (seed: number) => {
	const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
	return x - Math.floor(x);
};

/** estrella de 4 puntas cóncava */
export const starPath = (r: number, inner = 0.12) => {
	const k = r * inner;
	return `M0,${-r} Q${k},${-k} ${r},0 Q${k},${k} 0,${r} Q${-k},${k} ${-r},0 Q${-k},${-k} 0,${-r} Z`;
};
