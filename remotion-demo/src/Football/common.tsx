import { loadFont as loadItalic } from "@remotion/google-fonts/Poppins";
import { loadFont } from "@remotion/google-fonts/Poppins";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  useCurrentFrame,
} from "remotion";

loadFont("normal", { weights: ["600", "800"], subsets: ["latin"] });
loadItalic("italic", { weights: ["800"], subsets: ["latin"] });
export const FONT = "Poppins, sans-serif";

export const NIGHT = "#050a14";
export const PITCH = "#0b3d2e";
export const PITCH2 = "#0e4a37";
export const LIME = "#c6ff3d";
export const GOLD = "#ffc83d";
export const RED = "#ff3d5a";
export const CYAN = "#3df5ff";
export const WHITE = "#f4f7ff";

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
export const outCubic = Easing.out(Easing.cubic);
export const inOut = Easing.inOut(Easing.quad);

/** Smooth 0→1 between two frames. */
export const ramp = (frame: number, a: number, b: number, easing = outCubic) =>
  interpolate(frame, [a, b], [0, 1], { ...clamp, easing });

/* ------------------------------ Ball -------------------------------- */

export const Ball: React.FC<{ size: number; rotation?: number }> = ({
  size,
  rotation = 0,
}) => {
  const r = size / 2;
  const pent = (cx: number, cy: number, rad: number, rot: number) =>
    Array.from({ length: 5 }, (_, i) => {
      const a = rot + (i * Math.PI * 2) / 5 - Math.PI / 2;
      return `${cx + Math.cos(a) * rad},${cy + Math.sin(a) * rad}`;
    }).join(" ");
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ overflow: "visible" }}
    >
      <defs>
        <radialGradient id="ballShade" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#dfe6f2" />
          <stop offset="100%" stopColor="#8a96ad" />
        </radialGradient>
        <clipPath id="ballClip">
          <circle cx={r} cy={r} r={r} />
        </clipPath>
      </defs>
      <circle cx={r} cy={r} r={r} fill="url(#ballShade)" />
      <g clipPath="url(#ballClip)" transform={`rotate(${rotation} ${r} ${r})`}>
        <polygon points={pent(r, r, r * 0.34, 0)} fill="#10131c" />
        {Array.from({ length: 5 }, (_, i) => {
          const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
          const cx = r + Math.cos(a) * r * 0.95;
          const cy = r + Math.sin(a) * r * 0.95;
          return (
            <g key={i}>
              <polygon
                points={pent(cx, cy, r * 0.3, a + Math.PI / 2)}
                fill="#10131c"
              />
              <line
                x1={r + Math.cos(a) * r * 0.34}
                y1={r + Math.sin(a) * r * 0.34}
                x2={r + Math.cos(a) * r * 0.66}
                y2={r + Math.sin(a) * r * 0.66}
                stroke="#10131c"
                strokeWidth={size * 0.025}
              />
            </g>
          );
        })}
      </g>
      <circle
        cx={r}
        cy={r}
        r={r}
        fill="none"
        stroke="rgba(0,0,0,0.25)"
        strokeWidth={size * 0.02}
      />
    </svg>
  );
};

/* ------------------------------ Pitch ------------------------------- */

export const PITCH_BOX = { x0: 140, y0: 110, w: 1640, h: 860 };

const circle = (cx: number, cy: number, r: number) =>
  `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0`;

export const Pitch: React.FC<{
  box?: { x0: number; y0: number; w: number; h: number };
  draw?: number;
  stripes?: boolean;
  fillOpacity?: number;
  lineColor?: string;
}> = ({
  box = PITCH_BOX,
  draw = 1,
  stripes = true,
  fillOpacity = 1,
  lineColor = "rgba(255,255,255,0.85)",
}) => {
  const { x0, y0, w, h } = box;
  const sx = w / 105;
  const sy = h / 68;
  const cx = x0 + w / 2;
  const cy = y0 + h / 2;
  const paths = [
    `M ${x0} ${y0} H ${x0 + w} V ${y0 + h} H ${x0} Z`,
    `M ${cx} ${y0} V ${y0 + h}`,
    circle(cx, cy, 9.15 * sx),
    // penalty areas
    `M ${x0} ${cy - 20.15 * sy} h ${16.5 * sx} v ${40.3 * sy} h ${-16.5 * sx}`,
    `M ${x0 + w} ${cy - 20.15 * sy} h ${-16.5 * sx} v ${40.3 * sy} h ${16.5 * sx}`,
    // goal areas
    `M ${x0} ${cy - 9.16 * sy} h ${5.5 * sx} v ${18.32 * sy} h ${-5.5 * sx}`,
    `M ${x0 + w} ${cy - 9.16 * sy} h ${-5.5 * sx} v ${18.32 * sy} h ${5.5 * sx}`,
    // penalty arcs
    `M ${x0 + 16.5 * sx} ${cy - 7 * sy} a ${9.15 * sx} ${9.15 * sy} 0 0 1 0 ${14 * sy}`,
    `M ${x0 + w - 16.5 * sx} ${cy - 7 * sy} a ${9.15 * sx} ${9.15 * sy} 0 0 0 0 ${14 * sy}`,
  ];
  const stripeW = w / 14;
  return (
    <g>
      {stripes &&
        Array.from({ length: 14 }, (_, i) => (
          <rect
            key={i}
            x={x0 + i * stripeW}
            y={y0}
            width={stripeW}
            height={h}
            fill={i % 2 ? PITCH : PITCH2}
            opacity={fillOpacity}
          />
        ))}
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={lineColor}
          strokeWidth={4}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
          strokeLinecap="round"
        />
      ))}
      <circle cx={cx} cy={cy} r={6} fill={lineColor} opacity={draw} />
      <circle cx={x0 + 11 * sx} cy={cy} r={5} fill={lineColor} opacity={draw} />
      <circle
        cx={x0 + w - 11 * sx}
        cy={cy}
        r={5}
        fill={lineColor}
        opacity={draw}
      />
    </g>
  );
};

