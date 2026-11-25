/**
 * Biblioteca de ilustración 2D: objetos vectoriales planos con sombreado en tonos ("cel shading")
 * en la paleta de oro de Centro Suizo. Todos se animan desde los props (frame-driven).
 */
import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame} from 'remotion';

export const INK = {
  deep: '#3E2D0C',
  shadow: '#7A5A1E',
  mid: '#C8A84B', // --cs-gold
  light: '#E2C878', // --cs-gold-light
  hi: '#FFF4D2',
  line: '#241A06',
  ivory: '#F3F2EE',
  taupe: '#BCAF9B',
  silver: '#D6D8DC',
  silverShadow: '#8E9299',
  copper: '#C27A4E',
  copperShadow: '#7E4527',
  wood: '#5A3A1C',
  woodLight: '#8A5A2B',
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Squash & stretch para un rebote: devuelve [scaleX, scaleY] alrededor de un frame de impacto. */
export const squash = (frame: number, impact: number, amount = 0.35): [number, number] => {
  const s = spring({frame: frame - impact, fps: 30, config: {damping: 6, mass: 0.5, stiffness: 180}});
  const d = frame < impact ? 0 : (1 - s) * amount;
  return [1 + d, 1 - d];
};

/** Destello de 4 puntas que aparece girando y se apaga. */
export const Sparkle: React.FC<{readonly x: number; readonly y: number; readonly size: number; readonly at: number; readonly dur?: number; readonly color?: string}> = ({
  x,
  y,
  size,
  at,
  dur = 22,
  color = INK.hi,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + dur], [0, 1], clamp);
  if (p <= 0 || p >= 1) return null;
  const s = Math.sin(p * Math.PI);
  const r = size * s;
  const k = r * 0.18;
  return (
    <g transform={`translate(${x} ${y}) rotate(${p * 90})`} style={{filter: `drop-shadow(0 0 ${r * 0.6}px rgba(255,236,190,.9))`}}>
      <path d={`M 0 ${-r} Q ${k} ${-k} ${r} 0 Q ${k} ${k} 0 ${r} Q ${-k} ${k} ${-r} 0 Q ${-k} ${-k} 0 ${-r} Z`} fill={color} />
    </g>
  );
};

/** Lingote isométrico (caja de 200×110). */
export const Ingot: React.FC<{readonly scale?: number; readonly shine?: number}> = ({scale = 1, shine = 0}) => (
  <g transform={`scale(${scale})`}>
    <ellipse cx={100} cy={118} rx={100} ry={10} fill="rgba(0,0,0,.45)" />
    <path d="M 10 40 L 190 40 L 200 110 L 0 110 Z" fill={INK.mid} />
    <path d="M 160 40 L 190 40 L 200 110 L 172 110 Z" fill={INK.shadow} />
    <path d="M 30 0 L 170 0 L 190 40 L 10 40 Z" fill={INK.light} />
    <path d="M 45 8 L 120 8 L 112 18 L 40 18 Z" fill={INK.hi} opacity={0.8} />
    <rect x={14} y={58} width={150} height={10} rx={5} fill={INK.light} opacity={0.6} />
    {shine > 0 ? (
      <path d={`M ${-40 + shine * 280} 0 L ${-10 + shine * 280} 0 L ${-30 + shine * 280} 110 L ${-60 + shine * 280} 110 Z`} fill="#fff" opacity={0.55} />
    ) : null}
  </g>
);

/** Anillo visto de 3/4: dos elipses con hueco, luz arriba y sombra abajo. */
export const Ring2D: React.FC<{readonly rx: number; readonly ry: number; readonly band: number; readonly tone?: 'gold' | 'rose'}> = ({rx, ry, band, tone = 'gold'}) => {
  const outer = `M ${-rx} 0 A ${rx} ${ry} 0 1 0 ${rx} 0 A ${rx} ${ry} 0 1 0 ${-rx} 0 Z`;
  const irx = rx - band;
  const iry = ry - band * (ry / rx) * 1.2;
  const inner = `M ${-irx} 0 A ${irx} ${iry} 0 1 1 ${irx} 0 A ${irx} ${iry} 0 1 1 ${-irx} 0 Z`;
  const mid = tone === 'gold' ? INK.mid : '#D9A07A';
  return (
    <g>
      <ellipse cx={0} cy={ry + 24} rx={rx * 0.9} ry={14} fill="rgba(0,0,0,.45)" />
      <path d={outer + inner} fillRule="evenodd" fill={mid} />
      {/* cara interior en sombra (parte de atrás del aro) */}
      <path d={`M ${-irx} 0 A ${irx} ${iry} 0 0 1 ${irx} 0 L ${irx} ${band * 0.5} A ${irx} ${iry} 0 0 0 ${-irx} ${band * 0.5} Z`} fill={INK.shadow} />
      {/* luz superior y sombra inferior del frente */}
      <path d={`M ${-rx + 10} ${-6} A ${rx - 10} ${ry - 10} 0 0 1 ${rx - 10} ${-6}`} stroke={INK.hi} strokeWidth={band * 0.22} fill="none" strokeLinecap="round" opacity={0.85} />
      <path d={`M ${rx - 6} 10 A ${rx - 6} ${ry - 6} 0 0 1 ${-rx + 6} 10`} stroke={INK.shadow} strokeWidth={band * 0.3} fill="none" strokeLinecap="round" />
      <path d={`M ${-rx * 0.55} ${-ry * 0.72} Q ${-rx * 0.2} ${-ry * 0.95} ${rx * 0.15} ${-ry * 0.9}`} stroke="#fff" strokeWidth={band * 0.12} fill="none" strokeLinecap="round" opacity={0.8} />
    </g>
  );
};

