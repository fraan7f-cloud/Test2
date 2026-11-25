import React from 'react';
import {AbsoluteFill, interpolateColors, useCurrentFrame, useVideoConfig} from 'remotion';
import {SceneId, TIMELINE} from '../lib/timeline';
import {rand} from '../gfx/util';
import {spr} from '../lib/anim';

type Theme = {center: string; edge: string; accent: string; dark: number};

const THEMES: Record<SceneId, Theme> = {
	intro: {center: '#1a1f5c', edge: '#03040f', accent: '#6b7cff', dark: 0.35},
	estuche: {center: '#232a78', edge: '#080b26', accent: '#8a9bff', dark: 0},
	tamano: {center: '#20286f', edge: '#070a22', accent: '#7f8fff', dark: 0},
	luz: {center: '#1b2363', edge: '#05071c', accent: '#7aa2ff', dark: 0},
	dinero: {center: '#4a1d55', edge: '#14061b', accent: '#ff9bd2', dark: 0},
	color: {center: '#252c7a', edge: '#080b26', accent: '#ffd98a', dark: 0},
	pureza: {center: '#3d1a5c', edge: '#11061c', accent: '#c59bff', dark: 0},
	truco: {center: '#521c4a', edge: '#160615', accent: '#ffb38a', dark: 0},
	talla: {center: '#1c1640', edge: '#020208', accent: '#a58cff', dark: 0.25},
	brilla: {center: '#262f86', edge: '#070a24', accent: '#ffe39a', dark: 0},
	cta: {center: '#3f1d63', edge: '#10061d', accent: '#ff8fb8', dark: 0},
	historia: {center: '#2a2378', edge: '#07061f', accent: '#ffe39a', dark: 0},
	outro: {center: '#1d2466', edge: '#04051a', accent: '#ffe39a', dark: 0},
};

const BOKEH = Array.from({length: 34}, (_, i) => ({
	x: rand(i * 1.3) * 1080,
	y: rand(i * 2.7) * 1920,
	r: 18 + rand(i * 4.1) ** 2 * 120,
	speed: 8 + rand(i * 5.3) * 30,
	phase: rand(i * 6.6) * 6.28,
	depth: 0.3 + rand(i * 7.9) * 0.9,
	hueShift: rand(i * 8.8),
}));

export const Background: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;
	const scenes = TIMELINE.scenes;
	let idx = scenes.findIndex((s) => t >= s.start && t < s.end);
	if (idx < 0) {
		idx = scenes.length - 1;
	}
	const cur = scenes[idx];
	const prev = scenes[Math.max(0, idx - 1)];
	const k = Math.min(1, (t - cur.start) / 0.45);
	const A = THEMES[prev.id];
	const B = idx === 0 ? THEMES[cur.id] : THEMES[cur.id];
	const kk = idx === 0 ? 1 : k;
	const center = interpolateColors(kk, [0, 1], [A.center, B.center]);
	const edge = interpolateColors(kk, [0, 1], [A.edge, B.edge]);
	const accent = interpolateColors(kk, [0, 1], [A.accent, B.accent]);
	const dark = A.dark + (B.dark - A.dark) * kk;

	// "golpe de cámara" del bokeh en cada cambio de escena
	let kick = 0;
	scenes.forEach((s, i) => {
		if (i === 0) {
			return;
		}
		const dir = i % 2 ? 1 : -1;
		kick += dir * spr(t, s.start - 0.15, {damping: 18, stiffness: 90}) * 160;
	});

	return (
		<AbsoluteFill style={{background: `radial-gradient(120% 80% at 50% 45%, ${center} 0%, ${edge} 100%)`}}>
			{/* haces de luz */}
			{[0, 1, 2].map((i) => (
				<div
					key={i}
					style={{
						position: 'absolute',
						left: 540 - 140,
						top: -400,
						width: 280,
						height: 2900,
						transformOrigin: '50% 0%',
						rotate: `${-35 + i * 32 + Math.sin(t * 0.25 + i * 2) * 10}deg`,
						background: `linear-gradient(180deg, ${accent}33 0%, ${accent}10 45%, transparent 75%)`,
						filter: 'blur(28px)',
						opacity: 0.55,
					}}
				/>
			))}
			{/* bokeh */}
			{BOKEH.map((b, i) => {
				const y = (((b.y - t * b.speed * b.depth) % 2100) + 2100) % 2100 - 90;
				const x = b.x + Math.sin(t * 0.3 + b.phase) * 30 + kick * b.depth;
				const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * (0.8 + b.depth) + b.phase));
				const col = b.hueShift > 0.75 ? '#ffe2a8' : b.hueShift > 0.45 ? accent : '#c9d4ff';
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: x - b.r,
							top: y - b.r,
							width: b.r * 2,
							height: b.r * 2,
							borderRadius: '50%',
							background: `radial-gradient(circle, ${col}55 0%, ${col}22 55%, transparent 70%)`,
							border: b.r > 60 ? `1.5px solid ${col}22` : undefined,
							opacity: tw * (0.4 + 0.6 * b.depth),
							filter: b.depth < 0.6 ? 'blur(6px)' : undefined,
						}}
					/>
				);
			})}
			{/* viñeta */}
			<AbsoluteFill style={{background: 'radial-gradient(90% 70% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)'}} />
			{dark > 0 ? <AbsoluteFill style={{backgroundColor: `rgba(0,0,0,${dark})`}} /> : null}
		</AbsoluteFill>
	);
};
