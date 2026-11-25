import React, { useId } from "react";

export type Shape = "round" | "oval" | "pear" | "emerald" | "marquise" | "cushion";
type P = [number, number];

const dense = (shape: Shape): P[] => {
  const pts: P[] = [];
  const M = 360;
  for (let i = 0; i < M; i++) {
    const a = (i / M) * Math.PI * 2;
    if (shape === "round") pts.push([Math.cos(a), Math.sin(a)]);
    else if (shape === "oval") pts.push([0.74 * Math.cos(a), Math.sin(a)]);
    else if (shape === "cushion") {
      const c = Math.cos(a), s = Math.sin(a), n = 3.2;
      const r = Math.pow(Math.pow(Math.abs(c), n) + Math.pow(Math.abs(s), n), -1 / n);
      pts.push([0.95 * r * c, 0.95 * r * s]);
    } else if (shape === "pear") {
      pts.push([0.78 * Math.sin(a) * Math.pow(Math.sin(a / 2), 1.1), -Math.cos(a)]);
    } else if (shape === "marquise") {
      const y = -Math.cos(a);
      const x = 0.56 * Math.pow(Math.max(0, 1 - y * y), 0.75) * Math.sign(Math.sin(a));
      pts.push([x, y]);
    }
  }
  return pts;
};

const center = (shape: Shape): P => (shape === "pear" ? [0, 0.22] : [0, 0]);

const sampleByAngle = (shape: Shape, n: number): P[] => {
  const d = dense(shape);
  const c = center(shape);
  const out: P[] = [];
  for (let i = 0; i < n; i++) {
    const target = -Math.PI / 2 + (i / n) * Math.PI * 2;
    let best = d[0], bd = 1e9;
    for (const p of d) {
      const a = Math.atan2(p[1] - c[1], p[0] - c[0]);
      let diff = Math.abs(a - target) % (2 * Math.PI);
      if (diff > Math.PI) diff = 2 * Math.PI - diff;
      if (diff < bd) { bd = diff; best = p; }
    }
    out.push(best);
  }
  return out;
};

const emeraldRing = (s: number): P[] => {
  const w = 0.7 * s + 0.0, h = 1 * s, c = 0.2 * s;
  return [[-w + c, -h], [w - c, -h], [w, -h + c], [w, h - c], [w - c, h], [-w + c, h], [-w, h - c], [-w, -h + c]];
};

const cache = new Map<string, P[]>();
const outline = (shape: Shape, n: number) => {
  const k = shape + n;
  if (!cache.has(k)) cache.set(k, shape === "emerald" ? emeraldRing(1) : sampleByAngle(shape, n));
  return cache.get(k)!;
};

const shadeColor = (s: number, warm = 0) => {
  const v = Math.max(0, Math.min(1, s));
  const l = 28 + Math.pow(v, 1.4) * 72;
  return `hsl(${(225 - warm * 370 + 360) % 360}, ${18 + warm * 90}%, ${l}%)`;
};
const poly = (pts: P[], k: number) => pts.map((p) => `${(p[0] * k).toFixed(1)},${(p[1] * k).toFixed(1)}`).join(" ");

