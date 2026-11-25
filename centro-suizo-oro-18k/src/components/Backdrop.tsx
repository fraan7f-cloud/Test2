import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS} from '../theme';

/** Fondo continuo de todo el spot (estilo 2D): negro de marca, halo cálido que respira, polvo de oro y destellos de 4 puntas, y viñeta. */
export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const t = frame / 30;
  const glowX = 50 + Math.sin(t * 0.35) * 12;
  const glowY = 42 + Math.cos(t * 0.27) * 8;

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.dark, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 75% 45% at ${glowX}% ${glowY}%, rgba(200,168,75,0.20) 0%, rgba(200,168,75,0.06) 45%, rgba(8,8,9,0) 75%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 30% at ${100 - glowX}% 88%, rgba(222,198,157,0.08) 0%, rgba(8,8,9,0) 70%)`,
        }}
      />
      {/* Polvo de oro: partículas deterministas (misma semilla en cada render) */}
      {new Array(70).fill(true).map((_, i) => {
        const size = 2 + random(`s${i}`) * 7;
        const speed = 0.25 + random(`v${i}`) * 0.9;
        const x = random(`x${i}`) * width + Math.sin(t * (0.3 + random(`w${i}`)) + i) * 30;
        const y = (((random(`y${i}`) * height - frame * speed * 2.2) % height) + height) % height;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * (0.8 + random(`f${i}`) * 1.6) + i));
        const star = size > 5.5; // estilo 2D: los más grandes son destellos de 4 puntas, nítidos
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: star ? size * 3 : size,
              height: star ? size * 3 : size,
              borderRadius: star ? 0 : '50%',
              clipPath: star ? 'polygon(50% 0%, 58% 42%, 100% 50%, 58% 58%, 50% 100%, 42% 58%, 0% 50%, 42% 42%)' : undefined,
              background: i % 3 === 0 ? COLORS.champagne : COLORS.goldLight,
              opacity: tw * interpolate(size, [2, 9], [0.8, 0.55]),
              rotate: star ? `${t * 20 + i * 13}deg` : undefined,
            }}
          />
        );
      })}
      <AbsoluteFill
        style={{background: 'radial-gradient(ellipse 85% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.75) 100%)'}}
      />
    </AbsoluteFill>
  );
};
