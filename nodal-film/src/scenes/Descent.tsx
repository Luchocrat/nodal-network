import {Video} from '@remotion/media';
import {staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {incomingDissolve} from '../transitions';
import {videoStyle} from '../video-style';

export const Descent = () => {
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  return <Video name="ATOL to connected underwater network" src={staticFile('clips/Nodal_4.mp4')}
    trimBefore={0} durationInFrames={10 * fps} premountFor={fps}
    muted objectFit="contain" style={{...videoStyle, opacity: incomingDissolve(frame, fps, 0.9)}} />;
};
