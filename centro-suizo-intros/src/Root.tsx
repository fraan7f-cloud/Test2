import { Composition, Folder } from "remotion";
import { Intro1Brillo } from "./intros/Intro1Brillo";
import { Intro2Suiza } from "./intros/Intro2Suiza";
import { Intro3Oro } from "./intros/Intro3Oro";

export const RemotionRoot: React.FC = () => {
  return (
    <Folder name="CentroSuizo">
      <Composition
        id="Intro1-Brillo"
        component={Intro1Brillo}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Intro2-Suiza"
        component={Intro2Suiza}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Intro3-Oro"
        component={Intro3Oro}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
    </Folder>
  );
};
