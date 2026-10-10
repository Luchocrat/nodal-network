import {Video} from '@remotion/media';
import {staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {incomingDissolve} from '../transitions';
import {videoStyle} from '../video-style';

export const FinalSignal = () => {
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  return <Video name="Earth to final NODAL signal" src={staticFile('clips/Nodal_6.mp4')}
    trimBefore={0} durationInFrames={301} premountFor={fps}
    muted objectFit="contain" style={{...videoStyle, opacity: incomingDissolve(frame, fps, 1)}} />;
};
