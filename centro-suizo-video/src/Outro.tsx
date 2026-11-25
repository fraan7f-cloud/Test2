import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background, Flash, Kinetic, PALETTES, Rays, shake } from "./common";
import { Gem, Shape, Sparkle } from "./Gem";
import { SANS, SERIF } from "./fonts";
import { GOLD } from "./timing";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const SHAPES: Shape[] = ["round", "oval", "pear", "emerald", "marquise", "cushion"];

export const OutroMessage: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const orbit = spring({ frame: f - 14, fps, config: { damping: 16, stiffness: 80 } });
  const BIG = 78;
  return (
    <AbsoluteFill>
      <Background pal={PALETTES.outro} seed="o1" speed={2} />
      <Rays x={540} y={760} size={2000} opacity={0.8} color="255,220,150" />
      <AbsoluteFill style={{ transform: shake(f, BIG, 18) }}>
        {SHAPES.map((sh, i) => {
          const a = (i / 6) * Math.PI * 2 + f / 45;
          const r = 470 * orbit;
          const x = 540 + Math.cos(a) * r, y = 770 + Math.sin(a) * r * 0.55;
          const front = Math.sin(a) > 0;
          return (
            <div key={i} style={{ position: "absolute", left: x - 90, top: y - 90, width: 180, height: 180, zIndex: front ? 2 : 0,
              transform: `scale(${(0.75 + 0.35 * Math.sin(a)) * orbit})`, opacity: front ? 1 : 0.55, filter: front ? undefined : "blur(3px)" }}>
              <Gem shape={sh} size={180} t={f * 0.1 + i} detail={false} />
            </div>
          );
        })}
        <div style={{ position: "absolute", top: 330, width: "100%" }}>
          <Kinetic text="RECUERDA QUE EN" at={6} size={70} weight={800} spacing={6} stagger={0.9} />
        </div>
        <div style={{ position: "absolute", top: 1190, width: "100%" }}>
          <Kinetic text="TENEMOS TODAS" at={40} size={76} weight={900} spacing={3} stagger={0.9} />
          <div style={{ height: 8 }} />
          <Kinetic text="ESTAS FORMAS," at={52} size={76} weight={900} spacing={3} stagger={0.9} />
          <div style={{ height: 30 }} />
          <Kinetic text="¡Y MUCHO MÁS!" at={BIG} size={104} gold weight={900} spacing={2} stagger={1.1} />
        </div>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => <Sparkle key={i} x={120 + i * 140} y={1500 + (i % 2) * 120} size={60} frame={f} phase={i * 1.1} speed={0.18} />)}
      </AbsoluteFill>
      <Flash at={BIG} strength={0.6} />
    </AbsoluteFill>
  );
};

const Pin = () => (
  <svg width={70} height={70} viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 0 10px rgba(255,200,90,0.7))" }}>
    <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" fill="#ffd775" />
  </svg>
);

const Card: React.FC<{ at: number; dir: number; city: string; lines: string[] }> = ({ at, dir, city, lines }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - at, fps, config: { damping: 14, stiffness: 120 } });
  const shine = interpolate((f - at - 15) % 70, [0, 30], [-40, 140], clamp);
  return (
    <div style={{ position: "relative", margin: "0 70px", padding: "44px 50px", borderRadius: 40, overflow: "hidden",
      background: "linear-gradient(145deg, rgba(40,32,14,0.85), rgba(8,8,8,0.9))", border: "3px solid rgba(255,215,117,0.85)",
      boxShadow: "0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(255,200,90,0.25)",
      transform: `translateX(${(1 - p) * 1100 * dir}px) skewX(${(1 - p) * -12 * dir}deg)`, filter: `blur(${(1 - Math.min(1, p)) * 25}px)`, opacity: f >= at ? 1 : 0 }}>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: `${shine}%`, width: "25%", background: "linear-gradient(100deg, transparent, rgba(255,230,170,0.25), transparent)" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Pin />
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 84, letterSpacing: 4, backgroundImage: GOLD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{city}</div>
      </div>
      <div style={{ height: 3, margin: "18px 0 22px", background: "linear-gradient(90deg, rgba(255,215,117,0.9), transparent)", width: `${interpolate(f - at, [8, 30], [0, 100], clamp)}%` }} />
      {lines.map((l, i) => (
        <div key={i} style={{ fontFamily: SANS, fontWeight: i === 0 ? 800 : 600, fontSize: 46, color: "#fff", lineHeight: 1.3,
          opacity: interpolate(f - at, [12 + i * 5, 22 + i * 5], [0, 1], clamp), transform: `translateY(${interpolate(f - at, [12 + i * 5, 22 + i * 5], [20, 0], clamp)}px)` }}>{l}</div>
      ))}
    </div>
  );
};

