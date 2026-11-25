import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import {
  SceneCompare,
  SceneHook,
  SceneKarat,
  SceneKarats,
  SceneOutro,
  SceneSeed,
} from "./scenes";
import { Background, clamp, LogoFooter, ProgressBar } from "./theme";

// Inicio de cada escena en frames (30 fps). Total 1500 = 50 s.
const STARTS = [0, 150, 330, 510, 690, 840, 990, 1200, 1350];
const TOTAL = 1500;

const Chrome: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [10, 30, 1335, 1350], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <ProgressBar starts={STARTS} total={TOTAL} />
      <LogoFooter />
    </AbsoluteFill>
  );
};

export const OroQuilates: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Background />
      <Sequence name="1 · Gancho" from={0} durationInFrames={5 * fps}>
        <SceneHook dur={5 * fps} />
      </Sequence>
      <Sequence name="2 · Qué es un quilate" from={5 * fps} durationInFrames={6 * fps}>
        <SceneKarat dur={6 * fps} />
      </Sequence>
      <Sequence name="3 · 24k" from={11 * fps} durationInFrames={6 * fps}>
        <SceneKarats
          dur={6 * fps}
          k="24"
          pct={99.9}
          pctLabel="99,9 %"
          hallmark="999"
          pills={["oro puro", "blando"]}
          caption={"*24k* es casi oro puro…\ny tan *blando* que se raya."}
          bar
        />
      </Sequence>
      <Sequence name="4 · 18k" from={17 * fps} durationInFrames={6 * fps}>
        <SceneKarats
          dur={6 * fps}
          k="18"
          pct={75}
          pctLabel="75 %"
          hallmark="750"
          pills={["+ plata", "+ cobre"]}
          caption={"*18k:* brillo intenso\ny *resistencia* de por vida."}
        />
      </Sequence>
      <Sequence name="5 · 14k" from={23 * fps} durationInFrames={5 * fps}>
        <SceneKarats
          dur={5 * fps}
          k="14"
          pct={58.3}
          pctLabel="58,3 %"
          hallmark="585"
          pills={["más duro", "más pálido"]}
          caption={"*14k:* más duro,\npero de tono más *pálido.*"}
        />
      </Sequence>
      <Sequence name="6 · 10k" from={28 * fps} durationInFrames={5 * fps}>
        <SceneKarats
          dur={5 * fps}
          k="10"
          pct={41.7}
          pctLabel="41,7 %"
          hallmark="417"
          pills={["menos oro"]}
          caption={"*10k:* menos de la *mitad*\nes oro."}
        />
      </Sequence>
      <Sequence name="7 · Comparación y sello" from={33 * fps} durationInFrames={7 * fps}>
        <SceneCompare dur={7 * fps} />
      </Sequence>
      <Sequence name="8 · Dato quilate" from={40 * fps} durationInFrames={5 * fps}>
        <SceneSeed dur={5 * fps} />
      </Sequence>
      <Sequence name="9 · Cierre" from={45 * fps} durationInFrames={5 * fps}>
        <SceneOutro dur={5 * fps} />
      </Sequence>
      <Chrome />
      <Audio name="Música original" src={staticFile("music.wav")} />
    </AbsoluteFill>
  );
};
