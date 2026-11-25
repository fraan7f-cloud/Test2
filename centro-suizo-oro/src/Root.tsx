import { Composition } from "remotion";
import { OroQuilates } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="CentroSuizoQuilates"
      component={OroQuilates}
      durationInFrames={1500}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
