import {Audio} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, Sequence, staticFile, useVideoConfig} from 'remotion';
import {Background} from './components/Background';
import {Captions} from './components/Captions';
import {BranchFooter, CutFlashes} from './components/Fx';
import {LogoBug} from './components/LogoBug';
import {EXIT} from './components/SceneShell';
import {SceneId, scene} from './lib/timeline';
import {Intro} from './scenes/Intro';
import {Dinero, Estuche, Luz, Tamano} from './scenes/PartA';
import {Color, Pureza, Talla, Truco} from './scenes/PartB';
import {Brilla, Cta, Historia, Outro} from './scenes/PartC';

const SceneSeq: React.FC<{id: SceneId; Comp: React.FC<{start: number; end: number}>}> = ({id, Comp}) => {
	const {fps, durationInFrames} = useVideoConfig();
	const s = scene(id);
	const from = Math.round(s.start * fps);
	const dur = Math.min(durationInFrames - from, Math.round((s.end - s.start + EXIT) * fps));
	return (
		<Sequence name={id} from={from} durationInFrames={dur} premountFor={fps}>
			<Comp start={from / fps} end={s.end} />
		</Sequence>
	);
};

export const CentroSuizo: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: '#05071c', overflow: 'hidden'}}>
			<Background />
			<SceneSeq id="intro" Comp={Intro} />
			<SceneSeq id="estuche" Comp={Estuche} />
			<SceneSeq id="tamano" Comp={Tamano} />
			<SceneSeq id="luz" Comp={Luz} />
			<SceneSeq id="dinero" Comp={Dinero} />
			<SceneSeq id="color" Comp={Color} />
			<SceneSeq id="pureza" Comp={Pureza} />
			<SceneSeq id="truco" Comp={Truco} />
			<SceneSeq id="talla" Comp={Talla} />
			<SceneSeq id="brilla" Comp={Brilla} />
			<SceneSeq id="cta" Comp={Cta} />
			<SceneSeq id="historia" Comp={Historia} />
			<SceneSeq id="outro" Comp={Outro} />
			<CutFlashes />
			<Captions />
			<LogoBug />
			<BranchFooter />
			<Audio name="Mezcla final" src={staticFile('audio/master.wav')} />
		</AbsoluteFill>
	);
};
