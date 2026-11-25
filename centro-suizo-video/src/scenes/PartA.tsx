import React from 'react';
import {Burst, Chip, Sparkles} from '../components/Fx';
import {DiamondAt, Halo, Place, Rays} from '../components/Place';
import {SceneShell} from '../components/SceneShell';
import {Coin, Eye, PriceTag, RingBox} from '../gfx/Props';
import {GlintAbs} from '../gfx/Glint';
import {rand} from '../gfx/util';
import {EASE_IN, EASE_IN_OUT, EASE_OUT, map, prog, pulse, spr, useGlobalTime, wobble} from '../lib/anim';
import {SANS} from '../lib/fonts';
import {at} from '../lib/timeline';

type SceneProps = {start: number; end: number};

/* ------------------------------------------------------------------ */
/* 1. "Así se elige el anillo de compromiso ideal, sin pagar de más." */
/* ------------------------------------------------------------------ */
export const Estuche: React.FC<SceneProps> = ({start, end}) => {
	const t = useGlobalTime(start);
	const rise = spr(t, start - 0.05, {damping: 14, stiffness: 90});
	const openT = at('anillo') - 0.15;
	const open = prog(t, openT, 0.5, EASE_OUT);
	const glow = pulse(t, openT + 0.3, 0.15, 0.9);
	const ringRise = spr(t, openT + 0.25, {damping: 9, stiffness: 120});
	const boxW = 660;
	const cx = 540;
	const cy = 1130 - wobble(t, 1, 0.6) * 8;
	const diaY = cy - (boxW * 1.05) / 2 + (232 - 40 * ringRise - 72) * (boxW / 400);
	const tagIn = spr(t, at('sin') - 0.15, {damping: 8, stiffness: 70});
	const swing = (1 - Math.min(1, tagIn)) * 40 + Math.sin((t - at('sin')) * 6) * 14 * Math.exp(-(t - at('sin')) * 1.6);
	const crossed = prog(t, at('más') + 0.05, 0.3, EASE_OUT);
	const stamp = pulse(t, at('más') + 0.2, 0.05, 0.25);
	return (
		<SceneShell t={t} start={start} end={end} enter="none" exit="slideLeft">
			<Rays x={cx} y={diaY + 60} t={t} size={1300} amount={open * 0.9} />
			<Halo x={cx} y={diaY + 40} size={800} amount={open * 0.8} />
			<Place x={cx} y={cy} scale={0.4 + 0.6 * rise} rotate={(1 - rise) * -18} opacity={Math.min(1, rise * 2)}>
				<div style={{translate: `0px ${(1 - rise) * 700}px`}}>
					<RingBox width={boxW} t={t} open={open} ringRise={ringRise} glow={glow} />
				</div>
			</Place>
			<Burst x={cx} y={diaY} t={t} t0={at('ideal') - 0.05} size={380} />
			<GlintAbs x={cx + 40} y={diaY - 30} size={110} amount={pulse(t, at('ideal'), 0.12, 0.5)} />
			<Sparkles x={cx} y={diaY} t={t} radius={300} count={8} amount={open} seed={2} />
			{/* etiqueta de precio */}
			{tagIn > 0 ? (
				<div style={{position: 'absolute', left: 760 + (1 - Math.min(1, tagIn)) * 500, top: 720, scale: String(1 + stamp * 0.15)}}>
					<PriceTag width={210} text="$$$" swing={swing} crossed={crossed} />
				</div>
			) : null}
		</SceneShell>
	);
};

