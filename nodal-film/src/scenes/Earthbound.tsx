import {Video} from '@remotion/media';
import {staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {incomingDissolve} from '../transitions';
import {videoStyle} from '../video-style';

export const Earthbound = () => {
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  return <Video name="Marine network to conceptual Florida orbital view" src={staticFile('clips/Nodal_5.mp4')}
    trimBefore={0} durationInFrames={9.5 * fps} premountFor={fps}
    muted objectFit="contain" style={{...videoStyle, opacity: incomingDissolve(frame, fps, 1.1)}} />;
};
