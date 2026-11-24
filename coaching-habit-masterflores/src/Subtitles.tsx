import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, POPPINS, W} from './theme';
import {useEnter} from './anim';
import {Layout} from './layout';

/** Las palabras se iluminan progresivamente hasta el 85 % de la duración de la escena. */
export const Subtitles: React.FC<{text: string; sceneDuration: number; layout: Layout}> = ({
  text,
  sceneDuration,
  layout,
}) => {
  const frame = useCurrentFrame();
  useVideoConfig();
  const enter = useEnter(8, 40);
  const words = text.split(' ');
  const start = 14;
  const end = sceneDuration * 0.85;
  const step = (end - start) / words.length;
  const {subs} = layout;

  return (
    <div
      style={{
        position: 'absolute',
        left: subs.left,
        width: subs.width,
        bottom: subs.bottom,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          ...enter.style,
          background: 'rgba(4,42,102,0.78)',
          borderRadius: 32,
          padding: '20px 34px',
          fontFamily: POPPINS,
          fontWeight: W.regular,
          fontSize: subs.font,
          lineHeight: 1.35,
          color: C.white,
          textAlign: 'center',
        }}
      >
        {words.map((w, i) => {
          const t = start + i * step;
          const lit = interpolate(frame, [t, t + 5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return (
            <span key={i} style={{opacity: 0.32 + 0.68 * lit}}>
              {w}{' '}
            </span>
          );
        })}
      </div>
    </div>
  );
};
