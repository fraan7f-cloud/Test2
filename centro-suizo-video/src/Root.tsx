import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import { FPS, TOTAL } from "./timing";

export const RemotionRoot: React.FC = () => (
  <Composition id="CentroSuizo" component={Main} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
);
