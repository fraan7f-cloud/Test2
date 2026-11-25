import React from 'react';
import {Img, staticFile} from 'remotion';
import {COLORS, FONTS} from '../theme';

type Props = {
  readonly src: string;
  readonly caption?: string;
  readonly width: number;
  readonly height: number;
  readonly zoom?: number;
  readonly style?: React.CSSProperties;
};

/** Tarjeta de producto con el estilo de la web: fondo blanco, borde dorado translúcido, radio 15px. */
export const ProductCard: React.FC<Props> = ({src, caption, width, height, zoom = 1, style}) => (
  <div
    style={{
      width,
      height,
      borderRadius: 22,
      border: `2px solid ${COLORS.cardBorder}`,
      background: COLORS.white,
      overflow: 'hidden',
      boxShadow: '0 30px 60px rgba(0,0,0,.55), 0 0 40px rgba(200,168,75,.18)',
      position: 'relative',
      ...style,
    }}
  >
    <Img
      src={staticFile(src)}
      style={{width: '100%', height: '100%', objectFit: 'cover', scale: String(zoom)}}
    />
    {caption ? (
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: '22px 26px',
          background: 'linear-gradient(to top, rgba(8,8,9,.78), rgba(8,8,9,0))',
          fontFamily: FONTS.body,
          fontWeight: 500,
          fontSize: 30,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: COLORS.ivory,
        }}
      >
        {caption}
      </div>
    ) : null}
  </div>
);
