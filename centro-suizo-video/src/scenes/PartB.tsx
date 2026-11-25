import React from 'react';
import {Burst, Chip, Sparkles} from '../components/Fx';
import {DiamondAt, Halo, Place, Rays, RingAt} from '../components/Place';
import {SceneShell} from '../components/SceneShell';
import {Diamond} from '../gfx/Diamond';
import {GlintAbs} from '../gfx/Glint';
import {Coin, Eye, Magnifier, PriceTag} from '../gfx/Props';
import {RingFront} from '../gfx/Ring';
import {EASE_IN_OUT, EASE_OUT, map, prog, pulse, spr, useGlobalTime, wobble} from '../lib/anim';
import {SANS, SERIF} from '../lib/fonts';
import {at} from '../lib/timeline';

type SceneProps = {start: number; end: number};

/* ------------------------------------------------------------------ */
/* 5. color: blanco ≈ un poco cálido, sobre todo en oro amarillo        */
/* ------------------------------------------------------------------ */
export const Color: React.FC<SceneProps> = ({start, end}) => {
	const t = useGlobalTime(start);
	const lx = 290;
	const rx = 790;
	const y = 1060;
	const inL = spr(t, start + 0.05, {damping: 12, stiffness: 120});
	const inR = spr(t, at('color') + 0.15, {damping: 12, stiffness: 120});
	const goldK = prog(t, at('oro') - 0.1, 0.7, EASE_IN_OUT);
	const approx = spr(t, at('nota') - 0.1, {damping: 8, stiffness: 200});
	const ahorra = at('ahorrar');
	return (
		<SceneShell t={t} start={start} end={end} enter="zoom" exit="slideLeft">
			<Halo x={lx} y={y - 90} size={600} amount={0.5} color="200,215,255" />
			<Halo x={rx} y={y - 90} size={600} amount={0.5 + goldK * 0.3} color="255,226,160" />
			<RingAt x={lx} y={y} width={400} t={t} gold={goldK} warmth={0} scale={inL} rotate={(1 - inL) * -30 + wobble(t, 1) * 2} seed={2} />
			<RingAt x={rx} y={y} width={400} t={t + 0.7} gold={goldK} warmth={0.75} scale={inR} rotate={(1 - inR) * 30 + wobble(t, 2) * 2} seed={7} />
			<Place x={540} y={y - 130} scale={approx}>
				<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 150, color: '#F3C969', textShadow: '0 0 30px rgba(243,201,105,0.7)'}}>≈</div>
			</Place>
			<Chip x={lx} y={y + 150} t={t} t0={at('color') - 0.05} variant="glass" size={38}>
				blanco
			</Chip>
			<Chip x={rx} y={y + 150} t={t} t0={at('cálido')} variant="glass" size={38}>
				un poco cálido
			</Chip>
			<Chip x={540} y={1430} t={t} t0={ahorra + 0.05} t1={at('oro') - 0.2} variant="good" size={50}>
				¡ahorras!
			</Chip>
			<Place x={540 - 180} y={1430} scale={spr(t, ahorra + 0.1, {damping: 8, stiffness: 180}) * (1 - prog(t, at('oro') - 0.2, 0.2))} rotate={t * 120}>
				<Coin size={84} spin={t * 6} />
			</Place>
			<Chip x={540} y={1430} t={t} t0={at('amarillo')} variant="gold" size={46}>
				en oro amarillo
			</Chip>
			<Sparkles x={540} y={y - 90} t={t} radius={480} count={10} amount={goldK} seed={9} />
			<Burst x={rx} y={y - 150} t={t} t0={at('amarillo') + 0.1} size={300} />
		</SceneShell>
	);
};

