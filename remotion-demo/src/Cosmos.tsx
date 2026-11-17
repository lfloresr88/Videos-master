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

const CX = 960;
const CY = 540;
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
  "10²⁶ m · el universo observable",
] as const;
const AMBER = "#ffb347";
const CYAN = "#3df5ff";
const PINK = "#ff4d8d";

/** The scale the camera is at (powers of ten) for a global frame. */
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
      <AbsoluteFill style={{ scale, transformOrigin: "50% 50%" }}>
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
      s: 1.6 + random(`${seed}s${i}`) * 3.2,
      c: random(`${seed}c${i}`),
    };
  });

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
          left: 100,
          top: 70,
          opacity: interpolate(s, [0, 0.4], [0, 1], clamp),
          translate: `${interpolate(s, [0, 1], [-120, 0])}px 0px`,
        }}
      >
        <div
          style={{
            fontSize: 118,
            fontWeight: 800,
            fontStyle: "italic",
            lineHeight: 1,
            color: "#fff",
            textTransform: "uppercase",
            textShadow: "0 6px 40px rgba(0,0,0,0.8)",
          }}
        >
          {NAMES[index]}
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: 56,
            fontWeight: 600,
            color: AMBER,
            textShadow: "0 4px 24px rgba(0,0,0,0.8)",
          }}
        >
          {SUBS[index]}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const glow = (id: string, color: string, op = 1) => (
  <radialGradient id={id}>
    <stop offset="0%" stopColor={color} stopOpacity={op} />
    <stop offset="100%" stopColor={color} stopOpacity={0} />
  </radialGradient>
);

/* --------------------------------- 1 · atom ------------------------------------ */

const CLOUD = shell(320, "cloud", 110, 330);
const NUCLEONS = shell(16, "nuc", 0, 30);

const Atom: React.FC = () => {
  const f = useCurrentFrame();
  const rot = f * 0.012;
  const pts = CLOUD.map((p) => {
    const x1 = p.x * Math.cos(rot) - p.z * Math.sin(rot);
    const z1 = p.x * Math.sin(rot) + p.z * Math.cos(rot);
    const y2 = p.y * Math.cos(0.5) - z1 * Math.sin(0.5);
    const z2 = p.y * Math.sin(0.5) + z1 * Math.cos(0.5);
    return { x: CX + x1, y: CY + y2, z: z2, s: p.s, c: p.c };
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "#03050d" }}>
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          {glow("aCore", "#ff7a8a", 0.9)}
          {glow("aCloud", "#4d7cff", 0.35)}
        </defs>
        <circle cx={CX} cy={CY} r={430} fill="url(#aCloud)" />
        {[0, 60, 120].map((deg, k) => (
          <g key={k} transform={`rotate(${deg} ${CX} ${CY})`}>
            <ellipse
              cx={CX}
              cy={CY}
              rx={330}
              ry={120}
              fill="none"
              stroke="rgba(120,170,255,0.35)"
              strokeWidth={2}
            />
            {(() => {
              const a = f * 0.07 + k * 2.1;
              const x = CX + Math.cos(a) * 330;
              const y = CY + Math.sin(a) * 120;
              return (
                <g>
                  <circle cx={x} cy={y} r={34} fill="url(#aCloud)" />
                  <circle cx={x} cy={y} r={11} fill="#9ad1ff" />
                </g>
              );
            })()}
          </g>
        ))}
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={p.s * (0.7 + (p.z + 330) / 660)}
            fill={p.c > 0.5 ? "#7fb2ff" : "#b58cff"}
            opacity={0.35 + (p.z + 330) / 900}
          />
        ))}
        <circle
          cx={CX}
          cy={CY}
          r={90 + Math.sin(f / 8) * 6}
          fill="url(#aCore)"
        />
        {NUCLEONS.map((p, i) => (
          <circle
            key={i}
            cx={CX + p.x + Math.sin(f / 5 + i) * 2}
            cy={CY + p.y + Math.cos(f / 6 + i) * 2}
            r={13}
            fill={i % 2 ? "#ff5d73" : "#6ea8ff"}
            stroke="rgba(255,255,255,0.5)"
            strokeWidth={1.5}
          />
        ))}
      </svg>
      <Label index={0} />
    </AbsoluteFill>
  );
};

