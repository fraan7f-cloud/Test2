import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { SANS } from "./fonts";
import { GOLD } from "./timing";

export type Palette = [string, string, string];
export const PALETTES: Record<string, Palette> = {
  hook: ["#1f2a74", "#060920", "#7f8cff"],
  round: ["#20308a", "#050926", "#8aa0ff"],
  oval: ["#86163a", "#200309", "#ff6a8a"],
  pear: ["#962060", "#270416", "#ff8ac4"],
  emerald: ["#0e6a4c", "#021710", "#5dffb8"],
  marquise: ["#5323a0", "#100428", "#c08cff"],
  cushion: ["#8a5d16", "#1d1003", "#ffcc66"],
  cta: ["#1f2a74", "#060920", "#ffd36b"],
  outro: ["#2a200b", "#020202", "#ffd36b"],
};

export const Background: React.FC<{ pal: Palette; seed: string; speed?: number }> = ({ pal, seed, speed = 1 }) => {
  const f = useCurrentFrame();
  const [a, b, acc] = pal;
  const dots = new Array(28).fill(0).map((_, i) => {
    const r = (k: string) => random(`${seed}${i}${k}`);
    const size = 30 + r("s") * 170;
    const y = ((r("y") * 2300 - f * speed * (0.6 + r("v") * 2.2)) % 2300 + 2300) % 2300 - 200;
    const x = r("x") * 1180 - 50 + Math.sin(f / 40 + i) * 20;
    return (
      <div key={i} style={{
        position: "absolute", left: x, top: y, width: size, height: size, borderRadius: "50%",
        background: r("c") > 0.5 ? acc : "#fff", opacity: 0.06 + r("o") * 0.2,
        filter: `blur(${4 + r("b") * 18}px)`,
      }} />
    );
  });
  const lx = 540 + Math.sin(f / 50) * 380, ly = 700 + Math.cos(f / 63) * 420;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 48%, ${a} 0%, ${b} 78%)`, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: lx - 500, top: ly - 500, width: 1000, height: 1000, borderRadius: "50%", background: acc, opacity: 0.18, filter: "blur(160px)" }} />
      <div style={{ position: "absolute", left: 1080 - lx - 400, top: 1920 - ly - 400, width: 800, height: 800, borderRadius: "50%", background: "#fff", opacity: 0.07, filter: "blur(140px)" }} />
      {dots}
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, transparent 45%, rgba(0,0,0,0.65) 100%)" }} />
    </AbsoluteFill>
  );
};

export const Rays: React.FC<{ x: number; y: number; size: number; opacity?: number; color?: string }> = ({ x, y, size, opacity = 1, color = "255,255,255" }) => {
  const f = useCurrentFrame();
  return (
    <div style={{
      position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, opacity,
      background: `repeating-conic-gradient(from ${f * 0.6}deg, rgba(${color},0.16) 0deg 5deg, transparent 5deg 20deg)`,
      WebkitMaskImage: "radial-gradient(circle, black 0%, transparent 62%)", maskImage: "radial-gradient(circle, black 0%, transparent 62%)",
    }} />
  );
};

/** texto cinetico: letras que entran con blur y rebote */
export const Kinetic: React.FC<{
  text: string; at: number; size: number; gold?: boolean; weight?: number; spacing?: number; stagger?: number; color?: string; font?: string;
}> = ({ text, at, size, gold, weight = 900, spacing = 2, stagger = 1.3, color = "#fff", font = SANS }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", fontFamily: font, fontWeight: weight, fontSize: size, letterSpacing: spacing, lineHeight: 1.05, filter: gold ? "drop-shadow(0 0 18px rgba(255,200,90,0.55)) drop-shadow(0 6px 6px rgba(0,0,0,0.5))" : "drop-shadow(0 6px 10px rgba(0,0,0,0.55))" }}>
      {text.split("").map((ch, i) => {
        const p = spring({ frame: f - at - i * stagger, fps, config: { damping: 11, stiffness: 160, mass: 0.6 } });
        const lin = interpolate(f - at - i * stagger, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <span key={i} style={{
            display: "inline-block", whiteSpace: "pre",
            transform: `translateY(${(1 - p) * size * 0.9}px) scale(${0.4 + 0.6 * p}) rotate(${(1 - p) * -14}deg)`,
            opacity: lin, filter: `blur(${(1 - lin) * 14}px)`,
            ...(gold ? { backgroundImage: GOLD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" } : { color }),
          }}>{ch}</span>
        );
      })}
    </div>
  );
};

export const Pill: React.FC<{ text: string; at: number; size?: number; dark?: boolean }> = ({ text, at, size = 44, dark }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - at, fps, config: { damping: 10, stiffness: 180, mass: 0.7 } });
  const lin = interpolate(f - at, [0, 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{
      display: "inline-block", padding: `${size * 0.28}px ${size * 0.6}px`, borderRadius: size * 0.35,
      background: dark ? "rgba(0,0,0,0.55)" : "#fff", color: dark ? "#fff" : "#141428", fontFamily: SANS, fontWeight: 900,
      fontSize: size, letterSpacing: 3, boxShadow: "0 10px 30px rgba(0,0,0,0.4), 0 0 30px rgba(255,255,255,0.25)",
      transform: `scale(${p}) rotate(${(1 - p) * -10}deg)`, opacity: lin, filter: `blur(${(1 - lin) * 10}px)`,
      border: dark ? "2px solid rgba(255,255,255,0.4)" : "none",
    }}>{text}</div>
  );
};

/** destello blanco + lens flare horizontal */
export const Flash: React.FC<{ at: number; strength?: number }> = ({ at, strength = 0.8 }) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f > 18) return null;
  const o = interpolate(f, [0, 2, 14], [0, strength, 0], { extrapolateRight: "clamp" });
  const sx = interpolate(f, [0, 18], [-600, 1700], { easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.95), rgba(255,240,210,0.3) 60%, transparent)", opacity: o }} />
      <div style={{ position: "absolute", left: sx - 700, top: 940, width: 1400, height: 14, borderRadius: 7, background: "linear-gradient(90deg, transparent, rgba(255,235,190,0.95), transparent)", filter: "blur(4px)", opacity: Math.min(1, o * 2) }} />
    </AbsoluteFill>
  );
};

/** temblor de camara tras un golpe */
export const shake = (frame: number, at: number, amp = 18) => {
  const d = frame - at;
  if (d < 0 || d > 14) return "";
  const k = amp * Math.exp(-d / 4);
  return `translate(${Math.sin(d * 2.7) * k}px, ${Math.cos(d * 3.3) * k}px)`;
};