/* ------------------------------------------------------------------ */
/* 6. pureza: limpio a simple vista, no pagues por lo que ve la lupa    */
/* ------------------------------------------------------------------ */
export const Pureza: React.FC<SceneProps> = ({start, end}) => {
	const t = useGlobalTime(start);
	const cx = 540;
	const cy = 1000;
	const enter = spr(t, start + 0.05, {damping: 11, stiffness: 130});
	const lupaT = at('lupa');
	const mag = spr(t, at('solo') - 0.15, {damping: 13, stiffness: 110});
	const tagIn = spr(t, at('pagues') - 0.1, {damping: 8, stiffness: 70});
	const swing = (1 - Math.min(1, tagIn)) * 40 + Math.sin((t - at('pagues')) * 6) * 12 * Math.exp(-(t - at('pagues')) * 1.5);
	const crossed = prog(t, lupaT + 0.1, 0.3, EASE_OUT);
	const eyeIn = spr(t, at('simple') - 0.05, {damping: 10});
	const magW = 400;
	const lensX = 650;
	const lensY = 1050;
	const mx = lensX - (110 * magW) / 300 + (1 - mag) * 500;
	const my = lensY - (110 * magW) / 300 + (1 - mag) * 700;
	return (
		<SceneShell t={t} start={start} end={end} enter="slideRight" exit="zoom">
			<Rays x={cx} y={cy + 40} t={t} size={1300} amount={0.55} color="210,190,255" />
			<DiamondAt x={cx} y={cy} width={560} t={t} scale={enter} rotate={wobble(t, 4, 0.5) * 3} glints={1.3} seed={6} />
			<Sparkles x={cx} y={cy} t={t} radius={400} count={9} seed={3} />
			<Place x={190} y={760} scale={eyeIn} rotate={wobble(t, 5) * 5}>
				<Eye width={170} look={0.8} glow={pulse(t, at('limpio'), 0.1, 0.5)} />
			</Place>
			<Chip x={cx} y={1440} t={t} t0={at('limpio') - 0.05} variant="good" size={42}>
				✓ limpio a simple vista
			</Chip>
			{tagIn > 0 ? (
				<div style={{position: 'absolute', left: 790 + (1 - Math.min(1, tagIn)) * 450, top: 700}}>
					<PriceTag width={190} text="+$$$" swing={swing} crossed={crossed} />
				</div>
			) : null}
			{mag > 0.001 ? (
				<div style={{position: 'absolute', left: mx, top: my, rotate: `${(1 - mag) * 40 + wobble(t, 8) * 3}deg`, transformOrigin: '36% 36%'}}>
					<Magnifier width={magW}>
						<g transform="translate(110 110)">
							<g transform="translate(-260 -160)">
								<Diamond width={520} t={t} seed={6} glints={0} glow={0} />
							</g>
							{/* inclusiones diminutas */}
							{[
								[-18, 22, 5],
								[14, -8, 3.5],
								[30, 34, 2.5],
							].map(([x, y, r], i) => (
								<g key={i}>
									<circle cx={x} cy={y} r={r * (1 + 0.3 * Math.sin(t * 6 + i))} fill="#1a0b12" opacity={0.9} />
									<circle cx={x} cy={y} r={r * 3} fill="none" stroke="#ff5470" strokeWidth={2} opacity={pulse(t, lupaT - 0.1 + i * 0.12, 0.1, 0.6)} />
								</g>
							))}
						</g>
					</Magnifier>
				</div>
			) : null}
		</SceneShell>
	);
};

/* ------------------------------------------------------------------ */
/* 7. truco: 0,90 ct ≈ 1 ct, y cuesta bastante menos                    */
/* ------------------------------------------------------------------ */
const Counter: React.FC<{value: number; decimals?: number; suffix: string}> = ({value, decimals = 1, suffix}) => (
	<span>
		{value.toFixed(decimals).replace('.', ',')}
		<span style={{fontSize: '0.6em', marginLeft: 6}}>{suffix}</span>
	</span>
);

