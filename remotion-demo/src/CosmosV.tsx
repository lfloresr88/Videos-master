import { Audio } from "@remotion/media";
import {
  linearTiming,
  TransitionSeries,
  type TransitionPresentation,
  type TransitionPresentationComponentProps,
} from "@remotion/transitions";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { clamp, FONT, LIME, ramp } from "./Football/common";

const W = 1080;
const H = 1920;
const CX = 540;
const CY = 880;
const OVERLAP = 24;
const STARTS = [0, 106, 212, 318, 424, 530, 636, 742] as const;
const DURS = [130, 130, 130, 130, 130, 130, 130, 158] as const;
const EXPS = [-10, -6, 0, 4, 7, 13, 21, 26] as const;
const NAMES = [
  "Un átomo",
  "Una célula",
  "Una persona",
  "Una ciudad",
  "La Tierra",
  "El sistema solar",
  "Una galaxia",
  "El universo",
] as const;
const SUBS = [
  "10⁻¹⁰ m · un ångström",
  "10⁻⁶ m · una micra",
  "10⁰ m · un metro",
  "10⁴ m · diez kilómetros",
  "10⁷ m · diez mil km",
  "10¹³ m · 100 UA",
  "10²¹ m · 100 000 años luz",
  "10²⁶ m · universo observable",
] as const;
const AMBER = "#ffb347";

const exponentAt = (frame: number) => {
  for (let k = 7; k >= 1; k--) {
    if (frame >= STARTS[k]) {
      const p = Math.min(1, (frame - STARTS[k]) / OVERLAP);
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      return EXPS[k - 1] + (EXPS[k] - EXPS[k - 1]) * e;
    }
  }
  return EXPS[0];
};

/* --------------------------- zoom-through transition --------------------------- */

const ZOOM = 22;
const ZoomComp: React.FC<
  TransitionPresentationComponentProps<Record<string, never>>
> = ({ children, presentationDirection, presentationProgress: p }) => {
  const entering = presentationDirection === "entering";
  const scale = entering ? Math.pow(ZOOM, 1 - p) : Math.pow(ZOOM, -p);
  const opacity = entering
    ? interpolate(p, [0, 0.55], [0, 1], clamp)
    : interpolate(p, [0.35, 1], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity }}>
      <AbsoluteFill
        style={{ scale, transformOrigin: `50% ${(CY / H) * 100}%` }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
const zoomThrough = (): TransitionPresentation<Record<string, never>> => ({
  component: ZoomComp,
  props: {},
});

/* ----------------------------------- helpers ----------------------------------- */

const glow = (id: string, color: string, op = 1) => (
  <radialGradient id={id}>
    <stop offset="0%" stopColor={color} stopOpacity={op} />
    <stop offset="100%" stopColor={color} stopOpacity={0} />
  </radialGradient>
);

const Starfield: React.FC<{ n: number; seed: string; max?: number }> = ({
  n,
  seed,
  max = 1.8,
}) => {
  const f = useCurrentFrame();
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <circle
          key={i}
          cx={random(`${seed}x${i}`) * W}
          cy={random(`${seed}y${i}`) * H}
          r={0.5 + random(`${seed}r${i}`) * max}
          fill={
            random(`${seed}c${i}`) > 0.8
              ? "#ffd9b0"
              : random(`${seed}c${i}`) < 0.2
                ? "#b9d0ff"
                : "#fff"
          }
          opacity={
            0.35 +
            0.55 * Math.abs(Math.sin(f / 22 + random(`${seed}p${i}`) * 6))
          }
        />
      ))}
    </g>
  );
};

const Label: React.FC<{ index: number }> = ({ index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - 26,
    fps,
    config: { damping: 15, stiffness: 120 },
  });
  const out = ramp(frame, 100, 122, Easing.in(Easing.cubic));
  const isLast = index === 7;
  return (
    <AbsoluteFill style={{ fontFamily: FONT, opacity: isLast ? 1 : 1 - out }}>
      <div
        style={{
          position: "absolute",
          left: 70,
          top: 170,
          width: 940,
          opacity: interpolate(s, [0, 0.4], [0, 1], clamp),
          translate: `${interpolate(s, [0, 1], [-120, 0])}px 0px`,
        }}
      >
        <div
          style={{
            fontSize: 104,
            fontWeight: 800,
            fontStyle: "italic",
            lineHeight: 1,
            color: "#fff",
            textTransform: "uppercase",
            textShadow: "0 6px 40px rgba(0,0,0,0.85)",
          }}
        >
          {NAMES[index]}
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 48,
            fontWeight: 600,
            color: AMBER,
            textShadow: "0 4px 24px rgba(0,0,0,0.9)",
          }}
        >
          {SUBS[index]}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* --------------------------------- 1 · atom ------------------------------------ */

type P3 = { x: number; y: number; z: number; s: number; c: number };
const shell = (n: number, seed: string, rmin: number, rmax: number): P3[] =>
  Array.from({ length: n }, (_, i) => {
    const u = random(`${seed}u${i}`) * 2 - 1;
    const a = random(`${seed}a${i}`) * Math.PI * 2;
    const r =
      rmin +
      ((random(`${seed}r${i}`) + random(`${seed}q${i}`)) / 2) * (rmax - rmin);
    const q = Math.sqrt(1 - u * u);
    return {
      x: r * q * Math.cos(a),
      y: r * u,
      z: r * q * Math.sin(a),
      s: 1.6 + random(`${seed}s${i}`) * 3,
      c: random(`${seed}c${i}`),
    };
  });
const CLOUD = shell(380, "vcloud", 70, 250);
const NUCLEONS = shell(18, "vnuc", 0, 24);

