import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { Background, Flash, Kinetic, PALETTES, Rays } from "./common";
import { SANS } from "./fonts";

export const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const ring = interpolate(f, [22, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const streak = interpolate(f, [0, 20], [-1, 1], { extrapolateRight: "clamp", easing: Easing.in(Easing.quad) });
  const sub = interpolate(f, [56, 70], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Background pal={PALETTES.outro} seed="intro" speed={3} />
      <Rays x={540} y={820} size={1900} opacity={interpolate(f, [20, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} color="255,220,150" />
      {/* particulas doradas que explotan desde el centro */}
      {new Array(40).fill(0).map((_, i) => {
        const a = random(`a${i}`) * Math.PI * 2, sp = 8 + random(`s${i}`) * 26;
        const d = Math.max(0, f - 22) * sp * Math.exp(-Math.max(0, f - 22) / 30);
        const o = f < 22 ? 0 : interpolate(f, [22, 75], [1, 0]);
        const s = 4 + random(`z${i}`) * 10;
        return <div key={i} style={{ position: "absolute", left: 540 + Math.cos(a) * d, top: 820 + Math.sin(a) * d, width: s, height: s, borderRadius: "50%", background: i % 3 ? "#ffd889" : "#fff", opacity: o, boxShadow: "0 0 12px #ffd889" }} />;
      })}
      <div style={{ position: "absolute", left: 540 - 700 * ring, top: 820 - 700 * ring, width: 1400 * ring, height: 1400 * ring, borderRadius: "50%", border: `${6 * (1 - ring) + 1}px solid rgba(255,220,150,${1 - ring})`, filter: "blur(2px)" }} />
      <div style={{ position: "absolute", left: streak * 1400 - 400, top: 815, width: 1200, height: 10, background: "linear-gradient(90deg, transparent, #fff, transparent)", filter: "blur(3px)", opacity: f < 22 ? 1 : 0 }} />
      <div style={{ position: "absolute", top: 1120, width: "100%", opacity: sub }}>
        <Kinetic text="COMPRA Y VENTA DE ORO" at={30} size={46} gold weight={800} spacing={6} stagger={0.8} />
        <div style={{ height: 18 }} />
        <Kinetic text="✦ JOYERÍA ✦" at={42} size={40} weight={700} spacing={14} font={SANS} />
      </div>
      <Flash at={22} strength={1} />
    </AbsoluteFill>
  );
};
