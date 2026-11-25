import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Body, Label} from '../components/Label';
import {GoldText} from '../components/GoldText';
import {Reveal} from '../components/Reveal';
import {SceneShell} from '../components/SceneShell';
import {COLORS} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
/** Cada segmento se llena en una semicorchea (6,25 frames a 72 BPM). Exportado para sincronizar los ticks. */
export const SEGMENT_START = 30;
export const SEGMENT_STEP = 6.25;

const R = 330;
const CX = 540;
const CY = 380;

const arcPath = (i: number) => {
  const gap = 2.4;
  const a0 = ((i * 15 + gap / 2 - 90) * Math.PI) / 180;
  const a1 = (((i + 1) * 15 - gap / 2 - 90) * Math.PI) / 180;
  return `M ${CX + R * Math.cos(a0)} ${CY + R * Math.sin(a0)} A ${R} ${R} 0 0 1 ${CX + R * Math.cos(a1)} ${CY + R * Math.sin(a1)}`;
};

const Ring: React.FC = () => {
  const frame = useCurrentFrame();
  const filled = Math.max(0, Math.min(24, Math.floor((frame - SEGMENT_START) / SEGMENT_STEP) + 1));
  const done = SEGMENT_START + 24 * SEGMENT_STEP;
  return (
    <div style={{position: 'relative', width: 1080, height: 760}}>
      {/* barrido de luz alrededor del anillo cuando se completa */}
      <div
        style={{
          position: 'absolute',
          left: CX - R - 60,
          top: CY - R - 60,
          width: 2 * R + 120,
          height: 2 * R + 120,
          borderRadius: '50%',
          background: 'conic-gradient(from 0deg, rgba(255,244,210,0) 0deg, rgba(255,244,210,.55) 25deg, rgba(255,244,210,0) 60deg)',
          rotate: `${interpolate(frame, [done, done + 40], [0, 360], clamp)}deg`,
          opacity: interpolate(frame, [done, done + 6, done + 34, done + 44], [0, 1, 1, 0], clamp),
          WebkitMaskImage: 'radial-gradient(circle, transparent 60%, black 62%, black 76%, transparent 78%)',
        }}
      />
      <svg width={1080} height={760} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="segGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFF4D2" />
            <stop offset="0.35" stopColor={COLORS.goldLight} />
            <stop offset="0.7" stopColor={COLORS.gold} />
            <stop offset="1" stopColor="#7A5A1E" />
          </linearGradient>
        </defs>
        {new Array(24).fill(true).map((_, i) => {
          const start = SEGMENT_START + i * SEGMENT_STEP;
          const p = interpolate(frame, [start, start + 7], [0, 1], clamp);
          return (
            <g key={i}>
              <path d={arcPath(i)} stroke="rgba(188,175,155,.16)" strokeWidth={62} fill="none" />
              <path
                d={arcPath(i)}
                stroke="url(#segGold)"
                strokeWidth={52 + 14 * p - 4 * interpolate(frame, [start + 7, start + 14], [0, 1], clamp)}
                fill="none"
                opacity={p}
                style={{filter: `drop-shadow(0 0 ${10 * p}px rgba(226,200,120,.7))`}}
              />
            </g>
          );
        })}
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: CY - 150,
          textAlign: 'center',
        }}
      >
        <GoldText shineFrom={done} shineDuration={40} style={{fontSize: 230, lineHeight: 1}}>
          {filled}
        </GoldText>
        <Label style={{fontSize: 38, marginTop: 4, color: COLORS.taupe}}>de 24</Label>
      </div>
    </div>
  );
};

/** Escena 3 (10–16,7 s): el oro se mide en 24 partes. */
export const S3TwentyFour: React.FC = () => (
  <SceneShell duration={200} push={1.05}>
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 220}}>
      <Reveal at={4}>
        <Label style={{textAlign: 'center', fontSize: 44}}>El oro puro se divide en</Label>
      </Reveal>
      <Reveal at={12} style={{marginTop: 6}}>
        <GoldText shineFrom={20} style={{fontSize: 150, lineHeight: 1.1}}>
          24 partes
        </GoldText>
      </Reveal>
      <div style={{marginTop: 40}}>
        <Ring />
      </div>
      <Reveal at={182} duration={14}>
        <Body style={{fontSize: 56}}>
          24 de 24 partes = <GoldText style={{fontSize: 72}}>24K</GoldText>
        </Body>
      </Reveal>
    </AbsoluteFill>
  </SceneShell>
);
