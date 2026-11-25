import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {EASE_IN_OUT, FONTS, GOLD_GRADIENT} from '../theme';

type Props = {
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
  /** Frame (local) en que el reflejo de luz empieza a cruzar el texto. */
  readonly shineFrom?: number;
  readonly shineDuration?: number;
  readonly glow?: number;
};

/** Texto con relleno de oro metálico y un reflejo que lo recorre. */
export const GoldText: React.FC<Props> = ({children, style, shineFrom = 0, shineDuration = 45, glow = 0.35}) => {
  const frame = useCurrentFrame();
  return (
    <span
      style={{
        fontFamily: FONTS.display,
        backgroundImage: GOLD_GRADIENT,
        backgroundSize: '320% 100%',
        backgroundPosition: interpolate(frame, [shineFrom, shineFrom + shineDuration], ['100% 50%', '0% 50%'], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.bezier(...EASE_IN_OUT),
        }),
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        filter: `drop-shadow(0 0 18px rgba(226, 200, 120, ${glow})) drop-shadow(0 6px 14px rgba(0,0,0,.55))`,
        display: 'inline-block',
        ...style,
      }}
    >
      {children}
    </span>
  );
};
