import React, {useMemo} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {map, prog, spr} from '../lib/anim';
import {SANS} from '../lib/fonts';
import {TIMELINE, WORDS, Word} from '../lib/timeline';

type Chunk = {id: number; words: Word[]; start: number; end: number; exit: number};

const buildChunks = (): Chunk[] => {
	const map = new Map<number, Word[]>();
	for (const w of WORDS) {
		if (!map.has(w.chunk)) {
			map.set(w.chunk, []);
		}
		map.get(w.chunk)!.push(w);
	}
	const chunks = [...map.entries()]
		.sort((a, b) => a[0] - b[0])
		.map(([id, ws]) => ({id, words: ws, start: ws[0].start, end: ws[ws.length - 1].end, exit: 0}));
	chunks.forEach((c, i) => {
		const next = chunks[i + 1];
		const hold = c.end + 0.7;
		c.exit = next ? Math.min(next.start - 0.05, hold) : Math.min(hold, TIMELINE.outroStart - 0.1);
		c.exit = Math.max(c.exit, c.end);
	});
	return chunks;
};

const WordView: React.FC<{w: Word; t: number}> = ({w, t}) => {
	const p = spr(t, w.start - 0.07, {damping: 13, stiffness: 230, mass: 0.6});
	const active = t >= w.start - 0.03 && t < w.end + 0.06;
	const o = Math.min(1, p * 1.6);
	const blur = Math.max(0, (1 - Math.min(p, 1)) * 10);
	if (w.emph) {
		const pill = spr(t, w.start, {damping: 10, stiffness: 260, mass: 0.5});
		return (
			<span
				style={{
					display: 'inline-block',
					position: 'relative',
					opacity: o,
					translate: `0px ${(1 - p) * 46}px`,
					scale: String(0.55 + 0.45 * p),
					filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
					margin: '0 10px',
				}}
			>
				<span
					style={{
						position: 'absolute',
						inset: '-2px -16px -6px -16px',
						borderRadius: 18,
						background: 'linear-gradient(135deg, #fff1c4 0%, #f3c969 45%, #c8902a 100%)',
						boxShadow: `0 0 ${24 + 20 * (active ? 1 : 0)}px rgba(243,201,105,${active ? 0.75 : 0.35}), 0 8px 18px rgba(0,0,0,0.4)`,
						scale: `${Math.max(0, pill)} 1`,
						rotate: '-2.5deg',
						transformOrigin: 'left center',
					}}
				/>
				<span style={{position: 'relative', color: pill > 0.5 ? '#141a4a' : '#ffffff', textShadow: pill > 0.5 ? 'none' : '0 4px 18px rgba(0,0,0,0.6)'}}>{w.text}</span>
			</span>
		);
	}
	return (
		<span
			style={{
				display: 'inline-block',
				opacity: o,
				translate: `0px ${(1 - p) * 46}px`,
				scale: String(0.55 + 0.45 * p),
				filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
				color: active ? '#F3C969' : '#ffffff',
				textShadow: active ? '0 0 22px rgba(243,201,105,0.65), 0 4px 18px rgba(0,0,0,0.6)' : '0 4px 18px rgba(0,0,0,0.6)',
				margin: '0 10px',
			}}
		>
			{w.text}
		</span>
	);
};

export const Captions: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;
	const chunks = useMemo(buildChunks, []);
	const visible = chunks.filter((c) => t >= c.start - 0.12 && t < c.exit + 0.2);
	if (t >= TIMELINE.outroStart) {
		return null;
	}
	return (
		<>
			{visible.map((c) => {
				const e = prog(t, c.exit, 0.18);
				return (
					<div
						key={c.id}
						style={{
							position: 'absolute',
							left: 70,
							right: 70,
							top: 318,
							height: 230,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							flexWrap: 'wrap',
							alignContent: 'center',
							rowGap: 6,
							textAlign: 'center',
							fontFamily: SANS,
							fontWeight: 800,
							fontSize: 74,
							lineHeight: 1.12,
							letterSpacing: -0.5,
							opacity: 1 - e,
							translate: `0px ${-40 * e}px`,
							scale: String(map(e, 0, 1, 1, 0.92)),
							filter: e > 0.02 ? `blur(${e * 8}px)` : undefined,
						}}
					>
						{c.words.map((w, i) => (
							<WordView key={i} w={w} t={t} />
						))}
					</div>
				);
			})}
		</>
	);
};
