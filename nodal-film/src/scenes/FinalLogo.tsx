import {Video} from '@remotion/media';
import {Freeze, staticFile, useVideoConfig} from 'remotion';
import {videoStyle} from '../video-style';

// User approved Nodal_6's exact last frame instead of LogoPage.png.
// 241 source frames at 24 fps: source frame 240 begins at exactly 10 seconds.
export const FinalLogo = () => {
  const {fps} = useVideoConfig();
  return <Freeze frame={0}>
    <Video name="Approved final frame held in silence" src={staticFile('clips/Nodal_6.mp4')}
      trimBefore={10 * fps} premountFor={fps} muted objectFit="contain" style={videoStyle} />
  </Freeze>;
};
