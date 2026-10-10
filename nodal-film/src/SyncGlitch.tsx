import {Video} from '@remotion/media';
import {AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

/** Six-frame synchronization accent, placed at film frame 802 by its parent. */
export const SyncGlitch = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const visible = frame === 1 || frame === 2 || frame === 4;
  const upperShift = frame === 1 ? -6 : frame === 2 ? 8 : -3;
  const lowerShift = frame === 1 ? 4 : frame === 2 ? -5 : 2;

  // Earthbound starts at film frame 789: 802 - 789 = 13 frames of source offset.
  const sourceTrim = (13 / 30) * fps;
  const bands = [
    {clipPath: 'inset(34% 0 57% 0)', shift: upperShift},
    {clipPath: 'inset(63% 0 31% 0)', shift: lowerShift},
  ];

  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: visible ? 0.72 : 0}}>
      {bands.map(({clipPath, shift}) => (
        <AbsoluteFill key={clipPath} style={{clipPath}}>
          <Video
            src={staticFile('clips/Nodal_5.mp4')}
            trimBefore={sourceTrim}
            durationInFrames={6}
            premountFor={fps}
            muted
            objectFit="contain"
            style={{width: '100%', height: '100%', transform: `translateX(${shift}px)`}}
          />
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};