const Atom: React.FC = () => {
  const f = useCurrentFrame();
  const rot = f * 0.012;
  return (
    <AbsoluteFill style={{ backgroundColor: "#02040b" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          {glow("aCore", "#ff8a98", 0.95)}
          {glow("aCloud", "#4d7cff", 0.55)}
          <radialGradient id="aP" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#ffd3d9" />
            <stop offset="55%" stopColor="#ff5d73" />
            <stop offset="100%" stopColor="#7a1226" />
          </radialGradient>
          <radialGradient id="aN" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#d9e8ff" />
            <stop offset="55%" stopColor="#6ea8ff" />
            <stop offset="100%" stopColor="#1a3a85" />
          </radialGradient>
          <filter id="aBlur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        <circle cx={CX} cy={CY} r={380} fill="url(#aCloud)" />
        <g filter="url(#aBlur)">
          {CLOUD.map((p, i) => {
            const x1 = p.x * Math.cos(rot) - p.z * Math.sin(rot);
            const z1 = p.x * Math.sin(rot) + p.z * Math.cos(rot);
            const y2 = p.y * Math.cos(0.5) - z1 * Math.sin(0.5);
            const z2 = p.y * Math.sin(0.5) + z1 * Math.cos(0.5);
            return (
              <circle
                key={i}
                cx={CX + x1}
                cy={CY + y2}
                r={p.s * (1.2 + (z2 + 250) / 300)}
                fill={p.c > 0.5 ? "#8dbbff" : "#c3a0ff"}
                opacity={0.25 + (z2 + 250) / 700}
              />
            );
          })}
        </g>
        {[0, 60, 120].map((deg, k) => {
          const a = f * 0.07 + k * 2.1;
          const x = CX + Math.cos(a) * 250;
          const y = CY + Math.sin(a) * 90;
          return (
            <g key={k} transform={`rotate(${deg} ${CX} ${CY})`}>
              <ellipse
                cx={CX}
                cy={CY}
                rx={250}
                ry={90}
                fill="none"
                stroke="rgba(150,190,255,0.3)"
                strokeWidth={2}
              />
              <circle cx={x} cy={y} r={40} fill="url(#aCloud)" />
              <circle cx={x} cy={y} r={11} fill="#cfe4ff" />
            </g>
          );
        })}
        <circle
          cx={CX}
          cy={CY}
          r={78 + Math.sin(f / 8) * 5}
          fill="url(#aCore)"
        />
        {NUCLEONS.map((p, i) => (
          <circle
            key={i}
            cx={CX + p.x + Math.sin(f / 5 + i) * 2}
            cy={CY + p.y + Math.cos(f / 6 + i) * 2}
            r={14}
            fill={i % 2 ? "url(#aP)" : "url(#aN)"}
          />
        ))}
      </svg>
      <Label index={0} />
    </AbsoluteFill>
  );
};

/* ---------------------------------- 2 · cell ----------------------------------- */

const ORGS = Array.from({ length: 14 }, (_, i) => ({
  x: random(`vox${i}`) * W,
  y: 300 + random(`voy${i}`) * 1100,
  rx: 50 + random(`vorx${i}`) * 90,
  ry: 34 + random(`vory${i}`) * 60,
  rot: random(`vorr${i}`) * 180,
  c: i % 3,
}));

const Cell: React.FC = () => {
  const f = useCurrentFrame();
  const rungs = 40;
  const pts = Array.from({ length: rungs }, (_, i) => {
    const ph = i * 0.42 + f * 0.07;
    return {
      y: CY - 430 + i * 22,
      x1: Math.sin(ph) * 120,
      x2: -Math.sin(ph) * 120,
      d: Math.cos(ph),
    };
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "#03121a" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          {glow("cMem", "#1ec9b0", 0.6)}
          {glow("cNuc", "#7c4dff", 0.8)}
          <radialGradient id="dC" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#e8fdff" />
            <stop offset="50%" stopColor="#3df5ff" />
            <stop offset="100%" stopColor="#0a6c86" />
          </radialGradient>
          <radialGradient id="dP" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#ffe0ee" />
            <stop offset="50%" stopColor="#ff4d8d" />
            <stop offset="100%" stopColor="#7a0f3f" />
          </radialGradient>
          <filter id="cBlur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
          <clipPath id="cClip">
            <circle cx={CX} cy={CY} r={600} />
          </clipPath>
          <filter id="cTex" x="0" y="0" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012"
              numOctaves={4}
              seed={11}
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.3  0 0 0 0 1  0 0 0 0 0.85  1.6 0 0 0 -0.55"
            />
          </filter>
          <filter id="dBack" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
        </defs>
        <circle cx={CX} cy={CY} r={640} fill="url(#cMem)" />
        <g clipPath="url(#cClip)">
          <rect
            x={CX - 600}
            y={CY - 600}
            width={1200}
            height={1200}
            filter="url(#cTex)"
            opacity={0.5}
          />
        </g>
        <circle
          cx={CX}
          cy={CY}
          r={560}
          fill="none"
          stroke="rgba(130,255,230,0.4)"
          strokeWidth={10}
        />
        <g filter="url(#cBlur)">
          {ORGS.map((o, i) => (
            <ellipse
              key={i}
              cx={(o.x + f * (0.3 + (i % 4) * 0.2)) % W}
              cy={o.y + Math.sin(f / 30 + i) * 20}
              rx={o.rx}
              ry={o.ry}
              fill={
                [
                  "rgba(255,170,80,0.55)",
                  "rgba(80,200,255,0.5)",
                  "rgba(255,100,160,0.5)",
                ][o.c]
              }
            />
          ))}
        </g>
        <circle cx={CX} cy={CY} r={330} fill="url(#cNuc)" />
        <g transform={`rotate(-14 ${CX} ${CY})`}>
          {pts.map((p, i) => (
            <line
              key={i}
              x1={CX + p.x1}
              y1={p.y}
              x2={CX + p.x2}
              y2={p.y}
              stroke={i % 2 ? "#ffd166" : "#9be7ff"}
              strokeWidth={5}
              opacity={0.3 + (p.d + 1) * 0.3}
            />
          ))}
          {pts.map((p, i) => (
            <g key={i}>
              <circle
                cx={CX + p.x1}
                cy={p.y}
                r={12 + p.d * 5}
                fill="url(#dC)"
                filter={p.d < 0 ? "url(#dBack)" : undefined}
                opacity={p.d < 0 ? 0.75 : 1}
              />
              <circle
                cx={CX + p.x2}
                cy={p.y}
                r={12 - p.d * 5}
                fill="url(#dP)"
                filter={p.d > 0 ? "url(#dBack)" : undefined}
                opacity={p.d > 0 ? 0.75 : 1}
              />
            </g>
          ))}
        </g>
      </svg>
      <Label index={1} />
    </AbsoluteFill>
  );
};

/* --------------------------------- 3 · person ---------------------------------- */

const Person: React.FC = () => {
  const f = useCurrentFrame();
  const shoot = ramp(f, 60, 85, Easing.linear);
  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(#02040e, #0e1a3d 62%, #243059 78%, #1a1f3d)",
      }}
    >
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          {glow("pFF", "#ffe28a", 0.95)}
          <filter id="mw" x="0" y="0" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.006 0.012"
              numOctaves={5}
              seed={21}
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.66  0 0 0 0 0.72  0 0 0 0 1  2.3 0 0 0 -0.95"
            />
          </filter>
          <linearGradient id="mwMask" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" />
            <stop offset="0.3" stopColor="#777" />
            <stop offset="0.5" stopColor="#fff" />
            <stop offset="0.7" stopColor="#777" />
            <stop offset="1" stopColor="#000" />
          </linearGradient>
          <mask id="mwM">
            <rect
              x={-900}
              y={600}
              width={2800}
              height={500}
              fill="url(#mwMask)"
            />
          </mask>
          <filter id="fog" x="-10%" y="-50%" width="120%" height="200%">
            <feGaussianBlur stdDeviation="30" />
          </filter>
        </defs>
        <Starfield n={420} seed="pers" />
        <g transform="rotate(-28 540 900)" mask="url(#mwM)" opacity={0.95}>
          <rect
            x={-900}
            y={710}
            width={2800}
            height={280}
            fill="rgba(120,140,255,0.22)"
            filter="url(#fog)"
          />
          <rect x={-900} y={600} width={2800} height={500} filter="url(#mw)" />
        </g>
        {shoot > 0 && shoot < 1 && (
          <line
            x1={900 - shoot * 600}
            y1={300 + shoot * 300}
            x2={900 - shoot * 600 + 150}
            y2={300 + shoot * 300 - 66}
            stroke="#fff"
            strokeWidth={4}
            strokeLinecap="round"
            opacity={1 - shoot}
          />
        )}
        <path
          d="M0 1380 C 180 1280 340 1350 560 1300 S 900 1250 1080 1330 V1920 H0 Z"
          fill="#0a0d1c"
        />
        <path
          d="M0 1500 C 260 1420 520 1500 800 1450 S 1000 1470 1080 1490 V1920 H0 Z"
          fill="#05070f"
        />
        <rect
          x={0}
          y={1380}
          width={W}
          height={160}
          fill="rgba(80,100,170,0.35)"
          filter="url(#fog)"
        />
        <g transform={`translate(${CX} 1470) scale(1.05)`}>
          <ellipse cx={0} cy={4} rx={80} ry={12} fill="rgba(0,0,0,0.5)" />
          <rect
            x={-22}
            y={-150}
            width={18}
            height={150}
            rx={8}
            fill="#04060c"
          />
          <rect x={4} y={-150} width={18} height={150} rx={8} fill="#04060c" />
          <path
            d="M-34 -150 L-30 -300 Q0 -330 30 -300 L34 -150 Z"
            fill="#04060c"
          />
          <circle cx={0} cy={-345} r={34} fill="#04060c" />
          <path
            d={`M30 -290 L${70 + Math.sin(f / 20) * 4} -400 L${88 + Math.sin(f / 20) * 4} -392 L48 -276 Z`}
            fill="#04060c"
          />
          <path d="M-30 -290 L-66 -220 L-52 -208 L-20 -262 Z" fill="#04060c" />
          <path
            d="M-34 -300 Q0 -332 34 -300"
            fill="none"
            stroke="rgba(160,190,255,0.55)"
            strokeWidth={3}
          />
        </g>
        {Array.from({ length: 24 }, (_, i) => {
          const x = random(`vffx${i}`) * W;
          const y = 1340 + random(`vffy${i}`) * 400;
          return (
            <circle
              key={i}
              cx={x + Math.sin(f / 40 + i) * 30}
              cy={y + Math.cos(f / 33 + i) * 20}
              r={22}
              fill="url(#pFF)"
              opacity={0.4 + 0.6 * Math.abs(Math.sin(f / 14 + i * 1.7))}
            />
          );
        })}
      </svg>
      <Label index={2} />
    </AbsoluteFill>
  );
};

/* ---------------------------------- 4 · city ----------------------------------- */

const BLOCKS = Array.from({ length: 16 * 26 }, (_, i) => {
  const gx = i % 16;
  const gy = Math.floor(i / 16);
  return {
    x: gx * 90 - 160,
    y: gy * 90 - 200,
    w: 52 + random(`vbw${i}`) * 26,
    h: 52 + random(`vbh${i}`) * 26,
    l: random(`vbl${i}`),
    lit: random(`vbt${i}`) > 0.3,
  };
});
const CARS = Array.from({ length: 80 }, (_, i) => ({
  horiz: random(`vch${i}`) > 0.5,
  lane: Math.floor(random(`vcl${i}`) * 14),
  off: random(`vco${i}`) * 2600,
  sp: 3 + random(`vcs${i}`) * 5,
  c: random(`vcc${i}`) > 0.5,
}));

const City: React.FC = () => {
  const f = useCurrentFrame();
  const lights = (
    <g>
      {BLOCKS.filter((b) => b.lit && b.l > 0.6).map((b, i) => (
        <rect
          key={i}
          x={b.x + b.w * 0.34}
          y={b.y + b.h * 0.34}
          width={b.w * 0.3}
          height={b.h * 0.3}
          rx={3}
          fill={`rgba(255,${180 + b.l * 50},${100 + b.l * 80},0.55)`}
        />
      ))}
      {CARS.map((c, i) => {
        const pos = (c.off + f * c.sp) % 2800;
        const x = c.horiz ? -200 + pos : -160 + c.lane * 90 + 8;
        const y = c.horiz ? -200 + c.lane * 90 + 8 : -200 + pos * 0.8;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={7}
            fill={c.c ? "#fff3c4" : "#ff5a4d"}
          />
        );
      })}
    </g>
  );
  return (
    <AbsoluteFill style={{ backgroundColor: "#03050c" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="bloom" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
          <filter id="dof" x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
          {glow("yTower", "#ffd9a0", 0.85)}
          <radialGradient id="yFog" cx="50%" cy="50%" r="65%">
            <stop offset="55%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.85)" />
          </radialGradient>
        </defs>
        <g transform={`rotate(-10 ${CX} ${CY}) translate(${-f * 0.5} 0)`}>
          {BLOCKS.map((b, i) => (
            <rect
              key={i}
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx={5}
              fill={
                b.lit
                  ? `rgba(255,${170 + b.l * 60},${90 + b.l * 80},${0.07 + b.l * 0.14})`
                  : "rgba(26,36,66,0.55)"
              }
            />
          ))}
          {Array.from({ length: 24 }, (_, i) => (
            <line
              key={`h${i}`}
              x1={-300}
              x2={1500}
              y1={-160 + i * 90}
              y2={-160 + i * 90}
              stroke="rgba(255,190,110,0.3)"
              strokeWidth={3}
            />
          ))}
          {Array.from({ length: 16 }, (_, i) => (
            <line
              key={`v${i}`}
              y1={-300}
              y2={2300}
              x1={-120 + i * 90}
              x2={-120 + i * 90}
              stroke="rgba(255,190,110,0.3)"
              strokeWidth={3}
            />
          ))}
          <path
            d="M-200 1100 C 100 800 500 1250 700 900 S 1200 700 1500 1000"
            fill="none"
            stroke="rgba(30,80,160,0.6)"
            strokeWidth={100}
            strokeLinecap="round"
          />
          <path
            d="M-200 1100 C 100 800 500 1250 700 900 S 1200 700 1500 1000"
            fill="none"
            stroke="rgba(130,190,255,0.35)"
            strokeWidth={8}
            strokeLinecap="round"
          />
          <g filter="url(#dof)">{lights}</g>
          <g
            filter="url(#bloom)"
            opacity={0.9}
            style={{ mixBlendMode: "screen" }}
          >
            {lights}
          </g>
          {[
            [300, 700],
            [760, 1100],
            [520, 400],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={130 + Math.sin(f / 12 + i) * 14}
              fill="url(#yTower)"
            />
          ))}
        </g>
        <rect width={W} height={H} fill="url(#yFog)" />
      </svg>
      <Label index={3} />
    </AbsoluteFill>
  );
};

/* ---------------------------------- 5 · Earth ---------------------------------- */

const Earth: React.FC = () => {
  const f = useCurrentFrame();
  const R = 340;
  const shift = f * 2.0;
  const moonA = f * 0.03 + 0.4;
  const mx = CX + Math.cos(moonA) * 420;
  const my = CY + Math.sin(moonA) * 130 - 40;
  return (
    <AbsoluteFill style={{ backgroundColor: "#01020a" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id="eClip">
            <circle cx={CX} cy={CY} r={R} />
          </clipPath>
          <radialGradient id="eOcean" cx="38%" cy="34%" r="85%">
            <stop offset="0%" stopColor="#2f86d8" />
            <stop offset="55%" stopColor="#0c3f8f" />
            <stop offset="100%" stopColor="#04183d" />
          </radialGradient>
          <radialGradient id="eAtm" cx="50%" cy="50%" r="50%">
            <stop offset="86%" stopColor="rgba(90,170,255,0)" />
            <stop offset="93%" stopColor="rgba(110,190,255,0.55)" />
            <stop offset="100%" stopColor="rgba(110,190,255,0)" />
          </radialGradient>
          <radialGradient id="eLimb" cx="38%" cy="34%" r="80%">
            <stop offset="45%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,3,12,0.92)" />
          </radialGradient>
          <radialGradient id="eSpec" cx="34%" cy="30%" r="22%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <linearGradient id="eNight" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0.45" stopColor="#000" />
            <stop offset="0.8" stopColor="#fff" />
          </linearGradient>
          <mask id="eNightM">
            <rect
              x={CX - R}
              y={CY - R}
              width={2 * R}
              height={2 * R}
              fill="url(#eNight)"
            />
          </mask>
          <filter id="eLand" x="0" y="0" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.0042 0.0052"
              numOctaves={5}
              seed={7}
              result="n"
            />
            <feColorMatrix
              in="n"
              type="matrix"
              values="0 0 0 0 0.14  0 0 0 0 0.36  0 0 0 0 0.16  16 0 0 0 -7.4"
              result="g"
            />
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.011"
              numOctaves={4}
              seed={19}
              result="n2"
            />
            <feColorMatrix
              in="n2"
              type="matrix"
              values="0 0 0 0 0.55  0 0 0 0 0.45  0 0 0 0 0.26  5 0 0 0 -2.75"
              result="d"
            />
            <feComposite in="d" in2="g" operator="in" result="dd" />
            <feMerge>
              <feMergeNode in="g" />
              <feMergeNode in="dd" />
            </feMerge>
          </filter>
          <linearGradient id="iceT" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </linearGradient>
          <linearGradient id="iceB" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </linearGradient>
          <mask id="iceTM">
            <rect
              x={CX - R - 340}
              y={CY - R}
              width={1300}
              height={90}
              fill="url(#iceT)"
            />
          </mask>
          <mask id="iceBM">
            <rect
              x={CX - R - 340}
              y={CY + R - 90}
              width={1300}
              height={90}
              fill="url(#iceB)"
            />
          </mask>
          <filter id="eIce" x="0" y="0" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.01"
              numOctaves={3}
              seed={4}
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.95  0 0 0 0 0.98  0 0 0 0 1  3 0 0 0 -1.3"
            />
          </filter>
          <filter id="eCloud" x="0" y="0" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.0045 0.014"
              numOctaves={5}
              seed={3}
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  3.0 0 0 0 -1.35"
            />
          </filter>
          <filter id="eLights" x="0" y="0" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.05"
              numOctaves={2}
              seed={31}
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 1  0 0 0 0 0.78  0 0 0 0 0.4  45 0 0 0 -25"
            />
          </filter>
        </defs>
        <Starfield n={260} seed="earth" max={1.6} />
        <circle cx={CX} cy={CY} r={R * 1.16} fill="url(#eAtm)" />
        <circle cx={CX} cy={CY} r={R} fill="url(#eOcean)" />
        <g clipPath="url(#eClip)">
          <g transform={`translate(${shift} 0)`}>
            <rect
              x={CX - R - 340}
              y={CY - R}
              width={1300}
              height={2 * R}
              filter="url(#eLand)"
            />
            <g mask="url(#iceTM)">
              <rect
                x={CX - R - 340}
                y={CY - R}
                width={1300}
                height={90}
                filter="url(#eIce)"
                opacity={0.9}
              />
            </g>
            <g mask="url(#iceBM)">
              <rect
                x={CX - R - 340}
                y={CY + R - 90}
                width={1300}
                height={90}
                filter="url(#eIce)"
                opacity={0.9}
              />
            </g>
          </g>
          <g transform={`translate(${shift * 1.5} 0)`} opacity={0.85}>
            <rect
              x={CX - R - 540}
              y={CY - R}
              width={1700}
              height={2 * R}
              filter="url(#eCloud)"
            />
          </g>
          <g mask="url(#eNightM)" transform={`translate(${shift} 0)`}>
            <rect
              x={CX - R - 340}
              y={CY - R}
              width={1300}
              height={2 * R}
              filter="url(#eLights)"
              opacity={0.85}
            />
          </g>
          <circle cx={CX} cy={CY} r={R} fill="url(#eLimb)" />
          <circle cx={CX} cy={CY} r={R} fill="url(#eSpec)" />
        </g>
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke="rgba(150,210,255,0.35)"
          strokeWidth={3}
        />
        <g opacity={Math.sin(moonA) > 0 ? 1 : 0.95}>
          <circle
            cx={mx}
            cy={my}
            r={Math.sin(moonA) > 0 ? 46 : 38}
            fill="#bdb9b2"
          />
          {[
            [-10, -8, 9],
            [12, 6, 7],
            [-4, 14, 5],
            [14, -12, 5],
          ].map(([dx, dy, rr], i) => (
            <circle
              key={i}
              cx={mx + dx}
              cy={my + dy}
              r={rr}
              fill="rgba(70,66,60,0.55)"
            />
          ))}
        </g>
      </svg>
      <Label index={4} />
    </AbsoluteFill>
  );
};

/* ------------------------------- 6 · solar system ------------------------------ */

const PLANETS = [
  {
    a: 120,
    r: 9,
    c: ["#e0d6c8", "#8b8174", "#3b352f"],
    ring: false,
    bands: false,
  },
  {
    a: 168,
    r: 15,
    c: ["#ffe9bd", "#d9a85a", "#6b4a18"],
    ring: false,
    bands: false,
  },
  {
    a: 225,
    r: 17,
    c: ["#a8d4ff", "#2f6fd1", "#0b2a63"],
    ring: false,
    bands: false,
  },
  {
    a: 280,
    r: 12,
    c: ["#ffb494", "#c8502e", "#531c0e"],
    ring: false,
    bands: false,
  },
  {
    a: 370,
    r: 40,
    c: ["#f1dcb8", "#c79a6a", "#5c3d22"],
    ring: false,
    bands: true,
  },
  {
    a: 450,
    r: 34,
    c: ["#fff1c9", "#d9bd7c", "#6b5424"],
    ring: true,
    bands: true,
  },
  {
    a: 520,
    r: 23,
    c: ["#c9f6fa", "#5fc4d1", "#18606b"],
    ring: false,
    bands: false,
  },
  {
    a: 575,
    r: 22,
    c: ["#a8bcff", "#3f5fd9", "#14246b"],
    ring: false,
    bands: false,
  },
] as const;
const BELT = Array.from({ length: 260 }, (_, i) => ({
  a: 315 + random(`vbl${i}`) * 38,
  t: random(`vbt${i}`) * 6.28,
  s: 0.8 + random(`vbs${i}`) * 2,
}));

const Solar: React.FC = () => {
  const f = useCurrentFrame();
  const squash = 0.4;
  const tilt = -14;
  const sun = { x: CX, y: CY };
  return (
    <AbsoluteFill style={{ backgroundColor: "#02030a" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          {glow("sSun", "#ffb347", 1)}
          {glow("sSun2", "#ff6a1e", 0.55)}
          {glow("sSun3", "#ff9a3d", 0.25)}
          <clipPath id="sunClip">
            <circle cx={CX} cy={CY} r={74} />
          </clipPath>
          <filter id="sunTex" x="0" y="0" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.035"
              numOctaves={4}
              seed={5}
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 1  1.2 0 0 0 0.35  0 0 0 0 0.05  0 0 0 0 1"
            />
          </filter>
        </defs>
        <Starfield n={240} seed="solar" />
        <g transform={`rotate(${tilt} ${CX} ${CY})`}>
          {PLANETS.map((p) => (
            <ellipse
              key={p.a}
              cx={CX}
              cy={CY}
              rx={p.a}
              ry={p.a * squash}
              fill="none"
              stroke="rgba(255,255,255,0.14)"
              strokeWidth={2}
            />
          ))}
          {BELT.map((b, i) => {
            const t = b.t + f * 0.006;
            return (
              <circle
                key={i}
                cx={CX + Math.cos(t) * b.a}
                cy={CY + Math.sin(t) * b.a * squash}
                r={b.s}
                fill="#a8a29a"
                opacity={0.8}
              />
            );
          })}
          <circle
            cx={CX}
            cy={CY}
            r={300 + Math.sin(f / 9) * 10}
            fill="url(#sSun3)"
          />
          <circle
            cx={CX}
            cy={CY}
            r={190 + Math.sin(f / 7) * 8}
            fill="url(#sSun2)"
          />
          <circle cx={CX} cy={CY} r={110} fill="url(#sSun)" />
          <g clipPath="url(#sunClip)">
            <circle cx={CX} cy={CY} r={74} fill="#ff9a2e" />
            <g transform={`translate(${f * 0.6} 0)`}>
              <rect
                x={CX - 140}
                y={CY - 80}
                width={300}
                height={160}
                filter="url(#sunTex)"
              />
            </g>
            <circle cx={CX} cy={CY} r={74} fill="url(#sSun)" opacity={0.35} />
          </g>
          {Array.from({ length: 10 }, (_, i) => {
            const a = (i / 10) * Math.PI * 2 + f * 0.01;
            return (
              <line
                key={i}
                x1={CX + Math.cos(a) * 78}
                y1={CY + Math.sin(a) * 78}
                x2={CX + Math.cos(a) * (110 + 30 * Math.sin(f / 9 + i))}
                y2={CY + Math.sin(a) * (110 + 30 * Math.sin(f / 9 + i))}
                stroke="rgba(255,190,90,0.5)"
                strokeWidth={5}
                strokeLinecap="round"
              />
            );
          })}
          {PLANETS.map((p, i) => {
            const t = i * 1.3 + f * (0.9 / Math.pow(p.a / 100, 1.5)) * 0.04;
            const x = CX + Math.cos(t) * p.a;
            const y = CY + Math.sin(t) * p.a * squash;
            const dx = sun.x - x;
            const dy = sun.y - y;
            const L = Math.hypot(dx, dy) || 1;
            const fx = 0.5 + (dx / L) * 0.28;
            const fy = 0.5 + (dy / L) * 0.28;
            const id = `pl${i}`;
            return (
              <g key={i}>
                <defs>
                  <radialGradient
                    id={id}
                    cx={fx}
                    cy={fy}
                    r={0.75}
                    fx={fx}
                    fy={fy}
                  >
                    <stop offset="0%" stopColor={p.c[0]} />
                    <stop offset="55%" stopColor={p.c[1]} />
                    <stop offset="100%" stopColor={p.c[2]} />
                  </radialGradient>
                  <clipPath id={`${id}c`}>
                    <circle cx={x} cy={y} r={p.r} />
                  </clipPath>
                </defs>
                {p.ring && (
                  <ellipse
                    cx={x}
                    cy={y}
                    rx={p.r * 2.2}
                    ry={p.r * 0.62}
                    fill="none"
                    stroke="rgba(236,214,160,0.85)"
                    strokeWidth={6}
                    transform={`rotate(-18 ${x} ${y})`}
                  />
                )}
                <circle cx={x} cy={y} r={p.r} fill={`url(#${id})`} />
                {p.bands && (
                  <g clipPath={`url(#${id}c)`} opacity={0.35}>
                    {[-0.55, -0.2, 0.15, 0.5].map((o, k) => (
                      <rect
                        key={k}
                        x={x - p.r}
                        y={y + o * p.r - 2}
                        width={p.r * 2}
                        height={4 + k}
                        fill={k % 2 ? "#7a5a36" : "#fff3d6"}
                      />
                    ))}
                  </g>
                )}
                {p.ring && (
                  <path
                    d={`M ${x - p.r * 2.2} ${y} A ${p.r * 2.2} ${p.r * 0.62} 0 0 0 ${x + p.r * 2.2} ${y}`}
                    fill="none"
                    stroke="rgba(236,214,160,0.85)"
                    strokeWidth={6}
                    transform={`rotate(-18 ${x} ${y})`}
                  />
                )}
              </g>
            );
          })}
        </g>
      </svg>
      <Label index={5} />
    </AbsoluteFill>
  );
};

/* ---------------------------------- 7 · galaxy --------------------------------- */

const GAL = Array.from({ length: 2300 }, (_, i) => {
  const arm = i % 2;
  const bulge = i > 1900;
  const t = bulge
    ? random(`vgt${i}`) * 0.12
    : Math.pow(random(`vgt${i}`), 0.85);
  const r = 24 + t * 560;
  const th =
    arm * Math.PI +
    3.1 * Math.log(1 + t * 7) +
    (random(`vgj${i}`) - 0.5) * (0.9 + t * 0.7);
  return {
    r,
    th,
    s: 0.8 + random(`vgs${i}`) * 3,
    t,
    hii: random(`vgh${i}`) > 0.93,
  };
});

const Galaxy: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#01020a" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          {glow("gCore", "#ffd9a0", 1)}
          {glow("gHalo", "#7a8cff", 0.5)}
          <radialGradient id="gM">
            <stop offset="25%" stopColor="#fff" />
            <stop offset="100%" stopColor="#000" />
          </radialGradient>
          <mask id="gMask">
            <circle r={620} fill="url(#gM)" />
          </mask>
          <filter id="gDust" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.009"
              numOctaves={5}
              seed={13}
            />
            <feColorMatrix
              type="matrix"
              values="0.6 0 0 0 0.35  0 0 0 0 0.45  0 0 0 0 1  3.2 0 0 0 -1.15"
            />
          </filter>
          <filter id="gSoft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>
        <Starfield n={180} seed="gal" />
        <g transform={`translate(${CX} ${CY}) rotate(-24) scale(1 0.6)`}>
          <circle r={640} fill="url(#gHalo)" />
          <g transform={`rotate(${f * 0.18})`}>
            <g mask="url(#gMask)" opacity={0.85}>
              <rect
                x={-640}
                y={-640}
                width={1280}
                height={1280}
                filter="url(#gDust)"
              />
            </g>
            <g filter="url(#gSoft)">
              {GAL.map((g, i) => (
                <circle
                  key={i}
                  cx={Math.cos(g.th) * g.r}
                  cy={Math.sin(g.th) * g.r}
                  r={g.s}
                  fill={
                    g.hii
                      ? "#ff6fa8"
                      : g.t < 0.25
                        ? "#ffe2a8"
                        : g.t < 0.6
                          ? "#cfe0ff"
                          : "#8fb2ff"
                  }
                  opacity={0.5 + 0.45 * (1 - g.t)}
                />
              ))}
            </g>
          </g>
          <circle r={170 + Math.sin(f / 10) * 8} fill="url(#gCore)" />
          <circle r={40} fill="#fff7de" />
        </g>
      </svg>
      <Label index={6} />
    </AbsoluteFill>
  );
};

/* --------------------------------- 8 · universe -------------------------------- */

const NODES = Array.from({ length: 80 }, (_, i) => ({
  x: 60 + random(`vnx${i}`) * 960,
  y: 360 + random(`vny${i}`) * 1100,
}));
const EDGES: [number, number][] = [];
NODES.forEach((a, i) =>
  NODES.forEach((b, j) => {
    if (j > i && Math.hypot(a.x - b.x, a.y - b.y) < 250) EDGES.push([i, j]);
  }),
);
const GALX = Array.from({ length: 800 }, (_, i) => {
  const n = NODES[Math.floor(random(`vgn${i}`) * NODES.length)];
  const a = random(`vga${i}`) * Math.PI * 2;
  const r = Math.abs(random(`vgr${i}`) + random(`vgq${i}`) - 1) * 90;
  return {
    x: n.x + Math.cos(a) * r,
    y: n.y + Math.sin(a) * r,
    s: 0.9 + random(`vgu${i}`) * 2.2,
    c: random(`vgc${i}`),
  };
});

const Universe: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const grow = ramp(f, 4, 60);
  const here = ramp(f, 64, 84);
  const t1 = spring({
    frame: f - 84,
    fps,
    config: { damping: 15, stiffness: 110 },
  });
  const t2 = spring({
    frame: f - 100,
    fps,
    config: { damping: 13, stiffness: 120 },
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "#01010a" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          {glow("uHere", "#ffd166", 1)}
          <filter id="uGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="uNeb" x="0" y="0" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.004 0.003"
              numOctaves={4}
              seed={9}
            />
            <feColorMatrix
              type="matrix"
              values="0.5 0 0 0 0.25  0 0 0 0 0.3  0 0 0 0 0.9  2.4 0 0 0 -1.1"
            />
          </filter>
        </defs>
        <rect width={W} height={H} filter="url(#uNeb)" opacity={0.35} />
        <g
          transform={`translate(${CX} ${CY}) scale(${0.55 + 0.45 * grow}) translate(${-CX + Math.sin(f / 50) * 8} ${-CY})`}
          opacity={grow}
        >
          <g filter="url(#uGlow)">
            {EDGES.map(([a, b], i) => (
              <line
                key={i}
                x1={NODES[a].x}
                y1={NODES[a].y}
                x2={NODES[b].x}
                y2={NODES[b].y}
                stroke="rgba(130,160,255,0.35)"
                strokeWidth={3}
              />
            ))}
          </g>
          {GALX.map((g, i) => (
            <circle
              key={i}
              cx={g.x}
              cy={g.y}
              r={g.s}
              fill={g.c > 0.7 ? "#ffd9a0" : g.c > 0.3 ? "#cfe0ff" : "#ff9bd0"}
              opacity={0.5 + 0.5 * Math.abs(Math.sin(f / 20 + i))}
            />
          ))}
          {NODES.map((n, i) => (
            <circle
              key={i}
              cx={n.x}
              cy={n.y}
              r={14}
              fill="url(#uHere)"
              opacity={0.3}
            />
          ))}
        </g>
        <g opacity={here}>
          {[0, 1, 2].map((k) => {
            const p = (f * 0.02 + k / 3) % 1;
            return (
              <circle
                key={k}
                cx={CX}
                cy={CY}
                r={18 + p * 120}
                fill="none"
                stroke={AMBER}
                strokeWidth={4 * (1 - p)}
                opacity={1 - p}
              />
            );
          })}
          <circle cx={CX} cy={CY} r={9} fill="#fff" />
        </g>
      </svg>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 30%, rgba(1,1,10,0.8) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: CX + 40,
          top: CY - 130,
          fontFamily: FONT,
          fontSize: 52,
          fontWeight: 800,
          color: AMBER,
          opacity: here,
          textTransform: "uppercase",
          textShadow: "0 4px 24px #000",
        }}
      >
        Tú estás aquí
      </div>
      <AbsoluteFill
        style={{
          fontFamily: FONT,
          justifyContent: "flex-start",
          alignItems: "center",
          paddingTop: 1180,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 100,
            fontWeight: 800,
            fontStyle: "italic",
            lineHeight: 1.02,
            color: "#fff",
            textTransform: "uppercase",
            opacity: interpolate(t1, [0, 0.4], [0, 1], clamp),
            scale: interpolate(t1, [0, 1], [0.78, 1]),
            textShadow: "0 8px 50px #000",
          }}
        >
          Del átomo
          <br />
          al universo
        </div>
        <div
          style={{
            marginTop: 22,
            fontSize: 52,
            fontWeight: 600,
            color: LIME,
            opacity: interpolate(t2, [0, 0.4], [0, 1], clamp),
            textShadow: "0 4px 30px #000",
          }}
        >
          100% código · Remotion
        </div>
      </AbsoluteFill>
      <Label index={7} />
    </AbsoluteFill>
  );
};

/* ------------------------------- global overlays ------------------------------- */

const WARP = Array.from({ length: 70 }, (_, i) => ({
  a: random(`vwa${i}`) * Math.PI * 2,
  r0: 90 + random(`vwr${i}`) * 220,
  l: 0.6 + random(`vwl${i}`) * 1.2,
}));

const Warp: React.FC = () => {
  const f = useCurrentFrame();
  let w = 0;
  for (let k = 1; k < 8; k++) {
    const p = (f - STARTS[k]) / OVERLAP;
    if (p >= 0 && p <= 1) w = Math.max(w, Math.sin(p * Math.PI));
  }
  if (w <= 0.01) return null;
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% ${(CY / H) * 100}%, rgba(190,215,255,${0.5 * w}), transparent 45%)`,
        }}
      />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {WARP.map((l, i) => {
          const r0 = l.r0 + w * 260 * l.l;
          const r1 = r0 + 50 + w * 800 * l.l;
          return (
            <line
              key={i}
              x1={CX + Math.cos(l.a) * r0}
              y1={CY + Math.sin(l.a) * r0 * 1.4}
              x2={CX + Math.cos(l.a) * r1}
              y2={CY + Math.sin(l.a) * r1 * 1.4}
              stroke={i % 3 ? "#cfe0ff" : "#ffd9a0"}
              strokeWidth={2 + w * 4}
              opacity={w * 0.8}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

const Ruler: React.FC = () => {
  const frame = useCurrentFrame();
  const e = exponentAt(frame);
  const x0 = 100;
  const x1 = 980;
  const px = (v: number) => x0 + ((v + 10) / 36) * (x1 - x0);
  const vis = ramp(frame, 6, 28);
  const fadeEnd = 1 - ramp(frame, 760, 784);
  return (
    <AbsoluteFill style={{ fontFamily: FONT, opacity: vis * fadeEnd }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1420,
          textAlign: "center",
          color: "#fff",
          textShadow: "0 4px 24px rgba(0,0,0,0.85)",
        }}
      >
        <div
          style={{
            fontSize: 40,
            fontWeight: 600,
            letterSpacing: 8,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          ESCALA
        </div>
        <div style={{ fontSize: 120, fontWeight: 800, lineHeight: 1 }}>
          10
          <span style={{ fontSize: 72, verticalAlign: "super" }}>
            {e.toFixed(0).replace("-", "−")}
          </span>
          <span style={{ fontSize: 60, fontWeight: 600 }}> m</span>
        </div>
      </div>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <rect
          x={x0}
          y={1650}
          width={x1 - x0}
          height={10}
          rx={5}
          fill="rgba(255,255,255,0.18)"
        />
        <rect
          x={x0}
          y={1650}
          width={px(e) - x0}
          height={10}
          rx={5}
          fill={AMBER}
        />
        {EXPS.map((v, i) => (
          <circle
            key={i}
            cx={px(v)}
            cy={1655}
            r={e >= v - 0.01 ? 11 : 7}
            fill={e >= v - 0.01 ? "#fff" : "rgba(255,255,255,0.35)"}
          />
        ))}
        <circle
          cx={px(e)}
          cy={1655}
          r={22}
          fill={AMBER}
          opacity={0.35 + 0.2 * Math.sin(frame / 5)}
        />
        <circle cx={px(e)} cy={1655} r={13} fill="#fff" />
        <text
          x={x0}
          y={1710}
          fontSize={34}
          fontWeight={600}
          fill="rgba(255,255,255,0.8)"
          fontFamily={FONT}
        >
          ÁTOMO
        </text>
        <text
          x={x1}
          y={1710}
          fontSize={34}
          fontWeight={600}
          fill="rgba(255,255,255,0.8)"
          fontFamily={FONT}
          textAnchor="end"
        >
          UNIVERSO
        </text>
      </svg>
    </AbsoluteFill>
  );
};

/* ----------------------------------- root -------------------------------------- */

export const CosmosV: React.FC = () => {
  const frame = useCurrentFrame();
  const T = linearTiming({
    durationInFrames: OVERLAP,
    easing: Easing.bezier(0.65, 0, 0.35, 1),
  });
  const scenes = [Atom, Cell, Person, City, Earth, Solar, Galaxy, Universe];
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <TransitionSeries>
        {scenes.flatMap((Scene, i) => {
          const items = [
            <TransitionSeries.Sequence
              key={`s${i}`}
              name={NAMES[i]}
              durationInFrames={DURS[i]}
            >
              <Scene />
            </TransitionSeries.Sequence>,
          ];
          if (i < scenes.length - 1)
            items.push(
              <TransitionSeries.Transition
                key={`t${i}`}
                presentation={zoomThrough()}
                timing={T}
              />,
            );
          return items;
        })}
      </TransitionSeries>
      <Warp />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.45) 130%)",
        }}
      />
      <Ruler />
      <Audio
        src={staticFile("cosmos.mp3")}
        volume={interpolate(frame, [0, 12, 870, 900], [0, 1, 1, 0], clamp)}
      />
    </AbsoluteFill>
  );
};
