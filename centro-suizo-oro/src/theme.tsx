import { loadFont } from "@remotion/fonts";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

// Paleta medida del video oficial de Centro Suizo (ver brand-notes.md)
export const C = {
  night: "#350915",
  burgundy: "#5E0F22",
  burgundyMid: "#842B2F",
  goldDark: "#C78F43",
  gold: "#E4B65B",
  goldBright: "#F1B148",
  goldLight: "#F9DD98",
  white: "#FFFFFF",
};

export const GOLD_GRADIENT = `linear-gradient(170deg, ${C.goldLight} 0%, ${C.gold} 45%, ${C.goldDark} 75%, ${C.goldLight} 100%)`;

export const F = {
  display: "Cinzel",
  numeral: "Cormorant Garamond",
  body: "Poppins",
};

const fonts: [string, string, string, string][] = [
  ["Cinzel", "fonts/cinzel-latin-600-normal.woff2", "600", "normal"],
  ["Cinzel", "fonts/cinzel-latin-700-normal.woff2", "700", "normal"],
  ["Cormorant Garamond", "fonts/cormorant-garamond-latin-600-italic.woff2", "600", "italic"],
  ["Poppins", "fonts/poppins-latin-400-normal.woff2", "400", "normal"],
  ["Poppins", "fonts/poppins-latin-600-normal.woff2", "600", "normal"],
  ["Poppins", "fonts/poppins-latin-800-normal.woff2", "800", "normal"],
];
fonts.forEach(([family, url, weight, style]) =>
  loadFont({ family, url: staticFile(url), weight, style }),
);

export const EASE = Easing.bezier(0.16, 1, 0.3, 1);
export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

