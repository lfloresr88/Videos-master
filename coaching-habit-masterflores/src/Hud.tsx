import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, POPPINS, W} from './theme';
import {sceneAt} from './data';
import {useEnter} from './anim';

/** Firma en texto (sin isotipo). */
export const Signature: React.FC<{scale?: number}> = ({scale = 1}) => {
  const a = useEnter(0, 30);
  const b = useEnter(6, 30);
  return (
    <div style={{fontFamily: POPPINS, lineHeight: 1, transform: `scale(${scale})`, transformOrigin: 'top left'}}>
      <div style={{...a.style, fontSize: 54, fontWeight: W.extra, color: C.white, letterSpacing: -1}}>Master</div>
      <div style={{...a.style, fontSize: 54, fontWeight: W.extra, color: C.mint, letterSpacing: -1, marginTop: 2}}>
        flores
      </div>
      <div style={{...b.style, fontSize: 21, fontWeight: W.medium, color: C.white, opacity: b.p * 0.85, marginTop: 10}}>
        Aprendizaje en acción
      </div>
    </div>
  );
};

/** Siete círculos numerados. */
export const QuestionDots: React.FC<{size?: number; gap?: number}> = ({size = 58, gap = 12}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {index, local} = sceneAt(frame);
  const current = index - 1; // 0..6 durante las preguntas; -1 intro; 7 outro
  return (
    <div style={{display: 'flex', gap, alignItems: 'center'}}>
      {Array.from({length: 7}, (_, i) => {
        const isCurrent = i === current;
        const seen = i < current;
        const enter = spring({frame: frame - i * 4, fps, config: {damping: 200}});
        const grow = isCurrent ? spring({frame: local, fps, config: {damping: 12, stiffness: 140}}) : 0;
        const pulse = isCurrent ? 0.5 + 0.5 * Math.sin(frame / 8) : 0;
        const s = 1 + 0.28 * grow;
        return (
          <div
            key={i}
            style={{
              width: size,
              height: size,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: POPPINS,
              fontWeight: W.semi,
              fontSize: size * 0.44,
              color: isCurrent ? C.bgC : C.white,
              background: isCurrent ? C.mint : seen ? 'rgba(39,252,170,0.45)' : 'transparent',
              border: isCurrent ? `3px solid ${C.mint}` : `3px solid rgba(255,255,255,${seen ? 0.5 : 0.35})`,
              opacity: enter * (isCurrent ? 1 : seen ? 0.6 : 0.8),
              transform: `translateY(${(1 - enter) * -30}px) scale(${s})`,
              boxShadow: isCurrent ? `0 0 ${18 + pulse * 22}px ${6 + pulse * 6}px rgba(39,252,170,0.55)` : 'none',
              zIndex: isCurrent ? 2 : 1,
            }}
          >
            {i + 1}
          </div>
        );
      })}
    </div>
  );
};
