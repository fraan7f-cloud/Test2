import {Composition} from 'remotion';
import {CentroSuizo} from './CentroSuizo';
import {TIMELINE} from './lib/timeline';
import './lib/fonts';

export const RemotionRoot: React.FC = () => {
	return (
		<Composition
			id="CentroSuizo"
			component={CentroSuizo}
			durationInFrames={Math.ceil(TIMELINE.total * 30)}
			fps={30}
			width={1080}
			height={1920}
		/>
	);
};
