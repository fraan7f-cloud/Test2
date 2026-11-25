import React from 'react';
import {COLORS, FONTS} from '../theme';

/** Rótulo en mayúsculas espaciadas, como los botones del sitio (letter-spacing .08em, uppercase). */
export const Label: React.FC<{readonly children: React.ReactNode; readonly style?: React.CSSProperties}> = ({
  children,
  style,
}) => (
  <div
    style={{
      fontFamily: FONTS.body,
      fontWeight: 500,
      fontSize: 40,
      letterSpacing: '0.22em',
      textTransform: 'uppercase',
      color: COLORS.champagne,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Texto de apoyo (Barlow, marfil). */
export const Body: React.FC<{readonly children: React.ReactNode; readonly style?: React.CSSProperties}> = ({
  children,
  style,
}) => (
  <div
    style={{
      fontFamily: FONTS.body,
      fontWeight: 400,
      fontSize: 50,
      lineHeight: 1.3,
      color: COLORS.ivory,
      textAlign: 'center',
      ...style,
    }}
  >
    {children}
  </div>
);
