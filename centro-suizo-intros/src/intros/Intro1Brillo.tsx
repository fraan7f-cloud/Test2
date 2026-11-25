import React from "react";
import {
  AbsoluteFill,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  CENTRO_LETTERS,
  DiamondStrokes,
  Glint,
  LogoStage,
  Part,
  SUIZO_LETTERS,
  clamp,
  easeInOutQuint,
  easeOutExpo,
  parts,
} from "./shared";

/**
 * Intro 1 — "Brillo"
 * El diamante se dibuja trazo a trazo, las letras emergen desde una máscara
 * y un barrido de luz recorre el logo antes del destello final.
 */
export const Intro1Brillo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const drawP = interpolate(frame, [0.1 * fps, 1.7 * fps], [0, 1], clamp);
  const strokeToFill = interpolate(frame, [1.5 * fps, 2.1 * fps], [0, 1], {
    ...clamp,
    easing: easeInOutQuint,
  });

  const shineX = interpolate(frame, [3.4 * fps, 4.4 * fps], [-40, 140], {
    ...clamp,
    easing: easeInOutQuint,
  });

  const glintP = interpolate(
    frame,
    [4.1 * fps, 4.45 * fps, 5.1 * fps],
    [0, 1, 0],
    { ...clamp, easing: easeOutExpo },
  );

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 0.5 * fps, durationInFrames],
    [1, 0],
    clamp,
  );

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 50% 45%, #26262b 0%, #101013 55%, #050506 100%)",
        opacity: fadeOut,
      }}
    >
      <LogoStage
        scale={interpolate(frame, [0, durationInFrames], [1.38, 1.5])}
        style={{ translate: "0px 10px" }}
      >
        {/* Diamond: strokes → real artwork */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            scale: String(
              interpolate(frame, [0, 2.2 * fps], [0.88, 1], {
                ...clamp,
                easing: easeOutExpo,
              }),
            ),
            transformOrigin: `${parts.diamond.x + parts.diamond.w / 2}px ${parts.diamond.y + parts.diamond.h / 2}px`,
          }}
        >
          <DiamondStrokes
            progress={drawP}
            style={{ opacity: 1 - strokeToFill }}
          />
          <Part
            name="diamond"
            style={{
              opacity: strokeToFill,
              filter: `blur(${(1 - strokeToFill) * 6}px)`,
            }}
          />
        </div>

        {/* CENTRO: letters rise out of a mask */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: parts.centro.y - 4,
            width: "100%",
            height: parts.centro.h + 8,
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", left: 0, top: -(parts.centro.y - 4) }}>
            {CENTRO_LETTERS.map((name, i) => {
              const start = 1.6 * fps + i * 0.09 * fps;
              const p = interpolate(frame, [start, start + 0.9 * fps], [0, 1], {
                ...clamp,
                easing: easeOutExpo,
              });
              return (
                <Part
                  key={name}
                  name={name}
                  style={{
                    translate: `0px ${(1 - p) * 160}px`,
                    rotate: `${(1 - p) * 8}deg`,
                    filter: `blur(${(1 - p) * 8}px)`,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* SUIZO: tracking in from center */}
        {SUIZO_LETTERS.map((name, i) => {
          const start = 2.5 * fps + i * 0.06 * fps;
          const p = interpolate(frame, [start, start + 1.1 * fps], [0, 1], {
            ...clamp,
            easing: easeOutExpo,
          });
          const offset = (i - 2) * 60 * (1 - p);
          return (
            <Part
              key={name}
              name={name}
              style={{
                opacity: p,
                translate: `${offset}px 0px`,
                filter: `blur(${(1 - p) * 10}px)`,
              }}
            />
          );
        })}

        {/* Light sweep masked by the full logo */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(105deg, transparent ${shineX - 18}%, rgba(255,240,210,0.95) ${shineX}%, transparent ${shineX + 18}%)`,
            WebkitMaskImage: `url(${staticFile("logo/full.png")})`,
            maskImage: `url(${staticFile("logo/full.png")})`,
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
            mixBlendMode: "screen",
          }}
        />

        <Glint
          x={parts.diamond.x + 205}
          y={parts.diamond.y + 62}
          size={120 * glintP}
          opacity={glintP}
          rotate={glintP * 90}
        />
        <Glint
          x={parts.diamond.x + 44}
          y={parts.diamond.y + 13}
          size={70 * glintP}
          opacity={glintP * 0.8}
          rotate={-glintP * 60}
        />
      </LogoStage>
    </AbsoluteFill>
  );
};
