import {Video} from '@remotion/media';
import {staticFile, useVideoConfig} from 'remotion';
import {videoStyle} from '../video-style';

export const AwakeningGenesis = () => {
  const {fps} = useVideoConfig();
  return <Video name="RIDGE activation and coral growth" src={staticFile('clips/Nodal_1.mp4')}
    trimBefore={0} durationInFrames={9 * fps} premountFor={fps}
    muted objectFit="contain" style={videoStyle} />;
};
