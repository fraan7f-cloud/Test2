import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Captions } from "./Captions";
import { Intro } from "./Intro";
import { LogoLayer } from "./Logo";
import { OutroBranches, OutroLogo, OutroMessage, Tracker } from "./Outro";
import { Cta, Hook, SceneWrap, ShapeScene, TransType } from "./Scenes";
import { INTRO, OUTRO, OUTRO_PARTS, s2f, SCENES, TRANS } from "./timing";
import { Shape } from "./Gem";

const SHAPE_CFG: Record<string, { num: number; tags: [string, number][]; fx: any; fxAt: number }> = {
  round: { num: 1, tags: [["CLÁSICA", 11.0], ["SEGURA", 12.02], ["SABE LO QUE QUIERE", 12.84], ["LA QUE MÁS BRILLA", 15.4]], fx: "shine", fxAt: 16.5 },
  oval: { num: 2, tags: [["ELEGANTE", 19.3], ["CON UN TRUCO", 20.34], ["ALARGA LA MANO", 21.82]], fx: "stretch", fxAt: 22.44 },
  pear: { num: 3, tags: [["ROMÁNTICA", 26.14], ["ÚNICA", 27.92]], fx: "hearts", fxAt: 26.14 },
  emerald: { num: 4, tags: [["SOBRIA", 31.5], ["DE BUEN GUSTO", 32.46], ["ELEGANCIA NATURAL", 33.56]], fx: "spotlight", fxAt: 33.42 },
  marquise: { num: 5, tags: [["LA ATREVIDA", 38.08], ["¡DE MODA!", 39.62]], fx: "speed", fxAt: 38.08 },
  cushion: { num: 6, tags: [["LA DE LAS ABUELAS", 43.32], ["¡ESTÁ REGRESANDO!", 45.38], ["NO SIGUE MODAS", 46.84], ["LAS HACE VOLVER", 48.62]], fx: "vintage", fxAt: 43.02 },
};
const TRANS_SEQ: TransType[] = ["zoom", "whip", "spin", "whip", "zoom", "whip", "spin", "zoom", "whip", "zoom", "zoom"];

export const Main: React.FC = () => {
  const reveals = SCENES.filter((s) => "reveal" in s).map((s) => s2f((s as { reveal: number }).reveal));
  const O = [OUTRO, OUTRO + OUTRO_PARTS[0], OUTRO + OUTRO_PARTS[0] + OUTRO_PARTS[1]];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sequence durationInFrames={INTRO + TRANS} name="Intro"><Intro /></Sequence>
      {SCENES.map((sc, i) => {
        const from = s2f(sc.start);
        const isLast = i === SCENES.length - 1;
        const to = isLast ? OUTRO : s2f(sc.end);
        const dur = to - from + TRANS;
        const cfg = SHAPE_CFG[sc.id];
        return (
          <Sequence key={sc.id} from={from} durationInFrames={dur} name={sc.id}>
            <SceneWrap id={sc.id} dur={dur} enter={TRANS_SEQ[i]} exit={TRANS_SEQ[i + 1]}>
              {sc.id === "hook" ? <Hook from={from} /> : sc.id === "cta" ? <Cta from={from} /> : (
                <ShapeScene from={from} num={cfg.num} shape={sc.id as Shape} pal={sc.id} reveal={(sc as { reveal: number }).reveal} tags={cfg.tags} fx={cfg.fx} fxAt={cfg.fxAt} end={sc.end} />
              )}
            </SceneWrap>
          </Sequence>
        );
      })}
      <Sequence from={O[0]} durationInFrames={OUTRO_PARTS[0] + TRANS} name="Outro frase">
        <SceneWrap id="o1" dur={OUTRO_PARTS[0] + TRANS} enter={TRANS_SEQ[8]} exit="zoom"><OutroMessage /></SceneWrap>
      </Sequence>
      <Sequence from={O[1]} durationInFrames={OUTRO_PARTS[1] + TRANS} name="Sucursales">
        <SceneWrap id="o2" dur={OUTRO_PARTS[1] + TRANS} enter="zoom" exit="zoom"><OutroBranches /></SceneWrap>
      </Sequence>
      <Sequence from={O[2]} durationInFrames={OUTRO_PARTS[2]} name="Logo final">
        <SceneWrap id="o3" dur={OUTRO_PARTS[2]} enter="zoom" exit={null}><OutroLogo /></SceneWrap>
      </Sequence>
      <Tracker reveals={reveals} show={[s2f(7.7) + 4, s2f(49.75) + 6]} />
      <Captions />
      <LogoLayer />
      <Sequence from={INTRO} name="Voz"><Audio src={staticFile("voz.wav")} /></Sequence>
      <Audio src={staticFile("musica.wav")} name="Música y efectos" />
    </AbsoluteFill>
  );
};
