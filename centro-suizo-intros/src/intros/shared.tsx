import React from "react";
import { Easing, Img, interpolate, staticFile } from "remotion";
import logo from "../logoParts.json";

export type PartName = keyof typeof logo.parts;
export const LOGO_W = logo.width;
export const LOGO_H = logo.height;
export const parts = logo.parts;

export const CENTRO_LETTERS: PartName[] = [
  "centro_0",
  "centro_1",
  "centro_2",
  "centro_3",
  "centro_4",
  "centro_5",
];
export const SUIZO_LETTERS: PartName[] = [
  "suizo_0",
  "suizo_1",
  "suizo_2",
  "suizo_3",
  "suizo_4",
];

// After Effects–style easing curves
export const easeOutExpo = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOutQuint = Easing.bezier(0.83, 0, 0.17, 1);
export const easeOutBack = Easing.bezier(0.34, 1.56, 0.64, 1);
export const easeInExpo = Easing.bezier(0.7, 0, 0.84, 0);

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

/** Stage in the logo's native coordinate space (676×434), centered and scaled. */
export const LogoStage: React.FC<{
  scale: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ scale, children, style }) => (
  <div
    style={{
      position: "absolute",
      left: "50%",
      top: "50%",
      width: LOGO_W,
      height: LOGO_H,
      marginLeft: -LOGO_W / 2,
      marginTop: -LOGO_H / 2,
      scale: String(scale),
      ...style,
    }}
  >
    {children}
  </div>
);

/** One piece of the logo, positioned at its native place. */
export const Part: React.FC<{
  name: PartName;
  style?: React.CSSProperties;
  tint?: string; // CSS background (gradient) used instead of white
}> = ({ name, style, tint }) => {
  const p = parts[name];
  const base: React.CSSProperties = {
    position: "absolute",
    left: p.x,
    top: p.y,
    width: p.w,
    height: p.h,
    ...style,
  };
  if (tint) {
    const url = `url(${staticFile(`logo/${name}.png`)})`;
    return (
      <div
        style={{
          ...base,
          background: tint,
          WebkitMaskImage: url,
          maskImage: url,
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
        }}
      />
    );
  }
  return <Img src={staticFile(`logo/${name}.png`)} style={base} />;
};

/** Diamond traced as SVG strokes (in diamond-local coordinates). */
export const DIAMOND_PATHS = [
  // outer silhouette
  "M 108 183 L 10 64 L 44 13 L 172 13 L 207 64 L 180 100",
  "M 168 118 L 108 183",
  // girdle
  "M 12 66 L 100 66",
  "M 118 66 L 205 66",
  // crown zig-zag
  "M 48 18 L 72 60 L 108 18 L 145 60 L 170 18",
  // pavilion
  "M 70 72 L 108 172 L 146 72",
];

export const DiamondStrokes: React.FC<{
  progress: number; // 0..1
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}> = ({ progress, color = "#fff", strokeWidth = 13, style }) => {
  const d = parts.diamond;
  return (
    <svg
      viewBox={`0 0 ${d.w} ${d.h}`}
      style={{
        position: "absolute",
        left: d.x,
        top: d.y,
        width: d.w,
        height: d.h,
        overflow: "visible",
        ...style,
      }}
    >
      {DIAMOND_PATHS.map((path, i) => {
        const stagger = i * 0.08;
        const local = interpolate(progress, [stagger, stagger + 0.6], [0, 1], {
          ...clamp,
          easing: easeInOutQuint,
        });
        return (
          <path
            key={path}
            d={path}
            pathLength={1}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1 1"
            strokeDashoffset={1 - local}
          />
        );
      })}
    </svg>
  );
};

/** Four-point star glint */
export const Glint: React.FC<{
  x: number;
  y: number;
  size: number;
  opacity: number;
  rotate?: number;
  color?: string;
}> = ({ x, y, size, opacity, rotate = 0, color = "#fff" }) => (
  <svg
    viewBox="-50 -50 100 100"
    style={{
      position: "absolute",
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
      opacity,
      rotate: `${rotate}deg`,
      filter: `drop-shadow(0 0 ${size / 6}px ${color})`,
    }}
  >
    <path
      d="M0 -50 C 4 -8 8 -4 50 0 C 8 4 4 8 0 50 C -4 8 -8 4 -50 0 C -8 -4 -4 -8 0 -50 Z"
      fill={color}
    />
  </svg>
);

/** Deterministic pseudo-random */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};
