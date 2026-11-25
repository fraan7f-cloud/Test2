import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {DiamondRule} from '../components/DiamondRule';
import {JewelBox, Sparkle} from '../components/Illustration';
import {GoldText} from '../components/GoldText';
import {Body, Label} from '../components/Label';
import {ProductCard} from '../components/ProductCard';
import {Reveal} from '../components/Reveal';
import {SceneShell} from '../components/SceneShell';
import {COLORS, EASE_OUT, FONTS} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const TAGLINE_AT = 118;
export const LOGO_AT = 196;

const BOX_X = 540;
const BOX_Y = 1560;

/** Tarjeta que sale del joyero en arco (con giro y rebote) y luego deriva lentamente. */
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
  const p = interpolate(frame, [at, at + 24], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.4))});
  const out = interpolate(frame, [TAGLINE_AT - 14, TAGLINE_AT], [0, 1], clamp);
  const startX = BOX_X - w / 2;
  const startY = BOX_Y - h / 2;
  const cx = interpolate(p, [0, 1], [startX, x]);
  const cy = interpolate(p, [0, 1], [startY, y]) - Math.sin(Math.min(p, 1) * Math.PI) * 220;
  return (
    <div
      style={{
        position: 'absolute',
        left: cx,
        top: cy - Math.max(0, frame - at - 24) * drift - out * 60,
        opacity: interpolate(frame, [at, at + 4], [0, 1], clamp) * (1 - out),
        scale: String(interpolate(p, [0, 1], [0.15, 1])),
        rotate: `${interpolate(p, [0, 1], [rot * -6, rot]) + Math.sin((frame + at) / 16) * 1.2}deg`,
        filter: `blur(${out * 10}px)`,
      }}
    >
      <ProductCard src={src} caption={caption} width={w} height={h} zoom={1.1 + frame * 0.0009} />
    </div>
  );
};

/** Joyero ilustrado que se abre al inicio del cierre. */
const Box: React.FC = () => {
  const frame = useCurrentFrame();
  const open = interpolate(frame, [2, 14], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.6))});
  const out = interpolate(frame, [TAGLINE_AT - 14, TAGLINE_AT], [0, 1], clamp);
  const appear = interpolate(frame, [0, 6], [0, 1], clamp);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: appear * (1 - out)}}>
      <g transform={`translate(${BOX_X} ${BOX_Y}) scale(0.8)`}>
        <JewelBox open={open} />
      </g>
      <Sparkle x={BOX_X - 150} y={BOX_Y - 60} size={40} at={10} />
      <Sparkle x={BOX_X + 160} y={BOX_Y - 90} size={50} at={18} />
      <Sparkle x={BOX_X} y={BOX_Y - 140} size={60} at={30} />
    </svg>
  );
};

/** Trazo caligráfico que se dibuja bajo "Se sienten.". */
const Swash: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [TAGLINE_AT + 34, TAGLINE_AT + 60], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const out = interpolate(frame, [LOGO_AT - 14, LOGO_AT], [0, 1], clamp);
  return (
    <svg width={760} height={120} style={{opacity: 1 - out, marginTop: -30}}>
      <path
        d="M 20 70 C 160 20, 300 110, 420 60 S 640 20, 740 60"
        stroke="url(#swashGold)"
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1 - p}
      />
      <defs>
        <linearGradient id="swashGold" x1="0" x2="1">
          <stop offset="0" stopColor="rgba(226,200,120,0)" />
          <stop offset="0.3" stopColor={COLORS.goldLight} />
          <stop offset="1" stopColor={COLORS.gold} />
        </linearGradient>
      </defs>
    </svg>
  );
};

/** Destellos que aparecen alrededor del logo. */
const LogoSparkles: React.FC = () => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
    <Sparkle x={250} y={560} size={56} at={LOGO_AT + 18} dur={28} />
    <Sparkle x={850} y={640} size={44} at={LOGO_AT + 30} dur={26} />
    <Sparkle x={540} y={420} size={70} at={LOGO_AT + 44} dur={30} />
    <Sparkle x={820} y={960} size={36} at={LOGO_AT + 58} dur={26} />
    <Sparkle x={230} y={900} size={40} at={LOGO_AT + 70} dur={26} />
    <Sparkle x={700} y={520} size={30} at={LOGO_AT + 84} dur={24} />
  </svg>
);

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
      {/* A · Joyero que se abre y galería de producto */}
      <Box />
      <Reveal at={4} outAt={TAGLINE_AT - 14} style={{position: 'absolute', top: 200, textAlign: 'center'}}>
        <Label style={{fontSize: 38}}>Joyería Centro Suizo</Label>
        <GoldText shineFrom={14} style={{fontSize: 96, marginTop: 10}}>
          Oro 18K certificado
        </GoldText>
      </Reveal>
      <FloatingCard src="products/argollas_media_cana.jpg" caption="Argollas 18kt" at={14} x={60} y={470} rot={-5} w={450} h={520} drift={0.25} />
      <FloatingCard src="products/aros_bolita.jpg" caption="Aros 18kt" at={22} x={570} y={560} rot={4} w={450} h={520} drift={0.35} />
      <FloatingCard src="products/cadena_bolitas.jpg" caption="Cadenas 18kt" at={30} x={330} y={1010} rot={-2} w={420} h={400} drift={0.3} />
      <Reveal at={56} outAt={TAGLINE_AT - 14} style={{position: 'absolute', top: 1770}}>
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
        <Swash />
      </AbsoluteFill>

      <LogoSparkles />
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
