import React from 'react';
import {Composition} from 'remotion';
import {CoachingHabit} from './CoachingHabit';
import {FPS, TOTAL_FRAMES} from './theme';
import {TOTAL} from './data';

if (TOTAL !== TOTAL_FRAMES) {
  throw new Error(`La duración de las escenas (${TOTAL}) no coincide con 120 s (${TOTAL_FRAMES})`);
}

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="CoachingHabit"
      component={CoachingHabit}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition
      id="CoachingHabitVertical"
      component={CoachingHabit}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
    />
  </>
);
