import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {EASE_OUT} from '../theme';

type Props = {
  readonly children: React.ReactNode;
  /** Duración de la escena en frames (la misma que su Sequence). */
  readonly duration: number;
  /** Empuje de cámara: escala final del lento "dolly in" durante la escena. */
  readonly push?: number;
  readonly fadeIn?: number;
  readonly fadeOut?: number;
};

/**
 * Envoltura de cada escena: entrada con desenfoque, "dolly in" de cámara continuo
 * y salida con fundido + leve zoom, para encadenar escenas sin cortes bruscos.
 */
export const SceneShell: React.FC<Props> = ({children, duration: durationInFrames, push = 1.06, fadeIn = 12, fadeOut = 12}) => {
  const frame = useCurrentFrame();
  const out = durationInFrames - fadeOut;

  return (
    <AbsoluteFill
      style={{
        opacity: interpolate(frame, [0, fadeIn, out, durationInFrames], [0, 1, 1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
        scale: interpolate(frame, [0, durationInFrames - fadeOut, durationInFrames], [1, push, push + 0.05], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
        filter: `blur(${interpolate(frame, [0, fadeIn, out, durationInFrames], [14, 0, 0, 10], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.bezier(...EASE_OUT),
        })}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