/* ----------------------------- Confetti ----------------------------- */

const CONFETTI_COLORS = [LIME, GOLD, RED, CYAN, WHITE];

export const Confetti: React.FC<{
  seed: string;
  count: number;
  start: number;
  origin?: readonly [number, number];
  spread?: number;
  gravity?: number;
  life?: number;
}> = ({
  seed,
  count,
  start,
  origin,
  spread = 1,
  gravity = 0.55,
  life = 130,
}) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0 || t > life) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0 }}
      >
        {Array.from({ length: count }, (_, i) => {
          const a = origin
            ? random(`${seed}a${i}`) * Math.PI * 2
            : -Math.PI / 2;
          const sp = origin ? (6 + random(`${seed}s${i}`) * 20) * spread : 0;
          const ox = origin ? origin[0] : random(`${seed}x${i}`) * 1920;
          const oy = origin ? origin[1] : -40 - random(`${seed}y${i}`) * 400;
          const vx = origin
            ? Math.cos(a) * sp
            : (random(`${seed}vx${i}`) - 0.5) * 3;
          const vy = origin
            ? Math.sin(a) * sp - 6
            : 4 + random(`${seed}vy${i}`) * 5;
          const x = ox + vx * t + Math.sin(t / 7 + i) * 14;
          const y = oy + vy * t + 0.5 * gravity * t * t * (origin ? 1 : 0.25);
          const rot = t * (6 + random(`${seed}r${i}`) * 12) + i * 40;
          return (
            <rect
              key={i}
              x={-8}
              y={-14}
              width={16}
              height={28}
              rx={3}
              fill={CONFETTI_COLORS[i % CONFETTI_COLORS.length]}
              opacity={interpolate(t, [life - 30, life], [1, 0], clamp)}
              transform={`translate(${x} ${y}) rotate(${rot}) scale(1 ${Math.cos(t / 5 + i)})`}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/* ----------------------- Stadium night background ------------------- */

export const StadiumBg: React.FC<{ intensity?: number }> = ({
  intensity = 1,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: NIGHT, overflow: "hidden" }}>
      {[0, 1, 2, 3].map((k) => (
        <div
          key={k}
          style={{
            position: "absolute",
            left: 160 + k * 520,
            top: -420,
            width: 700,
            height: 1900,
            transformOrigin: "50% 0%",
            rotate: `${Math.sin(frame / 60 + k * 1.7) * 14 + (k - 1.5) * 8}deg`,
            background:
              "linear-gradient(to bottom, rgba(210,235,255,0.20), rgba(210,235,255,0) 80%)",
            clipPath: "polygon(46% 0, 54% 0, 100% 100%, 0 100%)",
            opacity: 0.55 * intensity,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 120%, rgba(18,99,63,0.55), transparent 60%)",
        }}
      />
    </AbsoluteFill>
  );
};

/* ----------------------------- Glass card --------------------------- */

export const Glass: React.FC<{
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ style, children }) => (
  <div
    style={{
      borderRadius: 28,
      backgroundColor: "rgba(8,16,30,0.72)",
      border: "2px solid rgba(255,255,255,0.14)",
      boxShadow: "0 30px 90px rgba(0,0,0,0.5)",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Title: React.FC<{
  children: React.ReactNode;
  frame: number;
  style?: React.CSSProperties;
  size?: number;
}> = ({ children, frame, style, size = 130 }) => (
  <div
    style={{
      position: "absolute",
      fontFamily: FONT,
      fontWeight: 800,
      fontStyle: "italic",
      fontSize: size,
      lineHeight: 1,
      color: WHITE,
      textTransform: "uppercase",
      opacity: ramp(frame, 0, 14),
      translate: `${interpolate(frame, [0, 22], [-90, 0], { ...clamp, easing: outCubic })}px 0px`,
      ...style,
    }}
  >
    {children}
  </div>
);
