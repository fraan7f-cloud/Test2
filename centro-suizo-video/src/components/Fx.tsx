import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {EASE_OUT, map, prog, spr} from '../lib/anim';
import {SANS} from '../lib/fonts';
import {GlintAbs} from '../gfx/Glint';
import {rand} from '../gfx/util';
import {TIMELINE} from '../lib/timeline';

type ChipVariant = 'good' | 'bad' | 'gold' | 'glass';

const CHIP_STYLE: Record<ChipVariant, React.CSSProperties> = {
	good: {background: 'linear-gradient(135deg,#43e08c,#14a35a)', color: '#06210f', boxShadow: '0 0 30px rgba(61,220,132,0.55)'},
	bad: {background: 'linear-gradient(135deg,#ff7a8e,#e3244b)', color: '#2a0410', boxShadow: '0 0 30px rgba(255,84,112,0.55)'},
	gold: {background: 'linear-gradient(135deg,#fff1c4,#f3c969 45%,#c8902a)', color: '#141a4a', boxShadow: '0 0 30px rgba(243,201,105,0.55)'},
	glass: {
		background: 'rgba(255,255,255,0.12)',
		color: '#ffffff',
		border: '2px solid rgba(255,255,255,0.35)',
		boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
		backdropFilter: 'blur(6px)',
	},
};

/** Etiqueta tipo "pill" que aparece con rebote en t0 (y opcionalmente se va en t1) */
export const Chip: React.FC<{
	x: number;
	y: number;
	t: number;
	t0: number;
	t1?: number;
	variant?: ChipVariant;
	size?: number;
	children: React.ReactNode;
	rotate?: number;
}> = ({x, y, t, t0, t1, variant = 'glass', size = 40, children, rotate = 0}) => {
	const p = spr(t, t0, {damping: 10, stiffness: 240, mass: 0.6});
	const out = t1 !== undefined ? prog(t, t1, 0.2) : 0;
	if (p <= 0.001 || out >= 1) {
		return null;
	}
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				translate: '-50% -50%',
				scale: String(Math.max(0, p) * (1 - out * 0.4)),
				rotate: `${rotate + (1 - Math.min(1, p)) * -12}deg`,
				opacity: Math.min(1, p * 2) * (1 - out),
				padding: `${size * 0.32}px ${size * 0.7}px`,
				borderRadius: 999,
				fontFamily: SANS,
				fontWeight: 800,
				fontSize: size,
				whiteSpace: 'nowrap',
				letterSpacing: 0.2,
				...CHIP_STYLE[variant],
			}}
		>
			{children}
		</div>
	);
};

/** Explosión de anillos + rayos + destellos en t0 */
export const Burst: React.FC<{x: number; y: number; t: number; t0: number; size?: number; color?: string; rays?: number}> = ({
	x,
	y,
	t,
	t0,
	size = 420,
	color = '#ffe39a',
	rays = 14,
}) => {
	const p = prog(t, t0, 0.75, EASE_OUT);
	if (t < t0 || p >= 1) {
		return null;
	}
	const fade = 1 - p;
	return (
		<div style={{position: 'absolute', left: x, top: y, width: 0, height: 0, pointerEvents: 'none'}}>
			<svg width={size * 2} height={size * 2} viewBox={`${-size} ${-size} ${size * 2} ${size * 2}`} style={{position: 'absolute', left: -size, top: -size, overflow: 'visible'}}>
				<circle r={size * 0.25 + p * size * 0.75} fill="none" stroke={color} strokeWidth={10 * fade + 1} opacity={fade} />
				<circle r={size * 0.1 + p * size * 0.5} fill="none" stroke="#fff" strokeWidth={5 * fade} opacity={fade * 0.8} />
				{Array.from({length: rays}, (_, i) => {
					const a = (i / rays) * Math.PI * 2 + rand(i) * 0.3;
					const r0 = size * (0.15 + p * 0.55);
					const r1 = r0 + size * 0.25 * fade;
					return (
						<line
							key={i}
							x1={Math.cos(a) * r0}
							y1={Math.sin(a) * r0}
							x2={Math.cos(a) * r1}
							y2={Math.sin(a) * r1}
							stroke={i % 3 === 0 ? '#ffffff' : color}
							strokeWidth={6 * fade + 1}
							strokeLinecap="round"
							opacity={fade}
						/>
					);
				})}
			</svg>
			{[0, 1, 2, 3, 4].map((i) => {
				const a = rand(i * 3 + t0) * Math.PI * 2;
				const d = size * (0.3 + 0.6 * rand(i * 7 + t0)) * p;
				return (
					<GlintAbs
						key={i}
						x={Math.cos(a) * d}
						y={Math.sin(a) * d}
						size={30 + rand(i + t0 * 3) * 30}
						amount={Math.sin(Math.PI * Math.min(1, p * 1.3))}
						color={i % 2 ? '#fff' : color}
					/>
				);
			})}
		</div>
	);
};

