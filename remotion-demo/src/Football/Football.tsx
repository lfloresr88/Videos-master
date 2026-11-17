import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { fade } from "@remotion/transitions/fade";
import { iris } from "@remotion/transitions/iris";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { clamp, GOLD, LIME, NIGHT } from "./common";
import { Goal, Play, Tunnel } from "./ScenesA";
import { Network, Numbers, Timeline } from "./ScenesB";
import { Crowd, Finale } from "./ScenesC";

const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        bottom: 0,
        height: 10,
        width: `${(frame / durationInFrames) * 100}%`,
        background: `linear-gradient(90deg, ${LIME}, ${GOLD})`,
      }}
    />
  );
};

export const Football: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const T = linearTiming({
    durationInFrames: 12,
    easing: Easing.bezier(0.7, 0, 0.3, 1),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: NIGHT }}>
      <TransitionSeries>
        <TransitionSeries.Sequence name="Túnel" durationInFrames={190}>
          <Tunnel />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={T}
        />
        <TransitionSeries.Sequence name="Jugada" durationInFrames={250}>
          <Play />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={T} />
        <TransitionSeries.Sequence name="Gol" durationInFrames={250}>
          <Goal />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={T}
        />
        <TransitionSeries.Sequence name="Números" durationInFrames={250}>
          <Numbers />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={clockWipe({ width: 1920, height: 1080 })}
          timing={T}
        />
        <TransitionSeries.Sequence name="Mapa" durationInFrames={250}>
          <Network />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={T}
        />
        <TransitionSeries.Sequence name="Cronología" durationInFrames={250}>
          <Timeline />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={iris({ width: 1920, height: 1080 })}
          timing={T}
        />
        <TransitionSeries.Sequence name="Afición" durationInFrames={250}>
          <Crowd />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={T} />
        <TransitionSeries.Sequence name="Final" durationInFrames={194}>
          <Finale />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Audio
        src={staticFile("football.mp3")}
        volume={interpolate(
          frame,
          [0, 15, durationInFrames - 60, durationInFrames - 6],
          [0, 1, 1, 0],
          clamp,
        )}
      />
      <ProgressBar />
    </AbsoluteFill>
  );
};