/* ---------------------------------- 2 · cell ----------------------------------- */

const ORGS = Array.from({ length: 14 }, (_, i) => ({
  x: random(`ox${i}`) * 1920,
  y: random(`oy${i}`) * 1080,
  rx: 60 + random(`orx${i}`) * 120,
  ry: 40 + random(`ory${i}`) * 80,
  rot: random(`orr${i}`) * 180,
  c: i % 3,
}));

const Cell: React.FC = () => {
  const f = useCurrentFrame();
  const rungs = 44;
  const pts = Array.from({ length: rungs }, (_, i) => {
    const ph = i * 0.42 + f * 0.07;
    return {
      y: CY - 470 + i * 22,
      x1: Math.sin(ph) * 140,
      x2: -Math.sin(ph) * 140,
      d: Math.cos(ph),
    };
  });
  const strand = (key: "x1" | "x2") =>
    pts.map((p) => `${CX + p[key]},${p.y}`).join(" ");
  return (
    <AbsoluteFill style={{ backgroundColor: "#04141a" }}>
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          {glow("cMem", "#1ec9b0", 0.55)}
          {glow("cNuc", "#7c4dff", 0.7)}
        </defs>
        <circle cx={CX} cy={CY} r={900} fill="url(#cMem)" />
        <circle
          cx={CX}
          cy={CY}
          r={760}
          fill="none"
          stroke="rgba(120,255,230,0.35)"
          strokeWidth={10}
        />
        {ORGS.map((o, i) => (
          <ellipse
            key={i}
            cx={(o.x + f * (0.3 + (i % 4) * 0.2)) % 1920}
            cy={o.y + Math.sin(f / 30 + i) * 20}
            rx={o.rx}
            ry={o.ry}
            transform={`rotate(${o.rot + f * 0.1} ${o.x} ${o.y})`}
            fill={
              [
                "rgba(255,170,80,0.22)",
                "rgba(80,200,255,0.2)",
                "rgba(255,100,160,0.2)",
              ][o.c]
            }
            stroke="rgba(255,255,255,0.18)"
            strokeWidth={2}
          />
        ))}
        <circle cx={CX} cy={CY} r={420} fill="url(#cNuc)" />
        <g transform={`rotate(-16 ${CX} ${CY})`}>
          {pts.map((p, i) => (
            <line
              key={i}
              x1={CX + p.x1}
              y1={p.y}
              x2={CX + p.x2}
              y2={p.y}
              stroke={i % 2 ? "#ffd166" : "#9be7ff"}
              strokeWidth={5}
              opacity={0.35 + (p.d + 1) * 0.25}
            />
          ))}
          <polyline
            points={strand("x1")}
            fill="none"
            stroke={CYAN}
            strokeWidth={10}
            strokeLinejoin="round"
          />
          <polyline
            points={strand("x2")}
            fill="none"
            stroke={PINK}
            strokeWidth={10}
            strokeLinejoin="round"
          />
          {pts.map((p, i) => (
            <g key={i}>
              <circle cx={CX + p.x1} cy={p.y} r={11 + p.d * 5} fill={CYAN} />
              <circle cx={CX + p.x2} cy={p.y} r={11 - p.d * 5} fill={PINK} />
            </g>
          ))}
        </g>
      </svg>
      <Label index={1} />
    </AbsoluteFill>
  );
};

/* --------------------------------- 3 · person ---------------------------------- */

const STARS = Array.from({ length: 260 }, (_, i) => ({
  x: random(`sx${i}`) * 1920,
  y: random(`sy${i}`) * 760,
  r: 0.8 + random(`sr${i}`) * 2.4,
  p: random(`sp${i}`) * 6,
}));

