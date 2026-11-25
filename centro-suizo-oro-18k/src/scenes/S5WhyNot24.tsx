import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame} from 'remotion';
import {backOut, Crucible, Drop, Hammer, INK, Ring2D, Sparkle, squash} from '../components/Illustration';
import {Body} from '../components/Label';
import {GoldText} from '../components/GoldText';
import {Reveal} from '../components/Reveal';
import {SceneShell} from '../components/SceneShell';
import {COLORS, FONTS} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
/** El martillo golpea el anillo 24K en este frame. */
export const DENT_AT = 34;
/** Empieza la mezcla de la aleación 18K. */
export const ALLOY_AT = 104;
const CX = 540;
const CY = 960;

/** Parte A: el martillo abolla y raya un anillo de oro puro. */
const SoftRing: React.FC = () => {
  const frame = useCurrentFrame();
  // anticipación (sube 14–28), golpe (28–34), rebote
  const swing = interpolate(frame, [8, 26, DENT_AT, DENT_AT + 6, DENT_AT + 26], [-20, -55, 12, 4, -60], {...clamp, easing: Easing.inOut(Easing.quad)});
  const dent = spring({frame: frame - DENT_AT, fps: 30, config: {damping: 6, mass: 0.6}});
  const scratch = (from: number) => interpolate(frame, [from, from + 8], [0, 1], clamp);
  const visible = interpolate(frame, [4, 14, 88, 100], [0, 1, 1, 0], clamp);
  return (
    <g opacity={visible}>
      <g transform={`translate(${CX} ${CY}) scale(${1 + 0.2 * dent} ${1 - 0.28 * dent})`}>
        <Ring2D rx={240} ry={150} band={52} />
        {[
          {d: 'M -200 -60 L -120 -120', at: DENT_AT + 2},
          {d: 'M 120 110 L 220 40', at: DENT_AT + 6},
          {d: 'M -40 140 L 60 135', at: DENT_AT + 10},
        ].map((s) => (
          <path key={s.d} d={s.d} stroke={INK.line} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - scratch(s.at)} />
        ))}
        <text x={0} y={-178} textAnchor="middle" fontFamily="Marcellus" fontSize={72} fill={INK.light}>
          24K
        </text>
      </g>
      {/* estrellitas de impacto (lenguaje de animación 2D) */}
      {[-1, 1].map((d) => (
        <Sparkle key={d} x={CX + d * 120} y={CY - 170} size={38} at={DENT_AT} dur={18} color={INK.ivory} />
      ))}
      <g transform={`translate(${CX + 380} ${CY + 120}) rotate(${swing - 40})`} opacity={interpolate(frame, [4, 12, 80, 90], [0, 1, 1, 0], clamp)}>
        <Hammer />
      </g>
    </g>
  );
};

const DROPS = [
  {label: 'oro', color: INK.mid, shade: INK.shadow, size: 46, x: -110, at: ALLOY_AT + 2},
  {label: 'plata', color: INK.silver, shade: INK.silverShadow, size: 28, x: 40, at: ALLOY_AT + 16},
  {label: 'cobre', color: INK.copper, shade: INK.copperShadow, size: 28, x: 130, at: ALLOY_AT + 26},
];

/** Parte B: gotas de oro, plata y cobre caen al crisol y nace el anillo 18K. */
const Alloy: React.FC = () => {
  const frame = useCurrentFrame();
  const show = interpolate(frame, [ALLOY_AT - 6, ALLOY_AT + 4], [0, 1], clamp);
  const glow = interpolate(frame, [ALLOY_AT + 20, ALLOY_AT + 44], [0, 1], clamp);
  const ringP = interpolate(frame, [ALLOY_AT + 46, ALLOY_AT + 66], [0, 1], {...clamp, easing: backOut});
  const [sx, sy] = squash(frame, ALLOY_AT + 66, 0.25);
  return (
    <g opacity={show}>
      <g transform={`translate(${CX} ${CY + 230})`}>
        <Crucible glow={glow} />
      </g>
      {DROPS.map((d) => {
        const p = interpolate(frame, [d.at, d.at + 18], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
        if (p <= 0 || p >= 1) return null;
        return (
          <g key={d.label} transform={`translate(${CX + d.x * (1 - p * 0.6)} ${interpolate(p, [0, 1], [CY - 340, CY + 230])})`}>
            <Drop color={d.color} shade={d.shade} size={d.size} stretch={p * 0.5} />
          </g>
        );
      })}
      {DROPS.map((d) => (
        <Sparkle key={d.label} x={CX + d.x * 0.4} y={CY + 220} size={34} at={d.at + 18} color={d.color} />
      ))}
      <g transform={`translate(${CX} ${CY + 210 - ringP * 330}) scale(${ringP * 0.8 * sx} ${ringP * 0.8 * sy})`} opacity={ringP > 0 ? 1 : 0}>
        <Ring2D rx={200} ry={120} band={46} />
      </g>
      <Sparkle x={CX + 190} y={CY - 200} size={56} at={ALLOY_AT + 66} />
      <Sparkle x={CX - 200} y={CY - 80} size={40} at={ALLOY_AT + 74} />
    </g>
  );
};

/** Escena 5 (26,7–33,3 s): ¿por qué no 24K? */
export const S5WhyNot24: React.FC = () => (
  <SceneShell duration={200} push={1.03}>
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <SoftRing />
        <Alloy />
      </svg>
      <AbsoluteFill style={{alignItems: 'center'}}>
        <Reveal at={2} outAt={90} style={{position: 'absolute', top: 230}}>
          <Body style={{fontFamily: FONTS.display, fontSize: 104, lineHeight: 1.1}}>
            ¿Y por qué
            <br />
            <GoldText shineFrom={10}>no 24K?</GoldText>
          </Body>
        </Reveal>
        <Reveal at={DENT_AT + 8} outAt={90} style={{position: 'absolute', top: 1400, maxWidth: 900}}>
          <Body style={{fontSize: 58}}>
            El oro puro es tan blando que <span style={{color: COLORS.goldLight}}>se raya y se deforma.</span>
          </Body>
        </Reveal>
        <Reveal at={ALLOY_AT - 2} style={{position: 'absolute', top: 230}}>
          <Body style={{fontFamily: FONTS.display, fontSize: 84, lineHeight: 1.15}}>
            <GoldText shineFrom={ALLOY_AT + 66}>18K</GoldText> = 75 % oro
            <br />
            <span style={{color: COLORS.taupe}}>+ 25 % plata y cobre</span>
          </Body>
        </Reveal>
        <Reveal at={ALLOY_AT + 60} style={{position: 'absolute', top: 1500}}>
          <GoldText shineFrom={ALLOY_AT + 70} style={{fontSize: 80, textAlign: 'center', lineHeight: 1.15}}>
            Firmeza, sin perder
            <br />
            su brillo.
          </GoldText>
        </Reveal>
      </AbsoluteFill>
    </AbsoluteFill>
  </SceneShell>
);
