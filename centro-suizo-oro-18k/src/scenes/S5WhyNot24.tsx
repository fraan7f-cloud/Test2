import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame} from 'remotion';
import {Body} from '../components/Label';
import {GoldText} from '../components/GoldText';
import {Reveal} from '../components/Reveal';
import {SceneShell} from '../components/SceneShell';
import {COLORS, EASE_OUT, FONTS} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const DENT_AT = 34;
export const ALLOY_AT = 104;

/** Anillo de oro puro que se abolla y se raya: el 24K es demasiado blando. */
const SoftRing: React.FC = () => {
  const frame = useCurrentFrame();
  const dent = spring({frame: frame - DENT_AT, fps: 30, config: {damping: 7, mass: 0.7}});
  const scratch = (from: number) => interpolate(frame, [from, from + 10], [0, 1], clamp);
  return (
    <div
      style={{
        opacity: interpolate(frame, [6, 18, 90, 100], [0, 1, 1, 0], clamp),
        scale: `${1 + 0.16 * dent} ${1 - 0.22 * dent}`,
      }}
    >
      <svg width={600} height={600} viewBox="-300 -300 600 600">
        <defs>
          <linearGradient id="ring24" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFF4D2" />
            <stop offset="0.3" stopColor={COLORS.goldLight} />
            <stop offset="0.65" stopColor="#D9A93A" />
            <stop offset="1" stopColor="#7A5A1E" />
          </linearGradient>
        </defs>
        <circle r={210} fill="none" stroke="url(#ring24)" strokeWidth={56} style={{filter: 'drop-shadow(0 0 22px rgba(226,200,120,.5))'}} />
        {[
          {d: 'M -250 -60 L -120 -200', at: DENT_AT + 8},
          {d: 'M 120 170 L 250 40', at: DENT_AT + 16},
          {d: 'M -40 205 L 90 190', at: DENT_AT + 22},
        ].map((s) => (
          <path
            key={s.d}
            d={s.d}
            stroke="rgba(60,40,10,.85)"
            strokeWidth={5}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - scratch(s.at)}
          />
        ))}
        <text y={18} textAnchor="middle" fontFamily="Marcellus" fontSize={84} fill={COLORS.goldLight}>
          24K
        </text>
      </svg>
    </div>
  );
};

/** Anillo de aleación: 75 % oro + 25 % plata y cobre. */
const AlloyDonut: React.FC = () => {
  const frame = useCurrentFrame();
  const r = 210;
  const c = 2 * Math.PI * r;
  const gold = interpolate(frame, [ALLOY_AT, ALLOY_AT + 34], [0, 0.75], {...clamp, easing: Easing.bezier(...EASE_OUT)});
  const alloy = interpolate(frame, [ALLOY_AT + 30, ALLOY_AT + 50], [0, 0.25], {...clamp, easing: Easing.bezier(...EASE_OUT)});
  return (
    <div style={{opacity: interpolate(frame, [ALLOY_AT - 4, ALLOY_AT + 6], [0, 1], clamp), position: 'absolute'}}>
      <svg width={600} height={600} viewBox="-300 -300 600 600" style={{rotate: '-90deg'}}>
        <circle r={r} fill="none" stroke="rgba(188,175,155,.12)" strokeWidth={58} />
        <circle
          r={r}
          fill="none"
          stroke="url(#ring24)"
          strokeWidth={58}
          strokeDasharray={`${gold * c} ${c}`}
          style={{filter: 'drop-shadow(0 0 16px rgba(226,200,120,.6))'}}
        />
        <circle
          r={r}
          fill="none"
          stroke={COLORS.taupe}
          strokeWidth={58}
          strokeDasharray={`${alloy * c} ${c}`}
          strokeDashoffset={-0.75 * c}
        />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <GoldText shineFrom={ALLOY_AT + 40} style={{fontSize: 150}}>
          18K
        </GoldText>
      </div>
    </div>
  );
};

/** Escena 5 (26,7–33,3 s): ¿por qué no usar oro 24K en joyería? */
export const S5WhyNot24: React.FC = () => (
  <SceneShell duration={200} push={1.04}>
    <AbsoluteFill style={{alignItems: 'center'}}>
      <Reveal at={2} outAt={90} style={{position: 'absolute', top: 230}}>
        <Body style={{fontFamily: FONTS.display, fontSize: 104, lineHeight: 1.1}}>
          ¿Y por qué
          <br />
          <GoldText shineFrom={10}>no 24K?</GoldText>
        </Body>
      </Reveal>
      <Reveal at={ALLOY_AT - 2} style={{position: 'absolute', top: 250}}>
        <Body style={{fontFamily: FONTS.display, fontSize: 84, lineHeight: 1.15}}>
          18K = 75 % oro
          <br />
          <span style={{color: COLORS.taupe}}>+ 25 % plata y cobre</span>
        </Body>
      </Reveal>
      <div style={{position: 'absolute', top: 640, width: 600, height: 600, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <SoftRing />
        <AlloyDonut />
      </div>
      <Reveal at={DENT_AT + 6} outAt={90} style={{position: 'absolute', top: 1350, maxWidth: 900}}>
        <Body style={{fontSize: 58}}>
          El oro puro es tan blando que <span style={{color: COLORS.goldLight}}>se raya y se deforma.</span>
        </Body>
      </Reveal>
      <Reveal at={ALLOY_AT + 50} style={{position: 'absolute', top: 1360}}>
        <GoldText shineFrom={ALLOY_AT + 60} style={{fontSize: 84, textAlign: 'center', lineHeight: 1.15}}>
          Firmeza, sin perder
          <br />
          su brillo.
        </GoldText>
      </Reveal>
    </AbsoluteFill>
  </SceneShell>
);
