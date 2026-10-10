import {Composition, Folder} from 'remotion';
import {NodalFinalFilm} from './NodalFinalFilm';
import {AwakeningGenesis} from './scenes/AwakeningGenesis';
import {SurfaceGateway} from './scenes/SurfaceGateway';
import {Descent} from './scenes/Descent';
import {Earthbound} from './scenes/Earthbound';
import {FinalSignal} from './scenes/FinalSignal';
import {FinalLogo} from './scenes/FinalLogo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="NodalFinalFilm" component={NodalFinalFilm}
        durationInFrames={1405} fps={30} width={1920} height={1080} />
      <Folder name="Scenes">
        <Composition id="AwakeningGenesis" component={AwakeningGenesis} durationInFrames={270} fps={30} width={1920} height={1080} />
        <Composition id="SurfaceGateway" component={SurfaceGateway} durationInFrames={285} fps={30} width={1920} height={1080} />
        <Composition id="Descent" component={Descent} durationInFrames={300} fps={30} width={1920} height={1080} />
        <Composition id="Earthbound" component={Earthbound} durationInFrames={285} fps={30} width={1920} height={1080} />
        <Composition id="FinalSignal" component={FinalSignal} durationInFrames={301} fps={30} width={1920} height={1080} />
        <Composition id="FinalLogo" component={FinalLogo} durationInFrames={60} fps={30} width={1920} height={1080} />
      </Folder>
    </>
  );
};