const Person: React.FC = () => {
  const f = useCurrentFrame();
  const shoot = ramp(f, 60, 85, Easing.linear);
  return (
    <AbsoluteFill
      style={{ background: "linear-gradient(#030614, #14224a 70%, #2a2f5e)" }}
    >
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          {glow("pMW", "#9fb6ff", 0.35)}
          {glow("pFF", "#ffe28a", 0.9)}
        </defs>
        <ellipse
          cx={1000}
          cy={300}
          rx={1100}
          ry={150}
          transform="rotate(-24 1000 300)"
          fill="url(#pMW)"
        />
        {STARS.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="#fff"
            opacity={0.4 + 0.6 * Math.abs(Math.sin(f / 18 + s.p))}
          />
        ))}
        {shoot > 0 && shoot < 1 && (
          <line
            x1={1500 - shoot * 700}
            y1={120 + shoot * 300}
            x2={1500 - shoot * 700 + 160}
            y2={120 + shoot * 300 - 70}
            stroke="#fff"
            strokeWidth={4}
            strokeLinecap="round"
            opacity={1 - shoot}
          />
        )}
        <path
          d="M0 880 C 300 800 600 860 960 840 S 1600 790 1920 860 V1080 H0 Z"
          fill="#05070f"
        />
        {/* person */}
        <g transform={`translate(${CX} 870)`}>
          <ellipse cx={0} cy={4} rx={80} ry={12} fill="rgba(0,0,0,0.5)" />
          <rect
            x={-22}
            y={-150}
            width={18}
            height={150}
            rx={8}
            fill="#0a0c18"
          />
          <rect x={4} y={-150} width={18} height={150} rx={8} fill="#0a0c18" />
          <path
            d="M-34 -150 L-30 -300 Q0 -330 30 -300 L34 -150 Z"
            fill="#0a0c18"
          />
          <circle cx={0} cy={-345} r={34} fill="#0a0c18" />
          <path
            d={`M30 -290 L${70 + Math.sin(f / 20) * 4} -400 L${88 + Math.sin(f / 20) * 4} -392 L48 -276 Z`}
            fill="#0a0c18"
          />
          <path d="M-30 -290 L-66 -220 L-52 -208 L-20 -262 Z" fill="#0a0c18" />
        </g>
        {Array.from({ length: 26 }, (_, i) => {
          const x = random(`ffx${i}`) * 1920;
          const y = 760 + random(`ffy${i}`) * 260;
          const a = 0.4 + 0.6 * Math.abs(Math.sin(f / 14 + i * 1.7));
          return (
            <circle
              key={i}
              cx={x + Math.sin(f / 40 + i) * 30}
              cy={y + Math.cos(f / 33 + i) * 20}
              r={22}
              fill="url(#pFF)"
              opacity={a}
            />
          );
        })}
      </svg>
      <Label index={2} />
    </AbsoluteFill>
  );
};

/* ---------------------------------- 4 · city ----------------------------------- */

const BLOCKS = Array.from({ length: 26 * 15 }, (_, i) => {
  const gx = i % 26;
  const gy = Math.floor(i / 26);
  return {
    x: gx * 90 - 220,
    y: gy * 90 - 120,
    w: 54 + random(`bw${i}`) * 26,
    h: 54 + random(`bh${i}`) * 26,
    l: random(`bl${i}`),
    lit: random(`bt${i}`) > 0.35,
  };
});
const CARS = Array.from({ length: 70 }, (_, i) => ({
  horiz: random(`ch${i}`) > 0.5,
  lane: Math.floor(random(`cl${i}`) * 14),
  off: random(`co${i}`) * 2400,
  sp: 3 + random(`cs${i}`) * 5,
  c: random(`cc${i}`) > 0.5,
}));

