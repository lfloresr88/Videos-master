import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

/** Entrada: sube desde abajo con opacidad y spring (damping 200), escalonada por `delay` frames. */
export function useEnter(delay = 0, distance = 60) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 200}});
  return {
    p,
    style: {
      opacity: p,
      transform: `translateY(${(1 - p) * distance}px)`,
    } as const,
  };
}

/** Fundido de salida en los últimos 0.4 s de la escena. */
export function useSceneFade(durationInFrames: number) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fade = Math.round(0.4 * fps);
  return interpolate(frame, [durationInFrames - fade, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}
