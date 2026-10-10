import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {AudioTimeline} from './AudioTimeline';
import {timeline} from './timeline';
import {AwakeningGenesis} from './scenes/AwakeningGenesis';
import {SurfaceGateway} from './scenes/SurfaceGateway';
import {Descent} from './scenes/Descent';
import {Earthbound} from './scenes/Earthbound';
import {FinalSignal} from './scenes/FinalSignal';
import {FinalLogo} from './scenes/FinalLogo';
import {SyncGlitch} from './SyncGlitch';

export const NodalFinalFilm = () => {
  const {fps} = useVideoConfig();
  return <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Sequence name="01–02 The Awakening / The Genesis" from={timeline.awakeningGenesis.from}
      durationInFrames={270} premountFor={fps}><AwakeningGenesis /></Sequence>
    <Sequence name="03 The Surface Gateway" from={timeline.gateway.from}
      durationInFrames={285} premountFor={fps}><SurfaceGateway /></Sequence>
    <Sequence name="04 The Descent" from={timeline.descent.from}
      durationInFrames={300} premountFor={fps}><Descent /></Sequence>
    <Sequence name="05 Earthbound" from={timeline.earthbound.from}
      durationInFrames={285} premountFor={fps}><Earthbound /></Sequence>
    <Sequence name="06 The Final Signal" from={timeline.signal.from}
      durationInFrames={301} premountFor={fps}><FinalSignal /></Sequence>
    <Sequence name="Final frame · two seconds of silence" from={timeline.logo.from}
      durationInFrames={60} premountFor={fps}><FinalLogo /></Sequence>
    <Sequence name="Brief network synchronization glitch" from={802}
      durationInFrames={6} premountFor={fps}><SyncGlitch /></Sequence>
    <AudioTimeline />
  </AbsoluteFill>;
};
