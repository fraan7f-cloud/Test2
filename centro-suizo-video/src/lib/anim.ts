import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

/** Tiempo global (segundos) dentro de una escena que empieza en `start`. */
export const useGlobalTime = (start: number) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return start + frame / fps;
};

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** progreso 0..1 lineal-con-easing entre t0 y t0+dur */
export const prog = (t: number, t0: number, dur: number, easing: (x: number) => number = Easing.bezier(0.22, 1, 0.36, 1)) =>
	interpolate(t, [t0, t0 + dur], [0, 1], {...CLAMP, easing});

/** progreso con resorte (puede pasar de 1 => rebote) */
export const spr = (
	t: number,
	t0: number,
	config: {damping?: number; stiffness?: number; mass?: number} = {},
	fps = 30,
) => {
	if (t < t0) {
		return 0;
	}
	return spring({
		frame: (t - t0) * fps,
		fps,
		config: {damping: config.damping ?? 12, stiffness: config.stiffness ?? 140, mass: config.mass ?? 0.8},
	});
};

/** mapea v de [a,b] a [c,d] con clamp */
export const map = (v: number, a: number, b: number, c: number, d: number, easing?: (x: number) => number) =>
	interpolate(v, [a, b], [c, d], {...CLAMP, easing});

/** pulso 0->1->0 centrado en t0 */
export const pulse = (t: number, t0: number, up: number, down: number) => {
	if (t < t0) {
		return map(t, t0 - up, t0, 0, 1, Easing.out(Easing.quad));
	}
	return map(t, t0, t0 + down, 1, 0, Easing.in(Easing.quad));
};

/** visible entre [a, b) con fundidos */
export const window01 = (t: number, a: number, b: number, fadeIn = 0.2, fadeOut = 0.2) =>
	Math.min(map(t, a, a + fadeIn, 0, 1), map(t, b - fadeOut, b, 1, 0));

/** ruido suave determinista */
export const wobble = (t: number, seed: number, speed = 1) =>
	Math.sin(t * 1.7 * speed + seed * 12.9898) * 0.6 + Math.sin(t * 2.9 * speed + seed * 78.233) * 0.4;

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN = Easing.bezier(0.7, 0, 0.84, 0);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
