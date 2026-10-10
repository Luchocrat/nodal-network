import {Audio} from '@remotion/media';
import {staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {audioFiles, timeline} from './timeline';
import {ambienceEnvelope} from './transitions';

export const AudioTimeline = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <>
    <Audio name="Awakening and genesis ambience" src={staticFile(audioFiles.awakeningGenesis)}
      from={timeline.awakeningGenesis.from} durationInFrames={270} trimBefore={0} premountFor={fps}
      volume={ambienceEnvelope(frame, 0, 270, fps)} />
    <Audio name="Surface gateway ambience" src={staticFile(audioFiles.gateway)}
      from={timeline.gateway.from} durationInFrames={285} trimBefore={0.5 * fps} premountFor={fps}
      volume={ambienceEnvelope(frame, 264, 285, fps, 0.2, 0.9)} />
    <Audio name="Descent ambience" src={staticFile(audioFiles.descent)}
      from={timeline.descent.from} durationInFrames={300} trimBefore={0} premountFor={fps}
      volume={ambienceEnvelope(frame, 522, 300, fps, 0.9, 1.1)} />
    <Audio name="Earthbound ambience" src={staticFile(audioFiles.earthbound)}
      from={timeline.earthbound.from} durationInFrames={285} trimBefore={0} premountFor={fps}
      volume={ambienceEnvelope(frame, 789, 285, fps, 1.1, 1)} />
    <Audio name="Final signal fades to silence before logo" src={staticFile(audioFiles.signal)}
      from={timeline.signal.from} durationInFrames={246} trimBefore={0} premountFor={fps}
      volume={ambienceEnvelope(frame, 1044, 246, fps, 1, 0.5)} />
  </>;
};
