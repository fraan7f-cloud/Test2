import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame} from 'remotion';
import {Body} from '../components/Label';
import {GoldText} from '../components/GoldText';
import {Reveal} from '../components/Reveal';
import {SceneShell} from '../components/SceneShell';
import {COLORS, FONTS} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const SEED_LAND = 66;
const NUGGET_LAND = 104;

/** Balanza dorada: la semilla de algarrobo cae en un platillo y el oro la equilibra. */
const Balance: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;
  const tiltIn = spring({frame: frame - SEED_LAND, fps, config: {damping: 9, mass: 0.9}});
  const tiltBack = spring({frame: frame - NUGGET_LAND, fps, config: {damping: 10, mass: 0.9}});
  const angle = 9 * tiltIn - 9 * tiltBack; // grados, positivo = baja el platillo izquierdo
  const rad = (angle * Math.PI) / 180;
  const px = 540;
  const py = 110;
  const arm = 330;
  const lx = px - arm * Math.cos(rad);
  const ly = py + arm * Math.sin(rad);
  const rx = px + arm * Math.cos(rad);
  const ry = py - arm * Math.sin(rad);
  const hang = 230;

  const seedFall = interpolate(frame, [36, SEED_LAND], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const seedY = frame < SEED_LAND ? interpolate(seedFall, [0, 1], [-520, ly + hang - 26]) : ly + hang - 26;
  const seedX = lx;
  const nugFall = interpolate(frame, [78, NUGGET_LAND], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const nugY = frame < NUGGET_LAND ? interpolate(nugFall, [0, 1], [-520, ry + hang - 24]) : ry + hang - 24;

  const pan = (x: number, y: number) => (
    <g>
      <line x1={x} y1={y} x2={x - 95} y2={y + hang} stroke="url(#goldLine)" strokeWidth={2.5} />
      <line x1={x} y1={y} x2={x + 95} y2={y + hang} stroke="url(#goldLine)" strokeWidth={2.5} />
      <path
        d={`M ${x - 120} ${y + hang} Q ${x} ${y + hang + 70} ${x + 120} ${y + hang} Z`}
        fill="url(#goldFill)"
        stroke={COLORS.goldLight}
        strokeWidth={2}
      />
    </g>
  );

  return (
    <svg width={1080} height={720} viewBox="0 -60 1080 720" style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id="goldLine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9C7A2C" />
          <stop offset="0.5" stopColor={COLORS.goldLight} />
          <stop offset="1" stopColor="#9C7A2C" />
        </linearGradient>
        <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF4D2" />
          <stop offset="0.35" stopColor={COLORS.goldLight} />
          <stop offset="1" stopColor="#7A5A1E" />
        </linearGradient>
        <radialGradient id="seed" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#E9C98A" />
          <stop offset="0.45" stopColor="#8A5A2B" />
          <stop offset="1" stopColor="#3A2210" />
        </radialGradient>
        <radialGradient id="nugget" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#FFF6D8" />
          <stop offset="0.4" stopColor={COLORS.goldLight} />
          <stop offset="1" stopColor="#7A5A1E" />
        </radialGradient>
      </defs>
      {/* pie de la balanza */}
      <line x1={px} y1={py} x2={px} y2={560} stroke={COLORS.gold} strokeWidth={10} strokeLinecap="round" />
      <ellipse cx={px} cy={566} rx={150} ry={20} fill="url(#goldFill)" />
      {/* brazo */}
      <line x1={lx} y1={ly} x2={rx} y2={ry} stroke="url(#goldFill)" strokeWidth={12} strokeLinecap="round" />
      <circle cx={px} cy={py} r={18} fill="url(#nugget)" />
      <path d={`M ${px} ${py - 60} L ${px - 14} ${py - 20} L ${px + 14} ${py - 20} Z`} fill={COLORS.goldLight} />
      {pan(lx, ly)}
      {pan(rx, ry)}
      {/* semilla de algarrobo */}
      <g transform={`translate(${seedX} ${seedY}) rotate(${-18 + angle})`}>
        <ellipse rx={30} ry={20} fill="url(#seed)" />
        <ellipse rx={9} ry={5} cx={-9} cy={-7} fill="rgba(255,240,210,.55)" />
      </g>
      {/* pepita de oro */}
      <g transform={`translate(${rx} ${nugY})`} opacity={interpolate(frame, [78, 82], [0, 1], clamp)}>
        <path
          d="M -30 6 Q -26 -20 -4 -22 Q 22 -26 30 -4 Q 34 16 10 20 Q -18 26 -30 6 Z"
          fill="url(#nugget)"
          style={{filter: 'drop-shadow(0 0 12px rgba(226,200,120,.8))'}}
        />
      </g>
    </svg>
  );
};

/** Escena 2 (3,3–10 s): el origen de la palabra "quilate". */
export const S2Seed: React.FC = () => {
  return (
    <SceneShell duration={200} push={1.07}>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 230}}>
        <Reveal at={6}>
          <Body style={{fontFamily: FONTS.display, fontSize: 96, lineHeight: 1.1}}>
            Todo empieza
            <br />
            con una <GoldText shineFrom={30}>semilla.</GoldText>
          </Body>
        </Reveal>
        <div style={{marginTop: 30}}>
          <Balance />
        </div>
        <Reveal at={112} style={{marginTop: -10}}>
          <GoldText shineFrom={120} style={{fontFamily: FONTS.script, fontSize: 170, lineHeight: 1}}>
            Quilate
          </GoldText>
        </Reveal>
        <Reveal at={124} style={{marginTop: 10, maxWidth: 880}}>
          <Body style={{fontSize: 50}}>
            viene del griego <i style={{color: COLORS.goldLight}}>kerátion</i>: la semilla del algarrobo, usada
            para pesar el oro.
          </Body>
        </Reveal>
      </AbsoluteFill>
    </SceneShell>
  );
};
