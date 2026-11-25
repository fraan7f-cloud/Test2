import React from 'react';
import {Composition} from 'remotion';
import {CentroSuizo18K} from './CentroSuizo18K';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="CentroSuizo18K"
    component={CentroSuizo18K}
    durationInFrames={1500}
    fps={30}
    width={1080}
    height={1920}
  />
);
