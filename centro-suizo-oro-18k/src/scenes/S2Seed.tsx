import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame} from 'remotion';
import {CarobBranch, INK, Sparkle, squash} from '../components/Illustration';
import {Body} from '../components/Label';
import {GoldText} from '../components/GoldText';
import {Reveal} from '../components/Reveal';
import {SceneShell} from '../components/SceneShell';
import {COLORS, FONTS} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const SEED_LAND = 66;
export const NUGGET_LAND = 104;
const POD_OPEN = 26;

/** Ilustración completa: rama de algarrobo, vaina que se abre y balanza que se equilibra. */
const Illustration: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;
  const tiltIn = spring({frame: frame - SEED_LAND, fps, config: {damping: 8, mass: 0.9}});
  const tiltBack = spring({frame: frame - NUGGET_LAND, fps, config: {damping: 9, mass: 0.9}});
  const angle = 10 * tiltIn - 10 * tiltBack;
  const rad = (angle * Math.PI) / 180;
  const px = 540;
  const py = 820;
  const arm = 330;
  const lx = px - arm * Math.cos(rad);
  const ly = py + arm * Math.sin(rad);
  const rx = px + arm * Math.cos(rad);
  const ry = py - arm * Math.sin(rad);
  const hang = 230;

  // semilla: sale de la vaina (210, 700) y cae al platillo izquierdo
  const seedFall = interpolate(frame, [36, SEED_LAND], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const seedY = frame < SEED_LAND ? interpolate(seedFall, [0, 1], [700, ly + hang - 22]) : ly + hang - 22;
  const seedStretch = frame < SEED_LAND && frame > 36 ? seedFall * 0.5 : 0;
  const [ssx, ssy] = squash(frame, SEED_LAND, 0.5);
  const nugFall = interpolate(frame, [78, NUGGET_LAND], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const nugY = frame < NUGGET_LAND ? interpolate(nugFall, [0, 1], [-100, ry + hang - 22]) : ry + hang - 22;
  const [nsx, nsy] = squash(frame, NUGGET_LAND, 0.5);

  const pan = (x: number, y: number) => (
    <g>
      <path d={`M ${x} ${y} L ${x - 100} ${y + hang} M ${x} ${y} L ${x + 100} ${y + hang}`} stroke={INK.light} strokeWidth={3} />
      <path d={`M ${x - 125} ${y + hang} Q ${x} ${y + hang + 80} ${x + 125} ${y + hang} Z`} fill={INK.mid} />
      <path d={`M ${x + 20} ${y + hang + 34} Q ${x + 100} ${y + hang + 20} ${x + 125} ${y + hang} L ${x + 60} ${y + hang} Z`} fill={INK.shadow} />
      <rect x={x - 125} y={y + hang - 6} width={250} height={10} rx={5} fill={INK.light} />
      <circle cx={x} cy={y} r={9} fill={INK.light} />
    </g>
  );

  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <g transform="translate(470 470) scale(-1 1)">
        <CarobBranch podOpen={interpolate(frame, [POD_OPEN, POD_OPEN + 12], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))})} />
      </g>
      {/* balanza */}
      <rect x={px - 9} y={py} width={18} height={420} rx={9} fill={INK.mid} />
      <rect x={px + 1} y={py} width={8} height={420} rx={4} fill={INK.shadow} />
      <path d={`M ${px - 170} ${py + 450} Q ${px} ${py + 380} ${px + 170} ${py + 450} Z`} fill={INK.mid} />
      <path d={`M ${px + 40} ${py + 410} Q ${px + 130} ${py + 420} ${px + 170} ${py + 450} L ${px + 40} ${py + 450} Z`} fill={INK.shadow} />
      <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={INK.mid} strokeWidth={16} strokeLinecap="round" />
      <line x1={lx} y1={ly - 4} x2={rx} y2={ry - 4} stroke={INK.hi} strokeWidth={4} strokeLinecap="round" opacity={0.7} />
      <circle cx={px} cy={py} r={22} fill={INK.light} />
      <circle cx={px - 6} cy={py - 6} r={7} fill="#fff" />
      <path d={`M ${px} ${py - 70} L ${px - 16} ${py - 22} L ${px + 16} ${py - 22} Z`} fill={INK.light} />
      {pan(lx, ly)}
      {pan(rx, ry)}
      {/* semilla */}
      {frame > 34 ? (
        <g transform={`translate(${frame < SEED_LAND ? 210 : lx} ${seedY}) scale(${ssx * (1 - seedStretch * 0.3)} ${ssy * (1 + seedStretch)}) rotate(${-18 + angle})`}>
          <ellipse rx={30} ry={20} fill="#6E4320" />
          <ellipse rx={30} ry={20} cx={4} cy={4} fill="#3A2210" opacity={0.6} />
          <ellipse rx={10} ry={6} cx={-10} cy={-7} fill="#E9C98A" />
        </g>
      ) : null}
      {/* pepita de oro */}
      {frame > 78 ? (
        <g transform={`translate(${rx} ${nugY}) scale(${nsx} ${nsy})`}>
          <path d="M -32 6 Q -28 -22 -4 -24 Q 24 -28 32 -4 Q 36 18 10 22 Q -20 28 -32 6 Z" fill={INK.mid} />
          <path d="M 10 22 Q 36 18 32 -4 Q 30 16 6 18 Z" fill={INK.shadow} />
          <circle cx={-10} cy={-10} r={6} fill={INK.hi} />
        </g>
      ) : null}
      <Sparkle x={210} y={740} size={36} at={SEED_LAND} />
      <Sparkle x={rx + 60} y={ry + hang - 40} size={46} at={NUGGET_LAND} />
      <Sparkle x={px} y={py - 90} size={40} at={NUGGET_LAND + 16} />
    </svg>
  );
};

/** Escena 2 (3,3–10 s): el origen de la palabra "quilate", animado en 2D. */
export const S2Seed: React.FC = () => (
  <SceneShell duration={200} push={1.04}>
    <AbsoluteFill>
      <Illustration />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 190}}>
        <Reveal at={6}>
          <Body style={{fontFamily: FONTS.display, fontSize: 92, lineHeight: 1.1}}>
            Todo empieza
            <br />
            con una <GoldText shineFrom={30}>semilla.</GoldText>
          </Body>
        </Reveal>
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', top: 1330}}>
        <Reveal at={112}>
          <GoldText shineFrom={120} style={{fontFamily: FONTS.script, fontSize: 160, lineHeight: 1}}>
            Quilate
          </GoldText>
        </Reveal>
        <Reveal at={124} style={{marginTop: 6, maxWidth: 900}}>
          <Body style={{fontSize: 48}}>
            viene del griego <i style={{color: COLORS.goldLight}}>kerátion</i>: la semilla del algarrobo, usada para pesar el oro.
          </Body>
        </Reveal>
      </AbsoluteFill>
    </AbsoluteFill>
  </SceneShell>
);
