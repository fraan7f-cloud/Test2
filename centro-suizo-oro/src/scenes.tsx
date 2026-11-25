import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Balance, Disc24, GoldBar, Hallmark, Ring } from "./illustrations";
import {
  C,
  Caption,
  clamp,
  Divider,
  EASE,
  F,
  GlassCard,
  GOLD_GRADIENT,
  Numeral,
  Pill,
  SceneShell,
} from "./theme";

const enter = (f: number, at: number, len = 18) =>
  interpolate(f, [at, at + len], [0, 1], { ...clamp, easing: EASE });

/* 1 · Gancho */
export const SceneHook: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const p = enter(f, 0, 30);
  return (
    <SceneShell dur={dur}>
      <AbsoluteFill style={{ perspective: 1600 }}>
        <GlassCard
          style={{
            left: 190,
            top: 300,
            width: 700,
            height: 860,
            rotate: `y ${interpolate(p, [0, 1], [55, -8]) + Math.sin(f / 25) * 6}deg`,
            translate: `0px ${(1 - p) * 120}px`,
          }}
          glow={1.3}
        >
          <div style={{ position: "absolute", left: 100, top: 210 }}>
            <Ring size={500} turn={f / 22} />
          </div>
        </GlassCard>
      </AbsoluteFill>
      <Numeral
        size={420}
        style={{
          right: 60,
          top: 120,
          opacity: enter(f, 22),
          translate: `${(1 - enter(f, 22)) * 80}px 0px`,
          rotate: `${Math.sin(f / 18) * 4}deg`,
        }}
      >
        ?
      </Numeral>
      <Caption text={"¿Tu anillo de oro…\nes *oro* *puro?*"} start={18} perWord={7} top={1250} />
    </SceneShell>
  );
};

/* 2 · Qué es un quilate */
export const SceneKarat: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const filled = interpolate(f, [20, 120], [0, 24], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return (
    <SceneShell dur={dur}>
      <div style={{ position: "absolute", left: 140, top: 260, rotate: `${f * 0.15}deg` }}>
        <Disc24 size={800} filled={filled} />
      </div>
      <Numeral size={300} style={{ left: 0, right: 0, top: 500, textAlign: "center" }}>
        {Math.round(filled)}
      </Numeral>
      <Pill active style={{ left: 210, top: 1130, opacity: enter(f, 40), translate: `0px ${(1 - enter(f, 40)) * 30}px` }}>
        1 quilate = 1 parte de 24
      </Pill>
      <Caption text={"El oro se mide en *quilates:*\ncuántas partes de oro\nhay de *24.*"} start={10} perWord={6} top={1290} />
    </SceneShell>
  );
};

/* 3-6 · Escena por quilate */
export const SceneKarats: React.FC<{
  dur: number;
  k: string;
  pct: number;
  pctLabel: string;
  hallmark: string;
  pills: string[];
  caption: string;
  bar?: boolean;
}> = ({ dur, k, pct, pctLabel, hallmark, pills, caption, bar }) => {
  const f = useCurrentFrame();
  const card = enter(f, 6, 26);
  const fill = interpolate(f, [18, 60], [0, pct], { ...clamp, easing: EASE });
  return (
    <SceneShell dur={dur}>
      <Numeral
        size={560}
        style={{
          left: 90,
          top: 130,
          opacity: enter(f, 0),
          translate: `${(1 - enter(f, 0)) * -120}px 0px`,
        }}
      >
        {k}
        <span style={{ fontSize: 220 }}>k</span>
      </Numeral>
      <div style={{ position: "absolute", right: 90, top: 260, scale: String(0.6 + 0.4 * enter(f, 14)), rotate: `${(1 - enter(f, 14)) * -90 + Math.sin(f / 20) * 5}deg`, opacity: enter(f, 14) }}>
        <Hallmark size={260} value={hallmark} />
      </div>
      <AbsoluteFill style={{ perspective: 1600 }}>
        <GlassCard
          style={{
            left: 80,
            right: 80,
            top: 760,
            height: 330,
            opacity: card,
            rotate: `x ${(1 - card) * 50}deg`,
            translate: `0px ${(1 - card) * 80}px`,
          }}
        >
          <div style={{ position: "absolute", left: 56, top: 44, fontFamily: F.body, fontWeight: 800, fontSize: 92, color: C.white }}>
            {pctLabel}
            <span style={{ fontWeight: 400, fontSize: 48, color: "rgba(255,255,255,0.7)" }}> de oro</span>
          </div>
          <div style={{ position: "absolute", left: 56, right: 56, top: 200, height: 54, borderRadius: 54, background: "rgba(255,255,255,0.10)", overflow: "hidden" }}>
            <div style={{ width: `${fill}%`, height: "100%", borderRadius: 54, background: GOLD_GRADIENT, boxShadow: `0 0 30px ${C.gold}` }} />
          </div>
          <div style={{ position: "absolute", left: 56, right: 56, top: 268, display: "flex", justifyContent: "space-between", fontFamily: F.body, fontSize: 30, color: "rgba(255,255,255,0.55)" }}>
            <span>oro</span>
            <span>aleación</span>
          </div>
        </GlassCard>
      </AbsoluteFill>
      {pills.map((p, i) => (
        <Pill
          key={p}
          active={i === 0}
          style={{
            left: 80 + i * 330,
            top: 1150,
            opacity: enter(f, 34 + i * 6),
            translate: `0px ${(1 - enter(f, 34 + i * 6)) * 40}px`,
          }}
        >
          {p}
        </Pill>
      ))}
      {bar ? (
        <div style={{ position: "absolute", right: 70, top: 600, opacity: enter(f, 26), rotate: "-8deg" }}>
          <GoldBar width={300} label="999" />
        </div>
      ) : null}
      <Caption text={caption} start={22} perWord={6} top={1300} />
    </SceneShell>
  );
};

