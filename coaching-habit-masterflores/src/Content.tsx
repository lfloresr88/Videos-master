import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, POPPINS, W} from './theme';
import {RECAP, Scene} from './data';
import {useEnter} from './anim';
import {Layout} from './layout';

const Word: React.FC<{text: string; delay: number; color: string; size: number}> = ({text, delay, color, size}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 200}});
  return (
    <span
      style={{
        display: 'inline-block',
        marginRight: size * 0.26,
        opacity: p,
        transform: `translateY(${(1 - p) * 50}px)`,
        color,
      }}
    >
      {text}
    </span>
  );
};

export const Content: React.FC<{scene: Scene; layout: Layout}> = ({scene, layout}) => {
  const words = scene.title.split(' ');
  const len = scene.title.length;
  const base = len <= 14 ? 124 : len <= 24 ? 104 : len <= 40 ? 88 : 76;
  const size = Math.round(base * layout.titleScale);
  const step = 6;
  const titleStart = 16;
  const titleEnd = titleStart + words.length * step;

  const label = useEnter(2, 40);
  const sub = useEnter(titleEnd + 6, 40);
  const extra = useEnter(titleEnd + 16, 40);
  const {content} = layout;

  const labelText =
    scene.kind === 'question' ? `Pregunta ${scene.n} de 7 · ${scene.label}` : scene.label;

  return (
    <div
      style={{
        position: 'absolute',
        left: content.left,
        top: content.top,
        width: content.width,
        height: content.height,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        fontFamily: POPPINS,
      }}
    >
      <div
        style={{
          ...label.style,
          alignSelf: 'flex-start',
          fontWeight: W.medium,
          fontSize: layout.vertical ? 28 : 30,
          color: C.mint,
          border: `2px solid ${C.mint}`,
          borderRadius: 999,
          padding: '8px 26px',
          marginBottom: 28,
          letterSpacing: 0.5,
        }}
      >
        {labelText}
      </div>

      <div style={{fontWeight: W.extra, fontSize: size, lineHeight: 1.08, letterSpacing: -1.5}}>
        {words.map((w, i) => (
          <Word
            key={i}
            text={w}
            size={size}
            delay={titleStart + i * step}
            color={scene.keywords?.includes(w) ? C.mint : C.white}
          />
        ))}
      </div>

      <div
        style={{
          ...sub.style,
          fontWeight: W.semi,
          fontSize: layout.vertical ? 38 : 42,
          color: C.white,
          marginTop: 26,
        }}
      >
        {scene.subtitle}
      </div>

      {scene.kind === 'intro' && (
        <div
          style={{
            ...extra.style,
            alignSelf: 'flex-start',
            marginTop: 34,
            fontWeight: W.medium,
            fontSize: layout.vertical ? 30 : 34,
            color: C.bgC,
            background: C.mint,
            borderRadius: 999,
            padding: '10px 30px',
          }}
        >
          Michael Bungay Stanier
        </div>
      )}

      {scene.kind === 'outro' && <Recap start={titleEnd + 16} layout={layout} />}
    </div>
  );
};

const Recap: React.FC<{start: number; layout: Layout}> = ({start, layout}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 30}}>
      {RECAP.map((r, i) => {
        const p = spring({frame: frame - start - i * 5, fps, config: {damping: 200}});
        return (
          <div
            key={i}
            style={{
              opacity: p,
              transform: `translateY(${(1 - p) * 40}px)`,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(255,255,255,0.12)',
              border: '2px solid rgba(255,255,255,0.35)',
              borderRadius: 999,
              padding: '6px 20px 6px 8px',
              fontWeight: W.medium,
              fontSize: layout.vertical ? 24 : 26,
              color: C.white,
            }}
          >
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: C.mint,
                color: C.bgC,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: W.semi,
                fontSize: 20,
              }}
            >
              {i + 1}
            </span>
            {r}
          </div>
        );
      })}
    </div>
  );
};
