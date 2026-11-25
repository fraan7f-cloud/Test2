import React from 'react';
import {Diamond} from './Diamond';
import {useSvgId} from './util';

export const GOLD_STOPS: [number, string][] = [
	[0, '#7a4e10'],
	[0.18, '#e9b956'],
	[0.32, '#fff0c2'],
	[0.48, '#c8902a'],
	[0.66, '#ffe39a'],
	[0.82, '#b07a22'],
	[1, '#6e450d'],
];
export const SILVER_STOPS: [number, string][] = [
	[0, '#5d6472'],
	[0.18, '#c9d0db'],
	[0.32, '#ffffff'],
	[0.48, '#8d96a6'],
	[0.66, '#eef2f7'],
	[0.82, '#9aa3b2'],
	[1, '#4f5663'],
];

const mix = (a: string, b: string, k: number) => {
	const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
	const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
	return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * k)).join(',')})`;
};

export const MetalStops: React.FC<{gold: number}> = ({gold}) => (
	<>
		{SILVER_STOPS.map(([o, c], i) => (
			<stop key={i} offset={o} stopColor={mix(c, GOLD_STOPS[i][1], gold)} />
		))}
	</>
);

type Props = {
	width: number;
	t: number;
	/** 0 = plata/oro blanco, 1 = oro amarillo */
	gold?: number;
	warmth?: number;
	diamond?: boolean;
	brilliance?: number;
	seed?: number;
	style?: React.CSSProperties;
	shine?: number;
};

/** Anillo solitario en vista 3/4 (desde arriba). Ancho de viewBox = 260. */
export const Ring: React.FC<Props> = ({width, t, gold = 1, warmth = 0, diamond = true, brilliance = 1, seed = 3, style, shine = 1}) => {
	const id = useSvgId('ring');
	const vbTop = -175;
	const vbH = 275;
	const height = (width * vbH) / 260;
	const sweep = ((t * 0.5 + seed * 0.3) % 2) * 360 - 220;
	return (
		<svg width={width} height={height} viewBox={`-130 ${vbTop} 260 ${vbH}`} style={{overflow: 'visible', ...style}}>
			<defs>
				<linearGradient id={`${id}-m`} x1="0" y1="0" x2="1" y2="0">
					<MetalStops gold={gold} />
				</linearGradient>
				<linearGradient id={`${id}-mv`} x1="0" y1="0" x2="0" y2="1">
					<MetalStops gold={gold} />
				</linearGradient>
				<linearGradient id={`${id}-shine`} gradientUnits="userSpaceOnUse" x1={sweep} y1="0" x2={sweep + 90} y2="40">
					<stop offset="0" stopColor="#fff" stopOpacity={0} />
					<stop offset="0.5" stopColor="#fff" stopOpacity={0.85 * shine} />
					<stop offset="1" stopColor="#fff" stopOpacity={0} />
				</linearGradient>
				<radialGradient id={`${id}-shadow`}>
					<stop offset="0" stopColor="#000" stopOpacity={0.45} />
					<stop offset="1" stopColor="#000" stopOpacity={0} />
				</radialGradient>
			</defs>
			<ellipse cx={0} cy={78} rx={120} ry={16} fill={`url(#${id}-shadow)`} />
			{/* banda: elipse exterior menos interior */}
			<path
				fillRule="evenodd"
				d="M-112,40 A112,40 0 1,0 112,40 A112,40 0 1,0 -112,40 Z M-94,44 A94,28 0 1,1 94,44 A94,28 0 1,1 -94,44 Z"
				fill={`url(#${id}-m)`}
			/>
			{/* espesor inferior (canto) */}
			<path d="M-112,40 A112,40 0 0,0 112,40 L112,50 A112,40 0 0,1 -112,50 Z" fill={`url(#${id}-mv)`} opacity={0.9} />
			<path
				fillRule="evenodd"
				d="M-112,40 A112,40 0 1,0 112,40 A112,40 0 1,0 -112,40 Z M-94,44 A94,28 0 1,1 94,44 A94,28 0 1,1 -94,44 Z"
				fill={`url(#${id}-shine)`}
				style={{mixBlendMode: 'screen'}}
			/>
			<path d="M-104,48 A104,34 0 0,0 104,48" fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={2} />
			{diamond ? (
				<g>
					{/* cabeza / garras */}
					<path d="M-30,-8 L30,-8 L14,8 L-14,8 Z" fill={`url(#${id}-m)`} />
					{[-36, -13, 13, 36].map((x, i) => (
						<path
							key={i}
							d={`M${x * 0.7},-6 Q${x * 1.05},-40 ${x * 1.12},${-78 + Math.abs(x) * 0.15}`}
							stroke={`url(#${id}-mv)`}
							strokeWidth={7}
							strokeLinecap="round"
							fill="none"
						/>
					))}
					<g transform="translate(-55 -112.4)">
						<Diamond width={110} t={t} warmth={warmth} brilliance={brilliance} seed={seed} glow={0.8} />
					</g>
					{[-36, 36].map((x, i) => (
						<circle key={i} cx={x * 1.12} cy={-76} r={4.5} fill={`url(#${id}-m)`} />
					))}
				</g>
			) : null}
		</svg>
	);
};

/** Aro visto de frente (de pie) para la escena de la talla. viewBox 260x260 */
export const RingFront: React.FC<{width: number; t: number; gold?: number; style?: React.CSSProperties}> = ({width, t, gold = 1, style}) => {
	const id = useSvgId('ringf');
	const sweep = ((t * 0.6) % 2) * 360 - 200;
	return (
		<svg width={width} height={width} viewBox="-130 -130 260 260" style={{overflow: 'visible', ...style}}>
			<defs>
				<linearGradient id={`${id}-m`} x1="0" y1="0" x2="1" y2="1">
					<MetalStops gold={gold} />
				</linearGradient>
				<linearGradient id={`${id}-shine`} gradientUnits="userSpaceOnUse" x1={sweep} y1={-130} x2={sweep + 100} y2={130}>
					<stop offset="0" stopColor="#fff" stopOpacity={0} />
					<stop offset="0.5" stopColor="#fff" stopOpacity={0.8} />
					<stop offset="1" stopColor="#fff" stopOpacity={0} />
				</linearGradient>
			</defs>
			<circle r={104} fill="none" stroke={`url(#${id}-m)`} strokeWidth={20} />
			<circle r={104} fill="none" stroke={`url(#${id}-shine)`} strokeWidth={20} style={{mixBlendMode: 'screen'}} />
			<circle r={113} fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={1.5} />
			<circle r={95} fill="none" stroke="#000" strokeOpacity={0.25} strokeWidth={2} />
		</svg>
	);
};
