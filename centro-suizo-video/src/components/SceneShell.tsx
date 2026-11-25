import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN, EASE_OUT, map, prog} from '../lib/anim';

export type TransitionKind = 'zoom' | 'slideLeft' | 'slideRight' | 'slideUp' | 'spin' | 'none';

export const EXIT = 0.32;

/**
 * Envuelve una escena: entrada dinámica (whip / zoom / giro) + salida, y un
 * leve "push-in" de cámara durante toda la escena.
 */
export const SceneShell: React.FC<{
	t: number;
	start: number;
	end: number;
	enter?: TransitionKind;
	exit?: TransitionKind;
	children: React.ReactNode;
	push?: number;
}> = ({t, start, end, enter = 'zoom', exit = 'zoom', children, push = 0.06}) => {
	const pi = prog(t, start - 0.04, 0.42, EASE_OUT);
	const po = exit === 'none' ? 0 : map(t, end - 0.06, end + EXIT - 0.06, 0, 1, EASE_IN);
	if (po >= 1) {
		return null;
	}
	const ei = 1 - pi;
	let tx = 0;
	let ty = 0;
	let sc = 1;
	let rot = 0;
	let blur = 0;
	let op = 1;
	switch (enter) {
		case 'zoom':
			sc *= 1 + ei * 0.6;
			blur += ei * 18;
			op *= 1 - ei;
			break;
		case 'slideLeft':
			tx += ei * 1100;
			blur += ei * 22;
			rot += ei * 6;
			break;
		case 'slideRight':
			tx -= ei * 1100;
			blur += ei * 22;
			rot -= ei * 6;
			break;
		case 'slideUp':
			ty += ei * 1500;
			blur += ei * 20;
			break;
		case 'spin':
			rot -= ei * 35;
			sc *= 1 - ei * 0.6;
			op *= 1 - ei;
			blur += ei * 10;
			break;
		default:
			break;
	}
	switch (exit) {
		case 'zoom':
			sc *= 1 - po * 0.45;
			blur += po * 16;
			op *= 1 - po;
			break;
		case 'slideLeft':
			tx -= po * 1100;
			blur += po * 22;
			rot -= po * 6;
			break;
		case 'slideRight':
			tx += po * 1100;
			blur += po * 22;
			rot += po * 6;
			break;
		case 'slideUp':
			ty -= po * 1500;
			blur += po * 20;
			break;
		case 'spin':
			rot += po * 30;
			sc *= 1 + po * 0.5;
			op *= 1 - po;
			blur += po * 10;
			break;
		default:
			break;
	}
	const cam = 1 + push * map(t, start, end, 0, 1);
	return (
		<AbsoluteFill
			style={{
				translate: `${tx}px ${ty}px`,
				scale: String(sc * cam),
				rotate: `${rot}deg`,
				opacity: op,
				filter: blur > 0.4 ? `blur(${blur}px)` : undefined,
				transformOrigin: '50% 58%',
			}}
		>
			{children}
		</AbsoluteFill>
	);
};
