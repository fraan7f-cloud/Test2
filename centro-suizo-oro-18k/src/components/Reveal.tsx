import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {EASE_OUT} from '../theme';

type Props = {
  readonly children: React.ReactNode;
  /** Frame local en que empieza la entrada. */
  readonly at: number;
  readonly duration?: number;
  /** Frame local en que empieza la salida (opcional). */
  readonly outAt?: number;
  readonly rise?: number;
  readonly style?: React.CSSProperties;
};

/** Entrada elegante: sube, se enfoca y aparece. Se usa para cada bloque de texto. */
export const Reveal: React.FC<Props> = ({children, at, duration = 22, outAt, rise = 40, style}) => {
  const frame = useCurrentFrame();
  const opts = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(...EASE_OUT)} as const;
  const inP = interpolate(frame, [at, at + duration], [0, 1], opts);
  const outP = outAt === undefined ? 0 : interpolate(frame, [outAt, outAt + 14], [0, 1], opts);
  return (
    <div
      style={{
        opacity: inP * (1 - outP),
        translate: `0px ${(1 - inP) * rise - outP * 30}px`,
        filter: `blur(${(1 - inP) * 10 + outP * 8}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
