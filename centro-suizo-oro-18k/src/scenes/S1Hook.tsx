import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {DiamondRule} from '../components/DiamondRule';
import {backOut, INK, Sparkle, squash} from '../components/Illustration';
import {Body} from '../components/Label';
import {GoldText} from '../components/GoldText';
import {Reveal} from '../components/Reveal';
import {SceneShell} from '../components/SceneShell';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
/** La pepita toca el suelo en este frame (sincronizado con el impacto). */
export const NUGGET_HIT = 6;
const POP = 22;

/** Pepita de oro: cae, se aplasta, rebota y estalla en destellos. */
const Nugget: React.FC = () => {
  const frame = useCurrentFrame();
  const fall = interpolate(frame, [0, NUGGET_HIT], [-700, 0], {...clamp, easing: Easing.in(Easing.quad)});
  const bounce = frame > NUGGET_HIT ? -Math.sin(interpolate(frame, [NUGGET_HIT, POP], [0, Math.PI], clamp)) * 160 : 0;
  const [sx, sy] = squash(frame, NUGGET_HIT, 0.45);
  const anticipation = interpolate(frame, [POP - 5, POP], [1, 0.8], clamp);
  const gone = frame >= POP;
  if (gone) return null;
  return (
    <g transform={`translate(540 ${880 + fall + bounce}) scale(${sx * anticipation} ${sy * (2 - anticipation)}) rotate(${frame * 6})`}>
      <path d="M -90 20 Q -84 -60 -14 -70 Q 70 -82 92 -12 Q 104 50 30 66 Q -60 84 -90 20 Z" fill={INK.mid} />
      <path d="M 20 60 Q 90 40 92 -12 Q 96 40 30 66 Z" fill={INK.shadow} />
      <path d="M 40 -40 Q 96 -10 70 40 Q 92 0 40 -40 Z" fill={INK.shadow} opacity={0.7} />
      <path d="M -60 -20 Q -50 -58 -6 -60 Q -40 -40 -44 -8 Z" fill={INK.hi} />
      <circle cx={-30} cy={-46} r={8} fill="#fff" />
    </g>
  );
};

/** Escena 1 (0–3,3 s): gancho 2D. */
export const S1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const letters = ['1', '8', 'K'];
  return (
    <SceneShell duration={100} fadeIn={1} push={1.04}>
      <AbsoluteFill>
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          {/* sombra en el piso */}
          <ellipse
            cx={540}
            cy={970}
            rx={interpolate(frame, [0, NUGGET_HIT, 14, POP], [20, 110, 70, 110], clamp)}
            ry={16}
            fill="rgba(0,0,0,.6)"
            opacity={frame < POP ? 1 : 0}
          />
          <Nugget />
          {/* polvo dorado al tocar el suelo */}
          {new Array(10).fill(true).map((_, i) => {
            const dir = i < 5 ? -1 : 1;
            const p = interpolate(frame, [NUGGET_HIT, NUGGET_HIT + 18], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
            return (
              <circle
                key={i}
                cx={540 + dir * (30 + p * (90 + (i % 5) * 40))}
                cy={960 - Math.sin(p * Math.PI) * (40 + (i % 5) * 18)}
                r={6 - (i % 3)}
                fill={INK.light}
                opacity={frame > NUGGET_HIT ? 1 - p : 0}
              />
            );
          })}
          {/* estallido de destellos cuando la pepita "se convierte" en 18K */}
          {new Array(12).fill(true).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const d = 260 + (i % 3) * 70;
            return <Sparkle key={i} x={540 + Math.cos(a) * d} y={860 + Math.sin(a) * d * 0.8} size={34 + (i % 3) * 14} at={POP + (i % 4) * 3} dur={26} />;
          })}
          <Sparkle x={820} y={700} size={60} at={52} dur={30} />
          <Sparkle x={250} y={1010} size={44} at={64} dur={28} />
        </svg>
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
          <div style={{display: 'flex', marginTop: -100}}>
            {letters.map((l, i) => {
              const at = POP + i * 4;
              const p = interpolate(frame, [at, at + 16], [0, 1], {...clamp, easing: backOut});
              const [sx, sy] = squash(frame, at + 10, 0.18);
              return (
                <div key={l} style={{opacity: interpolate(frame, [at, at + 3], [0, 1], clamp), scale: `${p * sx} ${p * sy}`, translate: `0px ${(1 - p) * 120}px`, rotate: `${(1 - p) * (i - 1) * 25}deg`}}>
                  <GoldText shineFrom={44} shineDuration={36} glow={0.5} style={{fontSize: 460, lineHeight: 1}}>
                    {l}
                  </GoldText>
                </div>
              );
            })}
          </div>
          <Reveal at={46} style={{marginTop: 10}}>
            <DiamondRule at={46} width={460} />
          </Reveal>
          <Reveal at={52} style={{marginTop: 40}}>
            <Body style={{fontSize: 76, fontWeight: 300}}>¿Sabes qué significa?</Body>
          </Reveal>
        </AbsoluteFill>
      </AbsoluteFill>
    </SceneShell>
  );
};
