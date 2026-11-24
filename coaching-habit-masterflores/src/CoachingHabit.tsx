import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background, FloatingQuestions, ProgressBar} from './Background';
import {Avatar} from './Avatar';
import {Content} from './Content';
import {Subtitles} from './Subtitles';
import {QuestionDots, Signature} from './Hud';
import {SCENES, SCENE_STARTS, sceneAt} from './data';
import {useSceneFade} from './anim';
import {getLayout} from './layout';

const SceneLayer: React.FC<{i: number}> = ({i}) => {
  const {width, height} = useVideoConfig();
  const layout = getLayout(width, height);
  const scene = SCENES[i];
  const opacity = useSceneFade(scene.durationInFrames);
  return (
    <AbsoluteFill style={{opacity}}>
      <Content scene={scene} layout={layout} />
      <Subtitles text={scene.narration} sceneDuration={scene.durationInFrames} layout={layout} />
    </AbsoluteFill>
  );
};

export const CoachingHabit: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const layout = getLayout(width, height);
  const {local, scene} = sceneAt(frame);

  return (
    <AbsoluteFill>
      <Background />
      <FloatingQuestions />

      {SCENES.map((s, i) => (
        <Sequence key={i} from={SCENE_STARTS[i]} durationInFrames={s.durationInFrames}>
          <SceneLayer i={i} />
        </Sequence>
      ))}

      <div style={{position: 'absolute', left: layout.avatarLeft, bottom: 0}}>
        <Avatar width={layout.avatarW} local={local} sceneDuration={scene.durationInFrames} bubble={scene.bubble} />
      </div>

      <div style={{position: 'absolute', top: layout.sigTop, left: layout.sigLeft}}>
        <Signature scale={layout.vertical ? 0.85 : 1} />
      </div>
      <div style={{position: 'absolute', top: layout.dots.top, right: layout.dots.right}}>
        <QuestionDots size={layout.dots.size} gap={layout.dots.gap} />
      </div>

      <ProgressBar />
    </AbsoluteFill>
  );
};
