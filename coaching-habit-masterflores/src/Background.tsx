import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, POPPINS, W} from './theme';
import {sceneAt, SCENES} from './data';

const angleFor = (i: number, phase: number) => (((i + phase) % 3) - 1) * 22;
const scaleFor = (i: number, phase: number) => 1 + 0.07 * ((i + phase) % 2);

/** Fondo degradado radial + cuartos de círculo en las esquinas (giran y escalan con spring en cada escena). */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {index, local} = sceneAt(frame);
  const p = spring({frame: local, fps, config: {damping: 200}, durationInFrames: 40});

  const R = Math.min(width, height) * 0.5;
  const shape = (phase: number) => {
    const prev = index === 0 ? 0 : 1;
    const a0 = angleFor(index - prev, phase);
    const a1 = angleFor(index, phase);
    const s0 = scaleFor(index - prev, phase);
    const s1 = scaleFor(index, phase);
    return {
      angle: a0 + (a1 - a0) * p,
      scale: s0 + (s1 - s0) * p,
    };
  };

  const tr = shape(0);
  const bl = shape(1);
  const br = shape(2);
  const off = 0.08 * R;

  const place = (cx: number, cy: number, s: {angle: number; scale: number}) =>
    `translate(${cx} ${cy}) rotate(${s.angle}) scale(${s.scale}) translate(${-cx} ${-cy})`;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 42%, ${C.bgA} 0%, ${C.bgB} 55%, ${C.bgC} 100%)`,
      }}
    >
      <svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
        {/* Azul oscuro, arriba a la derecha */}
        <g transform={place(width, 0, tr)}>
          <circle cx={width - off} cy={off} r={R * 0.85} fill={C.blueDark} />
        </g>
        {/* Verde decorativo, abajo a la izquierda */}
        <g transform={place(0, height, bl)}>
          <circle cx={off} cy={height - off} r={R * 0.8} fill={C.greenDeco} />
        </g>
        {/* Aro verde menta translúcido, abajo a la derecha */}
        <g transform={place(width, height, br)}>
          <circle
            cx={width - off}
            cy={height - off}
            r={R * 0.72}
            fill="none"
            stroke={C.mint}
            strokeOpacity={0.3}
            strokeWidth={R * 0.16}
          />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** Signos "?" que flotan hacia arriba. Posiciones determinísticas. */
export const FloatingQuestions: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const items = Array.from({length: 16}, (_, i) => {
    const x = ((i * 137 + 41) % 100) / 100;
    const size = 56 + ((i * 53) % 90);
    const speed = 0.9 + ((i * 29) % 10) / 8;
    const offset = (i * 211) % (height + 300);
    const sway = 14 + ((i * 7) % 22);
    return {x, size, speed, offset, sway, rot: ((i * 37) % 40) - 20};
  });
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {items.map((it, i) => {
        const travel = height + 300;
        const y = height + 100 - ((frame * it.speed + it.offset) % travel);
        const x = it.x * width + Math.sin(frame / 40 + i) * it.sway;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              fontFamily: POPPINS,
              fontWeight: W.extra,
              fontSize: it.size,
              color: C.mint,
              opacity: 0.3,
              transform: `rotate(${it.rot + Math.sin(frame / 55 + i) * 8}deg)`,
              lineHeight: 1,
            }}
          >
            ?
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, durationInFrames} = useVideoConfig();
  const w = (frame / (durationInFrames - 1)) * width;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        bottom: 0,
        height: 6,
        width: w,
        background: `linear-gradient(90deg, ${C.green}, ${C.mint})`,
        borderRadius: '0 6px 6px 0',
      }}
    />
  );
};

export const SCENE_COUNT = SCENES.length;
