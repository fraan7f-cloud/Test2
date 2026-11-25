import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from 'remotion';
import {Body} from '../components/Label';
import {GoldText} from '../components/GoldText';
import {ProductCard} from '../components/ProductCard';
import {Reveal} from '../components/Reveal';
import {SceneShell} from '../components/SceneShell';
import {COLORS, EASE_OUT, FONTS} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
/** Frame local del golpe del sello (cae en el 3er tiempo del compás 11). */
export const STAMP_AT = 50;

/** Interior de un anillo (banda de oro) donde se graba el sello 750. */
const Band: React.FC = () => {
  const frame = useCurrentFrame();
  const shakeAmt = interpolate(frame, [STAMP_AT, STAMP_AT + 10], [14, 0], clamp);
  const shake = frame >= STAMP_AT ? (random(`sh${frame}`) - 0.5) * shakeAmt : 0;
  const pressed = interpolate(frame, [STAMP_AT - 8, STAMP_AT], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  return (
    <div style={{position: 'relative', translate: `${shake}px ${shake * 0.6}px`}}>
      <div
        style={{
          width: 900,
          height: 300,
          borderRadius: 40,
          backgroundImage:
            'linear-gradient(180deg, #4A360F 0%, #9C7A2C 12%, #E2C878 30%, #FFF4D2 42%, #E2C878 55%, #C8A84B 72%, #7A5A1E 90%, #3E2D0C 100%)',
          boxShadow: '0 40px 80px rgba(0,0,0,.6), inset 0 0 40px rgba(0,0,0,.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 60,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* reflejo que recorre el metal */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: 220,
            left: interpolate(frame, [0, 200], [-300, 1100]),
            background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,250,230,.55), rgba(255,255,255,0))',
            rotate: '12deg',
          }}
        />
        <span
          style={{
            fontFamily: FONTS.display,
            fontSize: 200,
            color: 'rgba(92,66,18,.9)',
            textShadow: '0 3px 1px rgba(255,244,210,.75), 0 -2px 2px rgba(40,25,5,.6)',
            opacity: pressed,
            scale: String(interpolate(pressed, [0, 1], [1.6, 1])),
            letterSpacing: '0.04em',
          }}
        >
          750
        </span>
      </div>
      {/* chispas en el golpe */}
      {new Array(18).fill(true).map((_, i) => {
        const ang = random(`a${i}`) * Math.PI * 2;
        const dist = interpolate(frame, [STAMP_AT, STAMP_AT + 26], [0, 160 + random(`d${i}`) * 260], {
          ...clamp,
          easing: Easing.bezier(...EASE_OUT),
        });
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 450 + Math.cos(ang) * dist,
              top: 150 + Math.sin(ang) * dist * 0.6,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#FFF4D2',
              boxShadow: '0 0 14px rgba(255,236,190,1)',
              opacity: interpolate(frame, [STAMP_AT, STAMP_AT + 4, STAMP_AT + 26], [0, 1, 0], clamp),
            }}
          />
        );
      })}
    </div>
  );
};

/** Escena 6 (33,3–40 s): el sello 750 como garantía del oro 18K. */
export const S6Hallmark: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <SceneShell duration={200} push={1.04}>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 210}}>
        <Reveal at={4}>
          <Body style={{fontFamily: FONTS.display, fontSize: 100}}>
            Busca el <GoldText shineFrom={STAMP_AT}>sello 750</GoldText>
          </Body>
        </Reveal>
        <div style={{marginTop: 70}}>
          <Band />
        </div>
        <Reveal at={STAMP_AT + 14} style={{marginTop: 60, maxWidth: 900}}>
          <Body style={{fontSize: 54}}>
            750 milésimas de oro puro:
            <br />
            <span style={{color: COLORS.goldLight}}>la firma del oro 18K.</span>
          </Body>
        </Reveal>
        <Reveal at={STAMP_AT + 40} rise={80} style={{marginTop: 60}}>
          <ProductCard
            src="products/argollas_bicolor.jpg"
            caption="Argolla bi color · Oro 18kt"
            width={560}
            height={500}
            zoom={interpolate(frame, [STAMP_AT + 40, 200], [1.08, 1.2], clamp)}
          />
        </Reveal>
      </AbsoluteFill>
    </SceneShell>
  );
};
