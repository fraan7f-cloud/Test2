import React from 'react';
import {SANS} from '../lib/fonts';
import {MetalStops, Ring} from './Ring';
import {useSvgId} from './util';

/** Estuche de terciopelo rojo, vista frontal. viewBox 400x420. open 0..1 */
export const RingBox: React.FC<{width: number; t: number; open: number; ringRise?: number; style?: React.CSSProperties; glow?: number}> = ({
	width,
	t,
	open,
	ringRise = 0,
	style,
	glow = 0,
}) => {
	const id = useSvgId('box');
	const height = (width * 420) / 400;
	const lidScale = open < 0.35 ? 1 - open / 0.35 : (open - 0.35) / 0.65;
	const showInside = open >= 0.35;
	return (
		<svg width={width} height={height} viewBox="0 0 400 420" style={{overflow: 'visible', ...style}}>
			<defs>
				<linearGradient id={`${id}-vel`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#c4243f" />
					<stop offset="0.45" stopColor="#8e1029" />
					<stop offset="1" stopColor="#4d0715" />
				</linearGradient>
				<linearGradient id={`${id}-velh`} x1="0" y1="0" x2="1" y2="0">
					<stop offset="0" stopColor="#000" stopOpacity={0.35} />
					<stop offset="0.25" stopColor="#fff" stopOpacity={0.06} />
					<stop offset="0.5" stopColor="#fff" stopOpacity={0.12} />
					<stop offset="0.75" stopColor="#fff" stopOpacity={0.04} />
					<stop offset="1" stopColor="#000" stopOpacity={0.4} />
				</linearGradient>
				<linearGradient id={`${id}-satin`} x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#fffaf0" />
					<stop offset="0.5" stopColor="#efe2cb" />
					<stop offset="1" stopColor="#d9c6a6" />
				</linearGradient>
				<radialGradient id={`${id}-slot`} cx="0.5" cy="0.4">
					<stop offset="0" stopColor="#3b0510" />
					<stop offset="1" stopColor="#6d0c20" />
				</radialGradient>
				<radialGradient id={`${id}-burst`}>
					<stop offset="0" stopColor="#fff6d8" stopOpacity={0.95} />
					<stop offset="0.35" stopColor="#ffd98a" stopOpacity={0.45} />
					<stop offset="1" stopColor="#ffd98a" stopOpacity={0} />
				</radialGradient>
				<linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="0">
					<MetalStops gold={1} />
				</linearGradient>
			</defs>
			{/* sombra */}
			<ellipse cx={200} cy={400} rx={190} ry={18} fill="#000" opacity={0.45} />
			{/* tapa */}
			<g transform={`translate(0 222) scale(1 ${Math.max(0.001, lidScale)}) translate(0 -222)`}>
				{showInside ? (
					<>
						<rect x={38} y={22} width={324} height={200} rx={18} fill={`url(#${id}-vel)`} />
						<rect x={56} y={38} width={288} height={170} rx={10} fill={`url(#${id}-satin)`} />
						<rect x={56} y={38} width={288} height={170} rx={10} fill="none" stroke="#b08a52" strokeOpacity={0.5} strokeWidth={2} />
						<path d="M70,60 Q200,30 330,60" stroke="#fff" strokeOpacity={0.5} strokeWidth={3} fill="none" />
					</>
				) : (
					<>
						<rect x={38} y={22} width={324} height={200} rx={18} fill={`url(#${id}-vel)`} />
						<rect x={38} y={22} width={324} height={200} rx={18} fill={`url(#${id}-velh)`} />
						<rect x={185} y={196} width={30} height={14} rx={3} fill={`url(#${id}-gold)`} />
					</>
				)}
			</g>
			{/* luz al abrir */}
			{glow > 0 ? <ellipse cx={200} cy={230} rx={260 * (0.6 + glow * 0.6)} ry={200 * (0.6 + glow * 0.6)} fill={`url(#${id}-burst)`} opacity={glow} /> : null}
			{/* base */}
			<rect x={30} y={222} width={340} height={170} rx={20} fill={`url(#${id}-vel)`} />
			<rect x={30} y={222} width={340} height={170} rx={20} fill={`url(#${id}-velh)`} />
			<rect x={30} y={222} width={340} height={20} rx={8} fill="#d33a55" opacity={0.55} />
			<rect x={52} y={238} width={296} height={62} rx={12} fill={`url(#${id}-slot)`} opacity={showInside ? 1 : 0} />
			<path d="M80,268 L320,268" stroke="#1d0207" strokeWidth={6} strokeLinecap="round" opacity={showInside ? 0.9 : 0} />
			<rect x={186} y={316} width={28} height={12} rx={3} fill={`url(#${id}-gold)`} />
			{/* anillo */}
			{showInside ? (
				<g transform={`translate(200 ${232 - ringRise * 40}) scale(0.92)`}>
					<g transform="translate(-130 -175)">
						<Ring width={260} t={t} gold={1} seed={4} />
					</g>
				</g>
			) : null}
			{/* frente de la base sobre la banda del anillo */}
			{showInside ? <rect x={30} y={290} width={340} height={102} rx={20} fill={`url(#${id}-vel)`} /> : null}
			{showInside ? <rect x={30} y={290} width={340} height={102} rx={20} fill={`url(#${id}-velh)`} /> : null}
			{showInside ? <rect x={186} y={330} width={28} height={12} rx={3} fill={`url(#${id}-gold)`} /> : null}
		</svg>
	);
};

/** Etiqueta de precio colgando. viewBox 200x260, el punto de cuelgue es (100,0) */
export const PriceTag: React.FC<{width: number; text: string; swing: number; crossed?: number; style?: React.CSSProperties}> = ({
	width,
	text,
	swing,
	crossed = 0,
	style,
}) => {
	const id = useSvgId('tag');
	return (
		<svg width={width} height={(width * 260) / 200} viewBox="0 0 200 260" style={{overflow: 'visible', ...style}}>
			<defs>
				<linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#fffaf0" />
					<stop offset="1" stopColor="#e8dcc2" />
				</linearGradient>
			</defs>
			<g transform={`rotate(${swing} 100 0)`}>
				<line x1={100} y1={0} x2={100} y2={70} stroke="#d8c7a0" strokeWidth={3} />
				<g transform="rotate(-8 100 70)">
					<path d="M60,90 L100,62 L140,90 L140,240 Q140,250 130,250 L70,250 Q60,250 60,240 Z" fill={`url(#${id})`} stroke="#bfa877" strokeWidth={2} />
					<circle cx={100} cy={86} r={7} fill="#0b1033" stroke="#bfa877" strokeWidth={2} />
					<text
						x={100}
						y={180}
						textAnchor="middle"
						fontFamily={SANS}
						fontWeight={900}
						fontSize={text.length > 3 ? 34 : 40}
						fill="#1f8a4c"
						transform="rotate(-90 100 170)"
					>
						{text}
					</text>
					{crossed > 0 ? (
						<>
							<line x1={52} y1={110} x2={52 + 96 * crossed} y2={110 + 130 * crossed} stroke="#ff3b5c" strokeWidth={12} strokeLinecap="round" />
							<line x1={148} y1={110} x2={148 - 96 * Math.max(0, crossed * 2 - 1)} y2={110 + 130 * Math.max(0, crossed * 2 - 1)} stroke="#ff3b5c" strokeWidth={12} strokeLinecap="round" opacity={crossed > 0.5 ? 1 : 0} />
						</>
					) : null}
				</g>
			</g>
		</svg>
	);
};

/** Ojo estilizado. viewBox 200x110 */
export const Eye: React.FC<{width: number; open?: number; glow?: number; look?: number; sad?: number; style?: React.CSSProperties}> = ({
	width,
	open = 1,
	glow = 0,
	look = 0,
	sad = 0,
	style,
}) => {
	const id = useSvgId('eye');
	const o = Math.max(0.05, open);
	return (
		<svg width={width} height={(width * 110) / 200} viewBox="0 0 200 110" style={{overflow: 'visible', ...style}}>
			<defs>
				<radialGradient id={`${id}-i`}>
					<stop offset="0" stopColor="#9fd0ff" />
					<stop offset="0.6" stopColor="#2b62c9" />
					<stop offset="1" stopColor="#0e2a6b" />
				</radialGradient>
				<radialGradient id={`${id}-g`}>
					<stop offset="0" stopColor="#fff" stopOpacity={0.9} />
					<stop offset="1" stopColor="#fff" stopOpacity={0} />
				</radialGradient>
				<clipPath id={`${id}-c`}>
					<path d={`M10,55 Q100,${55 - 50 * o} 190,55 Q100,${55 + 50 * o} 10,55 Z`} />
				</clipPath>
			</defs>
			{glow > 0 ? <circle cx={100} cy={55} r={110} fill={`url(#${id}-g)`} opacity={glow} /> : null}
			<path d={`M10,55 Q100,${55 - 50 * o} 190,55 Q100,${55 + 50 * o} 10,55 Z`} fill="#f7f9ff" />
			<g clipPath={`url(#${id}-c)`}>
				<circle cx={100 + look * 18} cy={55} r={30} fill={`url(#${id}-i)`} />
				<circle cx={100 + look * 18} cy={55} r={13} fill="#060a1c" />
				<circle cx={110 + look * 18} cy={45} r={6} fill="#fff" />
			</g>
			<path d={`M10,55 Q100,${55 - 50 * o} 190,55`} fill="none" stroke="#0b1033" strokeWidth={5} strokeLinecap="round" />
			{sad > 0 ? <path d={`M40,${12 - sad * 4} Q100,${2 + sad * 8} 160,${12 - sad * 4}`} stroke="#fff" strokeWidth={5} fill="none" opacity={sad} strokeLinecap="round" /> : null}
		</svg>
	);
};

/** Moneda dorada; spin en radianes (efecto giro) */
export const Coin: React.FC<{size: number; spin?: number; style?: React.CSSProperties}> = ({size, spin = 0, style}) => {
	const id = useSvgId('coin');
	const sx = Math.max(0.12, Math.abs(Math.cos(spin)));
	return (
		<svg width={size} height={size} viewBox="-50 -50 100 100" style={{overflow: 'visible', ...style}}>
			<defs>
				<linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
					<MetalStops gold={1} />
				</linearGradient>
			</defs>
			<g transform={`scale(${sx} 1)`}>
				<circle r={46} fill="#8a5a12" />
				<circle r={44} fill={`url(#${id})`} />
				<circle r={34} fill="none" stroke="#8a5a12" strokeOpacity={0.6} strokeWidth={3} />
				<text y={15} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={44} fill="#8a5a12" opacity={0.8}>
					$
				</text>
			</g>
		</svg>
	);
};

/** Lupa. viewBox 300x300; lente centrada en (110,110) r=90 */
export const Magnifier: React.FC<{width: number; children?: React.ReactNode; style?: React.CSSProperties}> = ({width, children, style}) => {
	const id = useSvgId('mag');
	return (
		<svg width={width} height={width} viewBox="0 0 300 300" style={{overflow: 'visible', ...style}}>
			<defs>
				<linearGradient id={`${id}-m`} x1="0" y1="0" x2="1" y2="1">
					<MetalStops gold={1} />
				</linearGradient>
				<radialGradient id={`${id}-l`} cx="0.35" cy="0.3">
					<stop offset="0" stopColor="#ffffff" stopOpacity={0.35} />
					<stop offset="0.5" stopColor="#bcd3ff" stopOpacity={0.12} />
					<stop offset="1" stopColor="#6f8fd6" stopOpacity={0.25} />
				</radialGradient>
				<clipPath id={`${id}-c`}>
					<circle cx={110} cy={110} r={88} />
				</clipPath>
			</defs>
			<path d="M178,178 L272,272" stroke="#2a1a05" strokeWidth={30} strokeLinecap="round" />
			<path d="M182,182 L268,268" stroke={`url(#${id}-m)`} strokeWidth={22} strokeLinecap="round" />
			<g clipPath={`url(#${id}-c)`}>
				<circle cx={110} cy={110} r={88} fill="#0d1440" />
				{children}
				<circle cx={110} cy={110} r={88} fill={`url(#${id}-l)`} />
			</g>
			<circle cx={110} cy={110} r={92} fill="none" stroke={`url(#${id}-m)`} strokeWidth={14} />
			<path d="M50,80 A70,70 0 0,1 90,40" stroke="#fff" strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.7} />
		</svg>
	);
};