/* ------------------------------------------------------------------ */
/* 2. tamaño -> sin brillo -> EL CORTE                                 */
/* ------------------------------------------------------------------ */
export const Tamano: React.FC<SceneProps> = ({start, end}) => {
	const t = useGlobalTime(start);
	const cx = 540;
	const cy = 1010;
	const grow = spr(t, at('tamaño') - 0.1, {damping: 11, stiffness: 110});
	const corteT = at('corte');
	const dullK = prog(t, at('brillar') - 0.05, 0.45);
	const cut = prog(t, corteT - 0.45, 0.6, EASE_IN_OUT);
	const back = prog(t, corteT, 0.35, EASE_OUT);
	const brilliance = 1 - dullK + back;
	const shrink = prog(t, at('cosa') - 0.3, 0.6, EASE_IN_OUT);
	const enter = spr(t, start, {damping: 12, stiffness: 140});
	const w = 300 + 330 * grow - 80 * shrink + 60 * spr(t, corteT, {damping: 8, stiffness: 160}) * (1 - prog(t, corteT + 0.4, 0.5));
	const half = (w * 100) / 240;
	const measure = Math.min(prog(t, at('tamaño'), 0.5, EASE_OUT), 1 - prog(t, at('cosa') - 0.2, 0.3));
	const lineY = cy + (w * 105) / 240 + 40;
	const looking = Math.min(spr(t, at('Casi') + 0.05, {damping: 12}), 1 - prog(t, at('pero'), 0.25));
	const eyes = [
		{x: 200, y: 820, s: 150, look: 1},
		{x: 880, y: 760, s: 160, look: -1},
		{x: 860, y: 1330, s: 140, look: -1},
		{x: 230, y: 1300, s: 130, look: 1},
	];
	const shake = (1 - dullK) > 0.99 ? 0 : Math.sin(t * 40) * 6 * pulse(t, at('brillar') + 0.2, 0.05, 0.4);
	return (
		<SceneShell t={t} start={start} end={end} enter="slideLeft" exit="spin">
			<Rays x={cx} y={cy + 40} t={t} size={1400} amount={back} />
			<Halo x={cx} y={cy + 30} size={900} amount={back * 0.9 + (1 - dullK) * 0.3} />
			{eyes.map((e, i) => (
				<Place key={i} x={e.x} y={e.y} scale={looking * (0.9 + 0.1 * Math.sin(t * 3 + i))} rotate={wobble(t, i) * 6}>
					<Eye width={e.s} look={e.look * 0.8} open={0.85 + 0.15 * Math.abs(Math.sin(t * 0.8 + i * 2))} />
				</Place>
			))}
			<DiamondAt
				x={cx + shake}
				y={cy}
				width={w}
				t={t}
				brilliance={Math.min(1, brilliance)}
				cutLines={cut}
				scale={enter}
				rotate={wobble(t, 3, 0.5) * 3}
				glints={back > 0 ? 1.4 : 1}
			/>
			{/* línea de medida */}
			{measure > 0.01 ? (
				<svg width={1080} height={200} viewBox={`0 ${lineY - 100} 1080 200`} style={{position: 'absolute', left: 0, top: lineY - 100, overflow: 'visible', opacity: measure}}>
					<line x1={cx - half * measure} y1={lineY} x2={cx + half * measure} y2={lineY} stroke="#F3C969" strokeWidth={5} strokeLinecap="round" />
					<line x1={cx - half * measure} y1={lineY - 22} x2={cx - half * measure} y2={lineY + 22} stroke="#F3C969" strokeWidth={5} strokeLinecap="round" />
					<line x1={cx + half * measure} y1={lineY - 22} x2={cx + half * measure} y2={lineY + 22} stroke="#F3C969" strokeWidth={5} strokeLinecap="round" />
				</svg>
			) : null}
			<Chip x={cx} y={lineY + 80} t={t} t0={at('tamaño') + 0.1} t1={at('pero')} variant="gold">
				tamaño
			</Chip>
			<Chip x={cx} y={1420} t={t} t0={at('brillar') + 0.1} t1={corteT - 0.25} variant="glass">
				sin brillo
			</Chip>
			<Chip x={cx} y={1440} t={t} t0={corteT + 0.15} variant="gold" size={46}>
				✦ el corte ✦
			</Chip>
			<Burst x={cx} y={cy} t={t} t0={corteT} size={620} />
			<Sparkles x={cx} y={cy} t={t} radius={420} count={12} amount={back} seed={5} />
		</SceneShell>
	);
};

/* ------------------------------------------------------------------ */
/* 3. bien cortado (la luz vuelve a tus ojos) vs mal cortado           */
/* ------------------------------------------------------------------ */
const polyLen = (p: [number, number][]) => p.slice(1).reduce((s, q, i) => s + Math.hypot(q[0] - p[i][0], q[1] - p[i][1]), 0);