/** Martillo de orfebre. Pivote en el extremo del mango (0,0); la cabeza queda en y negativo. */
export const Hammer: React.FC = () => (
  <g>
    <rect x={-12} y={-300} width={24} height={300} rx={12} fill={INK.woodLight} />
    <rect x={-12} y={-300} width={9} height={300} rx={4} fill={INK.wood} />
    <rect x={-95} y={-360} width={190} height={78} rx={14} fill={INK.silver} />
    <rect x={-95} y={-310} width={190} height={28} rx={10} fill={INK.silverShadow} />
    <rect x={-85} y={-352} width={110} height={12} rx={6} fill="#fff" opacity={0.75} />
  </g>
);

/** Tubo de ensayo que se llena de oro líquido con oleaje en la superficie. */
export const Tube: React.FC<{readonly id: string; readonly w: number; readonly h: number; readonly level: number; readonly alloy: number; readonly wobble?: number}> = ({
  id,
  w,
  h,
  level,
  alloy,
  wobble = 1,
}) => {
  const frame = useCurrentFrame();
  const r = w / 2;
  const tubePath = `M 0 0 L 0 ${h - r} A ${r} ${r} 0 0 0 ${w} ${h - r} L ${w} 0`;
  const surfaceY = h - level * (h - 10);
  const amp = 7 * wobble;
  let wave = `M -10 ${h + 20} L -10 ${surfaceY}`;
  for (let x = -10; x <= w + 10; x += 6) {
    wave += ` L ${x} ${surfaceY + Math.sin(x / 14 + frame / 4) * amp + Math.sin(x / 7 - frame / 6) * amp * 0.4}`;
  }
  wave += ` L ${w + 10} ${h + 20} Z`;
  const alloyTop = h - (level + alloy) * (h - 10);
  return (
    <g>
      <defs>
        <clipPath id={`tube-${id}`}>
          <path d={tubePath + ' Z'} />
        </clipPath>
      </defs>
      <g clipPath={`url(#tube-${id})`}>
        <rect x={-10} y={0} width={w + 20} height={h + 20} fill="rgba(243,242,238,.05)" />
        {alloy > 0 ? <rect x={-10} y={alloyTop} width={w + 20} height={h} fill={INK.taupe} opacity={0.55} /> : null}
        <path d={wave} fill={INK.mid} />
        <path d={wave} fill={INK.light} transform={`translate(${-w * 0.35} 0)`} opacity={0.75} />
        <rect x={w * 0.62} y={surfaceY} width={w * 0.38 + 10} height={h} fill={INK.shadow} opacity={0.55} />
        {[0, 1, 2].map((b) => {
          const by = h - ((frame * (1.6 + b * 0.5) + b * 70) % Math.max(1, h - surfaceY));
          return level > 0.05 ? <circle key={b} cx={w * (0.25 + b * 0.22)} cy={by} r={4 + b} fill={INK.hi} opacity={0.6} /> : null;
        })}
      </g>
      <path d={tubePath} fill="none" stroke={INK.ivory} strokeWidth={5} strokeLinecap="round" opacity={0.9} />
      <path d={`M ${w * 0.18} 20 L ${w * 0.18} ${h - r - 10}`} stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.35} />
      <rect x={-14} y={-8} width={w + 28} height={14} rx={7} fill={INK.ivory} opacity={0.9} />
    </g>
  );
};

/** Crisol de fundición con brillo interior. */
export const Crucible: React.FC<{readonly glow: number}> = ({glow}) => (
  <g>
    <ellipse cx={0} cy={170} rx={190} ry={18} fill="rgba(0,0,0,.5)" />
    <path d="M -170 0 L 170 0 L 130 160 L -130 160 Z" fill="#3A3633" />
    <path d="M 90 0 L 170 0 L 130 160 L 70 160 Z" fill="#24211F" />
    <path d="M -150 10 L -120 150" stroke="#6A635D" strokeWidth={10} strokeLinecap="round" />
    <ellipse cx={0} cy={0} rx={170} ry={36} fill="#24211F" />
    <ellipse cx={0} cy={4} rx={150} ry={28} fill={INK.mid} opacity={glow} />
    <ellipse cx={-30} cy={0} rx={90} ry={14} fill={INK.hi} opacity={glow * 0.8} />
    <ellipse cx={0} cy={0} rx={220} ry={90} fill="rgba(255,200,90,.25)" opacity={glow} style={{filter: 'blur(20px)'}} />
  </g>
);