/** Entrada/salida de escena: aparece con desenfoque (motion blur) y se va igual. */
export const SceneShell: React.FC<{
  dur: number;
  children: React.ReactNode;
}> = ({ dur, children }) => {
  const f = useCurrentFrame();
  const inP = interpolate(f, [0, 14], [0, 1], { ...clamp, easing: EASE });
  const outP = interpolate(f, [dur - 10, dur], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
  return (
    <AbsoluteFill
      style={{
        opacity: inP * (1 - outP),
        filter: `blur(${(1 - inP) * 18 + outP * 22}px)`,
        scale: String(0.94 + inP * 0.06 + outP * 0.08),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Fondo: bordó noche con brillo dorado que respira y rayos sutiles (firma de la marca). */
export const Background: React.FC = () => {
  const f = useCurrentFrame();
  const gx = 50 + Math.sin(f / 90) * 14;
  const gy = 28 + Math.cos(f / 110) * 8;
  return (
    <AbsoluteFill style={{ backgroundColor: "#0B0205" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 90% 60% at 50% 40%, ${C.night} 0%, #1A040B 55%, #0B0205 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `repeating-conic-gradient(from ${f * 0.08}deg at 50% 34%, rgba(132,43,47,0.18) 0deg 6deg, transparent 6deg 15deg)`,
          maskImage:
            "radial-gradient(circle at 50% 34%, black 0%, transparent 62%)",
          WebkitMaskImage:
            "radial-gradient(circle at 50% 34%, black 0%, transparent 62%)",
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${gx}% ${gy}%, rgba(228,182,91,0.30) 0%, rgba(199,143,67,0.10) 22%, transparent 45%)`,
        }}
      />
      <Sparkles />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.65) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const rand = (i: number) => {
  const x = Math.sin(i * 9301.17 + 49297.3) * 233280;
  return x - Math.floor(x);
};

const Sparkles: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {new Array(38).fill(0).map((_, i) => {
        const x = rand(i) * 1080;
        const y = ((rand(i + 50) * 1920 - f * (0.3 + rand(i + 9) * 0.6)) % 1920 + 1920) % 1920;
        const tw = 0.25 + 0.75 * Math.abs(Math.sin(f / (12 + rand(i + 3) * 20) + i));
        const s = 2 + rand(i + 7) * 4;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: s,
              height: s,
              borderRadius: s,
              background: C.goldLight,
              opacity: tw * 0.55,
              boxShadow: `0 0 ${s * 3}px ${C.gold}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Tarjeta de vidrio esmerilado con borde dorado (lenguaje del video de referencia). */
export const GlassCard: React.FC<{
  style?: React.CSSProperties;
  children?: React.ReactNode;
  glow?: number;
}> = ({ style, children, glow = 1 }) => (
  <div
    style={{
      position: "absolute",
      borderRadius: 56,
      background:
        "linear-gradient(160deg, rgba(255,240,220,0.13) 0%, rgba(255,255,255,0.04) 40%, rgba(20,4,8,0.55) 100%)",
      border: "2px solid rgba(249,221,152,0.28)",
      boxShadow: `0 0 ${60 * glow}px rgba(228,182,91,${0.22 * glow}), inset 0 2px 0 rgba(255,255,255,0.12), 0 40px 80px rgba(0,0,0,0.55)`,
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Pill: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  active?: boolean;
}> = ({ children, style, active }) => (
  <div
    style={{
      position: "absolute",
      padding: "18px 40px",
      borderRadius: 999,
      fontFamily: F.body,
      fontWeight: 600,
      fontSize: 40,
      color: active ? C.goldLight : "rgba(255,255,255,0.85)",
      background: "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(30,6,12,0.6))",
      border: `2px solid ${active ? C.gold : "rgba(255,255,255,0.18)"}`,
      boxShadow: active ? `0 0 34px rgba(228,182,91,0.45)` : "none",
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Número gigante en serif itálica con degradé metálico. */
export const Numeral: React.FC<{
  children: React.ReactNode;
  size: number;
  style?: React.CSSProperties;
}> = ({ children, size, style }) => (
  <div
    style={{
      position: "absolute",
      fontFamily: F.numeral,
      fontStyle: "italic",
      fontWeight: 600,
      fontSize: size,
      lineHeight: 1,
      backgroundImage: GOLD_GRADIENT,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
      filter: "drop-shadow(0 0 40px rgba(228,182,91,0.45))",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Subtítulo cinético palabra por palabra. Palabras entre *asteriscos* van destacadas. */
export const Caption: React.FC<{
  text: string;
  start?: number;
  perWord?: number;
  top?: number;
}> = ({ text, start = 8, perWord = 6, top = 1380 }) => {
  const f = useCurrentFrame();
  const lines = text.split("\n");
  let idx = 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        top,
        textAlign: "center",
        fontFamily: F.body,
        color: C.white,
      }}
    >
      {lines.map((line, li) => (
        <div key={li} style={{ lineHeight: 1.25 }}>
          {line.split(" ").map((raw, wi) => {
            const strong = raw.startsWith("*");
            const word = raw.replace(/\*/g, "");
            const at = start + idx++ * perWord;
            const p = interpolate(f, [at, at + 10], [0, 1], {
              ...clamp,
              easing: EASE,
            });
            return (
              <span
                key={wi}
                style={{
                  display: "inline-block",
                  marginRight: "0.28em",
                  fontSize: strong ? 74 : 60,
                  fontWeight: strong ? 800 : 400,
                  color: strong ? C.white : "rgba(255,255,255,0.82)",
                  opacity: p,
                  filter: `blur(${(1 - p) * 10}px)`,
                  translate: `0px ${(1 - p) * 26}px`,
                  textShadow: strong
                    ? "0 0 28px rgba(249,221,152,0.55)"
                    : "0 2px 12px rgba(0,0,0,0.6)",
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Barra de progreso segmentada (firma del video oficial de la marca). */
export const ProgressBar: React.FC<{ starts: number[]; total: number }> = ({
  starts,
  total,
}) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        top: 90,
        left: 80,
        right: 80,
        display: "flex",
        gap: 12,
      }}
    >
      {starts.map((s, i) => {
        const e = starts[i + 1] ?? total;
        const p = interpolate(f, [s, e], [0, 1], clamp);
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: 8,
              borderRadius: 8,
              background: "rgba(255,255,255,0.16)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${p * 100}%`,
                height: "100%",
                background: GOLD_GRADIENT,
                boxShadow: `0 0 12px ${C.gold}`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

/** Logo entre filetes dorados con rombo (como en el video de la marca). */
export const LogoFooter: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      bottom: 110,
      left: 0,
      right: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 26,
      opacity,
    }}
  >
    <Divider width={520} />
    <Img src={staticFile("logo-centro-suizo.png")} style={{ width: 210 }} />
  </div>
);

export const Divider: React.FC<{ width: number; progress?: number }> = ({
  width,
  progress = 1,
}) => (
  <div style={{ position: "relative", width, height: 20 }}>
    <div
      style={{
        position: "absolute",
        top: 9,
        left: (width / 2) * (1 - progress),
        width: width * progress,
        height: 2,
        background: `linear-gradient(90deg, transparent, ${C.gold} 20%, ${C.gold} 80%, transparent)`,
      }}
    />
    <div
      style={{
        position: "absolute",
        left: width / 2 - 9,
        top: 1,
        width: 18,
        height: 18,
        rotate: "45deg",
        background: C.goldLight,
        boxShadow: `0 0 14px ${C.gold}`,
        scale: String(progress),
      }}
    />
  </div>
);