export const Gem: React.FC<{ shape: Shape; size: number; t: number; detail?: boolean; warm?: number; glow?: number }> = ({
  shape, size, t, detail = true, warm = 0, glow = 1,
}) => {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const K = size * 0.46;
  const n = detail ? 24 : 12;
  const out = outline(shape, n);
  const c = center(shape);
  const facets: React.ReactNode[] = [];

  if (shape === "emerald") {
    const rings = [1, 0.82, 0.64, 0.46].map(emeraldRing);
    for (let k = 0; k < rings.length - 1; k++) {
      for (let i = 0; i < 8; i++) {
        const a = rings[k][i], b = rings[k][(i + 1) % 8], cc = rings[k + 1][(i + 1) % 8], d = rings[k + 1][i];
        const ang = Math.atan2((a[1] + b[1]) / 2, (a[0] + b[0]) / 2);
        const s = 0.5 + 0.5 * Math.sin(ang * 2 + k * 1.3 + t);
        facets.push(<polygon key={`e${k}${i}`} points={poly([a, b, cc, d], K)} fill={shadeColor(s, warm)} />);
      }
    }
    const tb = rings[3];
    facets.push(<polygon key="tb" points={poly(tb, K)} fill={shadeColor(0.55 + 0.4 * Math.sin(t * 0.8), warm)} />);
    for (let i = -3; i <= 3; i++) {
      const x = ((i / 3) * 0.3 + ((t * 0.15) % 0.3)) * K;
      facets.push(<line key={`l${i}`} x1={x - 0.3 * K} y1={-0.46 * K} x2={x + 0.3 * K} y2={0.46 * K} stroke="rgba(255,255,255,0.25)" strokeWidth={2} />);
    }
  } else {
    const q = out.map((p): P => [c[0] + (p[0] - c[0]) * 0.52, c[1] + (p[1] - c[1]) * 0.52]);
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const th = (i / n) * Math.PI * 2;
      const s1 = 0.5 + 0.5 * Math.sin(th * 3 + t);
      const s2 = 0.5 + 0.5 * Math.sin(th * 3 + t + 1.9);
      const s3 = 0.5 + 0.5 * Math.sin(th * 2 - t * 1.3 + 0.7);
      facets.push(<polygon key={`a${i}`} points={poly([out[i], out[j], q[i]], K)} fill={shadeColor(s1, warm)} />);
      facets.push(<polygon key={`b${i}`} points={poly([q[i], q[j], out[j]], K)} fill={shadeColor(s2, warm)} />);
      facets.push(<polygon key={`c${i}`} points={poly([c, q[i], q[j]], K)} fill={shadeColor(0.3 + 0.7 * s3, warm)} />);
    }
  }
  const outlinePts = poly(out, K);
  const sweep = ((t * 0.35) % 3) - 1.5;
  return (
    <svg width={size} height={size} viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`} style={{ overflow: "visible", filter: `drop-shadow(0 0 ${size * 0.06 * glow}px rgba(255,255,255,${0.55 * glow})) drop-shadow(0 ${size * 0.05}px ${size * 0.08}px rgba(0,0,0,0.45))` }}>
      <defs>
        <clipPath id={`c${id}`}><polygon points={outlinePts} /></clipPath>
        <radialGradient id={`r${id}`} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#fff" stopOpacity={0.75} />
          <stop offset="60%" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`s${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset={0} stopColor="#fff" stopOpacity={0} />
          <stop offset={0.5} stopColor="#fff" stopOpacity={0.9} />
          <stop offset={1} stopColor="#fff" stopOpacity={0} />
        </linearGradient>
      </defs>
      <g clipPath={`url(#c${id})`}>
        {facets}
        <g stroke="rgba(255,255,255,0.45)" strokeWidth={detail ? 1.4 : 0.8} fill="none">
          {shape !== "emerald" && out.map((p, i) => <line key={i} x1={c[0] * K} y1={c[1] * K} x2={p[0] * K} y2={p[1] * K} />)}
        </g>
        <rect x={-K} y={-K} width={2 * K} height={2 * K} fill={`url(#r${id})`} />
        <rect x={sweep * K * 1.4 - K * 0.35} y={-K * 1.5} width={K * 0.7} height={K * 3} fill={`url(#s${id})`} transform="rotate(25)" opacity={0.7} />
      </g>
      <polygon points={outlinePts} fill="none" stroke="#fff" strokeWidth={detail ? size * 0.012 : 2} strokeLinejoin="round" />
    </svg>
  );
};

export const Sparkle: React.FC<{ x: number; y: number; size: number; frame: number; phase: number; speed?: number }> = ({ x, y, size, frame, phase, speed = 0.13 }) => {
  const v = Math.pow(Math.max(0, Math.sin(frame * speed + phase)), 4);
  if (v < 0.01) return null;
  const s = size * v;
  return (
    <svg width={s * 2} height={s * 2} viewBox="-1 -1 2 2" style={{ position: "absolute", left: x - s, top: y - s, transform: `rotate(${frame * 2 + phase * 40}deg)`, filter: "drop-shadow(0 0 8px #fff)" }}>
      <path d="M0,-1 C0.08,-0.08 0.08,-0.08 1,0 C0.08,0.08 0.08,0.08 0,1 C-0.08,0.08 -0.08,0.08 -1,0 C-0.08,-0.08 -0.08,-0.08 0,-1Z" fill="#fff" />
    </svg>
  );
};
