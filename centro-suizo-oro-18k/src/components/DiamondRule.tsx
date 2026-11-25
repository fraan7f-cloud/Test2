import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, EASE_OUT} from '../theme';

/** Separador con rombos, tomado del "◆ SUIZO ◆" del logotipo. Se dibuja desde el centro. */
export const DiamondRule: React.FC<{readonly at: number; readonly width?: number}> = ({at, width = 420}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(...EASE_OUT),
  });
  const line: React.CSSProperties = {
    height: 2,
    width: (width / 2 - 30) * p,
    background: `linear-gradient(90deg, rgba(200,168,75,0), ${COLORS.gold})`,
  };
  const diamond: React.CSSProperties = {
    width: 12,
    height: 12,
    rotate: '45deg',
    background: COLORS.goldLight,
    opacity: p,
    boxShadow: '0 0 12px rgba(226,200,120,.8)',
  };
  return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16}}>
      <div style={line} />
      <div style={diamond} />
      <div style={{...line, scale: '-1 1'}} />
    </div>
  );
};
