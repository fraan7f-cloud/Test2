import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from 'remotion';
import {Hammer, INK, Sparkle} from '../components/Illustration';
import {Body} from '../components/Label';
import {GoldText} from '../components/GoldText';
import {ProductCard} from '../components/ProductCard';
import {Reveal} from '../components/Reveal';
import {SceneShell} from '../components/SceneShell';
import {COLORS, FONTS} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
/** Frame local del golpe del sello (3er tiempo del compás 11). */
export const STAMP_AT = 50;
const BX = 90;
const BY = 650;
const BW = 900;
const BH = 280;

/** Banda interior de la argolla (ilustrada) + punzón y martillo que graban el 750. */
const StampScene: React.FC = () => {
  const frame = useCurrentFrame();
  const shakeAmt = interpolate(frame, [STAMP_AT, STAMP_AT + 10], [14, 0], clamp);
  const shake = frame >= STAMP_AT ? (random(`sh${frame}`) - 0.5) * shakeAmt : 0;
  // punzón: baja (10–30), espera, se hunde con el golpe y luego se retira
  const punchY = interpolate(frame, [10, 30, STAMP_AT, STAMP_AT + 4, STAMP_AT + 16, STAMP_AT + 30], [-300, -40, -40, -14, -24, -420], {...clamp, easing: Easing.inOut(Easing.quad)});
  const hammer = interpolate(frame, [14, 42, STAMP_AT, STAMP_AT + 6, STAMP_AT + 30], [18, 40, 0, 6, 45], {...clamp, easing: Easing.inOut(Easing.quad)});
  const pressed = frame >= STAMP_AT ? 1 : 0;
  const tools = interpolate(frame, [6, 14, STAMP_AT + 14, STAMP_AT + 26], [0, 1, 1, 0], clamp);
  const cx = BX + BW / 2;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <g transform={`translate(${shake} ${shake * 0.6})`}>
        {/* banda ilustrada: franjas planas de luz y sombra */}
        <rect x={BX} y={BY} width={BW} height={BH} rx={40} fill={INK.mid} />
        <rect x={BX} y={BY + BH * 0.62} width={BW} height={BH * 0.38} rx={40} fill={INK.shadow} />
        <rect x={BX} y={BY + BH * 0.62} width={BW} height={30} fill={INK.shadow} />
        <rect x={BX + 30} y={BY + 34} width={BW - 60} height={26} rx={13} fill={INK.hi} opacity={0.75} />
        <rect x={BX} y={BY + BH * 0.5} width={BW} height={10} fill={INK.light} opacity={0.6} />
        {/* grabado 750 */}
        <g opacity={pressed}>
          <text x={cx} y={BY + 200} textAnchor="middle" fontFamily="Marcellus" fontSize={190} fill={INK.deep} letterSpacing={8}>
            750
          </text>
          <text x={cx} y={BY + 195} textAnchor="middle" fontFamily="Marcellus" fontSize={190} fill={INK.shadow} letterSpacing={8}>
            750
          </text>
        </g>
      </g>
      {/* punzón */}
      <g opacity={tools} transform={`translate(${cx} ${BY + punchY})`}>
        <rect x={-46} y={-170} width={92} height={150} rx={10} fill={INK.silver} />
        <rect x={10} y={-170} width={36} height={150} rx={8} fill={INK.silverShadow} />
        <path d="M -46 -20 L 46 -20 L 30 30 L -30 30 Z" fill={INK.silverShadow} />
      </g>
      {/* martillo que golpea el punzón */}
      <g opacity={tools} transform={`translate(${cx + 340} ${BY + punchY - 140}) rotate(${hammer - 90})`}>
        <Hammer />
      </g>
      {/* chispas */}
      {new Array(16).fill(true).map((_, i) => {
        const ang = random(`a${i}`) * Math.PI * 2;
        const dist = interpolate(frame, [STAMP_AT, STAMP_AT + 24], [0, 140 + random(`d${i}`) * 240], {...clamp, easing: Easing.out(Easing.quad)});
        return (
          <circle
            key={i}
            cx={cx + Math.cos(ang) * dist}
            cy={BY + 60 + Math.sin(ang) * dist * 0.6}
            r={6}
            fill={INK.hi}
            opacity={interpolate(frame, [STAMP_AT, STAMP_AT + 3, STAMP_AT + 24], [0, 1, 0], clamp)}
          />
        );
      })}
      <Sparkle x={cx - 260} y={BY + 40} size={50} at={STAMP_AT + 2} />
      <Sparkle x={cx + 270} y={BY + 220} size={40} at={STAMP_AT + 8} />
      <Sparkle x={cx + 120} y={BY + 20} size={34} at={STAMP_AT + 30} />
    </svg>
  );
};

/** Escena 6 (33,3–40 s): el sello 750, grabado con punzón y martillo. */
export const S6Hallmark: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <SceneShell duration={200} push={1.03}>
      <AbsoluteFill>
        <StampScene />
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 200}}>
          <Reveal at={4}>
            <Body style={{fontFamily: FONTS.display, fontSize: 96}}>
              Busca el <GoldText shineFrom={STAMP_AT}>sello 750</GoldText>
            </Body>
          </Reveal>
        </AbsoluteFill>
        <AbsoluteFill style={{alignItems: 'center', top: 990}}>
          <Reveal at={STAMP_AT + 14} style={{maxWidth: 900}}>
            <Body style={{fontSize: 54}}>
              750 milésimas de oro puro:
              <br />
              <span style={{color: COLORS.goldLight}}>la firma del oro 18K.</span>
            </Body>
          </Reveal>
          <Reveal at={STAMP_AT + 40} rise={80} style={{marginTop: 50}}>
            <ProductCard
              src="products/argollas_bicolor.jpg"
              caption="Argolla bi color · Oro 18kt"
              width={500}
              height={420}
              zoom={interpolate(frame, [STAMP_AT + 40, 200], [1.08, 1.2], clamp)}
              style={{rotate: `${Math.sin(frame / 20) * 1.5}deg`}}
            />
          </Reveal>
        </AbsoluteFill>
      </AbsoluteFill>
    </SceneShell>
  );
};