/** Boleta. viewBox 220x320 */
export const Receipt: React.FC<{width: number; style?: React.CSSProperties; crumple?: number}> = ({width, style, crumple = 0}) => {
	const zig = Array.from({length: 12}, (_, i) => `L${200 - i * 18 - 9},${300 + (i % 2 ? 0 : 12)} L${200 - (i + 1) * 18},300`).join(' ');
	return (
		<svg width={width} height={(width * 320) / 220} viewBox="0 0 220 320" style={{overflow: 'visible', ...style}}>
			<g transform={`translate(110 160) scale(${1 - crumple * 0.6} ${1 - crumple * 0.75}) rotate(${crumple * 40}) translate(-110 -160)`}>
				<path d={`M10,10 L210,10 L210,300 ${zig} L10,300 Z`} fill="#fbfaf6" stroke="#d9d4c7" strokeWidth={2} />
				{[50, 80, 110, 140, 170].map((y, i) => (
					<line key={y} x1={30} y1={y} x2={i % 2 ? 150 : 190} y2={y} stroke="#b9b3a5" strokeWidth={7} strokeLinecap="round" />
				))}
				<line x1={30} y1={210} x2={190} y2={210} stroke="#2b2b2b" strokeWidth={2} strokeDasharray="6 6" />
				<text x={30} y={255} fontFamily={SANS} fontWeight={900} fontSize={30} fill="#1d1d1d">
					TOTAL
				</text>
				<text x={190} y={255} textAnchor="end" fontFamily={SANS} fontWeight={900} fontSize={30} fill="#d6203f">
					$$$$
				</text>
			</g>
		</svg>
	);
};

