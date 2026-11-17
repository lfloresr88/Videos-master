import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  clamp,
  Confetti,
  CYAN,
  FONT,
  GOLD,
  LIME,
  NIGHT,
  outCubic,
  ramp,
  RED,
  WHITE,
} from "./common";

/* ================================================================== */
/* Scene 7 — the crowd                                                 */
/* ================================================================== */

const ROWS = 11;
const PER_ROW = 62;

const Firework: React.FC<{
  seed: string;
  at: number;
  x: number;
  y: number;
  color: string;
}> = ({ seed, at, x, y, color }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > 60) return null;
  return (
    <g>
      {Array.from({ length: 36 }, (_, i) => {
        const a = (i / 36) * Math.PI * 2;
        const sp = 7 + random(`${seed}${i}`) * 6;
        const d = sp * t * (1 - t / 140);
        return (
          <circle
            key={i}
            cx={x + Math.cos(a) * d}
            cy={y + Math.sin(a) * d + 0.5 * 0.06 * t * t}
            r={5 * (1 - t / 70)}
            fill={i % 2 ? color : WHITE}
            opacity={1 - t / 60}
          />
        );
      })}
    </g>
  );
};

export const Crowd: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const text = spring({
    frame: frame - 14,
    fps,
    config: { damping: 16, stiffness: 100 },
  });
  const wavePos = ((frame * 0.028) % 1.6) - 0.3;

  // heartbeat ecg
  const ecg = (x: number) => {
    const m = (x / 1920 - frame * 0.006 + 10) % 0.25;
    const u = m / 0.25;
    if (u > 0.1 && u < 0.16) return (-(u - 0.1) / 0.06) * 70;
    if (u >= 0.16 && u < 0.22) return -70 + ((u - 0.16) / 0.06) * 190;
    if (u >= 0.22 && u < 0.28) return 120 - ((u - 0.22) / 0.06) * 120;
    return Math.sin(u * 20) * 4;
  };
  const pts = Array.from(
    { length: 193 },
    (_, i) => `${i * 10},${900 + ecg(i * 10) * 0.5}`,
  ).join(" ");

  return (
    <AbsoluteFill style={{ backgroundColor: "#04070f", fontFamily: FONT }}>
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <filter id="smoke" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="40" />
          </filter>
        </defs>
        {/* sky glow */}
        <rect width={1920} height={1080} fill="#050a18" />
        {/* flare smoke */}
        <g filter="url(#smoke)">
          {Array.from({ length: 9 }, (_, i) => {
            const t = (frame * 0.9 + i * 38) % 340;
            return (
              <circle
                key={i}
                cx={150 + i * 210 + Math.sin(t / 40 + i) * 50}
                cy={900 - t * 1.5}
                r={80 + t * 0.35}
                fill={i % 2 ? RED : "#ff7a3d"}
                opacity={0.3 * (1 - t / 340)}
              />
            );
          })}
        </g>
        <Firework seed="f1" at={30} x={480} y={330} color={GOLD} />
        <Firework seed="f2" at={78} x={1400} y={290} color={CYAN} />
        <Firework seed="f3" at={128} x={960} y={250} color={RED} />
        <Firework seed="f4" at={170} x={1640} y={380} color={LIME} />
        <Firework seed="f5" at={190} x={300} y={260} color={WHITE} />
        {/* stands: curved rows of fans */}
        {Array.from({ length: ROWS }, (_, r) =>
          Array.from({ length: PER_ROW }, (_, c) => {
            const u = c / (PER_ROW - 1);
            const x = 20 + u * 1880;
            const curve = Math.sin(u * Math.PI) * 140;
            const baseY = 1080 - 40 - r * 48 - curve * (r / ROWS) * 0.9 + 70;
            const d = u - wavePos;
            const w = Math.exp(-(d * d) / 0.012);
            const jump =
              w * 46 + Math.abs(Math.sin(frame / 7 + c * 1.9 + r)) * 4;
            const team = random(`fan${r}-${c}`) > 0.5;
            return (
              <g
                key={`${r}-${c}`}
                transform={`translate(${x} ${baseY - jump})`}
              >
                <circle
                  r={15}
                  fill={team ? CYAN : RED}
                  opacity={0.55 + w * 0.45}
                />
                <circle cy={-22} r={8} fill="#f2c9a0" opacity={0.6 + w * 0.4} />
              </g>
            );
          }),
        )}
        {/* heartbeat */}
        <polyline
          points={pts}
          fill="none"
          stroke={GOLD}
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.9}
        />
      </svg>

      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(5,10,24,0.0) 55%, rgba(5,10,24,0.35))",
        }}
      />

      <AbsoluteFill style={{ alignItems: "center", paddingTop: 170 }}>
        <div
          style={{
            textAlign: "center",
            fontSize: 190,
            fontWeight: 800,
            fontStyle: "italic",
            lineHeight: 1,
            color: WHITE,
            textTransform: "uppercase",
            opacity: interpolate(text, [0, 0.4], [0, 1], clamp),
            scale: interpolate(text, [0, 1], [0.8, 1]),
            textShadow: "0 8px 60px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.8)",
          }}
        >
          90.000 voces
        </div>
        <div
          style={{
            fontSize: 110,
            fontWeight: 800,
            fontStyle: "italic",
            color: GOLD,
            textTransform: "uppercase",
            opacity: ramp(frame, 40, 62),
            translate: `0px ${interpolate(frame, [40, 62], [30, 0], { ...clamp, easing: outCubic })}px`,
            textShadow: "0 8px 40px rgba(0,0,0,0.9)",
          }}
        >
          un solo latido
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* Scene 8 — trophy finale                                             */
/* ================================================================== */