/* 7 · Comparación + sello */
const rows = [
  { k: "24k", v: 99.9, l: "99,9 %" },
  { k: "18k", v: 75, l: "75 %" },
  { k: "14k", v: 58.3, l: "58,3 %" },
  { k: "10k", v: 41.7, l: "41,7 %" },
];

export const SceneCompare: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const seal = enter(f, 95, 26);
  return (
    <SceneShell dur={dur}>
      <AbsoluteFill style={{ perspective: 1600 }}>
        <GlassCard
          style={{
            left: 80,
            right: 80,
            top: 220,
            height: 640,
            rotate: `y ${(1 - enter(f, 0, 24)) * -40}deg`,
          }}
        >
          {rows.map((r, i) => {
            const w = interpolate(f, [10 + i * 8, 50 + i * 8], [0, r.v], { ...clamp, easing: EASE });
            const hi = r.k === "18k";
            return (
              <div key={r.k} style={{ position: "absolute", left: 50, right: 50, top: 60 + i * 140, height: 110 }}>
                <div style={{ fontFamily: F.numeral, fontStyle: "italic", fontWeight: 600, fontSize: 64, color: hi ? C.goldLight : "rgba(255,255,255,0.75)", position: "absolute", left: 0, top: 10 }}>
                  {r.k}
                </div>
                <div style={{ position: "absolute", left: 140, right: 0, top: 28, height: 46, borderRadius: 46, background: "rgba(255,255,255,0.08)" }}>
                  <div
                    style={{
                      width: `${w}%`,
                      height: "100%",
                      borderRadius: 46,
                      background: hi ? GOLD_GRADIENT : "linear-gradient(90deg, rgba(228,182,91,0.55), rgba(199,143,67,0.35))",
                      boxShadow: hi ? `0 0 34px ${C.gold}` : "none",
                    }}
                  />
                </div>
                <div style={{ position: "absolute", right: 16, top: 30, fontFamily: F.body, fontWeight: 600, fontSize: 30, color: C.white, opacity: enter(f, 40 + i * 8) }}>
                  {r.l}
                </div>
              </div>
            );
          })}
        </GlassCard>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 390,
          top: 900,
          opacity: seal,
          scale: String(0.4 + 0.6 * seal),
          rotate: `${(1 - seal) * 120}deg`,
          filter: `drop-shadow(0 0 ${30 + Math.sin(f / 6) * 10}px rgba(228,182,91,0.7))`,
        }}
      >
        <Hallmark size={300} value="750" />
      </div>
      <Caption text={"¿Cómo saberlo? Busca el *sello:*\n*750* = 18k."} start={70} perWord={7} top={1270} />
    </SceneShell>
  );
};

/* 8 · Curiosidad */
export const SceneSeed: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const tilt = interpolate(f, [10, 70], [-14, 0], { ...clamp, easing: Easing.out(Easing.elastic(1)) });
  return (
    <SceneShell dur={dur}>
      <Pill active style={{ left: 400, top: 230, opacity: enter(f, 0) }}>
        Dato
      </Pill>
      <div style={{ position: "absolute", left: 190, top: 330, opacity: enter(f, 4) }}>
        <Balance size={700} tilt={tilt} />
      </div>
      <Numeral size={150} style={{ left: 0, right: 0, top: 1010, textAlign: "center", opacity: enter(f, 20) }}>
        kerátion
      </Numeral>
      <Caption text={"“Quilate” viene de una *semilla*\nusada para *pesar* *oro.*"} start={30} perWord={6} top={1270} />
    </SceneShell>
  );
};

/* 9 · Cierre */
export const SceneOutro: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const logo = enter(f, 4, 30);
  const line = enter(f, 20, 30);
  const sweep = interpolate(f, [40, 80], [-60, 160], clamp);
  return (
    <SceneShell dur={dur + 30}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 560,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 50,
        }}
      >
        <div
          style={{
            position: "relative",
            opacity: logo,
            filter: `blur(${(1 - logo) * 16}px) drop-shadow(0 0 40px rgba(228,182,91,0.5))`,
            scale: String(0.85 + 0.15 * logo),
          }}
        >
          <Img src={staticFile("logo-centro-suizo.png")} style={{ width: 760, display: "block" }} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(110deg, transparent ${sweep - 20}%, rgba(249,221,152,0.9) ${sweep}%, transparent ${sweep + 20}%)`,
              WebkitMaskImage: `url(${staticFile("logo-centro-suizo.png")})`,
              maskImage: `url(${staticFile("logo-centro-suizo.png")})`,
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
            }}
          />
        </div>
        <Divider width={640} progress={line} />
        <div
          style={{
            fontFamily: F.display,
            fontWeight: 600,
            fontSize: 52,
            letterSpacing: 10,
            color: C.goldLight,
            opacity: enter(f, 34),
            translate: `0px ${(1 - enter(f, 34)) * 20}px`,
          }}
        >
          JOYAS EN ORO 18K
        </div>
        <div
          style={{
            fontFamily: F.numeral,
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: 88,
            color: C.white,
            opacity: enter(f, 52),
            translate: `0px ${(1 - enter(f, 52)) * 20}px`,
          }}
        >
          Hechas para durar.
        </div>
      </div>
    </SceneShell>
  );
};
