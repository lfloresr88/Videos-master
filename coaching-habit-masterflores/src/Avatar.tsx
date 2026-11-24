import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, POPPINS, W} from './theme';

const SKIN = '#F0B98D';
const SKIN_SHADE = '#D99B6E';
const HAIR = '#1B1D2A';
const MOUTH = '#6B2233';

export type AvatarProps = {
  /** Ancho en píxeles del personaje */
  width: number;
  /** Frame local dentro de la escena actual */
  local: number;
  /** Duración de la escena actual */
  sceneDuration: number;
  /** Texto del bocadillo */
  bubble: string;
};

/** Luis (Master flores): personaje SVG original. */
export const Avatar: React.FC<AvatarProps> = ({width, local, sceneDuration, bubble}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const height = (width * 560) / 440;

  // Habla durante el primer 75 % de cada escena
  const speaking = local < sceneDuration * 0.75;
  const talk = speaking
    ? Math.abs(Math.sin(local * 0.5)) * (0.6 + 0.4 * Math.abs(Math.sin(local * 0.19)))
    : 0;
  const mouthScale = 0.1 + 0.9 * talk;
  const s = speaking ? 1 : 0.15; // intensidad del gesto

  // Parpadeo cada ~4 s (120 frames)
  const bf = frame % 120;
  const blink = bf < 6 ? 1 - Math.sin((bf / 6) * Math.PI) * 0.92 : 1;

  // Balanceo de cabeza
  const headRot = Math.sin(frame / 45) * 2.2;
  const headDy = Math.sin(frame / 30) * 2;

  // Brazo
  const upper = -8 + Math.sin(frame / 17) * 6 * s;
  const fore = -10 + Math.sin(frame / 9) * 20 * s + Math.sin(frame / 23) * 8 * s;

  // Bocadillo: pop entre 0.3 s y 3.8 s
  const t0 = Math.round(0.3 * fps);
  const t1 = Math.round(3.8 * fps);
  const popIn = spring({frame: local - t0, fps, config: {damping: 11, stiffness: 170}});
  const popOut = spring({frame: local - t1, fps, config: {damping: 200}, durationInFrames: 8});
  const bubbleScale = local < t0 ? 0 : popIn * (1 - popOut);

  const fs = width * 0.058;

  return (
    <div style={{position: 'relative', width, height}}>
      <svg viewBox="0 0 440 560" width={width} height={height} style={{display: 'block', overflow: 'visible'}}>
        <defs>
          <linearGradient id="shirt" gradientUnits="userSpaceOnUse" x1="40" y1="330" x2="380" y2="560">
            <stop offset="0" stopColor={C.blue} />
            <stop offset="1" stopColor={C.blueDark} />
          </linearGradient>
        </defs>
        <g transform="translate(20 0)">
          {/* Brazo izquierdo (colgando) */}
          <path d="M82 382 L62 560" stroke="url(#shirt)" strokeWidth={54} strokeLinecap="round" fill="none" />

          {/* Torso / camisa */}
          <path
            d="M36 560 L36 430 Q36 350 120 338 L280 338 Q364 350 364 430 L364 560 Z"
            fill="url(#shirt)"
          />
          {/* Cuello */}
          <rect x={170} y={285} width={60} height={64} rx={20} fill={SKIN_SHADE} />
          {/* Cuello en V blanco */}
          <path d="M138 338 L200 438 L262 338 Q200 322 138 338 Z" fill={C.white} />
          <path d="M170 334 L200 392 L230 334 Q200 326 170 334 Z" fill={SKIN} />
          {/* Insignia */}
          <circle cx={296} cy={452} r={28} fill={C.mint} />
          <text
            x={296}
            y={462}
            textAnchor="middle"
            fontFamily={POPPINS}
            fontWeight={W.extra}
            fontSize={30}
            fill={C.bgC}
          >
            M
          </text>

          {/* Brazo que gesticula */}
          <g transform={`rotate(${upper} 330 385)`}>
            <path d="M330 385 L364 467" stroke="url(#shirt)" strokeWidth={54} strokeLinecap="round" fill="none" />
            <g transform={`rotate(${fore} 364 467)`}>
              <path d="M364 467 L350 410" stroke="url(#shirt)" strokeWidth={46} strokeLinecap="round" fill="none" />
              <ellipse cx={346} cy={388} rx={24} ry={28} fill={SKIN} />
              <ellipse cx={330} cy={380} rx={9} ry={15} fill={SKIN} transform="rotate(-25 330 380)" />
            </g>
          </g>

          {/* Cabeza */}
          <g transform={`translate(0 ${headDy}) rotate(${headRot} 200 300)`}>
            <ellipse cx={112} cy={196} rx={14} ry={24} fill={SKIN_SHADE} />
            <ellipse cx={288} cy={196} rx={14} ry={24} fill={SKIN_SHADE} />
            <ellipse cx={200} cy={190} rx={88} ry={108} fill={SKIN} />
            {/* Pelo */}
            <path
              d="M108 186 Q96 74 200 72 Q304 74 292 186 Q288 136 256 124 Q206 150 152 124 Q114 136 108 186 Z"
              fill={HAIR}
            />
            {/* Cejas */}
            <path d="M138 158 Q165 142 190 156" stroke={HAIR} strokeWidth={8} strokeLinecap="round" fill="none" />
            <path d="M210 156 Q235 142 262 158" stroke={HAIR} strokeWidth={8} strokeLinecap="round" fill="none" />
            {/* Ojos */}
            <g transform={`translate(165 188) scale(1 ${blink})`}>
              <ellipse cx={0} cy={0} rx={11} ry={14} fill={HAIR} />
              <circle cx={3} cy={-5} r={3.4} fill={C.white} />
            </g>
            <g transform={`translate(235 188) scale(1 ${blink})`}>
              <ellipse cx={0} cy={0} rx={11} ry={14} fill={HAIR} />
              <circle cx={3} cy={-5} r={3.4} fill={C.white} />
            </g>
            {/* Nariz */}
            <path d="M200 196 Q188 228 202 234 Q212 234 214 228" stroke={SKIN_SHADE} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* Boca */}
            <path d="M172 262 Q200 282 228 262" stroke={MOUTH} strokeWidth={5} strokeLinecap="round" fill="none" />
            <g transform={`translate(200 266) scale(1 ${mouthScale})`}>
              <path d="M-26 -2 Q0 -8 26 -2 Q20 32 0 32 Q-20 32 -26 -2 Z" fill={MOUTH} />
              <path d="M-22 -1 Q0 -6 22 -1 L20 7 Q0 3 -20 7 Z" fill={C.white} />
              <ellipse cx={0} cy={25} rx={12} ry={6} fill="#C7566A" />
            </g>
          </g>
        </g>
      </svg>

      {bubbleScale > 0.01 && (
        <div
          style={{
            position: 'absolute',
            left: '73%',
            top: '16%',
            transform: `scale(${bubbleScale})`,
            transformOrigin: '0% 60%',
            background: C.white,
            color: C.blueDark,
            fontFamily: POPPINS,
            fontWeight: W.semi,
            fontSize: fs,
            lineHeight: 1.2,
            padding: `${fs * 0.55}px ${fs * 0.85}px`,
            borderRadius: fs * 1.1,
            maxWidth: width * 0.62,
            minWidth: width * 0.3,
            boxShadow: '0 10px 30px rgba(4,42,102,0.35)',
            opacity: interpolate(bubbleScale, [0, 0.3], [0, 1], {extrapolateRight: 'clamp'}),
          }}
        >
          {bubble}
          <div
            style={{
              position: 'absolute',
              left: -fs * 0.42,
              top: '55%',
              width: fs * 0.9,
              height: fs * 0.9,
              background: C.white,
              borderRadius: fs * 0.18,
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: -1,
            }}
          />
        </div>
      )}
    </div>
  );
};
