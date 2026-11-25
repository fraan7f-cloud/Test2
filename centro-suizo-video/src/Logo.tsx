import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { OUTRO, OUTRO_PARTS } from "./timing";

const O1 = OUTRO, O2 = OUTRO + OUTRO_PARTS[0], O3 = O2 + OUTRO_PARTS[1];
const KF: [number, number, number][] = [
  // frame, y, ancho
  [0, 820, 720], [58, 820, 720], [80, 150, 270],
  [O1 + 4, 150, 270], [O1 + 26, 760, 560],
  [O2 - 2, 760, 560], [O2 + 16, 150, 270],
  [O3, 150, 270], [O3 + 22, 800, 820],
];
const at = (g: number) => {
  const opts = { easing: Easing.inOut(Easing.cubic), extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
  const fr = KF.map((k) => k[0]);
  return { y: interpolate(g, fr, KF.map((k) => k[1]), opts), w: interpolate(g, fr, KF.map((k) => k[2]), opts) };
};
const RATIO = 434 / 676;
const SRC = staticFile("logo.png");

export const LogoLayer: React.FC = () => {
  const g = useCurrentFrame();
  const { y, w } = at(g);
  const prev = at(g - 1);
  const vel = Math.abs(y - prev.y) + Math.abs(w - prev.w);
  const appear = interpolate(g, [4, 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.exp) });
  const scale = 0.0 + interpolate(appear, [0, 1], [2.6, 1]);
  const blur = (1 - appear) * 40 + Math.min(22, vel * 0.25);
  const h = w * RATIO;
  const shinePeriod = 90;
  const sp = (g % shinePeriod) / shinePeriod;
  const shineX = interpolate(sp, [0, 0.45], [-0.6, 1.6], { extrapolateRight: "clamp" });
  const pulse = g > O3 ? 1 + 0.02 * Math.sin((g - O3) / 6) : 1;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{
        position: "absolute", left: 540 - w / 2, top: y - h / 2, width: w, height: h,
        transform: `scale(${scale * pulse}) scaleY(${1 + Math.min(0.25, vel * 0.004)})`, opacity: appear,
        filter: `blur(${blur}px) drop-shadow(0 0 ${w * 0.04}px rgba(255,225,160,0.6)) drop-shadow(0 4px 10px rgba(0,0,0,0.6))`,
      }}>
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: `url(${SRC})`, maskImage: `url(${SRC})`, WebkitMaskSize: "100% 100%", maskSize: "100% 100%" }}>
          <div style={{ position: "absolute", inset: 0, background: "#fff" }} />
          <div style={{
            position: "absolute", top: 0, bottom: 0, left: `${shineX * 100 - 25}%`, width: "30%",
            background: "linear-gradient(100deg, transparent, rgba(255,214,120,0.95) 45%, #fff 50%, rgba(255,214,120,0.95) 55%, transparent)",
          }} />
        </div>
        <Img src={SRC} style={{ display: "none" }} />
      </div>
    </AbsoluteFill>
  );
};