const Beam: React.FC<{points: [number, number][]; k: number; color: string; core?: string}> = ({points, k, color, core = '#ffffff'}) => {
	if (k <= 0) {
		return null;
	}
	const d = points.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
	const L = polyLen(points);
	const vis = L * k;
	// punta de la luz
	let acc = 0;
	let tip = points[0];
	for (let i = 1; i < points.length; i++) {
		const seg = Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
		if (acc + seg >= vis) {
			const f = (vis - acc) / seg;
			tip = [points[i - 1][0] + (points[i][0] - points[i - 1][0]) * f, points[i - 1][1] + (points[i][1] - points[i - 1][1]) * f];
			break;
		}
		acc += seg;
		tip = points[i];
	}
	return (
		<svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
			<path d={d} fill="none" stroke={color} strokeWidth={34} strokeOpacity={0.35} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={`${vis} ${L}`} style={{filter: 'blur(10px)'}} />
			<path d={d} fill="none" stroke={color} strokeWidth={14} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={`${vis} ${L}`} />
			<path d={d} fill="none" stroke={core} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={`${vis} ${L}`} />
			{k < 1 ? <circle cx={tip[0]} cy={tip[1]} r={22} fill="#fff" style={{filter: 'blur(4px)'}} /> : null}
		</svg>
	);
};

export const Luz: React.FC<SceneProps> = ({start, end}) => {
	const t = useGlobalTime(start);
	const cx = 540;
	const cy = 980;
	const W = 600;
	const s = W / 240;
	const P = (x: number, y: number): [number, number] => [cx + x * s, cy + y * s];
	const malT = at('Mal');
	const toBad = prog(t, malT - 0.2, 0.45, EASE_IN_OUT);
	const eyeX = 870;
	const eyeY = 720;
	const good = [P(-30, -150), P(-30, -38), P(-30, 71), P(40, 62), P(62, -38), [eyeX - 30, eyeY + 20] as [number, number]];
	const kGood = map(t, at('luz') - 0.05, at('ojos') + 0.05, 0, 1, EASE_IN_OUT);
	const bad = [P(-30, -150), P(-30, -38), P(-30, 110), P(28, 196), P(92, 300)];
	const kBad = map(t, malT + 0.35, at('abajo') + 0.25, 0, 1, EASE_IN_OUT);
	const eyeHit = pulse(t, at('ojos') + 0.1, 0.1, 0.7);
	const enter = spr(t, start + 0.05, {damping: 12, stiffness: 130});
	return (
		<SceneShell t={t} start={start} end={end} enter="spin" exit="slideUp" push={0.04}>
			<Halo x={cx} y={cy} size={900} amount={0.35 * (1 - toBad)} color="160,190,255" />
			<DiamondAt x={cx} y={cy} width={W} t={t} mode="glass" scale={enter * (1 - toBad)} opacity={1 - toBad} />
			<DiamondAt x={cx} y={cy} width={W} t={t} mode="glass" depth={1.6} scale={0.6 + 0.4 * toBad} opacity={toBad} />
			<Beam points={good} k={kGood * (1 - toBad)} color="#fff3c4" />
			<Beam points={bad} k={kBad} color="#ff5470" core="#ffd1da" />
			{/* fuga de luz hacia abajo */}
			{kBad > 0.85
				? Array.from({length: 8}, (_, i) => {
						const ph = ((t * 1.4 + rand(i) ) % 1);
						return (
							<div
								key={i}
								style={{
									position: 'absolute',
									left: P(92, 300)[0] - 10 + ph * 80 + rand(i * 3) * 40,
									top: P(92, 300)[1] - 10 + ph * 160,
									width: 14,
									height: 14,
									borderRadius: 7,
									background: '#ff8aa0',
									boxShadow: '0 0 16px 6px rgba(255,84,112,0.6)',
									opacity: 1 - ph,
								}}
							/>
						);
					})
				: null}
			<Place x={eyeX} y={eyeY} scale={spr(t, at('Bien') + 0.1, {damping: 11}) * (1 + eyeHit * 0.25)} rotate={wobble(t, 2) * 4}>
				<Eye width={190} glow={eyeHit + (kGood >= 1 ? 0.25 : 0) * (1 - toBad)} look={toBad > 0.5 ? 0.6 : -0.7} open={1 - toBad * 0.35} />
			</Place>
			<Burst x={eyeX} y={eyeY} t={t} t0={at('ojos') + 0.1} size={300} />
			<Chip x={cx} y={1480} t={t} t0={at('Bien')} t1={malT - 0.15} variant="good" size={44}>
				✓ bien cortado
			</Chip>
			<Chip x={290} y={1500} t={t} t0={malT} variant="bad" size={44}>
				✗ mal cortado
			</Chip>
		</SceneShell>
	);
};