const City: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#04060e" }}>
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>{glow("yTower", "#ffd9a0", 0.75)}</defs>
        <g transform={`rotate(-9 ${CX} ${CY}) translate(${-f * 0.6} 0)`}>
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
                  ? `rgba(255,${170 + b.l * 60},${90 + b.l * 80},${0.1 + b.l * 0.25})`
                  : "rgba(30,40,70,0.4)"
              }
            />
          ))}
          {Array.from({ length: 16 }, (_, i) => (
            <line
              key={`h${i}`}
              x1={-300}
              x2={2400}
              y1={-80 + i * 90}
              y2={-80 + i * 90}
              stroke="rgba(255,190,110,0.28)"
              strokeWidth={3}
            />
          ))}
          {Array.from({ length: 28 }, (_, i) => (
            <line
              key={`v${i}`}
              y1={-200}
              y2={1500}
              x1={-180 + i * 90}
              x2={-180 + i * 90}
              stroke="rgba(255,190,110,0.28)"
              strokeWidth={3}
            />
          ))}
          <path
            d="M-300 700 C 300 520 700 800 1200 560 S 2100 480 2500 660"
            fill="none"
            stroke="rgba(40,90,170,0.55)"
            strokeWidth={90}
            strokeLinecap="round"
          />
          <path
            d="M-300 700 C 300 520 700 800 1200 560 S 2100 480 2500 660"
            fill="none"
            stroke="rgba(120,180,255,0.3)"
            strokeWidth={8}
            strokeLinecap="round"
          />
          {CARS.map((c, i) => {
            const pos = (c.off + f * c.sp) % 2700;
            const x = c.horiz ? -300 + pos : -180 + c.lane * 90 + 8;
            const y = c.horiz ? -80 + c.lane * 90 + 8 : -200 + pos * 0.7;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={6}
                fill={c.c ? "#fff6d0" : "#ff6a5d"}
                opacity={0.95}
              />
            );
          })}
          {[
            [700, 380],
            [1250, 650],
            [980, 220],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={120 + Math.sin(f / 12 + i) * 14}
              fill="url(#yTower)"
            />
          ))}
        </g>
      </svg>
      <Label index={3} />
    </AbsoluteFill>
  );
};

/* ---------------------------------- 5 · Earth ---------------------------------- */

const LAND = Array.from({ length: 12 }, (_, i) => {
  const cx = random(`lx${i}`) * 1500;
  const cy = 190 + random(`ly${i}`) * 400;
  const r = 90 + random(`lr${i}`) * 150;
  const pts = Array.from({ length: 14 }, (_, k) => {
    const a = (k / 14) * Math.PI * 2;
    const rr = r * (0.6 + random(`lp${i}-${k}`) * 0.7);
    return `${cx + Math.cos(a) * rr * 1.3},${cy + Math.sin(a) * rr}`;
  }).join(" ");
  return pts;
});
const CLOUDS = Array.from({ length: 16 }, (_, i) => ({
  x: random(`kx${i}`) * 1500,
  y: 110 + random(`ky${i}`) * 560,
  w: 50 + random(`kw${i}`) * 110,
}));

const Earth: React.FC = () => {
  const f = useCurrentFrame();
  const R = 360;
  const shift = (f * 2.2) % 1500;
  const moonA = f * 0.025 + 1;
  return (
    <AbsoluteFill style={{ backgroundColor: "#02030a" }}>
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          {glow("eAtm", "#4aa8ff", 0.9)}
          <clipPath id="eClip">
            <circle cx={CX} cy={CY} r={R} />
          </clipPath>
          <radialGradient id="eOcean" cx="35%" cy="35%" r="80%">
            <stop offset="0%" stopColor="#3aa0ff" />
            <stop offset="60%" stopColor="#0f4fa8" />
            <stop offset="100%" stopColor="#06204a" />
          </radialGradient>
          <radialGradient id="eShade" cx="30%" cy="30%" r="85%">
            <stop offset="55%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,10,0.85)" />
          </radialGradient>
        </defs>
        {Array.from({ length: 140 }, (_, i) => (
          <circle
            key={i}
            cx={random(`es${i}`) * 1920}
            cy={random(`et${i}`) * 1080}
            r={0.8 + random(`ez${i}`) * 1.8}
            fill="#fff"
            opacity={0.7}
          />
        ))}
        <circle cx={CX} cy={CY} r={R + 90} fill="url(#eAtm)" opacity={0.7} />
        <circle cx={CX} cy={CY} r={R} fill="url(#eOcean)" />
        <g clipPath="url(#eClip)">
          {[0, 1].map((k) => (
            <g
              key={k}
              transform={`translate(${CX - R - 300 + k * 1500 - shift} ${CY - R - 60})`}
            >
              {LAND.map((pts, i) => (
                <polygon
                  key={i}
                  points={pts}
                  fill={i % 3 ? "#3d8b4a" : "#c8b36a"}
                  opacity={0.95}
                />
              ))}
            </g>
          ))}
          {[0, 1].map((k) => (
            <g
              key={k}
              transform={`translate(${CX - R - 300 + k * 1500 - shift * 1.4} ${CY - R - 60})`}
            >
              {CLOUDS.map((c, i) => (
                <ellipse
                  key={i}
                  cx={c.x}
                  cy={c.y}
                  rx={c.w}
                  ry={c.w * 0.16}
                  fill="rgba(255,255,255,0.4)"
                />
              ))}
            </g>
          ))}
          <circle cx={CX} cy={CY} r={R} fill="url(#eShade)" />
          {Array.from({ length: 70 }, (_, i) => {
            const a = random(`ea${i}`) * Math.PI * 2;
            const rr = Math.sqrt(random(`er${i}`)) * R * 0.95;
            const x = CX + Math.cos(a) * rr;
            const y = CY + Math.sin(a) * rr;
            return x > CX + 60 ? (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={2.6}
                fill="#ffd27a"
                opacity={0.85 * Math.min(1, (x - CX - 60) / 200)}
              />
            ) : null;
          })}
        </g>
        <circle
          cx={CX + Math.cos(moonA) * 600}
          cy={CY + Math.sin(moonA) * 170}
          r={Math.sin(moonA) > 0 ? 42 : 34}
          fill="#cfd3dc"
          opacity={0.95}
        />
      </svg>
      <Label index={4} />
    </AbsoluteFill>
  );
};

