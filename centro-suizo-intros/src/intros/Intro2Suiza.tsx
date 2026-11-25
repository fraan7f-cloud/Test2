import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  CENTRO_LETTERS,
  LogoStage,
  Part,
  clamp,
  easeInExpo,
  easeInOutQuint,
  easeOutBack,
  easeOutExpo,
  parts,
} from "./shared";

const SWISS_RED = "#D52B1E";

/**
 * Intro 2 — "Suiza"
 * Una cruz suiza gira y crece hasta llenar la pantalla, un iris oscuro
 * se abre desde el centro y el logo se arma con volteos 3D.
 */
export const Intro2Suiza: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const crossIn = interpolate(frame, [0, 0.8 * fps], [0, 1], {
    ...clamp,
    easing: easeOutBack,
  });
  const crossGrow = interpolate(frame, [1.0 * fps, 1.7 * fps], [1, 40], {
    ...clamp,
    easing: easeInExpo,
  });
  const iris = interpolate(frame, [1.55 * fps, 2.4 * fps], [0, 120], {
    ...clamp,
    easing: easeInOutQuint,
  });

  const lineP = interpolate(frame, [3.3 * fps, 4.2 * fps], [0, 1], {
    ...clamp,
    easing: easeInOutQuint,
  });

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 0.5 * fps, durationInFrames],
    [1, 0],
    clamp,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", opacity: fadeOut }}>
      {/* Swiss flag phase */}
      <AbsoluteFill style={{ backgroundColor: SWISS_RED }}>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 300,
            height: 300,
            marginLeft: -150,
            marginTop: -150,
            scale: String(crossIn * crossGrow),
            rotate: `${(1 - crossIn) * -180}deg`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 100,
              top: 0,
              width: 100,
              height: 300,
              background: "#fff",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 100,
              width: 300,
              height: 100,
              background: "#fff",
            }}
          />
        </div>
      </AbsoluteFill>

      {/* Dark iris with the logo */}
      <AbsoluteFill
        style={{
          clipPath: `circle(${iris}% at 50% 50%)`,
          background:
            "radial-gradient(ellipse at 50% 40%, #1c1c20 0%, #0a0a0c 70%)",
        }}
      >
        <LogoStage
          scale={interpolate(frame, [1.6 * fps, durationInFrames], [1.55, 1.42], {
            ...clamp,
            easing: easeOutExpo,
          })}
          style={{ perspective: 900 }}
        >
          {/* Diamond drops in with an overshoot */}
          <Part
            name="diamond"
            style={{
              translate: `0px ${interpolate(frame, [2.0 * fps, 2.9 * fps], [-260, 0], { ...clamp, easing: easeOutBack })}px`,
              rotate: `${interpolate(frame, [2.0 * fps, 2.9 * fps], [-25, 0], { ...clamp, easing: easeOutBack })}deg`,
              opacity: interpolate(frame, [2.0 * fps, 2.3 * fps], [0, 1], clamp),
            }}
          />

          {/* CENTRO: 3D flip per letter */}
          {CENTRO_LETTERS.map((name, i) => {
            const start = 2.35 * fps + i * 0.07 * fps;
            const p = interpolate(frame, [start, start + 0.8 * fps], [0, 1], {
              ...clamp,
              easing: easeOutExpo,
            });
            return (
              <Part
                key={name}
                name={name}
                style={{
                  opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
                  transform: `rotateX(${(1 - p) * -95}deg)`,
                  transformOrigin: "50% 100%",
                  translate: `0px ${(1 - p) * 30}px`,
                }}
              />
            );
          })}

          {/* SUIZO: horizontal wipe */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath: `inset(0 ${interpolate(frame, [3.0 * fps, 3.8 * fps], [100, 0], { ...clamp, easing: easeInOutQuint })}% 0 0)`,
            }}
          >
            <Part name="suizo" />
          </div>

          {/* Swiss-red accent lines framing SUIZO */}
          {[-1, 1].map((side) => {
            const y = parts.suizo.y + parts.suizo.h * 0.62;
            const len = 70 * lineP;
            const gap = 22;
            const edge =
              side < 0 ? parts.suizo.x - gap : parts.suizo.x + parts.suizo.w + gap;
            return (
              <div
                key={side}
                style={{
                  position: "absolute",
                  top: y - 2,
                  height: 4,
                  width: len,
                  left: side < 0 ? edge - len : edge,
                  background: SWISS_RED,
                  borderRadius: 2,
                }}
              />
            );
          })}
        </LogoStage>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
