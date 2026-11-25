import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Burst, Sparkles} from '../components/Fx';
import {BUG, LOGO_RATIO, ShinyLogo} from '../components/LogoBug';
import {Halo, Rays} from '../components/Place';
import {GlintAbs} from '../gfx/Glint';
import {rand} from '../gfx/util';
import {EASE_IN_OUT, EASE_OUT, map, prog, pulse, spr, useGlobalTime} from '../lib/anim';
import {SCRIPT} from '../lib/fonts';
import {TIMELINE} from '../lib/timeline';

const REVEAL = 1.6;
const LOGO_W = 760;
const LOGO_TOP = 640;
// el diamante del logo (png 676x434) está centrado en ~(338, 97) y mide ~195px
const GEM_CX = 540;
const GEM_CY = LOGO_TOP + (97 * LOGO_W) / 676;
const GEM_SCALE = (198 * LOGO_W) / 676 / 200;

const GEM_PATHS = [
	'M-58,-52 L58,-52 Q64,-52 68,-47 L100,-12 L0,92 L-100,-12 L-68,-47 Q-64,-52 -58,-52 Z',
	'M-100,-12 L100,-12',
	'M-58,-52 L-30,-12 L0,-52 L30,-12 L58,-52',
	'M-30,-12 L-4,70',
	'M30,-12 L4,70',
];

export const Intro: React.FC<{start: number; end: number}> = ({start}) => {
	const t = useGlobalTime(start);
	const END = TIMELINE.intro;
	const draw = prog(t, 0.15, 1.3, EASE_IN_OUT);
	const gemFade = map(t, REVEAL - 0.05, REVEAL + 0.15, 1, 0);
	const flash = pulse(t, REVEAL, 0.06, 0.45);
	const logoIn = spr(t, REVEAL - 0.03, {damping: 13, stiffness: 120});
	const textWipe = prog(t, REVEAL + 0.05, 0.6, EASE_OUT);
	const fly = prog(t, END - 0.55, 0.55, EASE_IN_OUT);
	const logoW = LOGO_W + (BUG.width - LOGO_W) * fly;
	const logoTop = LOGO_TOP + (BUG.top - LOGO_TOP) * fly;
	const logoScaleIn = 1.25 - 0.25 * logoIn;
	const tag = Math.min(prog(t, REVEAL + 0.45, 0.4), map(t, END - 0.7, END - 0.45, 1, 0));
	if (t >= END) {
		return null;
	}
	// punta de luz que dibuja el contorno
	return (
		<AbsoluteFill>
			{/* raya de luz inicial */}
			<div
				style={{
					position: 'absolute',
					left: map(t, 0, 0.9, -600, 1500, EASE_OUT),
					top: -200,
					width: 200,
					height: 2400,
					rotate: '22deg',
					background: 'linear-gradient(90deg, transparent, rgba(160,180,255,0.5), rgba(255,255,255,0.9), rgba(160,180,255,0.5), transparent)',
					filter: 'blur(18px)',
					opacity: map(t, 0, 0.2, 0, 1) * map(t, 0.6, 1.0, 1, 0),
					mixBlendMode: 'screen',
				}}
			/>
			<Rays x={GEM_CX} y={GEM_CY + 120 - fly * 400} t={t} size={1500} amount={map(t, REVEAL, REVEAL + 0.4, 0, 1) * (1 - fly)} />
			<Halo x={GEM_CX} y={GEM_CY} size={900} amount={Math.max(draw * 0.5 * gemFade, flash)} />
			{/* partículas que convergen */}
			{Array.from({length: 22}, (_, i) => {
				const a = rand(i * 3.7) * Math.PI * 2;
				const r0 = 600 + rand(i * 1.9) * 500;
				const k = prog(t, 0.2 + rand(i) * 0.5, 0.9, EASE_IN_OUT);
				const r = r0 * (1 - k);
				const op = Math.sin(Math.PI * k);
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: GEM_CX + Math.cos(a) * r - 5,
							top: GEM_CY + Math.sin(a) * r - 5,
							width: 10,
							height: 10,
							borderRadius: 5,
							background: i % 3 ? '#cfe0ff' : '#ffe39a',
							boxShadow: `0 0 18px 6px ${i % 3 ? 'rgba(150,180,255,0.7)' : 'rgba(255,220,140,0.7)'}`,
							opacity: op,
						}}
					/>
				);
			})}
			{/* contorno del diamante del logo dibujándose */}
			{gemFade > 0 ? (
				<svg
					width={1080}
					height={1920}
					viewBox="0 0 1080 1920"
					style={{position: 'absolute', inset: 0, overflow: 'visible', opacity: gemFade}}
				>
					<g transform={`translate(${GEM_CX} ${GEM_CY}) scale(${GEM_SCALE})`}>
						{GEM_PATHS.map((d, i) => {
							const k = map(draw, i * 0.12, 0.55 + i * 0.1, 0, 1);
							return (
								<g key={i}>
									<path d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} fill="none" stroke="#9fb6ff" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" opacity={0.35} style={{filter: 'blur(6px)'}} />
									<path d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} fill="none" stroke="#ffffff" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
								</g>
							);
						})}
					</g>
				</svg>
			) : null}
			<GlintAbs x={GEM_CX + 60 * GEM_SCALE} y={GEM_CY - 50 * GEM_SCALE} size={90} amount={pulse(t, 1.15, 0.25, 0.35)} />
			{/* logo real */}
			{t >= REVEAL - 0.03 ? (
				<div
					style={{
						position: 'absolute',
						left: 540 - logoW / 2,
						top: logoTop,
						width: logoW,
						height: logoW * LOGO_RATIO,
						scale: String(fly > 0 ? 1 : logoScaleIn),
						transformOrigin: '50% 22%',
						opacity: Math.min(1, logoIn * 2),
					}}
				>
					<div style={{clipPath: `inset(0 0 ${(1 - textWipe) * 58}% 0)`}}>
						<ShinyLogo width={logoW} t={t - REVEAL - 0.5} shineEvery={10} glow={1 - fly * 0.4} />
					</div>
				</div>
			) : null}
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: LOGO_TOP + LOGO_W * LOGO_RATIO + 40,
					textAlign: 'center',
					fontFamily: SCRIPT,
					fontStyle: 'italic',
					fontWeight: 600,
					fontSize: 76,
					color: '#F3C969',
					letterSpacing: 1,
					textShadow: '0 0 24px rgba(243,201,105,0.5)',
					opacity: tag,
					translate: `0px ${(1 - tag) * 30}px`,
				}}
			>
				Anillos de compromiso
			</div>
			<Burst x={GEM_CX} y={GEM_CY} t={t} t0={REVEAL} size={560} />
			<Sparkles x={540} y={GEM_CY + 160} t={t} radius={480} count={12} amount={map(t, REVEAL, REVEAL + 0.3, 0, 1) * (1 - fly)} />
			<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, rgba(255,255,255,1), rgba(255,240,210,0.6) 40%, transparent 75%)', opacity: flash * 0.85, mixBlendMode: 'screen'}} />
		</AbsoluteFill>
	);
};