const Sparkle: React.FC<{
  x: number;
  y: number;
  size: number;
  phase: number;
}> = ({ x, y, size, phase }) => {
  const frame = useCurrentFrame();
  const s = Math.max(0, Math.sin(frame / 7 + phase)) * size;
  return (
    <path
      d={`M ${x} ${y - s} Q ${x} ${y} ${x + s} ${y} Q ${x} ${y} ${x} ${y + s} Q ${x} ${y} ${x - s} ${y} Q ${x} ${y} ${x} ${y - s} Z`}
      fill="white"
    />
  );
};

export const Finale: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const rise = spring({
    frame: frame - 4,
    fps,
    config: { damping: 16, stiffness: 70 },
  });
  const out = interpolate(
    frame,
    [durationInFrames - 26, durationInFrames - 4],
    [1, 0],
    clamp,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: NIGHT, fontFamily: FONT }}>
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff2b0" />
            <stop offset="45%" stopColor={GOLD} />
            <stop offset="100%" stopColor="#b9801a" />
          </linearGradient>
          <radialGradient id="halo">
            <stop offset="0%" stopColor={GOLD} stopOpacity="0.55" />
            <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* rotating rays */}
        <g
          transform={`translate(560 540) rotate(${frame * 0.5})`}
          opacity={0.35 * rise}
        >
          {Array.from({ length: 18 }, (_, i) => (
            <polygon
              key={i}
              points="0,0 900,-60 900,60"
              fill={GOLD}
              opacity={0.35}
              transform={`rotate(${i * 20})`}
            />
          ))}
        </g>
        <circle cx={560} cy={540} r={520} fill="url(#halo)" opacity={rise} />
        {/* trophy */}
        <g
          transform={`translate(560 ${540 + (1 - rise) * 500}) scale(${0.9 + Math.sin(frame / 30) * 0.01})`}
        >
          {/* base */}
          <rect
            x={-150}
            y={250}
            width={300}
            height={50}
            rx={12}
            fill="url(#gold)"
          />
          <rect
            x={-110}
            y={200}
            width={220}
            height={60}
            rx={10}
            fill="#8a5f12"
          />
          <rect x={-40} y={110} width={80} height={100} fill="url(#gold)" />
          {/* handles */}
          <path
            d="M -170 -190 C -290 -190 -290 -40 -150 -10"
            fill="none"
            stroke="url(#gold)"
            strokeWidth={30}
            strokeLinecap="round"
          />
          <path
            d="M 170 -190 C 290 -190 290 -40 150 -10"
            fill="none"
            stroke="url(#gold)"
            strokeWidth={30}
            strokeLinecap="round"
          />
          {/* cup */}
          <path
            d="M -190 -230 H 190 C 190 -60 120 70 0 110 C -120 70 -190 -60 -190 -230 Z"
            fill="url(#gold)"
          />
          <path
            d="M -130 -200 C -130 -90 -90 0 -30 60"
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth={14}
            strokeLinecap="round"
          />
          <ellipse cx={0} cy={-230} rx={190} ry={26} fill="#ffe9a0" />
          {/* ball on top */}
          <circle cx={0} cy={-300} r={46} fill="#f4f7ff" />
          <polygon
            points="0,-326 22,-310 14,-284 -14,-284 -22,-310"
            fill="#10131c"
          />
        </g>
        <Sparkle x={400} y={260} size={42} phase={0} />
        <Sparkle x={760} y={300} size={34} phase={2} />
        <Sparkle x={620} y={170} size={50} phase={4} />
        <Sparkle x={330} y={520} size={30} phase={1} />
        <Sparkle x={800} y={560} size={38} phase={3} />
      </svg>

      <Confetti seed="fin" count={130} start={0} life={190} />

      <div style={{ position: "absolute", left: 900, top: 230, width: 960 }}>
        <div
          style={{
            fontSize: 100,
            fontWeight: 800,
            fontStyle: "italic",
            lineHeight: 1.02,
            color: WHITE,
            textTransform: "uppercase",
            opacity: ramp(frame, 20, 40),
            translate: `${interpolate(frame, [20, 44], [120, 0], { ...clamp, easing: outCubic })}px 0px`,
          }}
        >
          La pasión no se explica.
        </div>
        <div
          style={{
            fontSize: 118,
            fontWeight: 800,
            fontStyle: "italic",
            lineHeight: 1.02,
            marginTop: 14,
            textTransform: "uppercase",
            background: `linear-gradient(90deg, ${GOLD}, ${LIME})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            opacity: ramp(frame, 62, 84),
            scale: interpolate(
              spring({
                frame: frame - 62,
                fps,
                config: { damping: 11, stiffness: 130 },
              }),
              [0, 1],
              [0.7, 1],
            ),
            transformOrigin: "left center",
            whiteSpace: "nowrap",
          }}
        >
          Se programa.
        </div>
        <div
          style={{
            marginTop: 44,
            fontSize: 58,
            whiteSpace: "nowrap",
            fontWeight: 600,
            color: "rgba(244,247,255,0.85)",
            opacity: ramp(frame, 100, 124),
          }}
        >
          Hecho con Remotion · 100% código
        </div>
      </div>

      <AbsoluteFill style={{ backgroundColor: "black", opacity: 1 - out }} />
    </AbsoluteFill>
  );
};
