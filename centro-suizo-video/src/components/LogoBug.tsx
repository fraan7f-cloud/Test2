import React from 'react';
import {Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {map} from '../lib/anim';
import {TIMELINE, scene} from '../lib/timeline';

export const LOGO_SRC = staticFile('img/logo-centro-suizo.png');
export const LOGO_RATIO = 434 / 676;
export const BUG = {cx: 540, top: 70, width: 236};

/** Logo blanco con un brillo que lo recorre (máscara con la forma del logo). */
export const ShinyLogo: React.FC<{width: number; t: number; shineEvery?: number; glow?: number; style?: React.CSSProperties}> = ({
	width,
	t,
	shineEvery = 4.5,
	glow = 0.5,
	style,
}) => {
	const h = width * LOGO_RATIO;
	const ph = (t % shineEvery) / 1.1; // barrido dura ~1.1s
	const pos = map(ph, 0, 1, -40, 140);
	return (
		<div style={{position: 'relative', width, height: h, ...style}}>
			<Img
				src={LOGO_SRC}
				style={{
					width,
					height: h,
					position: 'absolute',
					inset: 0,
					filter: `drop-shadow(0 0 ${12 * glow}px rgba(255,230,170,${0.5 * glow})) drop-shadow(0 4px 10px rgba(0,0,0,0.5))`,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					WebkitMaskImage: `url(${LOGO_SRC})`,
					WebkitMaskSize: '100% 100%',
					maskImage: `url(${LOGO_SRC})`,
					maskSize: '100% 100%',
					background: `linear-gradient(110deg, transparent ${pos - 18}%, rgba(255,214,130,0.95) ${pos - 4}%, #ffffff ${pos}%, rgba(255,214,130,0.95) ${pos + 4}%, transparent ${pos + 18}%)`,
				}}
			/>
		</div>
	);
};

/** Logo permanente arriba (después de la intro, se oculta en el cierre) */
export const LogoBug: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;
	const hideAt = scene('historia').start;
	const opacity = Math.min(map(t, TIMELINE.intro - 0.06, TIMELINE.intro, 0, 1), map(t, hideAt - 0.1, hideAt + 0.15, 1, 0));
	if (opacity <= 0) {
		return null;
	}
	return (
		<div style={{position: 'absolute', left: BUG.cx - BUG.width / 2, top: BUG.top, opacity}}>
			<ShinyLogo width={BUG.width} t={t + 2} shineEvery={5} glow={0.6} />
		</div>
	);
};