/* ------------------------------- 6 · solar system ------------------------------ */

const PLANETS = [
  { a: 150, r: 9, c: "#b5aca0", n: "" },
  { a: 215, r: 15, c: "#e8c98a", n: "" },
  { a: 290, r: 16, c: "#3f8cff", n: "" },
  { a: 360, r: 11, c: "#d1593a", n: "" },
  { a: 480, r: 38, c: "#d9a874", n: "" },
  { a: 600, r: 32, c: "#e8d49a", n: "ring" },
  { a: 715, r: 22, c: "#7fe0e8", n: "" },
  { a: 810, r: 21, c: "#4a6fe0", n: "" },
] as const;
const BELT = Array.from({ length: 220 }, (_, i) => ({
  a: 400 + random(`bl${i}`) * 55,
  t: random(`bt${i}`) * 6.28,
  s: 1 + random(`bs${i}`) * 2,
}));

const Solar: React.FC = () => {
  const f = useCurrentFrame();
  const squash = 0.34;
  return (
    <AbsoluteFill style={{ backgroundColor: "#03040c" }}>
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          {glow("sSun", "#ffb347", 1)}
          {glow("sSun2", "#ff7a2e", 0.5)}
        </defs>
        {Array.from({ length: 160 }, (_, i) => (
          <circle
            key={i}
            cx={random(`ss${i}`) * 1920}
            cy={random(`st${i}`) * 1080}
            r={0.7 + random(`sz${i}`) * 1.6}
            fill="#fff"
            opacity={0.6}
          />
        ))}
        <g transform={`rotate(-12 ${CX} ${CY})`}>
          {PLANETS.map((p) => (
            <ellipse
              key={p.a}
              cx={CX}
              cy={CY}
              rx={p.a}
              ry={p.a * squash}
              fill="none"
              stroke="rgba(255,255,255,0.16)"
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
            r={230 + Math.sin(f / 9) * 10}
            fill="url(#sSun2)"
          />
          <circle cx={CX} cy={CY} r={110} fill="url(#sSun)" />
          <circle cx={CX} cy={CY} r={62} fill="#fff1c2" />
          {PLANETS.map((p, i) => {
            const t = i * 1.3 + f * (0.9 / Math.pow(p.a / 100, 1.5)) * 0.04;
            const x = CX + Math.cos(t) * p.a;
            const y = CY + Math.sin(t) * p.a * squash;
            return (
              <g key={p.a}>
                {p.n === "ring" && (
                  <ellipse
                    cx={x}
                    cy={y}
                    rx={p.r * 2.1}
                    ry={p.r * 0.6}
                    fill="none"
                    stroke="rgba(232,212,154,0.8)"
                    strokeWidth={5}
                  />
                )}
                <circle cx={x} cy={y} r={p.r} fill={p.c} />
                <circle
                  cx={x - p.r * 0.25}
                  cy={y - p.r * 0.25}
                  r={p.r * 0.6}
                  fill="rgba(255,255,255,0.18)"
                />
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

const GAL = Array.from({ length: 2100 }, (_, i) => {
  const arm = i % 2;
  const t =
    i > 1700 ? random(`gt${i}`) * 0.12 : Math.pow(random(`gt${i}`), 0.85);
  const r = 30 + t * 760;
  const th =
    arm * Math.PI +
    3.1 * Math.log(1 + t * 7) +
    (random(`gj${i}`) - 0.5) * (0.9 + t * 0.7);
  return {
    r,
    th,
    s: 1 + random(`gs${i}`) * 3.4,
    t,
    hii: random(`gh${i}`) > 0.93,
  };
});

const Galaxy: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#02030a" }}>
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          {glow("gCore", "#ffd9a0", 1)}
          {glow("gHalo", "#7a8cff", 0.5)}
        </defs>
        {Array.from({ length: 120 }, (_, i) => (
          <circle
            key={i}
            cx={random(`gx${i}`) * 1920}
            cy={random(`gy${i}`) * 1080}
            r={0.7 + random(`gz${i}`) * 1.3}
            fill="#fff"
            opacity={0.5}
          />
        ))}
        <g transform={`translate(${CX} ${CY}) rotate(-22) scale(1 0.56)`}>
          <circle r={820} fill="url(#gHalo)" />
          <g transform={`rotate(${f * 0.18})`}>
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
                opacity={0.55 + 0.4 * (1 - g.t)}
              />
            ))}
          </g>
          <circle r={190 + Math.sin(f / 10) * 8} fill="url(#gCore)" />
          <circle r={46} fill="#fff7de" />
        </g>
      </svg>
      <Label index={6} />
    </AbsoluteFill>
  );
};

/* --------------------------------- 8 · universe -------------------------------- */

const NODES = Array.from({ length: 90 }, (_, i) => ({
  x: 100 + random(`nx${i}`) * 1720,
  y: 80 + random(`ny${i}`) * 920,
}));
const EDGES: [number, number][] = [];
NODES.forEach((a, i) =>
  NODES.forEach((b, j) => {
    if (j > i && Math.hypot(a.x - b.x, a.y - b.y) < 260) EDGES.push([i, j]);
  }),
);
const GALX = Array.from({ length: 700 }, (_, i) => {
  const n = NODES[Math.floor(random(`gn${i}`) * NODES.length)];
  const a = random(`ga${i}`) * Math.PI * 2;
  const r = Math.abs(random(`gr${i}`) + random(`gq${i}`) - 1) * 90;
  return {
    x: n.x + Math.cos(a) * r,
    y: n.y + Math.sin(a) * r,
    s: 0.9 + random(`gu${i}`) * 2.2,
    c: random(`gc${i}`),
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
  const drift = Math.sin(f / 50) * 8;
  return (
    <AbsoluteFill style={{ backgroundColor: "#01020a" }}>
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>{glow("uHere", "#ffd166", 1)}</defs>
        <g
          transform={`translate(${CX} ${CY}) scale(${0.55 + 0.45 * grow}) translate(${-CX + drift} ${-CY})`}
          opacity={grow}
        >
          {EDGES.map(([a, b], i) => (
            <line
              key={i}
              x1={NODES[a].x}
              y1={NODES[a].y}
              x2={NODES[b].x}
              y2={NODES[b].y}
              stroke="rgba(120,150,255,0.22)"
              strokeWidth={2}
            />
          ))}
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
              r={12}
              fill="url(#uHere)"
              opacity={0.25}
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
                r={20 + p * 140}
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
            "radial-gradient(ellipse at center, rgba(0,0,0,0.0) 30%, rgba(1,2,10,0.8) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: CX + 50,
          top: CY - 150,
          fontFamily: FONT,
          fontSize: 64,
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
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 150,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 124,
            fontWeight: 800,
            fontStyle: "italic",
            lineHeight: 1,
            color: "#fff",
            textTransform: "uppercase",
            opacity: interpolate(t1, [0, 0.4], [0, 1], clamp),
            scale: interpolate(t1, [0, 1], [0.75, 1]),
            textShadow: "0 8px 50px #000",
          }}
        >
          Del átomo al universo
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 70,
            fontWeight: 600,
            color: LIME,
            opacity: interpolate(t2, [0, 0.4], [0, 1], clamp),
            textShadow: "0 4px 30px #000",
          }}
        >
          30 segundos · 100% código · Remotion
        </div>
      </AbsoluteFill>
      <Label index={7} />
    </AbsoluteFill>
  );
};

/* ------------------------------- global overlays ------------------------------- */

const WARP = Array.from({ length: 70 }, (_, i) => ({
  a: random(`wa${i}`) * Math.PI * 2,
  r0: 120 + random(`wr${i}`) * 260,
  l: 0.6 + random(`wl${i}`) * 1.2,
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
          background: `radial-gradient(circle at 50% 50%, rgba(190,215,255,${0.5 * w}), transparent 45%)`,
        }}
      />
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0 }}
      >
        {WARP.map((l, i) => {
          const r0 = l.r0 + w * 300 * l.l;
          const r1 = r0 + 60 + w * 900 * l.l;
          return (
            <line
              key={i}
              x1={CX + Math.cos(l.a) * r0}
              y1={CY + Math.sin(l.a) * r0 * 0.6}
              x2={CX + Math.cos(l.a) * r1}
              y2={CY + Math.sin(l.a) * r1 * 0.6}
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
  const x0 = 140;
  const x1 = 1780;
  const px = (v: number) => x0 + ((v + 10) / 36) * (x1 - x0);
  const vis = ramp(frame, 6, 28);
  const fadeEnd = 1 - ramp(frame, 880, 898);
  return (
    <AbsoluteFill style={{ fontFamily: FONT, opacity: vis * fadeEnd }}>
      <div
        style={{
          position: "absolute",
          right: 100,
          top: 76,
          textAlign: "right",
          color: "#fff",
          textShadow: "0 4px 24px rgba(0,0,0,0.8)",
        }}
      >
        <div
          style={{
            fontSize: 40,
            fontWeight: 600,
            letterSpacing: 6,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          ESCALA
        </div>
        <div style={{ fontSize: 110, fontWeight: 800, lineHeight: 1 }}>
          10
          <span style={{ fontSize: 66, verticalAlign: "super" }}>
            {e.toFixed(0).replace("-", "−")}
          </span>
          <span style={{ fontSize: 56, fontWeight: 600 }}> m</span>
        </div>
      </div>
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0 }}
      >
        <rect
          x={x0}
          y={978}
          width={x1 - x0}
          height={10}
          rx={5}
          fill="rgba(255,255,255,0.18)"
        />
        <rect
          x={x0}
          y={978}
          width={px(e) - x0}
          height={10}
          rx={5}
          fill={AMBER}
        />
        {EXPS.map((v, i) => (
          <g key={i}>
            <circle
              cx={px(v)}
              cy={983}
              r={e >= v - 0.01 ? 11 : 7}
              fill={e >= v - 0.01 ? "#fff" : "rgba(255,255,255,0.35)"}
            />
          </g>
        ))}
        <circle
          cx={px(e)}
          cy={983}
          r={22}
          fill={AMBER}
          opacity={0.35 + 0.2 * Math.sin(frame / 5)}
        />
        <circle cx={px(e)} cy={983} r={13} fill="#fff" />
        <text
          x={x0}
          y={1028}
          fontSize={34}
          fontWeight={600}
          fill="rgba(255,255,255,0.8)"
          fontFamily={FONT}
        >
          ÁTOMO
        </text>
        <text
          x={x1}
          y={1028}
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

export const Cosmos: React.FC = () => {
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
            "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.5) 130%)",
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
