import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {INK, Sparkle, Tube} from '../components/Illustration';
import {Body, Label} from '../components/Label';
import {GoldText} from '../components/GoldText';
import {Reveal} from '../components/Reveal';
import {SceneShell} from '../components/SceneShell';
import {COLORS, EASE_OUT, FONTS} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const HIGHLIGHT_AT = 170;
const TUBE_W = 150;
const TUBE_H = 640;
const TOP = 560;

/** Datos reales: K / 24. Cada tubo empieza a llenarse en un tiempo musical (25 frames). */
export const KARATS = [
  {k: '24K', parts: '24/24', pct: 99.9, at: 25},
  {k: '18K', parts: '18/24', pct: 75, at: 50},
  {k: '14K', parts: '14/24', pct: 58.3, at: 75},
  {k: '10K', parts: '10/24', pct: 41.7, at: 100},
];

const fmt = (n: number, decimals: number) => n.toFixed(decimals).replace('.', ',') + ' %';
const tubeX = (i: number) => 90 + i * 240;

const Tubes: React.FC = () => {
  const frame = useCurrentFrame();
  const hl = interpolate(frame, [HIGHLIGHT_AT, HIGHLIGHT_AT + 16], [0, 1], {...clamp, easing: Easing.bezier(...EASE_OUT)});
  const alloyP = interpolate(frame, [128, 150], [0, 1], clamp);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {KARATS.map((c, i) => {
        const fill = interpolate(frame, [c.at, c.at + 34], [0, c.pct / 100], {...clamp, easing: Easing.inOut(Easing.quad)});
        const pouring = frame >= c.at - 6 && frame <= c.at + 34;
        const streamW = interpolate(frame, [c.at - 6, c.at, c.at + 28, c.at + 34], [0, 18, 18, 0], clamp);
        const is18 = c.k === '18K';
        const wiggle = is18 ? Math.sin((frame - HIGHLIGHT_AT) / 2) * 6 * interpolate(frame, [HIGHLIGHT_AT, HIGHLIGHT_AT + 24], [1, 0], clamp) * (frame >= HIGHLIGHT_AT ? 1 : 0) : 0;
        const x = tubeX(i);
        return (
          <g
            key={c.k}
            opacity={interpolate(frame, [c.at - 20, c.at - 8], [0, 1], clamp) * (is18 ? 1 : 1 - 0.6 * hl)}
            transform={`translate(${x + TUBE_W / 2} ${TOP + TUBE_H}) rotate(${wiggle}) scale(${is18 ? 1 + 0.06 * hl : 1}) translate(${-TUBE_W / 2} ${-TUBE_H})`}
          >
            {pouring ? (
              <rect x={TUBE_W / 2 - streamW / 2} y={-90} width={streamW} height={90 + TUBE_H - fill * (TUBE_H - 10)} rx={streamW / 2} fill={INK.light} />
            ) : null}
            {is18 ? <ellipse cx={TUBE_W / 2} cy={TUBE_H * 0.6} rx={160 * hl} ry={380 * hl} fill="rgba(226,200,120,.18)" style={{filter: 'blur(30px)'}} /> : null}
            <Tube id={c.k} w={TUBE_W} h={TUBE_H} level={fill} alloy={(1 - c.pct / 100) * alloyP} wobble={pouring ? 1.6 : 0.6} />
          </g>
        );
      })}
      <Sparkle x={tubeX(1) + TUBE_W / 2} y={TOP + 120} size={60} at={HIGHLIGHT_AT + 2} />
      <Sparkle x={tubeX(1) - 20} y={TOP + 420} size={36} at={HIGHLIGHT_AT + 10} />
      <Sparkle x={tubeX(1) + TUBE_W + 20} y={TOP + 280} size={44} at={HIGHLIGHT_AT + 16} />
    </svg>
  );
};

const Labels: React.FC = () => {
  const frame = useCurrentFrame();
  const hl = interpolate(frame, [HIGHLIGHT_AT, HIGHLIGHT_AT + 16], [0, 1], clamp);
  return (
    <>
      {KARATS.map((c, i) => {
        const grow = interpolate(frame, [c.at, c.at + 34], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
        const dim = c.k === '18K' ? 1 : 1 - 0.6 * hl;
        return (
          <div key={c.k} style={{position: 'absolute', left: tubeX(i) - 30, width: TUBE_W + 60, top: TOP + TUBE_H + 24, textAlign: 'center', opacity: interpolate(frame, [c.at - 8, c.at], [0, 1], clamp) * dim}}>
            <div style={{fontFamily: FONTS.body, fontWeight: 600, fontSize: 40, color: COLORS.ivory}}>{fmt(c.pct * grow, Number.isInteger(c.pct) ? 0 : 1)}</div>
            <GoldText style={{fontSize: 70}}>{c.k}</GoldText>
            <Label style={{fontSize: 28, letterSpacing: '0.12em', color: COLORS.taupe}}>{c.parts}</Label>
          </div>
        );
      })}
    </>
  );
};

/** Escena 4 (16,7–26,7 s): tubos que se llenan de oro según su pureza. */
export const S4Compare: React.FC = () => (
  <SceneShell duration={300} push={1.03}>
    <AbsoluteFill>
      <Tubes />
      <Labels />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 200}}>
        <Reveal at={4}>
          <Body style={{fontFamily: FONTS.display, fontSize: 90, lineHeight: 1.1}}>
            Cada quilate es
            <br />
            <GoldText shineFrom={18}>una parte de oro.</GoldText>
          </Body>
        </Reveal>
      </AbsoluteFill>
      <Reveal at={132} outAt={HIGHLIGHT_AT - 6} style={{position: 'absolute', top: 1560, left: 0, right: 0}}>
        <div style={{display: 'flex', gap: 50, alignItems: 'center', justifyContent: 'center'}}>
          <Legend color={COLORS.goldLight} text="oro puro" />
          <Legend color="rgba(188,175,155,.6)" text="otros metales" />
        </div>
      </Reveal>
      <Reveal at={HIGHLIGHT_AT + 8} style={{position: 'absolute', top: 1530, left: 0, right: 0, textAlign: 'center'}}>
        <GoldText shineFrom={HIGHLIGHT_AT + 14} style={{fontSize: 100}}>
          18K = 75 % oro
        </GoldText>
        <Body style={{fontSize: 50, marginTop: 4}}>el equilibrio ideal para una joya.</Body>
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