export const Truco: React.FC<SceneProps> = ({start, end}) => {
	const t = useGlobalTime(start);
	const trucoT = at('truco');
	const title = spr(t, trucoT - 0.12, {damping: 9, stiffness: 150});
	const toHeader = prog(t, at('uno') - 0.25, 0.45, EASE_IN_OUT);
	const lx = 300;
	const rx = 780;
	const y = 960;
	const inL = spr(t, at('0,90') - 0.1, {damping: 11, stiffness: 140});
	const inR = spr(t, at('1') - 0.12, {damping: 11, stiffness: 140});
	const approx = spr(t, at('casi', 3) - 0.05, {damping: 8, stiffness: 200});
	const costT = at('cuesta');
	const bars = prog(t, costT - 0.05, 0.6, EASE_OUT);
	const base = 1620;
	const mmL = map(t, at('0,90') + 0.1, at('0,90') + 0.7, 0, 6.2);
	const mmR = map(t, at('1') + 0.05, at('1') + 0.6, 0, 6.4);
	const lineY = (w: number) => y + (w * 105) / 240 + 34;
	const letters = 'TRUCO'.split('');
	return (
		<SceneShell t={t} start={start} end={end} enter="spin" exit="slideLeft">
			{/* título */}
			<Place x={540} y={map(toHeader, 0, 1, 1020, 640)} scale={map(toHeader, 0, 1, 1, 0.42) * Math.min(1, title)}>
				<div style={{display: 'flex', alignItems: 'center', gap: 26, whiteSpace: 'nowrap'}}>
					<GlintStar t={t} />
					<div style={{display: 'flex'}}>
						{letters.map((ch, i) => {
							const p = spr(t, trucoT - 0.12 + i * 0.05, {damping: 9, stiffness: 220});
							return (
								<span
									key={i}
									style={{
										display: 'inline-block',
										fontFamily: SERIF,
										fontWeight: 700,
										fontSize: 190,
										lineHeight: 1,
										background: 'linear-gradient(180deg,#fff6d6 0%,#F3C969 50%,#b47a1e 100%)',
										WebkitBackgroundClip: 'text',
										backgroundClip: 'text',
										color: 'transparent',
										filter: 'drop-shadow(0 0 24px rgba(243,201,105,0.55))',
										translate: `0px ${(1 - p) * -160}px`,
										opacity: Math.min(1, p * 2),
										rotate: `${(1 - p) * 25}deg`,
									}}
								>
									{ch}
								</span>
							);
						})}
					</div>
					<GlintStar t={t + 0.5} />
				</div>
			</Place>
			<Burst x={540} y={1020} t={t} t0={trucoT} size={520} />
			{/* diamantes */}
			<Halo x={lx} y={y} size={520} amount={inL * 0.5} />
			<Halo x={rx} y={y} size={520} amount={inR * 0.5} />
			<DiamondAt x={lx} y={y} width={330} t={t} scale={inL} seed={2} />
			<DiamondAt x={rx} y={y} width={345} t={t + 0.4} scale={inR} seed={8} />
			<Chip x={lx} y={y - 150} t={t} t0={at('0,90') - 0.05} variant="glass" size={44}>
				0,90 ct
			</Chip>
			<Chip x={rx} y={y - 150} t={t} t0={at('1') - 0.08} variant="glass" size={44}>
				1 ct
			</Chip>
			<Place x={540} y={y + 10} scale={approx}>
				<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 130, color: '#F3C969', textShadow: '0 0 30px rgba(243,201,105,0.7)'}}>≈</div>
			</Place>
			{[
				{x: lx, w: 330, v: mmL, k: inL},
				{x: rx, w: 345, v: mmR, k: inR},
			].map((m, i) =>
				m.k > 0.02 ? (
					<React.Fragment key={i}>
						<svg width={1080} height={80} style={{position: 'absolute', left: 0, top: lineY(m.w) - 40, overflow: 'visible', opacity: Math.min(1, m.k)}}>
							<line x1={m.x - (m.w * 100) / 240} y1={40} x2={m.x + (m.w * 100) / 240} y2={40} stroke="#F3C969" strokeWidth={4} />
							<line x1={m.x - (m.w * 100) / 240} y1={24} x2={m.x - (m.w * 100) / 240} y2={56} stroke="#F3C969" strokeWidth={4} />
							<line x1={m.x + (m.w * 100) / 240} y1={24} x2={m.x + (m.w * 100) / 240} y2={56} stroke="#F3C969" strokeWidth={4} />
						</svg>
						<div
							style={{
								position: 'absolute',
								left: m.x,
								top: lineY(m.w) + 30,
								translate: '-50% 0',
								fontFamily: SANS,
								fontWeight: 800,
								fontSize: 44,
								color: '#F3C969',
								opacity: Math.min(1, m.k),
								whiteSpace: 'nowrap',
							}}
						>
							<Counter value={m.v} suffix="mm" />
						</div>
					</React.Fragment>
				) : null,
			)}
			{/* barras de precio */}
			{bars > 0
				? [
						{x: lx, h: 170, c: 'linear-gradient(180deg,#5cf0a0,#14a35a)', label: '$'},
						{x: rx, h: 300, c: 'linear-gradient(180deg,#ffe39a,#c8902a)', label: '$$$'},
					].map((b, i) => (
						<div
							key={i}
							style={{
								position: 'absolute',
								left: b.x - 80,
								top: base - b.h * bars,
								width: 160,
								height: b.h * bars,
								borderRadius: '18px 18px 6px 6px',
								background: b.c,
								boxShadow: '0 0 30px rgba(0,0,0,0.35)',
								display: 'flex',
								justifyContent: 'center',
								paddingTop: 14,
								fontFamily: SANS,
								fontWeight: 900,
								fontSize: 44,
								color: '#141a4a',
							}}
						>
							{bars > 0.6 ? b.label : ''}
						</div>
					))
				: null}
			<Chip x={lx} y={base - 170 * bars - 70} t={t} t0={at('menos') - 0.05} variant="good" size={40}>
				cuesta menos
			</Chip>
			<Place x={lx + 150} y={base - 240} scale={spr(t, at('menos'), {damping: 8, stiffness: 200})} rotate={t * 90}>
				<Coin size={70} spin={t * 7} />
			</Place>
		</SceneShell>
	);
};