/* ------------------------------------------------------------------ */
/* 4. "Así que el dinero, primero al corte."                           */
/* ------------------------------------------------------------------ */
const FALL = 0.42;

const JARS = [
	{x: 210, label: 'corte', fill: 0.86},
	{x: 420, label: 'color', fill: 0.18},
	{x: 660, label: 'pureza', fill: 0.14},
	{x: 870, label: 'quilates', fill: 0.1},
];

export const Dinero: React.FC<SceneProps> = ({start, end}) => {
	const t = useGlobalTime(start);
	const dT = at('dinero');
	const cT = at('corte', 2);
	const base = 1400;
	const jarH = 380;
	const jarW = 176;
	const coins = Array.from({length: 26}, (_, i) => {
		const jar = i < 6 ? i % 4 : 0;
		const t0 = i < 6 ? dT - 0.1 + i * 0.06 : dT + 0.3 + (i - 6) * 0.04;
		return {i, jar, t0, x0: 140 + rand(i * 2.2) * 800};
	});
	const fillK = (j: number) => {
		const mine = coins.filter((c) => c.jar === j);
		const landed = mine.filter((c) => t > c.t0 + FALL).length;
		return mine.length ? landed / mine.length : 0;
	};
	const win = spr(t, cT + 0.05, {damping: 8, stiffness: 160});
	return (
		<SceneShell t={t} start={start} end={end} enter="slideUp" exit="zoom" push={0.03}>
			{JARS.map((j, i) => {
				const pop = spr(t, start + 0.08 + i * 0.07, {damping: 10, stiffness: 170});
				const lvl = j.fill * fillK(i);
				const glow = i === 0 ? win : 0;
				return (
					<Place key={j.label} x={j.x} y={base - jarH / 2} scale={pop * (1 + (i === 0 ? 0.08 * pulse(t, cT + 0.05, 0.1, 0.4) : 0))}>
						<div style={{position: 'relative', width: jarW, height: jarH}}>
							{glow > 0 ? (
								<div style={{position: 'absolute', inset: -40, borderRadius: 60, background: 'radial-gradient(circle, rgba(255,214,120,0.6), transparent 70%)', opacity: Math.min(1, glow)}} />
							) : null}
							<div
								style={{
									position: 'absolute',
									inset: 0,
									borderRadius: '26px 26px 36px 36px',
									border: `4px solid rgba(255,255,255,${0.45 + glow * 0.4})`,
									background: 'linear-gradient(90deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04) 40%, rgba(255,255,255,0.12))',
									overflow: 'hidden',
								}}
							>
								<div
									style={{
										position: 'absolute',
										left: 0,
										right: 0,
										bottom: 0,
										height: `${lvl * 100}%`,
										background: 'repeating-linear-gradient(180deg, #ffe39a 0px, #f3c969 10px, #c8902a 18px, #f3c969 22px)',
										boxShadow: 'inset 0 6px 12px rgba(255,255,255,0.5)',
									}}
								/>
								<div style={{position: 'absolute', left: 18, top: 20, width: 16, height: jarH - 60, borderRadius: 8, background: 'rgba(255,255,255,0.35)'}} />
							</div>
							<div
								style={{
									position: 'absolute',
									top: jarH + 26,
									left: '50%',
									translate: '-50% 0',
									fontFamily: SANS,
									fontWeight: 800,
									fontSize: 36,
									color: i === 0 && win > 0.5 ? '#F3C969' : '#fff',
									textShadow: '0 4px 12px rgba(0,0,0,0.5)',
									whiteSpace: 'nowrap',
								}}
							>
								{j.label}
							</div>
						</div>
					</Place>
				);
			})}
			{coins.map((c) => {
				const k = map(t, c.t0, c.t0 + FALL, 0, 1, EASE_IN);
				if (k <= 0 || k >= 1) {
					return null;
				}
				const tx = JARS[c.jar].x;
				const x = c.x0 + (tx - c.x0) * k;
				const y = -100 + (base - jarH + 30 + 100) * k;
				return (
					<Place key={c.i} x={x} y={y} rotate={k * 200}>
						<Coin size={72} spin={t * 9 + c.i} />
					</Place>
				);
			})}
			<Chip x={JARS[0].x} y={base - jarH - 90} t={t} t0={cT} variant="gold" size={40}>
				1°
			</Chip>
			<Burst x={JARS[0].x} y={base - jarH / 2} t={t} t0={cT + 0.05} size={320} />
		</SceneShell>
	);
};

