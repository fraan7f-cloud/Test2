import React from 'react';
import {starPath, useSvgId} from './util';

/** Destello de 4 puntas (para usar dentro de un <svg>). amount 0..1 */
export const Glint: React.FC<{x: number; y: number; size: number; amount: number; rotate?: number; color?: string}> = ({
	x,
	y,
	size,
	amount,
	rotate = 0,
	color = '#ffffff',
}) => {
	const id = useSvgId('glint');
	if (amount <= 0.001) {
		return null;
	}
	const s = size * amount;
	return (
		<g transform={`translate(${x} ${y}) rotate(${rotate + amount * 45})`} style={{mixBlendMode: 'screen'}}>
			<defs>
				<radialGradient id={id}>
					<stop offset="0%" stopColor={color} stopOpacity={0.9} />
					<stop offset="40%" stopColor={color} stopOpacity={0.25} />
					<stop offset="100%" stopColor={color} stopOpacity={0} />
				</radialGradient>
			</defs>
			<circle r={s * 0.55} fill={`url(#${id})`} opacity={amount} />
			<path d={starPath(s, 0.08)} fill={color} opacity={Math.min(1, amount * 1.4)} />
			<path d={starPath(s * 0.55, 0.12)} fill={color} transform="rotate(45)" opacity={amount * 0.7} />
		</g>
	);
};

/** Versión HTML posicionada en absoluto */
export const GlintAbs: React.FC<{x: number; y: number; size: number; amount: number; rotate?: number; color?: string}> = (
	props,
) => {
	const pad = props.size * 1.2;
	return (
		<svg
			width={pad * 2}
			height={pad * 2}
			viewBox={`${-pad} ${-pad} ${pad * 2} ${pad * 2}`}
			style={{position: 'absolute', left: props.x - pad, top: props.y - pad, overflow: 'visible', pointerEvents: 'none'}}
		>
			<Glint {...props} x={0} y={0} />
		</svg>
	);
};
