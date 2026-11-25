import React, {useMemo} from 'react';
import {Glint} from './Glint';
import {Pt, pts, rand, useSvgId, zipper} from './util';

export type DiamondMode = 'brilliant' | 'dull' | 'glass';

type Geo = {facets: Pt[][]; outline: Pt[]; table: Pt[]; girdleY: number; culetY: number; vertices: Pt[]};

const hslToRgb = (h: number, s: number, l: number): number[] => {
	const S = s / 100;
	const L = l / 100;
	const a = S * Math.min(L, 1 - L);
	const f = (n: number) => {
		const k = (n + h / 30) % 12;
		return Math.round(255 * (L - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
	};
	return [f(0), f(8), f(4)];
};

const buildGeo = (depth: number): Geo => {
	const tableY = -38;
	const gY = 0;
	const pY = 5;
	const culetY = 100 * depth;
	const T: Pt[] = [-58, -29, 0, 29, 58].map((x) => [x, tableY]);
	const G: Pt[] = [-100, -75, -50, -25, 0, 25, 50, 75, 100].map((x) => [x, gY]);
	const P: Pt[] = [-100, -75, -50, -25, 0, 25, 50, 75, 100].map((x) => [x, pY]);
	const midY = pY + (culetY - pY) * 0.52;
	const M: Pt[] = [-48, -24, 0, 24, 48].map((x) => [x, midY]);
	const crown = zipper(T, G);
	const pav1 = zipper(P, M);
	const pav2: Pt[][] = [];
	for (let i = 0; i < M.length - 1; i++) {
		pav2.push([M[i], M[i + 1], [0, culetY]]);
	}
	const girdle: Pt[][] = [];
	for (let i = 0; i < G.length - 1; i++) {
		girdle.push([G[i], G[i + 1], P[i + 1], P[i]]);
	}
	const table: Pt[] = [
		[-58, tableY],
		[58, tableY],
		[50, tableY - 7],
		[-50, tableY - 7],
	];
	const outline: Pt[] = [[-50, tableY - 7], [50, tableY - 7], [58, tableY], [100, gY], [100, pY], [0, culetY], [-100, pY], [-100, gY], [-58, tableY]];
	return {
		facets: [...crown, ...girdle, ...pav1, ...pav2],
		outline,
		table,
		girdleY: gY,
		culetY,
		vertices: [...T, ...G, ...M, [0, culetY]],
	};
};

type Props = {
	width: number;
	t: number;
	mode?: DiamondMode;
	/** 0..1 mezcla hacia brillante (para transiciones dull->brilliant) */
	brilliance?: number;
	warmth?: number;
	depth?: number;
	glints?: number;
	seed?: number;
	glow?: number;
	style?: React.CSSProperties;
	/** dibujar líneas de corte 0..1 */
	cutLines?: number;
};

export const Diamond: React.FC<Props> = ({
	width,
	t,
	mode = 'brilliant',
	brilliance,
	warmth = 0,
	depth = 1,
	glints = 1,
	seed = 1,
	glow = 1,
	style,
	cutLines = 0,
}) => {
	const geo = useMemo(() => buildGeo(depth), [depth]);
	const gid = useSvgId('dia');
	const b = brilliance ?? (mode === 'brilliant' ? 1 : 0);
	const vbTop = -75;
	const vbH = geo.culetY - vbTop + 25;
	const height = (width * vbH) / 240;

	const facetFill = (i: number) => {
		const r1 = rand(i * 3.1 + seed);
		const r2 = rand(i * 7.7 + seed * 3);
		const shimmer = Math.sin(t * (1.6 + r2 * 2.2) + r1 * 6.28) * 0.5 + 0.5;
		// brillante: alto contraste azul/blanco
		const Lb = 28 + r1 * 62 + shimmer * 26 * b;
		const Sb = 35 + r2 * 30;
		const Hb = 212 - r2 * 18;
		// apagado: grises planos
		const Ld = 52 + r1 * 22;
		const L = Math.min(98, Ld + (Lb - Ld) * b);
		const S = 6 + (Sb - 6) * b;
		const cool = hslToRgb(Hb, S, L);
		if (warmth <= 0) {
			return `rgb(${cool.join(',')})`;
		}
		const warm = hslToRgb(44, 70, Math.min(96, L + 4));
		const k = Math.min(1, warmth);
		return `rgb(${cool.map((c, j) => Math.round(c + (warm[j] - c) * k)).join(',')})`;
	};

	const glass = mode === 'glass';
	const fireCols = ['#ff5fa2', '#3fe0c5', '#ffd34d', '#8f7bff'];

	return (
		<svg
			width={width}
			height={height}
			viewBox={`-120 ${vbTop} 240 ${vbH}`}
			style={{overflow: 'visible', ...style}}
		>
			<defs>
				<radialGradient id={`${gid}-glow`}>
					<stop offset="0%" stopColor="#cfe0ff" stopOpacity={0.55} />
					<stop offset="60%" stopColor="#8fa8ff" stopOpacity={0.12} />
					<stop offset="100%" stopColor="#8fa8ff" stopOpacity={0} />
				</radialGradient>
				<linearGradient id={`${gid}-glass`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="#dfe8ff" stopOpacity={0.22} />
					<stop offset="100%" stopColor="#9fb4ff" stopOpacity={0.06} />
				</linearGradient>
				<linearGradient id={`${gid}-sheen`} x1="0" y1="0" x2="1" y2="0.3" gradientTransform={`translate(${((t * 0.45) % 2.4) - 1.2} 0)`}>
					<stop offset="0.35" stopColor="#ffffff" stopOpacity={0} />
					<stop offset="0.5" stopColor="#ffffff" stopOpacity={0.55} />
					<stop offset="0.65" stopColor="#ffffff" stopOpacity={0} />
				</linearGradient>
				<clipPath id={`${gid}-clip`}>
					<polygon points={pts(geo.outline)} />
				</clipPath>
			</defs>
			{!glass && glow > 0 ? (
				<ellipse cx={0} cy={20} rx={170} ry={120} fill={`url(#${gid}-glow)`} opacity={glow * (0.35 + 0.65 * b)} />
			) : null}
			{glass ? (
				<>
					<polygon points={pts(geo.outline)} fill={`url(#${gid}-glass)`} stroke="#ffffff" strokeOpacity={0.9} strokeWidth={2.2} strokeLinejoin="round" />
					<line x1={-100} y1={0} x2={100} y2={0} stroke="#fff" strokeOpacity={0.5} strokeWidth={1.2} />
					<line x1={-58} y1={-38} x2={58} y2={-38} stroke="#fff" strokeOpacity={0.5} strokeWidth={1.2} />
				</>
			) : (
				<g>
					{geo.facets.map((f, i) => (
						<polygon
							key={i}
							points={pts(f)}
							fill={facetFill(i)}
							stroke={`rgba(255,255,255,${0.25 + 0.4 * b})`}
							strokeWidth={0.7}
							strokeLinejoin="round"
						/>
					))}
					<polygon points={pts(geo.table)} fill={facetFill(99)} stroke="rgba(255,255,255,0.7)" strokeWidth={0.8} />
					{/* fuego de colores */}
					{b > 0.05
						? geo.facets.map((f, i) => {
								const r = rand(i * 13.3 + seed * 5);
								if (r < 0.72) {
									return null;
								}
								const a = Math.max(0, Math.sin(t * (2 + r * 3) + i)) * 0.55 * b;
								return <polygon key={`f${i}`} points={pts(f)} fill={fireCols[i % 4]} opacity={a} style={{mixBlendMode: 'screen'}} />;
							})
						: null}
					<polygon points={pts(geo.outline)} fill={`url(#${gid}-sheen)`} opacity={0.35 + 0.65 * b} clipPath={`url(#${gid}-clip)`} />
					<polygon points={pts(geo.outline)} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={1.2} strokeLinejoin="round" />
				</g>
			)}
			{cutLines > 0 ? (
				<g clipPath={`url(#${gid}-clip)`}>
					{geo.facets.map((f, i) => {
						const k = Math.min(1, Math.max(0, cutLines * 1.6 - (i / geo.facets.length) * 0.6));
						const len = 400;
						return (
							<polygon
								key={`c${i}`}
								points={pts(f)}
								fill="none"
								stroke="#fffbe6"
								strokeWidth={1.6}
								strokeDasharray={len}
								strokeDashoffset={len * (1 - k)}
								opacity={Math.sin(Math.PI * Math.min(1, cutLines)) * 0.95}
							/>
						);
					})}
				</g>
			) : null}
			{!glass && glints > 0 && b > 0.2
				? [0, 1, 2, 3].map((k) => {
						const period = 1.7;
						const ph = ((t + k * 0.43 + seed * 0.17) % period) / period;
						const amount = Math.max(0, Math.sin(ph * Math.PI)) ** 3 * glints * b;
						const cycle = Math.floor((t + k * 0.43 + seed * 0.17) / period);
						const v = geo.vertices[Math.floor(rand(cycle * 9.1 + k * 31 + seed) * geo.vertices.length)];
						return <Glint key={k} x={v[0]} y={v[1]} size={34 + 20 * rand(cycle + k)} amount={amount} />;
					})
				: null}
		</svg>
	);
};