/** Pin de ubicación. viewBox 100x130 */
export const Pin: React.FC<{size: number; style?: React.CSSProperties}> = ({size, style}) => {
	const id = useSvgId('pin');
	return (
		<svg width={size} height={(size * 130) / 100} viewBox="0 0 100 130" style={{overflow: 'visible', ...style}}>
			<defs>
				<linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
					<MetalStops gold={1} />
				</linearGradient>
			</defs>
			<path d="M50,125 C50,125 8,72 8,46 A42,42 0 1,1 92,46 C92,72 50,125 50,125 Z" fill={`url(#${id})`} stroke="#7a4e10" strokeWidth={3} />
			<circle cx={50} cy={46} r={17} fill="#0b1033" />
		</svg>
	);
};

export const Heart: React.FC<{size: number; color?: string; style?: React.CSSProperties}> = ({size, color = '#ff4f7b', style}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible', ...style}}>
		<path d="M50,88 C20,66 6,48 6,30 A22,22 0 0,1 50,22 A22,22 0 0,1 94,30 C94,48 80,66 50,88 Z" fill={color} />
		<path d="M24,26 A12,12 0 0,1 38,20" stroke="#fff" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.6} />
	</svg>
);

export const PaperPlane: React.FC<{size: number; style?: React.CSSProperties}> = ({size, style}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible', ...style}}>
		<path d="M6,46 L94,8 L70,90 L48,62 Z" fill="#ffffff" />
		<path d="M48,62 L94,8 L38,56 Z" fill="#cfd8ff" />
		<path d="M38,56 L42,84 L48,62 Z" fill="#a8b5f0" />
	</svg>
);