/** Gota que cae (forma de lágrima) con estiramiento según la velocidad. */
export const Drop: React.FC<{readonly color: string; readonly shade: string; readonly size: number; readonly stretch: number}> = ({color, shade, size, stretch}) => (
  <g transform={`scale(${1 - stretch * 0.25} ${1 + stretch})`}>
    <path d={`M 0 ${-size * 1.5} Q ${size} ${-size * 0.2} ${size} ${size * 0.3} A ${size} ${size} 0 0 1 ${-size} ${size * 0.3} Q ${-size} ${-size * 0.2} 0 ${-size * 1.5} Z`} fill={color} />
    <path d={`M ${size * 0.25} ${-size * 0.2} Q ${size * 0.9} ${size * 0.3} ${size * 0.5} ${size}`} stroke={shade} strokeWidth={size * 0.35} fill="none" strokeLinecap="round" />
    <circle cx={-size * 0.35} cy={0} r={size * 0.22} fill="#fff" opacity={0.8} />
  </g>
);

/** Rama de algarrobo que se mece, con hojas y una vaina colgante. */
export const CarobBranch: React.FC<{readonly podOpen: number}> = ({podOpen}) => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame / 18) * 2.5;
  const leaves = [
    [120, 40, -30],
    [200, 70, 20],
    [280, 60, -15],
    [350, 95, 25],
    [420, 90, -20],
    [170, 95, 60],
    [310, 125, 55],
  ];
  return (
    <g transform={`rotate(${sway} 520 0)`}>
      <path d="M 520 -20 Q 400 60 260 70 Q 150 78 60 40" stroke={INK.woodLight} strokeWidth={16} fill="none" strokeLinecap="round" />
      <path d="M 520 -20 Q 400 60 260 70" stroke={INK.wood} strokeWidth={6} fill="none" strokeLinecap="round" />
      {leaves.map(([x, y, rot], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${rot + Math.sin(frame / 12 + i) * 6})`}>
          <ellipse cx={0} cy={0} rx={44} ry={22} fill={i % 2 ? INK.shadow : '#8C7A3A'} />
          <ellipse cx={-6} cy={-4} rx={30} ry={11} fill={INK.light} opacity={0.35} />
          <path d="M -40 0 L 40 0" stroke={INK.deep} strokeWidth={3} />
        </g>
      ))}
      {/* vaina de algarrobo: se abre en dos mitades */}
      <g transform={`translate(260 70) rotate(${Math.sin(frame / 10) * 5})`}>
        <path d="M 0 0 Q 30 80 10 190 Q 0 200 -12 188 Q 6 90 -14 6 Z" fill={INK.wood} transform={`rotate(${-podOpen * 22})`} />
        <path d="M 0 0 Q 36 82 18 192 Q 6 200 -2 186 Q 18 90 -4 6 Z" fill={INK.woodLight} transform={`rotate(${podOpen * 22})`} />
      </g>
    </g>
  );
};

/** Joyero que se abre (tapa con bisagra) — origen de las piezas del cierre. */
export const JewelBox: React.FC<{readonly open: number}> = ({open}) => (
  <g>
    <ellipse cx={0} cy={150} rx={260} ry={22} fill="rgba(0,0,0,.5)" />
    <rect x={-230} y={0} width={460} height={150} rx={18} fill="#1E1A14" />
    <rect x={-230} y={0} width={460} height={34} rx={12} fill="#2B251C" />
    <rect x={-230} y={60} width={460} height={8} fill={INK.mid} />
    <rect x={-20} y={50} width={40} height={30} rx={6} fill={INK.light} />
    <rect x={-210} y={6} width={420} height={26} rx={10} fill="#5B1E1E" opacity={0.9} />
    {/* tapa: gira sobre la bisagra (y = -110). En vista frontal se acorta (cos θ) y al pasar 90° muestra el satén interior */}
    {(() => {
      const c = Math.cos(open * Math.PI * 0.7);
      const inside = c < 0;
      return (
        <g transform={`translate(0 -110) scale(1 ${c === 0 ? 0.001 : c}) translate(0 110)`}>
          <rect x={-236} y={-110} width={472} height={110} rx={18} fill={inside ? '#5B1E1E' : '#2B251C'} />
          {inside ? (
            <rect x={-206} y={-96} width={412} height={82} rx={12} fill="#7E2A2A" />
          ) : (
            <>
              <rect x={-236} y={-14} width={472} height={8} fill={INK.mid} />
              <rect x={-216} y={-100} width={432} height={10} rx={5} fill="#fff" opacity={0.08} />
            </>
          )}
        </g>
      );
    })()}
    <ellipse cx={0} cy={10} rx={200} ry={60} fill="rgba(255,220,140,.45)" opacity={open} style={{filter: 'blur(24px)'}} />
  </g>
);

/** Easing estándar de entrada 2D con anticipación ligera. */
export const backOut = Easing.out(Easing.back(1.7));
