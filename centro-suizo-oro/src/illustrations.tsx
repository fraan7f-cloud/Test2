import React from "react";
import { C, F } from "./theme";

const GoldDefs: React.FC<{ id: string }> = ({ id }) => (
  <defs>
    <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor={C.goldLight} />
      <stop offset="0.45" stopColor={C.goldBright} />
      <stop offset="0.75" stopColor={C.goldDark} />
      <stop offset="1" stopColor={C.goldLight} />
    </linearGradient>
    <linearGradient id={`${id}-d`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={C.goldDark} />
      <stop offset="1" stopColor="#7A4E1E" />
    </linearGradient>
  </defs>
);

/** Anillo solitario; `turn` (radianes) simula el giro en 3D. */
export const Ring: React.FC<{ size: number; turn: number }> = ({ size, turn }) => {
  const sx = 0.35 + 0.65 * Math.abs(Math.cos(turn));
  return (
    <svg width={size} height={size} viewBox="0 0 400 400">
      <GoldDefs id="ring" />
      <g transform={`translate(200 0) scale(${sx} 1) translate(-200 0)`}>
        <ellipse cx="200" cy="250" rx="125" ry="125" fill="none" stroke="url(#ring-d)" strokeWidth="34" />
        <ellipse cx="200" cy="245" rx="125" ry="125" fill="none" stroke="url(#ring-g)" strokeWidth="26" />
        <ellipse cx="160" cy="165" rx="30" ry="8" fill="rgba(255,255,255,0.55)" transform="rotate(-30 160 165)" />
        {/* engaste + diamante */}
        <path d="M170 128 L230 128 L218 150 L182 150 Z" fill="url(#ring-g)" />
        <path d="M150 70 L250 70 L280 95 L200 140 L120 95 Z" fill="#F4F7FB" stroke="#B9C6D6" strokeWidth="3" />
        <path d="M150 70 L175 95 L200 70 L225 95 L250 70 M120 95 L280 95 M175 95 L200 140 L225 95" fill="none" stroke="#9FB0C4" strokeWidth="3" />
        <path d="M155 75 L172 92 L135 92 Z" fill="rgba(255,255,255,0.9)" />
      </g>
    </svg>
  );
};

export const GoldBar: React.FC<{ width: number; label?: string }> = ({ width, label }) => (
  <svg width={width} height={width * 0.5} viewBox="0 0 400 200">
    <GoldDefs id="bar" />
    <path d="M70 40 L330 40 L390 170 L10 170 Z" fill="url(#bar-g)" />
    <path d="M70 40 L330 40 L310 70 L90 70 Z" fill="rgba(255,255,255,0.35)" />
    <path d="M10 170 L390 170 L380 190 L20 190 Z" fill="url(#bar-d)" />
    {label ? (
      <text x="200" y="135" textAnchor="middle" fontFamily={F.display} fontWeight={700} fontSize="40" fill="#8A5A22">
        {label}
      </text>
    ) : null}
  </svg>
);

/** Sello de contraste (punzón) grabado en las joyas. */
export const Hallmark: React.FC<{ size: number; value: string }> = ({ size, value }) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <GoldDefs id={`hm${value}`} />
    <circle cx="100" cy="100" r="92" fill={`url(#hm${value}-g)`} />
    <circle cx="100" cy="100" r="78" fill="none" stroke="#8A5A22" strokeWidth="3" strokeDasharray="4 6" />
    <rect x="35" y="70" width="130" height="60" rx="14" fill="#5E3A12" opacity="0.9" />
    <text x="100" y="117" textAnchor="middle" fontFamily={F.body} fontWeight={800} fontSize="46" fill={C.goldLight}>
      {value}
    </text>
  </svg>
);

/** Disco de 24 partes; `filled` partes encendidas. */
export const Disc24: React.FC<{ size: number; filled: number }> = ({ size, filled }) => {
  const segs = [];
  for (let i = 0; i < 24; i++) {
    const a0 = (i / 24) * Math.PI * 2 - Math.PI / 2 + 0.02;
    const a1 = ((i + 1) / 24) * Math.PI * 2 - Math.PI / 2 - 0.02;
    const r0 = 120;
    const r1 = 190;
    const p = (r: number, a: number) => `${200 + r * Math.cos(a)} ${200 + r * Math.sin(a)}`;
    const on = Math.max(0, Math.min(1, filled - i));
    segs.push(
      <path
        key={i}
        d={`M${p(r0, a0)} L${p(r1, a0)} A${r1} ${r1} 0 0 1 ${p(r1, a1)} L${p(r0, a1)} A${r0} ${r0} 0 0 0 ${p(r0, a0)} Z`}
        fill={on > 0 ? "url(#disc-g)" : "rgba(255,255,255,0.08)"}
        opacity={on > 0 ? 0.35 + 0.65 * on : 1}
        stroke="rgba(249,221,152,0.25)"
        strokeWidth="1.5"
      />,
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 400 400">
      <GoldDefs id="disc" />
      {segs}
    </svg>
  );
};

/** Balanza con semillas de algarrobo. `tilt` en grados. */
export const Balance: React.FC<{ size: number; tilt: number }> = ({ size, tilt }) => {
  const rad = (tilt * Math.PI) / 180;
  const ly = 120 + Math.sin(-rad) * -130;
  const ry = 120 - Math.sin(-rad) * -130;
  return (
    <svg width={size} height={size} viewBox="0 0 400 400">
      <GoldDefs id="bal" />
      <rect x="192" y="110" width="16" height="220" fill="url(#bal-g)" />
      <path d="M130 345 L270 345 L250 320 L150 320 Z" fill="url(#bal-g)" />
      <g transform={`rotate(${tilt} 200 120)`}>
        <rect x="60" y="114" width="280" height="12" rx="6" fill="url(#bal-g)" />
      </g>
      <circle cx="200" cy="120" r="14" fill={C.goldLight} />
      {/* platillo izquierdo: semillas */}
      <g transform={`translate(0 ${ly - 120})`}>
        <line x1="70" y1="120" x2="40" y2="220" stroke={C.gold} strokeWidth="3" />
        <line x1="70" y1="120" x2="100" y2="220" stroke={C.gold} strokeWidth="3" />
        <path d="M25 220 Q70 260 115 220 Z" fill="url(#bal-g)" />
        {[[55, 208], [75, 205], [65, 194]].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx="13" ry="9" fill="#5A3417" stroke="#2E1A0B" strokeWidth="2" transform={`rotate(${i * 25 - 20} ${x} ${y})`} />
        ))}
      </g>
      {/* platillo derecho: pepita de oro */}
      <g transform={`translate(0 ${ry - 120})`}>
        <line x1="330" y1="120" x2="300" y2="220" stroke={C.gold} strokeWidth="3" />
        <line x1="330" y1="120" x2="360" y2="220" stroke={C.gold} strokeWidth="3" />
        <path d="M285 220 Q330 260 375 220 Z" fill="url(#bal-g)" />
        <path d="M310 212 Q318 188 334 192 Q352 186 352 206 Q348 218 330 216 Z" fill="url(#bal-g)" stroke={C.goldDark} strokeWidth="2" />
      </g>
    </svg>
  );
};
