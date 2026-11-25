import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Body, Label} from '../components/Label';
import {GoldText} from '../components/GoldText';
import {Reveal} from '../components/Reveal';
import {SceneShell} from '../components/SceneShell';
import {COLORS, EASE_OUT, FONTS, GOLD_GRADIENT} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const MAX_H = 660;
const COL_W = 170;
export const HIGHLIGHT_AT = 170;

/** Datos reales: K / 24. Los momentos de entrada caen en cada tiempo musical (25 frames). */
export const KARATS = [
  {k: '24K', parts: '24/24', pct: 99.9, at: 25},
  {k: '18K', parts: '18/24', pct: 75, at: 50},
  {k: '14K', parts: '14/24', pct: 58.3, at: 75},
  {k: '10K', parts: '10/24', pct: 41.7, at: 100},
];

const fmt = (n: number, decimals: number) => n.toFixed(decimals).replace('.', ',') + ' %';

const Column: React.FC<{readonly k: string; readonly parts: string; readonly pct: number; readonly at: number}> = ({
  k,
  parts,
  pct,
  at,
}) => {
  const frame = useCurrentFrame();
  const grow = interpolate(frame, [at, at + 30], [0, 1], {...clamp, easing: Easing.bezier(...EASE_OUT)});
  const is18 = k === '18K';
  const hl = interpolate(frame, [HIGHLIGHT_AT, HIGHLIGHT_AT + 16], [0, 1], {...clamp, easing: Easing.bezier(...EASE_OUT)});
  const h = MAX_H * (pct / 100) * grow;
  const decimals = Number.isInteger(pct) ? 0 : 1;
  return (
    <div
      style={{
        width: COL_W,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: interpolate(frame, [at - 4, at + 4], [0, 1], clamp) * (is18 ? 1 : 1 - 0.62 * hl),
        scale: String(is18 ? 1 + 0.07 * hl : 1),
      }}
    >
      <div
        style={{
          position: 'relative',
          width: COL_W,
          height: MAX_H,
          borderRadius: 24,
          border: `2px solid ${COLORS.cardBorder}`,
          overflow: 'hidden',
          background: `rgba(188,175,155,${0.12 * interpolate(frame, [130, 150], [0, 1], clamp)})`,
          boxShadow: is18 ? `0 0 ${70 * hl}px rgba(226,200,120,${0.55 * hl})` : undefined,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: h,
            backgroundImage: GOLD_GRADIENT,
            backgroundSize: '300% 100%',
            backgroundPosition: `${interpolate(frame, [at, at + 60], [100, 20], clamp)}% 50%`,
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          marginTop: MAX_H - h - 66,
          fontFamily: FONTS.body,
          fontWeight: 600,
          fontSize: 44,
          color: COLORS.ivory,
          opacity: grow,
        }}
      >
        {fmt(pct * grow, decimals)}
      </div>
      <GoldText style={{fontSize: 72, marginTop: 20}}>{k}</GoldText>
      <Label style={{fontSize: 30, letterSpacing: '0.12em', color: COLORS.taupe, marginTop: 2}}>{parts}</Label>
    </div>
  );
};

/** Escena 4 (16,7–26,7 s): comparación de pureza 24K / 18K / 14K / 10K. */
export const S4Compare: React.FC = () => (
  <SceneShell duration={300} push={1.04}>
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 200}}>
      <Reveal at={4}>
        <Body style={{fontFamily: FONTS.display, fontSize: 90, lineHeight: 1.1}}>
          Cada quilate es
          <br />
          <GoldText shineFrom={18}>una parte de oro.</GoldText>
        </Body>
      </Reveal>
      <div style={{display: 'flex', gap: 62, marginTop: 120, position: 'relative'}}>
        {KARATS.map((c) => (
          <Column key={c.k} {...c} />
        ))}
      </div>
      <Reveal at={132} outAt={HIGHLIGHT_AT - 6} style={{position: 'absolute', top: 1520}}>
        <div style={{display: 'flex', gap: 50, alignItems: 'center'}}>
          <Legend color={COLORS.goldLight} text="oro puro" />
          <Legend color="rgba(188,175,155,.45)" text="otros metales" />
        </div>
      </Reveal>
      <Reveal at={HIGHLIGHT_AT + 8} style={{position: 'absolute', top: 1470}}>
        <div style={{textAlign: 'center'}}>
          <GoldText shineFrom={HIGHLIGHT_AT + 14} style={{fontSize: 104}}>
            18K = 75 % oro
          </GoldText>
          <Body style={{fontSize: 52, marginTop: 6}}>el equilibrio ideal para una joya.</Body>
        </div>
      </Reveal>
    </AbsoluteFill>
  </SceneShell>
);

const Legend: React.FC<{readonly color: string; readonly text: string}> = ({color, text}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
    <div style={{width: 34, height: 34, borderRadius: 8, background: color}} />
    <Body style={{fontSize: 42}}>{text}</Body>
  </div>
);
