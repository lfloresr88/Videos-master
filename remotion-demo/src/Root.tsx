import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { Genesis } from "./Genesis";
import { Cosmos } from "./Cosmos";
import { Travel } from "./Travel";
import { Football } from "./Football/Football";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Showcase15s"
        component={MyComposition}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ gpu: true }}
      />
      <Composition
        id="Genesis15s"
        component={Genesis}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Futbol60s"
        component={Football}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Viaje"
        component={Travel}
        durationInFrames={408}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Cosmos30s"
        component={Cosmos}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
