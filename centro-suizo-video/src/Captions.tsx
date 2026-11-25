import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import G from "./captions.json";
import { SANS } from "./fonts";
import { INTRO, FPS } from "./timing";

type W = { w: string; s: number; e: number };
const groups = G as W[][];
const KEY = new Set(["redondo.", "oval,", "pera,", "esmeralda,", "marquise,", "cojín.", "tuya?", "seis.", "brilla.", "forma", "esperas."]);

export const Captions: React.FC = () => {
  const g = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (g - INTRO) / FPS;
  const idx = groups.findIndex((gr, i) => t >= gr[0].s - 0.1 && t < (groups[i + 1] ? groups[i + 1][0].s - 0.1 : gr[gr.length - 1].e + 0.4));
  if (idx < 0) return null;
  const gr = groups[idx];
  const g0 = INTRO + gr[0].s * FPS - 3;
  const enter = spring({ frame: g - g0, fps, config: { damping: 14, stiffness: 200 } });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{
        position: "absolute", top: 268, left: 70, right: 70, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 16px",
        fontFamily: SANS, fontWeight: 800, fontSize: 56, transform: `translateY(${(1 - enter) * 30}px) scale(${0.9 + 0.1 * enter})`,
      }}>
        {gr.map((w, i) => {
          const wf = INTRO + w.s * FPS;
          const p = spring({ frame: g - wf + 2, fps, config: { damping: 9, stiffness: 220, mass: 0.5 } });
          const active = t >= w.s - 0.05 && t < w.e + 0.1;
          const shown = g >= wf - 2;
          const key = KEY.has(w.w.toLowerCase());
          return (
            <span key={i} style={{
              position: "relative", display: "inline-block", padding: "2px 12px", borderRadius: 14,
              color: active ? "#1a1306" : key ? "#ffd775" : "#fff",
              opacity: shown ? 1 : 0.25,
              transform: `scale(${shown ? 0.7 + 0.3 * p + (active ? 0.08 : 0) : 0.85}) translateY(${shown ? (1 - p) * 20 : 0}px)`,
              filter: shown ? `blur(${Math.max(0, (1 - p) * 6)}px)` : "blur(1px)",
              background: active ? "linear-gradient(180deg,#fff3c4,#f0bd50)" : "transparent",
              boxShadow: active ? "0 0 26px rgba(255,205,100,0.75)" : "none",
              textShadow: active ? "none" : "0 4px 12px rgba(0,0,0,0.7)",
            }}>{w.w}</span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
