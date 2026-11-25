import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Ingot, Sparkle, squash} from '../components/Illustration';
import {Body, Label} from '../components/Label';
import {GoldText} from '../components/GoldText';
import {Reveal} from '../components/Reveal';
import {SceneShell} from '../components/SceneShell';
import {COLORS} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
/** Cada lingotito aterriza en una semicorchea (6,25 frames a 72 BPM). Exportado para sincronizar los ticks. */
export const SEGMENT_START = 30;
export const SEGMENT_STEP = 6.25;
const SPLIT = 28;
const CX = 540;
const CY = 900;

const gridPos = (i: number) => ({x: 70 + (i % 6) * 160, y: 590 + Math.floor(i / 6) * 150});

const IngotScene: React.FC = () => {
  const frame = useCurrentFrame();
  const shake = frame > 14 && frame < SPLIT ? Math.sin(frame * 2.2) * interpolate(frame, [14, SPLIT], [0, 12]) : 0;
  const bigScale = interpolate(frame, [0, 14, SPLIT - 3, SPLIT + 2], [0, 2.4, 2.55, 0], {...clamp, easing: Easing.out(Easing.quad)});
  const done = SEGMENT_START + 24 * SEGMENT_STEP;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {frame < SPLIT + 2 ? (
        <g transform={`translate(${CX - 100 * bigScale + shake} ${CY - 55 * bigScale})`}>
          <Ingot scale={bigScale} shine={interpolate(frame, [4, 22], [0, 1], clamp)} />
        </g>
      ) : null}
      <Sparkle x={CX} y={CY} size={140} at={SPLIT - 2} dur={18} />
      {new Array(24).fill(true).map((_, i) => {
        const land = SEGMENT_START + i * SEGMENT_STEP;
        const p = interpolate(frame, [land - 8, land], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
        if (p <= 0) return null;
        const g = gridPos(i);
        const x = interpolate(p, [0, 1], [CX - 70, g.x]);
        const y = interpolate(p, [0, 1], [CY - 40, g.y]) - Math.sin(p * Math.PI) * 120;
        const [sx, sy] = squash(frame, land, 0.4);
        const glow = interpolate(frame, [done + i * 0.8, done + 8 + i * 0.8, done + 22 + i * 0.8], [0, 1, 0], clamp);
        return (
          <g key={i} transform={`translate(${x + 70} ${y + 77}) scale(${sx} ${sy}) rotate(${(1 - p) * 120}) translate(-70 -77)`}>
            <g style={{filter: `drop-shadow(0 0 ${glow * 20}px rgba(255,236,190,.9))`}}>
              <Ingot scale={0.7} shine={glow} />
            </g>
          </g>
        );
      })}
      {[0, 5, 18, 23].map((i) => (
        <Sparkle key={i} x={gridPos(i).x + 70} y={gridPos(i).y + 10} size={40} at={done + 4 + i} />
      ))}
    </svg>
  );
};

const Counter: React.FC = () => {
  const frame = useCurrentFrame();
  const filled = Math.max(0, Math.min(24, Math.floor((frame - SEGMENT_START) / SEGMENT_STEP) + 1));
  const bump = interpolate((frame - SEGMENT_START) % SEGMENT_STEP, [0, 3, 6.25], [1.12, 1, 1], clamp);
  return (
    <div style={{textAlign: 'center', opacity: interpolate(frame, [SEGMENT_START - 4, SEGMENT_START + 2], [0, 1], clamp)}}>
      <GoldText style={{fontSize: 200, lineHeight: 1, scale: String(frame < SEGMENT_START + 24 * SEGMENT_STEP ? bump : 1)}}>{filled}</GoldText>
      <Label style={{fontSize: 40, color: COLORS.taupe}}>de 24 partes</Label>
    </div>
  );
};

/** Escena 3 (10–16,7 s): un lingote se parte en 24 partes. */
export const S3TwentyFour: React.FC = () => (
  <SceneShell duration={200} push={1.04}>
    <AbsoluteFill>
      <IngotScene />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 220}}>
        <Reveal at={4}>
          <Label style={{textAlign: 'center', fontSize: 44}}>El oro puro se divide en</Label>
        </Reveal>
        <Reveal at={12} style={{marginTop: 6}}>
          <GoldText shineFrom={20} style={{fontSize: 150, lineHeight: 1.1}}>
            24 partes
          </GoldText>
        </Reveal>
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', top: 1250}}>
        <Counter />
        <Reveal at={182} duration={14} style={{marginTop: 30}}>
          <Body style={{fontSize: 58}}>
            24 de 24 = <GoldText style={{fontSize: 76}}>24K</GoldText> · oro puro
          </Body>
        </Reveal>
      </AbsoluteFill>
    </AbsoluteFill>
  </SceneShell>
);

