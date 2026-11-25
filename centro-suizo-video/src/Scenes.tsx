import React from "react";
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background, Flash, Kinetic, PALETTES, Pill, Rays, shake } from "./common";
import { Gem, Shape, Sparkle } from "./Gem";
import { SANS, SERIF } from "./fonts";
import { s2f, TRANS } from "./timing";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
export type TransType = "zoom" | "whip" | "spin";

/** envoltorio con transiciones estilo After Effects (zoom blur / whip pan / spin) */
export const SceneWrap: React.FC<{ dur: number; enter: TransType; exit: TransType | null; children: React.ReactNode; id: string }> = ({ dur, enter, exit, children, id }) => {
  const f = useCurrentFrame();
  const pin = interpolate(f, [0, TRANS - 2], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const pout = exit ? interpolate(f, [dur - TRANS, dur], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) }) : 0;
  let tr = "", blur = 0, hblur = 0, op = 1;
  if (pin < 1) {
    const k = 1 - pin;
    op = interpolate(pin, [0, 0.35], [0, 1], clamp);
    if (enter === "zoom") { tr += ` scale(${1 + k * 0.9})`; blur += k * 40; }
    if (enter === "whip") { tr += ` translateX(${k * 1100}px)`; hblur += k * 120; }
    if (enter === "spin") { tr += ` rotate(${k * 35}deg) scale(${1 - k * 0.5})`; blur += k * 30; }
  }
  if (pout > 0) {
    if (exit === "zoom") { tr += ` scale(${1 - pout * 0.35})`; blur += pout * 30; }
    if (exit === "whip") { tr += ` translateX(${-pout * 1100}px)`; hblur += pout * 120; }
    if (exit === "spin") { tr += ` rotate(${-pout * 35}deg) scale(${1 + pout * 0.5})`; blur += pout * 30; }
  }
  const fid = `hb${id}`;
  return (
    <AbsoluteFill style={{ opacity: op }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={fid} x="-50%" y="-10%" width="200%" height="120%"><feGaussianBlur stdDeviation={`${hblur} 0`} /></filter>
      </svg>
      <AbsoluteFill style={{ transform: tr, filter: `${hblur > 0.5 ? `url(#${fid})` : ""} ${blur > 0.3 ? `blur(${blur}px)` : ""}`.trim() || undefined }}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------------- HOOK ---------------- */
const SHAPES: Shape[] = ["round", "oval", "pear", "emerald", "marquise", "cushion"];
const NAMES = ["REDONDO", "OVAL", "PERA", "ESMERALDA", "MARQUISE", "COJÍN"];

export const Hook: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (s: number) => s2f(s) - from;
  const six = L(3.82), last = L(5.14), dim = L(6.2);
  const cam = interpolate(f, [0, L(7.7)], [1, 1.08]);
  return (
    <AbsoluteFill>
      <Background pal={PALETTES.hook} seed="hook" />
      <Rays x={540} y={960} size={2000} opacity={0.6} />
      <AbsoluteFill style={{ transform: `scale(${cam}) ${shake(f, six, 22)}` }}>
        {SHAPES.map((sh, i) => {
          const col = i % 3, row = Math.floor(i / 3);
          const at = L(0.2 + i * 0.32);
          const p = spring({ frame: f - at, fps, config: { damping: 10, stiffness: 140 } });
          const x = 220 + col * 320, y = 820 + row * 330 + Math.sin((f + i * 13) / 14) * 10;
          const isLast = i === 5;
          const flip = isLast ? interpolate(f, [last, last + 10], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) }) : 0;
          const sx = Math.abs(Math.cos(flip * Math.PI));
          const showQ = flip > 0.5;
          const pulse = f > six && f < six + 12 ? 1 + 0.15 * Math.sin(((f - six) / 12) * Math.PI) : 1;
          const op = f > dim && !isLast ? interpolate(f, [dim, dim + 8], [1, 0.35], clamp) : 1;
          const big = isLast && f > dim ? interpolate(f, [dim, dim + 10], [1, 1.25], clamp) : 1;
          return (
            <div key={i} style={{ position: "absolute", left: x - 130, top: y - 130, width: 260, height: 260, opacity: op * Math.min(1, p * 2),
              transform: `scale(${p * pulse * big}) scaleX(${sx}) rotate(${(1 - p) * -120}deg)`, filter: `blur(${(1 - Math.min(1, p)) * 12}px)` }}>
              {showQ ? (
                <div style={{ width: 230, height: 230, margin: 15, borderRadius: "50%", background: "radial-gradient(circle at 40% 35%, #3b3220, #120d04)", border: "6px solid #f2c45e",
                  boxShadow: `0 0 ${40 + 20 * Math.sin(f / 4)}px rgba(255,200,90,0.8)`, display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: SERIF, fontWeight: 700, fontSize: 150, color: "#ffd775" }}>?</div>
              ) : (
                <Gem shape={sh} size={260} t={f * 0.08 + i} detail={false} />
              )}
            </div>
          );
        })}
        {[0, 1, 2, 3, 4].map((i) => <Sparkle key={i} x={160 + i * 190} y={760 + (i % 2) * 360} size={50} frame={f} phase={i * 1.7} />)}
        <div style={{ position: "absolute", top: 1370, width: "100%" }}>
          <Kinetic text="6 FORMAS" at={six} size={150} gold font={SERIF} weight={700} spacing={6} />
          <div style={{ height: 30 }} />
          {f > L(4.84) && <Kinetic text="¿CUÁL ERES TÚ?" at={L(4.84)} size={58} weight={900} spacing={5} stagger={0.9} />}
        </div>
      </AbsoluteFill>
      <Flash at={six} strength={0.6} />
      <Flash at={last + 5} strength={0.4} />
    </AbsoluteFill>
  );
};

/* ---------------- FORMAS ---------------- */
type Fx = "shine" | "stretch" | "hearts" | "spotlight" | "speed" | "vintage";
export type ShapeSceneProps = { from: number; num: number; shape: Shape; pal: string; reveal: number; tags: [string, number][]; fx: Fx; fxAt: number; end: number };

const Heart: React.FC<{ s: number; color: string }> = ({ s, color }) => (
  <svg width={s} height={s} viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-10-9.3C.3 8.4 2 4.5 5.8 4.1c2.2-.2 3.6 1 4.4 2.3h3.6c.8-1.3 2.2-2.5 4.4-2.3 3.8.4 5.5 4.3 3.8 7.6C19.5 16.4 12 21 12 21z" fill={color} /></svg>
);

export const ShapeScene: React.FC<ShapeSceneProps> = ({ from, num, shape, pal, reveal, tags, fx, fxAt, end }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (s: number) => s2f(s) - from;
  const R = L(reveal), FX = L(fxAt), E = L(end);
  const P = PALETTES[pal];
  const pin = spring({ frame: f - 3, fps, config: { damping: 12, stiffness: 110 } });
  const bump = f > R ? 1 + 0.18 * Math.exp(-(f - R) / 5) * Math.cos((f - R) / 2) : 1;
  const float = Math.sin(f / 18) * 14;
  const wob = 0.9 + 0.1 * Math.cos(f / 22);
  let gemScaleY = 1, warm = 0, glow = 1, tilt = Math.sin(f / 30) * 5;
  if (fx === "stretch") gemScaleY = 1 + 0.14 * interpolate(f, [FX, FX + 15], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  if (fx === "vintage") warm = interpolate(f, [FX, FX + 12, L(45.3), L(45.6)], [0, 0.5, 0.5, 0], clamp);
  if (fx === "shine") glow = 1 + 1.6 * interpolate(f, [FX, FX + 6, FX + 40], [0, 1, 0.4], clamp);
  if (fx === "speed") tilt += interpolate(f, [FX, FX + 8], [0, 18], clamp);
  const cam = interpolate(f, [0, E], [1.0, 1.1]);
  const curTag = tags.map((t) => L(t[1])).filter((t) => f >= t).length - 1;
  const GX = 540, GY = 900;
  return (
    <AbsoluteFill>
      <Background pal={P} seed={pal} speed={fx === "speed" && f > FX ? 6 : 1.4} />
      {/* numero gigante de fondo */}
      <div style={{ position: "absolute", top: 260 - f * 0.8, width: "100%", textAlign: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 1150, lineHeight: 1,
        color: "transparent", WebkitTextStroke: "4px rgba(255,255,255,0.10)", transform: `scale(${1.3 - pin * 0.3})`, opacity: pin }}>{num}</div>
      <AbsoluteFill style={{ transform: `scale(${cam}) ${shake(f, R, 16)}` }}>
        <Rays x={GX} y={GY} size={1900} opacity={0.5 + 0.5 * glow / 2.6} />
        {fx === "spotlight" && (
          <div style={{ position: "absolute", left: 140, top: -100, width: 800, height: 1400, opacity: interpolate(f, [FX, FX + 10], [0, 0.55], clamp),
            background: "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0))", clipPath: "polygon(42% 0, 58% 0, 100% 100%, 0 100%)", filter: "blur(18px)" }} />
        )}
        {/* anillos orbitales */}
        {[0, 1].map((k) => (
          <div key={k} style={{ position: "absolute", left: GX - 420, top: GY - 420, width: 840, height: 840, borderRadius: "50%",
            border: `${fx === "vintage" ? 6 : 3}px ${fx === "vintage" ? "dashed" : "solid"} ${fx === "vintage" && warm > 0.1 ? "rgba(255,210,120,0.6)" : "rgba(255,255,255,0.22)"}`,
            transform: `rotate(${f * (k ? -1.2 : 0.9) + k * 60}deg) scaleY(${k ? 0.32 : 0.5}) scale(${pin * (1 + 0.06 * Math.sin(f / 10 + k))})`, opacity: pin }} />
        ))}
        {fx === "vintage" && f > FX && [0, 1, 2].map((k) => {
          const d = ((f - FX + k * 18) % 54) / 54;
          return <div key={k} style={{ position: "absolute", left: GX - 300 - d * 260, top: GY - 300 - d * 260, width: 600 + d * 520, height: 600 + d * 520, borderRadius: 120 + d * 80, border: "4px solid rgba(255,210,120,0.8)", opacity: (1 - d) * 0.7 }} />;
        })}
        {fx === "speed" && f > FX && (
          <AbsoluteFill style={{ transform: "rotate(-35deg) scale(1.6)" }}>
            {new Array(18).fill(0).map((_, i) => {
              const x = ((random(`sx${i}`) * 2400 + (f - FX) * (60 + random(`sv${i}`) * 60)) % 2400) - 600;
              return <div key={i} style={{ position: "absolute", left: x, top: random(`sy${i}`) * 1920, width: 260 + random(`sw${i}`) * 300, height: 4, borderRadius: 2, background: "linear-gradient(90deg, transparent, rgba(230,200,255,0.9))", filter: "blur(1px)" }} />;
            })}
          </AbsoluteFill>
        )}
        {/* gema */}
        <div style={{ position: "absolute", left: GX - 330, top: GY - 330 + float, width: 660, height: 660,
          transform: `scale(${pin * bump}) rotate(${(1 - pin) * -200 + tilt}deg) scaleX(${wob}) scaleY(${gemScaleY})`, filter: `blur(${(1 - Math.min(1, pin)) * 20}px)` }}>
          <Gem shape={shape} size={660} t={f * 0.07} warm={warm} glow={glow} />
        </div>
        {fx === "stretch" && f > FX && [-1, 1].map((d) => {
          const p = interpolate(f, [FX, FX + 14], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
          return (
            <svg key={d} width={80} height={160} viewBox="0 0 80 160" style={{ position: "absolute", left: GX - 40, top: GY + d * (320 + 110 * p) - 80, transform: `scaleY(${-d})`, opacity: p }}>
              <path d="M40 150 L40 20 M12 48 L40 15 L68 48" stroke="#ffd775" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          );
        })}
        {fx === "hearts" && f > FX && new Array(12).fill(0).map((_, i) => {
          const st = FX + i * 5;
          const d = f - st; if (d < 0) return null;
          const x = GX + (random(`hx${i}`) - 0.5) * 820 + Math.sin(d / 8 + i) * 30;
          const y = GY + 300 - d * (5 + random(`hv${i}`) * 4);
          const s = 50 + random(`hs${i}`) * 60;
          return <div key={i} style={{ position: "absolute", left: x, top: y, opacity: interpolate(d, [0, 6, 50, 70], [0, 1, 1, 0], clamp), transform: `scale(${Math.min(1, d / 6)}) rotate(${Math.sin(d / 6) * 15}deg)`, filter: "drop-shadow(0 0 12px rgba(255,120,180,0.8))" }}><Heart s={s} color={i % 3 ? "#ff7eb6" : "#ffd1e6"} /></div>;
        })}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = (i / 6) * Math.PI * 2 + f / 60;
          return <Sparkle key={i} x={GX + Math.cos(a) * (300 + (i % 2) * 60)} y={GY + Math.sin(a) * 330} size={fx === "shine" && f > FX ? 95 : 60} frame={f} phase={i * 1.3} speed={0.16} />;
        })}
        {/* etiqueta */}
        <div style={{ position: "absolute", top: 1275, width: "100%" }}>
          {f >= R - 1 && <Kinetic text={`${num} · ${NAMES[num - 1]}`} at={R} size={104} gold font={SANS} weight={900} spacing={4} />}
        </div>
        <div style={{ position: "absolute", top: 1420, width: "100%", display: "flex", justifyContent: "center" }}>
          {tags.map(([txt, s], i) => {
            const at = L(s);
            if (i !== curTag) {
              if (i === curTag - 1) {
                const nxt = L(tags[i + 1][1]);
                const o = interpolate(f, [nxt, nxt + 6], [1, 0], clamp);
                if (o <= 0) return null;
                return <div key={i} style={{ position: "absolute", transform: `translateY(${(1 - o) * -60}px) scale(${0.8 + 0.2 * o})`, opacity: o, filter: `blur(${(1 - o) * 10}px)` }}><Pill text={txt} at={at} /></div>;
              }
              return null;
            }
            return <div key={i} style={{ position: "absolute" }}><Pill text={txt} at={at} /></div>;
          })}
        </div>
      </AbsoluteFill>
      <Flash at={R} strength={0.55} />
      {fx === "shine" && <Flash at={FX} strength={0.5} />}
      {fx === "vintage" && <Flash at={L(45.38)} strength={0.5} />}
    </AbsoluteFill>
  );
};

/* ---------------- CTA ---------------- */
const Bubble = () => (
  <svg width={54} height={54} viewBox="0 0 24 24"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="#ffd775" /></svg>
);
const Plane = () => (
  <svg width={54} height={54} viewBox="0 0 24 24"><path d="M2 11 22 2l-7 20-3-8-10-3z" fill="#ffd775" /></svg>
);
export const Cta: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (s: number) => s2f(s) - from;
  const T0 = L(50.0);
  const pick = f > L(51.0) ? Math.floor((f - L(51.0)) / 7) % 6 : -1;
  const action = (at: number, txt: string, icon: React.ReactNode, dir: number) => {
    const p = spring({ frame: f - at, fps, config: { damping: 13, stiffness: 150 } });
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "22px 40px", borderRadius: 60, background: "rgba(10,12,40,0.7)", border: "3px solid rgba(255,215,117,0.8)",
        boxShadow: "0 0 30px rgba(255,200,90,0.35)", fontFamily: SANS, fontWeight: 800, fontSize: 44, color: "#fff", letterSpacing: 1,
        transform: `translateX(${(1 - p) * 900 * dir}px)`, filter: `blur(${(1 - Math.min(1, p)) * 18}px)`, opacity: f >= at ? 1 : 0 }}>
        {icon}{txt}
      </div>
    );
  };
  return (
    <AbsoluteFill>
      <Background pal={PALETTES.cta} seed="cta" speed={2} />
      <Rays x={540} y={900} size={2000} opacity={0.6} color="255,220,150" />
      <AbsoluteFill style={{ transform: `${shake(f, T0, 20)} scale(${interpolate(f, [0, 190], [1, 1.06])})` }}>
        {SHAPES.map((sh, i) => {
          const col = i % 3, row = Math.floor(i / 3);
          const p = spring({ frame: f - 2 - i * 2, fps, config: { damping: 11, stiffness: 160 } });
          const x = 220 + col * 320, y = 640 + row * 330;
          const sel = pick === i;
          return (
            <div key={i} style={{ position: "absolute", left: x - 130, top: y - 140, width: 260, transform: `scale(${p * (sel ? 1.12 : 1)}) translateY(${Math.sin((f + i * 9) / 12) * 8}px)`, textAlign: "center" }}>
              <div style={{ position: "relative", width: 230, height: 230, margin: "0 auto" }}>
                {sel && <div style={{ position: "absolute", inset: -14, borderRadius: "50%", border: "5px solid #ffd775", boxShadow: "0 0 30px #ffd775" }} />}
                <Gem shape={sh} size={230} t={f * 0.09 + i} detail={false} glow={sel ? 1.8 : 1} />
              </div>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 28, letterSpacing: 2, color: sel ? "#ffd775" : "#fff", marginTop: 6 }}>{i + 1} · {NAMES[i]}</div>
            </div>
          );
        })}
        <div style={{ position: "absolute", top: 1255, width: "100%" }}>
          {f >= T0 - 1 && <Kinetic text="¿CUÁL ES" at={T0} size={118} gold weight={900} spacing={3} stagger={1} />}
          {f >= T0 + 5 && <Kinetic text="LA TUYA?" at={T0 + 5} size={140} gold weight={900} spacing={3} stagger={1} />}
        </div>
        <div style={{ position: "absolute", top: 1590, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
          {action(L(51.14), "Cuéntanos en comentarios", <Bubble />, -1)}
          {action(L(52.7), "Envíaselo a tu pareja", <Plane />, 1)}
        </div>
        {f > L(54.3) && new Array(10).fill(0).map((_, i) => {
          const d = f - L(54.3) - i * 2; if (d < 0) return null;
          return <div key={i} style={{ position: "absolute", left: 540 + (random(`cx${i}`) - 0.5) * 900, top: 1700 - d * (8 + random(`cv${i}`) * 6), opacity: interpolate(d, [0, 5, 30, 45], [0, 1, 1, 0], clamp), transform: `scale(${Math.min(1, d / 5)})` }}><Heart s={60 + random(`cs${i}`) * 40} color="#ff6f9e" /></div>;
        })}
      </AbsoluteFill>
      <Flash at={T0} strength={0.6} />
    </AbsoluteFill>
  );
};