const GlintStar: React.FC<{t: number}> = ({t}) => (
	<svg width={90} height={90} viewBox="-45 -45 90 90" style={{overflow: 'visible', rotate: `${t * 40}deg`}}>
		<path d="M0,-42 Q5,-5 42,0 Q5,5 0,42 Q-5,5 -42,0 Q-5,-5 0,-42 Z" fill="#F3C969" />
	</svg>
);

/* ------------------------------------------------------------------ */
/* 8. talla: a escondidas, mídelo por dentro                            */
/* ------------------------------------------------------------------ */
export const Talla: React.FC<SceneProps> = ({start, end}) => {
	const t = useGlobalTime(start);
	const q = spr(t, at('talla') - 0.2, {damping: 7, stiffness: 160});
	const qOut = prog(t, at('Toma') - 0.1, 0.3);
	const hideT = at('escondidas');
	const spot = prog(t, hideT - 0.3, 0.4);
	const measureT = at('mídelo');
	const standK = prog(t, measureT - 0.35, 0.45, EASE_IN_OUT);
	const lineK = prog(t, measureT + 0.1, at('dentro') - measureT + 0.1, EASE_OUT);
	const spotX = map(t, hideT - 0.3, hideT + 0.9, 160, 540, EASE_IN_OUT) + Math.sin(t * 2.2) * 30 * (1 - standK);
	const spotY = map(t, hideT - 0.3, hideT + 0.9, 900, 1150, EASE_IN_OUT);
	const dishY = 1330;
	const ringW = 420;
	const inner = (92 * ringW) / 260;
	const value = map(lineK, 0, 1, 0, 17.3);
	return (
		<SceneShell t={t} start={start} end={end} enter="zoom" exit="spin" push={0.04}>
			{/* gran signo de pregunta */}
			<Place x={540} y={1040} scale={q * (1 - qOut)} rotate={wobble(t, 3, 2) * 10}>
				<div
					style={{
						fontFamily: SERIF,
						fontWeight: 700,
						fontSize: 420,
						lineHeight: 1,
						background: 'linear-gradient(180deg,#fff6d6,#F3C969 55%,#b47a1e)',
						WebkitBackgroundClip: 'text',
						backgroundClip: 'text',
						color: 'transparent',
						filter: 'drop-shadow(0 0 40px rgba(243,201,105,0.6))',
					}}
				>
					?
				</div>
			</Place>
			{/* plato */}
			<Place x={540} y={dishY} scale={spr(t, hideT - 0.2, {damping: 12})}>
				<svg width={620} height={190} viewBox="-310 -95 620 190" style={{overflow: 'visible'}}>
					<defs>
						<radialGradient id="dishG" cx="0.5" cy="0.4">
							<stop offset="0" stopColor="#ffffff" />
							<stop offset="0.7" stopColor="#e4e6ef" />
							<stop offset="1" stopColor="#a9adbf" />
						</radialGradient>
					</defs>
					<ellipse cx={0} cy={30} rx={300} ry={70} fill="#000" opacity={0.4} />
					<ellipse cx={0} cy={0} rx={290} ry={78} fill="url(#dishG)" />
					<ellipse cx={0} cy={0} rx={290} ry={78} fill="none" stroke="#d9b45e" strokeWidth={5} />
					<ellipse cx={0} cy={-6} rx={200} ry={46} fill="none" stroke="#c9ccd8" strokeWidth={3} />
				</svg>
			</Place>
			{/* anillo acostado -> de pie */}
			<RingAt x={540} y={dishY - 40} width={330} t={t} diamond={false} opacity={(1 - standK) * Math.min(1, spr(t, hideT - 0.1))} />
			<Place x={540} y={map(standK, 0, 1, dishY - 40, 1050)} scale={standK > 0 ? 0.5 + 0.5 * standK : 0} opacity={standK}>
				<RingFront width={ringW} t={t} />
			</Place>
			{/* medida interior */}
			{lineK > 0 ? (
				<>
					<svg width={1080} height={120} style={{position: 'absolute', left: 0, top: 1050 - 60, overflow: 'visible'}}>
						<defs>
							<marker id="arrH" markerWidth={10} markerHeight={10} refX={5} refY={5} orient="auto-start-reverse">
								<path d="M0,0 L10,5 L0,10 Z" fill="#3DDC84" />
							</marker>
						</defs>
						<line x1={540 - inner * lineK} y1={60} x2={540 + inner * lineK} y2={60} stroke="#3DDC84" strokeWidth={6} markerStart="url(#arrH)" markerEnd="url(#arrH)" />
					</svg>
					<div
						style={{
							position: 'absolute',
							left: 540,
							top: 1050 - 92,
							translate: '-50% -50%',
							padding: '6px 22px',
							borderRadius: 16,
							background: 'rgba(8,12,40,0.85)',
							border: '2px solid #3DDC84',
							fontFamily: SANS,
							fontWeight: 900,
							fontSize: 50,
							color: '#3DDC84',
							whiteSpace: 'nowrap',
							scale: String(Math.min(1, lineK * 3)),
						}}
					>
						<Counter value={value} suffix="mm" />
					</div>
				</>
			) : null}
			<Chip x={540} y={1480} t={t} t0={at('dentro') - 0.05} variant="gold" size={42}>
				diámetro interior
			</Chip>
			{/* oscuridad + linterna */}
			{spot > 0 ? (
				<div
					style={{
						position: 'absolute',
						inset: 0,
						background: `radial-gradient(circle at ${spotX}px ${spotY}px, transparent 0px, transparent ${230 + standK * 400}px, rgba(0,0,8,${0.72 * (1 - standK * 0.8)}) ${330 + standK * 500}px)`,
						opacity: spot,
					}}
				/>
			) : null}
			<GlintAbs x={540 + 150} y={1050 - 150} size={80} amount={pulse(t, at('dentro') + 0.2, 0.1, 0.4)} />
		</SceneShell>
	);
};