export const OutroBranches: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Background pal={PALETTES.outro} seed="o2" speed={1.5} />
      <div style={{ position: "absolute", top: 330, width: "100%" }}>
        <Kinetic text="VISÍTANOS" at={4} size={110} gold font={SERIF} weight={700} spacing={8} stagger={1.2} />
        <div style={{ height: 10 }} />
        <Kinetic text="NUESTRAS SUCURSALES" at={14} size={40} weight={700} spacing={8} stagger={0.6} />
      </div>
      <div style={{ position: "absolute", top: 640, width: "100%", display: "flex", flexDirection: "column", gap: 50 }}>
        <Card at={18} dir={-1} city="ARICA" lines={["Arturo Prat 478"]} />
        <Card at={34} dir={1} city="IQUIQUE" lines={["Galería 18 de Septiembre, Local 3", "Almirante Latorre 708"]} />
      </div>
      {[0, 1, 2, 3].map((i) => <Sparkle key={i} x={150 + i * 260} y={600 + (i % 2) * 900} size={55} frame={f} phase={i * 1.5} />)}
    </AbsoluteFill>
  );
};

export const OutroLogo: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Background pal={PALETTES.outro} seed="o3" speed={1} />
      <Rays x={540} y={800} size={2200} opacity={interpolate(f, [10, 25], [0, 1], clamp)} color="255,220,150" />
      {new Array(36).fill(0).map((_, i) => {
        const a = random(`oa${i}`) * Math.PI * 2, sp = 6 + random(`os${i}`) * 18;
        const d = Math.max(0, f - 20) * sp * Math.exp(-Math.max(0, f - 20) / 40);
        const s = 4 + random(`oz${i}`) * 9;
        return <div key={i} style={{ position: "absolute", left: 540 + Math.cos(a) * d, top: 800 + Math.sin(a) * d, width: s, height: s, borderRadius: "50%", background: "#ffd889", boxShadow: "0 0 12px #ffd889", opacity: f < 20 ? 0 : interpolate(f, [20, 100], [1, 0.2], clamp) }} />;
      })}
      <div style={{ position: "absolute", top: 1170, width: "100%" }}>
        <Kinetic text="COMPRA Y VENTA DE ORO · JOYERÍA" at={28} size={40} gold weight={800} spacing={3} stagger={0.5} />
        <div style={{ height: 26 }} />
        <Kinetic text="ARICA  ·  IQUIQUE" at={42} size={46} weight={700} spacing={10} stagger={0.6} />
      </div>
      <Flash at={20} strength={0.8} />
      <AbsoluteFill style={{ background: "#000", opacity: interpolate(f, [92, 105], [0, 0.0], clamp) }} />
    </AbsoluteFill>
  );
};

export const Tracker: React.FC<{ reveals: number[]; show: [number, number] }> = ({ reveals, show }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pin = spring({ frame: f - show[0], fps, config: { damping: 14 } });
  const pout = interpolate(f, [show[1] - 8, show[1]], [0, 1], clamp);
  if (f < show[0] || f > show[1]) return null;
  const cur = reveals.filter((r) => f >= r).length - 1;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: 1590, left: 120, right: 120, height: 124, borderRadius: 62, background: "rgba(0,0,0,0.45)", border: "2px solid rgba(255,255,255,0.25)",
        display: "flex", alignItems: "center", justifyContent: "space-around", padding: "0 20px",
        transform: `translateY(${(1 - pin) * 300 + pout * 300}px)`, opacity: 1 - pout }}>
        {SHAPES.map((sh, i) => {
          const r = reveals[i];
          const p = spring({ frame: f - r, fps, config: { damping: 9, stiffness: 200 } });
          const on = f >= r;
          return (
            <div key={i} style={{ width: 92, height: 92, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
              border: i === cur ? "4px solid #ffd775" : "2px dashed rgba(255,255,255,0.4)", boxShadow: i === cur ? "0 0 22px rgba(255,210,110,0.8)" : "none" }}>
              {on ? <div style={{ transform: `scale(${p})` }}><Gem shape={sh} size={76} t={f * 0.1 + i} detail={false} glow={0.6} /></div>
                : <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 36, color: "rgba(255,255,255,0.7)" }}>{i === 5 ? "?" : i + 1}</span>}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
