import {Video} from '@remotion/media';
import {staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {incomingDissolve} from '../transitions';
import {videoStyle} from '../video-style';

export const SurfaceGateway = () => {
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  return <Video name="RIDGE to deployed ATOL" src={staticFile('clips/Nodal_2.mp4')}
    trimBefore={0.5 * fps} durationInFrames={9.5 * fps} premountFor={fps}
    muted objectFit="contain" style={{...videoStyle, opacity: incomingDissolve(frame, fps)}} />;
};
