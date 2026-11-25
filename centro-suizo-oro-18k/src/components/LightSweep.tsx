import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

/**
 * Destello cálido tipo "light leak" que cubre cada corte de escena.
 * `cuts` son frames globales; el destello alcanza su pico justo en el corte.
 */
export const LightSweep: React.FC<{readonly cuts: number[]}> = ({cuts}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {cuts.map((cut, i) => {
        const o = interpolate(frame, [cut - 10, cut, cut + 14], [0, 0.55, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        if (o <= 0) return null;
        const x = interpolate(frame, [cut - 10, cut + 14], [i % 2 ? 110 : -10, i % 2 ? -10 : 110]);
        return (
          <AbsoluteFill
            key={cut}
            style={{
              opacity: o,
              mixBlendMode: 'screen',
              background: `radial-gradient(ellipse 55% 70% at ${x}% 45%, rgba(255,236,190,.9) 0%, rgba(226,200,120,.45) 35%, rgba(8,8,9,0) 70%)`,
            }}
          />
        );
      })}
    </>
  );
};
