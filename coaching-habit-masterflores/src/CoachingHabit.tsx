import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background, FloatingQuestions, ProgressBar} from './Background';
import {Avatar} from './Avatar';
import {SceneBody, Subtitles} from './SceneBodies';
import {QuestionDots, Signature} from './Hud';
import {DURATIONS, SCENES, SCENE_STARTS, sceneAt} from './scenes';
import {MUSIC_VOLUME, VOICE_FILE} from './brand';
import {useSceneFade} from './anim';
import {getLayout} from './layout';

/** Contenido de una escena: entra escalonado y se desvanece en los últimos 0.4 s. */
const SceneLayer: React.FC<{i: number}> = ({i}) => {
  const {width, height} = useVideoConfig();
  const layout = getLayout(width, height);
  const scene = SCENES[i];
  const opacity = useSceneFade(DURATIONS[i]);
  return (
    <AbsoluteFill style={{opacity}}>
      <SceneBody scene={scene} layout={layout} />
      <Subtitles text={scene.narration} sceneDuration={DURATIONS[i]} layout={layout} />
    </AbsoluteFill>
  );
};

export const CoachingHabit: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const layout = getLayout(width, height);
  const {local, scene, duration} = sceneAt(frame);

  return (
    <AbsoluteFill>
      <Audio src={staticFile('music.mp3')} volume={MUSIC_VOLUME} />
      {VOICE_FILE && <Audio src={staticFile(VOICE_FILE)} />}

      <Background />
      <FloatingQuestions />

      {SCENES.map((_s, i) => (
        <Sequence key={i} from={SCENE_STARTS[i]} durationInFrames={DURATIONS[i]}>
          <SceneLayer i={i} />
        </Sequence>
      ))}

      <div style={{position: 'absolute', left: layout.avatarLeft, bottom: 0}}>
        <Avatar width={layout.avatarW} local={local} sceneDuration={duration} bubble={scene.bubble} />
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
