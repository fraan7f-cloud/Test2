import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  CENTRO_LETTERS,
  Glint,
  LogoStage,
  Part,
  SUIZO_LETTERS,
  clamp,
  easeInOutQuint,
  easeOutExpo,
  parts,
  rand,
} from "./shared";

const GOLD = (pos: number) =>
  `linear-gradient(115deg, #8a6a2f ${pos - 60}%, #e9cf8a ${pos - 25}%, #fff6dc ${pos}%, #d4ae5f ${pos + 25}%, #7a5a24 ${pos + 60}%)`;

const Bokeh: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {new Array(40).fill(0).map((_, i) => {
        const size = 6 + rand(i + 1) * 46;
        const x = rand(i + 11) * 1920;
        const y = ((rand(i + 21) * 1300 - frame * (0.4 + rand(i + 31) * 1.2)) % 1300 + 1300) % 1300 - 110;
        const tw = 0.25 + 0.35 * Math.sin(frame / 14 + i);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(240,205,130,0.9) 0%, rgba(240,205,130,0) 70%)",
              opacity: tw * interpolate(frame, [0, 30], [0, 1], clamp),
              filter: `blur(${size > 30 ? 4 : 1}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/**
 * Intro 3 — "Oro"
 * Partículas doradas, el diamante gira en 3D, las letras se ensamblan
 * desde posiciones dispersas y un reflejo dorado recorre el logo.
 */
export const Intro3Oro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const goldPos = interpolate(frame, [0, durationInFrames], [-40, 160]);
  const gold = GOLD(goldPos);

  const diaP = interpolate(frame, [0.2 * fps, 1.8 * fps], [0, 1], {
    ...clamp,
    easing: easeOutExpo,
  });
  const raysP = interpolate(frame, [1.0 * fps, 2.5 * fps], [0, 1], {
    ...clamp,
    easing: easeInOutQuint,
  });
  const flash = interpolate(
    frame,
    [3.9 * fps, 4.15 * fps, 4.9 * fps],
    [0, 1, 0],
    clamp,
  );
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 0.5 * fps, durationInFrames],
    [1, 0],
    clamp,
  );

  const dc = {
    x: parts.diamond.x + parts.diamond.w / 2,
    y: parts.diamond.y + parts.diamond.h / 2,
  };

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 50% 42%, #1d1a14 0%, #0b0a08 60%, #000 100%)",
        opacity: fadeOut,
      }}
    >
      <Bokeh />
      <LogoStage
        scale={interpolate(frame, [0, durationInFrames], [1.32, 1.46])}
        style={{ translate: "0px 10px" }}
      >
        {/* Light rays behind the diamond */}
        <div
          style={{
            position: "absolute",
            left: dc.x - 450,
            top: dc.y - 450,
            width: 900,
            height: 900,
            borderRadius: "50%",
            background:
              "repeating-conic-gradient(from 0deg, rgba(255,220,150,0.16) 0deg 4deg, transparent 4deg 18deg)",
            WebkitMaskImage:
              "radial-gradient(circle, #000 0%, rgba(0,0,0,0.5) 30%, transparent 65%)",
            maskImage:
              "radial-gradient(circle, #000 0%, rgba(0,0,0,0.5) 30%, transparent 65%)",
            rotate: `${frame * 0.25}deg`,
            opacity: raysP * 0.9,
            scale: String(0.5 + raysP * 0.5),
          }}
        />

        {/* Diamond: 3D spin-in */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            perspective: 800,
            perspectiveOrigin: `${dc.x}px ${dc.y}px`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              transformOrigin: `${dc.x}px ${dc.y}px`,
              transform: `rotateY(${(1 - diaP) * 270}deg) scale(${0.6 + diaP * 0.4})`,
              opacity: interpolate(diaP, [0, 0.25], [0, 1], clamp),
              filter: `drop-shadow(0 0 ${12 + flash * 30}px rgba(255,210,130,${0.35 + flash * 0.5}))`,
            }}
          >
            <Part name="diamond" tint={gold} />
          </div>
        </div>

        {/* CENTRO: letters assemble from scattered positions */}
        {CENTRO_LETTERS.map((name, i) => {
          const start = 1.3 * fps + i * 0.08 * fps;
          const p = interpolate(frame, [start, start + 1.3 * fps], [0, 1], {
            ...clamp,
            easing: easeOutExpo,
          });
          const dx = (rand(i + 101) - 0.5) * 900;
          const dy = (rand(i + 201) - 0.5) * 600;
          const dr = (rand(i + 301) - 0.5) * 120;
          return (
            <Part
              key={name}
              name={name}
              tint={gold}
              style={{
                translate: `${dx * (1 - p)}px ${dy * (1 - p)}px`,
                rotate: `${dr * (1 - p)}deg`,
                scale: String(1 + (1 - p) * 0.8),
                opacity: interpolate(p, [0, 0.35], [0, 1], clamp),
                filter: `blur(${(1 - p) * 14}px)`,
              }}
            />
          );
        })}

        {/* SUIZO: scale + tracking settle */}
        {SUIZO_LETTERS.map((name, i) => {
          const start = 2.4 * fps + i * 0.05 * fps;
          const p = interpolate(frame, [start, start + 1.2 * fps], [0, 1], {
            ...clamp,
            easing: easeOutExpo,
          });
          return (
            <Part
              key={name}
              name={name}
              tint={gold}
              style={{
                translate: `${(i - 2) * 45 * (1 - p)}px ${(1 - p) * 20}px`,
                scale: String(1 + (1 - p) * 0.4),
                opacity: p,
                filter: `blur(${(1 - p) * 10}px)`,
              }}
            />
          );
        })}

        <Glint
          x={dc.x}
          y={parts.diamond.y + 66}
          size={260 * flash}
          opacity={flash}
          rotate={flash * 45}
          color="#fff3d6"
        />
        <Glint
          x={parts.centro.x + parts.centro.w - 20}
          y={parts.centro.y + 18}
          size={90 * flash}
          opacity={flash * 0.9}
          color="#fff3d6"
        />
      </LogoStage>

      {/* Soft flash */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 35%, rgba(255,235,190,0.35), transparent 50%)",
          opacity: flash,
        }}
      />
    </AbsoluteFill>
  );
};
