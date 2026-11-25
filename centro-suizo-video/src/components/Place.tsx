import React from 'react';
import {Diamond} from '../gfx/Diamond';
import {Ring} from '../gfx/Ring';

/** Coloca children centrado en (x, y). scale/rotate giran alrededor de ese punto. */
export const Place: React.FC<{
	x: number;
	y: number;
	scale?: number;
	rotate?: number;
	opacity?: number;
	blur?: number;
	children: React.ReactNode;
	anchorY?: string;
}> = ({x, y, scale = 1, rotate = 0, opacity = 1, blur = 0, children, anchorY = '-50%'}) => {
	if (opacity <= 0.001 || scale <= 0.001) {
		return null;
	}
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				width: 0,
				height: 0,
				scale: String(scale),
				rotate: `${rotate}deg`,
				opacity,
				transformOrigin: '0 0',
				filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
			}}
		>
			<div style={{position: 'absolute', left: 0, top: 0, translate: `-50% ${anchorY}`}}>{children}</div>
		</div>
	);
};

type DiamondProps = React.ComponentProps<typeof Diamond>;

/** Diamante anclado en el centro de su filetín (parte más ancha) */
export const DiamondAt: React.FC<DiamondProps & {x: number; y: number; scale?: number; rotate?: number; opacity?: number}> = ({
	x,
	y,
	scale,
	rotate,
	opacity,
	...props
}) => (
	<Place x={x} y={y} scale={scale} rotate={rotate} opacity={opacity} anchorY={`-${(75 * props.width) / 240}px`}>
		<Diamond {...props} />
	</Place>
);

type RingProps = React.ComponentProps<typeof Ring>;

/** Anillo anclado en el centro de la banda */
export const RingAt: React.FC<RingProps & {x: number; y: number; scale?: number; rotate?: number; opacity?: number}> = ({
	x,
	y,
	scale,
	rotate,
	opacity,
	...props
}) => (
	<Place x={x} y={y} scale={scale} rotate={rotate} opacity={opacity} anchorY={`-${(215 * props.width) / 260}px`}>
		<Ring {...props} />
	</Place>
);

/** Rayos de luz giratorios detrás de un objeto */
export const Rays: React.FC<{x: number; y: number; t: number; size?: number; amount: number; color?: string; count?: number}> = ({
	x,
	y,
	t,
	size = 1100,
	amount,
	color = '255,227,154',
	count = 12,
}) => {
	if (amount <= 0.01) {
		return null;
	}
	const step = 360 / count;
	const stops = Array.from({length: count}, (_, i) => {
		const a = i * step;
		return `rgba(${color},0.0) ${a}deg, rgba(${color},0.5) ${a + step * 0.25}deg, rgba(${color},0.0) ${a + step * 0.5}deg`;
	}).join(', ');
	return (
		<div
			style={{
				position: 'absolute',
				left: x - size / 2,
				top: y - size / 2,
				width: size,
				height: size,
				borderRadius: '50%',
				background: `conic-gradient(from ${t * 18}deg, ${stops})`,
				WebkitMaskImage: 'radial-gradient(circle, black 0%, rgba(0,0,0,0.6) 30%, transparent 70%)',
				maskImage: 'radial-gradient(circle, black 0%, rgba(0,0,0,0.6) 30%, transparent 70%)',
				opacity: amount * 0.8,
				mixBlendMode: 'screen',
			}}
		/>
	);
};

/** Halo suave */
export const Halo: React.FC<{x: number; y: number; size: number; amount: number; color?: string}> = ({x, y, size, amount, color = '255,227,154'}) =>
	amount > 0.01 ? (
		<div
			style={{
				position: 'absolute',
				left: x - size / 2,
				top: y - size / 2,
				width: size,
				height: size,
				borderRadius: '50%',
				background: `radial-gradient(circle, rgba(${color},0.55) 0%, rgba(${color},0.18) 35%, transparent 70%)`,
				opacity: amount,
				mixBlendMode: 'screen',
			}}
		/>
	) : null;