/** Partículas brillantes flotando alrededor de un punto */
export const Sparkles: React.FC<{x: number; y: number; t: number; radius?: number; count?: number; amount?: number; seed?: number}> = ({
	x,
	y,
	t,
	radius = 320,
	count = 10,
	amount = 1,
	seed = 1,
}) => {
	if (amount <= 0) {
		return null;
	}
	return (
		<div style={{position: 'absolute', left: x, top: y, width: 0, height: 0}}>
			{Array.from({length: count}, (_, i) => {
				const period = 1.4 + rand(i * 5 + seed) * 1.2;
				const ph = ((t + rand(i * 9 + seed) * period) % period) / period;
				const cyc = Math.floor((t + rand(i * 9 + seed) * period) / period);
				const a = rand(cyc * 3.3 + i * 11 + seed) * Math.PI * 2;
				const d = radius * (0.35 + 0.65 * rand(cyc * 1.7 + i + seed));
				return (
					<GlintAbs
						key={i}
						x={Math.cos(a) * d}
						y={Math.sin(a) * d * 0.8}
						size={14 + rand(i * 2 + seed) * 26}
						amount={Math.sin(ph * Math.PI) ** 2 * amount}
						color={i % 3 === 0 ? '#ffe39a' : '#ffffff'}
					/>
				);
			})}
		</div>
	);
};

/** Destello + raya de luz en cada cambio de escena */
export const CutFlashes: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;
	const cuts = TIMELINE.scenes.slice(2).map((s) => s.start);
	const c = cuts.find((x) => t >= x - 0.12 && t < x + 0.35);
	if (c === undefined) {
		return null;
	}
	const p = map(t, c - 0.12, c + 0.35, 0, 1);
	const flash = Math.sin(Math.PI * map(t, c - 0.08, c + 0.18, 0, 1)) * 0.38;
	const streakX = map(p, 0, 1, -900, 1900, EASE_OUT);
	return (
		<>
			<div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 55%, rgba(255,250,235,1) 0%, rgba(255,240,210,0.4) 35%, transparent 70%)', opacity: flash, mixBlendMode: 'screen'}} />
			<div
				style={{
					position: 'absolute',
					left: streakX,
					top: -300,
					width: 160,
					height: 2600,
					rotate: '24deg',
					background: 'linear-gradient(90deg, transparent, rgba(255,236,190,0.55), rgba(255,255,255,0.9), rgba(255,236,190,0.55), transparent)',
					filter: 'blur(14px)',
					opacity: Math.sin(Math.PI * p),
					mixBlendMode: 'screen',
				}}
			/>
		</>
	);
};

/** Chip fijo con la dirección de la sucursal */
export const BranchFooter: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;
	const p = spr(t, TIMELINE.intro + 0.4, {damping: 14, stiffness: 120});
	const out = prog(t, TIMELINE.outroStart - 0.25, 0.3);
	if (p <= 0 || out >= 1) {
		return null;
	}
	const shine = ((t % 6) / 1.2) * 140 - 20;
	return (
		<div
			style={{
				position: 'absolute',
				left: 540,
				top: 1742,
				translate: `-50% ${(1 - p) * 120 + out * 60}px`,
				opacity: Math.min(1, p) * (1 - out),
				display: 'flex',
				alignItems: 'center',
				gap: 14,
				padding: '14px 30px 14px 22px',
				borderRadius: 999,
				background: `linear-gradient(110deg, rgba(11,16,51,0.72) ${shine - 12}%, rgba(255,227,154,0.28) ${shine}%, rgba(11,16,51,0.72) ${shine + 12}%)`,
				border: '2px solid rgba(243,201,105,0.65)',
				boxShadow: '0 10px 30px rgba(0,0,0,0.45), 0 0 24px rgba(243,201,105,0.25)',
				fontFamily: SANS,
				fontWeight: 700,
				fontSize: 34,
				color: '#fff',
				whiteSpace: 'nowrap',
			}}
		>
			<svg width={30} height={39} viewBox="0 0 100 130">
				<path d="M50,125 C50,125 8,72 8,46 A42,42 0 1,1 92,46 C92,72 50,125 50,125 Z" fill="#F3C969" />
				<circle cx={50} cy={46} r={17} fill="#0b1033" />
			</svg>
			<span>
				Sucursal <span style={{color: '#F3C969', fontWeight: 800}}>Arturo Prat 478</span>
			</span>
		</div>
	);
};
