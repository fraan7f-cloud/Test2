import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Body} from '../components/Label';
import {DiamondRule} from '../components/DiamondRule';
import {GoldText} from '../components/GoldText';
import {Reveal} from '../components/Reveal';
import {SceneShell} from '../components/SceneShell';
import {EASE_OUT} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Escena 1 (0–3,3 s): gancho. Un "18K" de oro aparece con impacto y una pregunta. */
export const S1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <SceneShell duration={100} fadeIn={1} push={1.05}>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        {/* Onda expansiva dorada en el impacto */}
        <div
          style={{
            position: 'absolute',
            width: 900,
            height: 900,
            borderRadius: '50%',
            border: '3px solid rgba(226,200,120,.8)',
            boxShadow: '0 0 60px rgba(226,200,120,.6), inset 0 0 60px rgba(226,200,120,.4)',
            scale: interpolate(frame, [4, 40], [0.2, 1.6], {...clamp, easing: Easing.bezier(...EASE_OUT)}),
            opacity: interpolate(frame, [4, 10, 40], [0, 0.9, 0], clamp),
          }}
        />
        <div
          style={{
            marginTop: -80,
            opacity: interpolate(frame, [4, 12], [0, 1], clamp),
            scale: interpolate(frame, [4, 30], [1.45, 1], {...clamp, easing: Easing.bezier(...EASE_OUT)}),
            filter: `blur(${interpolate(frame, [4, 22], [28, 0], clamp)}px)`,
            letterSpacing: interpolate(frame, [4, 60], [0.12, -0.01], {...clamp, easing: Easing.bezier(...EASE_OUT)}) + 'em',
          }}
        >
          <GoldText shineFrom={26} shineDuration={42} glow={0.5} style={{fontSize: 470, lineHeight: 1}}>
            18K
          </GoldText>
        </div>
        <Reveal at={40} style={{marginTop: 10}}>
          <DiamondRule at={40} width={460} />
        </Reveal>
        <Reveal at={46} style={{marginTop: 40}}>
          <Body style={{fontSize: 76, fontWeight: 300, letterSpacing: '0.01em'}}>¿Sabes qué significa?</Body>
        </Reveal>
      </AbsoluteFill>
    </SceneShell>
  );
};
