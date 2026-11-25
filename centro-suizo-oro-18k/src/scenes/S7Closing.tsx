import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {DiamondRule} from '../components/DiamondRule';
import {GoldText} from '../components/GoldText';
import {Body, Label} from '../components/Label';
import {ProductCard} from '../components/ProductCard';
import {Reveal} from '../components/Reveal';
import {SceneShell} from '../components/SceneShell';
import {COLORS, EASE_OUT, FONTS} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const TAGLINE_AT = 118;
export const LOGO_AT = 196;

/** Tarjeta que entra desde abajo con rotación y deriva lenta (parallax). */
const FloatingCard: React.FC<{
  readonly src: string;
  readonly caption: string;
  readonly at: number;
  readonly x: number;
  readonly y: number;
  readonly rot: number;
  readonly w: number;
  readonly h: number;
  readonly drift: number;
}> = ({src, caption, at, x, y, rot, w, h, drift}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 26], [0, 1], {...clamp, easing: Easing.bezier(...EASE_OUT)});
  const out = interpolate(frame, [TAGLINE_AT - 14, TAGLINE_AT], [0, 1], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity: p * (1 - out),
        translate: `0px ${(1 - p) * 500 - frame * drift - out * 60}px`,
        rotate: `${rot * p}deg`,
        filter: `blur(${out * 10}px)`,
      }}
    >
      <ProductCard src={src} caption={caption} width={w} height={h} zoom={1.1 + frame * 0.0009} />
    </div>
  );
};

/** Logo oficial recoloreado en dorado, con un reflejo de luz recortado a su silueta. */
const Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [LOGO_AT, LOGO_AT + 26], [0, 1], {...clamp, easing: Easing.bezier(...EASE_OUT)});
  const W = 760;
  const H = Math.round((W * 634) / 999);
  return (
    <div
      style={{
        position: 'relative',
        width: W,
        height: H,
        opacity: p,
        scale: String(1.12 - 0.12 * p + interpolate(frame, [LOGO_AT, 300], [0, 0.03], clamp)),
        filter: `blur(${(1 - p) * 16}px) drop-shadow(0 0 30px rgba(226,200,120,${0.35 * p}))`,
      }}
    >
      <Img src={staticFile('brand/logo-dorado.png')} style={{width: W, height: H}} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          WebkitMaskImage: `url(${staticFile('brand/logo-dorado.png')})`,
          WebkitMaskSize: '100% 100%',
          maskImage: `url(${staticFile('brand/logo-dorado.png')})`,
          maskSize: '100% 100%',
          background: `linear-gradient(105deg, rgba(255,255,255,0) ${interpolate(frame, [LOGO_AT + 20, LOGO_AT + 60], [-40, 110], clamp)}%, rgba(255,250,230,.95) ${interpolate(frame, [LOGO_AT + 20, LOGO_AT + 60], [-30, 120], clamp)}%, rgba(255,255,255,0) ${interpolate(frame, [LOGO_AT + 20, LOGO_AT + 60], [-20, 130], clamp)}%)`,
        }}
      />
    </div>
  );
};

/** Escena 7 (40–50 s): productos reales, frase de marca y logo. */
export const S7Closing: React.FC = () => (
  <SceneShell duration={300} push={1.03} fadeOut={10}>
    <AbsoluteFill style={{alignItems: 'center'}}>
      {/* A · Galería de producto */}
      <Reveal at={4} outAt={TAGLINE_AT - 14} style={{position: 'absolute', top: 200, textAlign: 'center'}}>
        <Label style={{fontSize: 38}}>Joyería Centro Suizo</Label>
        <GoldText shineFrom={14} style={{fontSize: 96, marginTop: 10}}>
          Oro 18K certificado
        </GoldText>
      </Reveal>
      <FloatingCard src="products/argollas_media_cana.jpg" caption="Argollas 18kt" at={8} x={60} y={500} rot={-5} w={470} h={560} drift={0.25} />
      <FloatingCard src="products/aros_bolita.jpg" caption="Aros 18kt" at={20} x={550} y={620} rot={4} w={470} h={560} drift={0.4} />
      <FloatingCard src="products/cadena_bolitas.jpg" caption="Cadenas 18kt" at={32} x={300} y={1215} rot={-1.5} w={480} h={480} drift={0.55} />
      <Reveal at={56} outAt={TAGLINE_AT - 14} style={{position: 'absolute', top: 1745}}>
        <Label style={{fontSize: 36, color: COLORS.goldLight}}>◆ Garantía de por vida ◆</Label>
      </Reveal>

      {/* B · Frase de campaña de la marca */}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <Reveal at={TAGLINE_AT + 4} outAt={LOGO_AT - 14}>
          <Body style={{fontFamily: FONTS.display, fontSize: 80, lineHeight: 1.2}}>
            Hay decisiones
            <br />
            que no se explican.
          </Body>
        </Reveal>
        <Reveal at={TAGLINE_AT + 26} outAt={LOGO_AT - 14} style={{marginTop: 10}}>
          <GoldText shineFrom={TAGLINE_AT + 30} shineDuration={50} glow={0.55} style={{fontFamily: FONTS.script, fontSize: 230, lineHeight: 1.1}}>
            Se sienten.
          </GoldText>
        </Reveal>
      </AbsoluteFill>

      {/* C · Firma */}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingBottom: 120}}>
        <Logo />
        <div style={{marginTop: 50, width: 600}}>
          <DiamondRule at={LOGO_AT + 18} width={560} />
        </div>
        <Reveal at={LOGO_AT + 24} style={{marginTop: 36}}>
          <div style={{fontFamily: FONTS.display, fontSize: 52, letterSpacing: '0.32em', color: COLORS.ivory, textAlign: 'center'}}>
            JOYAS DESDE 1979
          </div>
        </Reveal>
        <Reveal at={LOGO_AT + 36} style={{marginTop: 34}}>
          <Label style={{fontSize: 34, color: COLORS.goldLight, textAlign: 'center'}}>
            Oro 18K certificado · Garantía de por vida
          </Label>
        </Reveal>
        <Reveal at={LOGO_AT + 46} style={{marginTop: 70, textAlign: 'center'}}>
          <Body style={{fontSize: 44, color: COLORS.champagne}}>Arica · Iquique</Body>
          <Body style={{fontSize: 48, fontWeight: 500, marginTop: 8}}>joyeriacentrosuizo.cl</Body>
        </Reveal>
      </AbsoluteFill>
    </AbsoluteFill>
  </SceneShell>
);
