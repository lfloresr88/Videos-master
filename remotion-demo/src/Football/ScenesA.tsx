import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Ball,
  clamp,
  Confetti,
  CYAN,
  FONT,
  GOLD,
  Glass,
  LIME,
  NIGHT,
  outCubic,
  Pitch,
  ramp,
  RED,
  StadiumBg,
  Title,
  WHITE,
} from "./common";

/* ================================================================== */
/* Scene 1 — the tunnel                                                */
/* ================================================================== */

export const Tunnel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const open = ramp(frame, 0, 150, Easing.inOut(Easing.cubic));
  const vx = 960;
  const vy = 470;
  const lineA = spring({ frame: frame - 70, fps, config: { damping: 200 } });
  const lineB = spring({
    frame: frame - 92,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#02040a", fontFamily: FONT }}>
      {/* light at the end of the tunnel */}
      <div
        style={{
          position: "absolute",
          left: vx - 900,
          top: vy - 900,
          width: 1800,
          height: 1800,
          borderRadius: "50%",
          scale: 0.06 + open * 1.1,
          background:
            "radial-gradient(circle, #ffffff 0%, #cfe6ff 18%, rgba(120,170,255,0.55) 40%, transparent 70%)",
        }}
      />
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0 }}
      >
        {/* tunnel perspective lines */}
        {Array.from({ length: 14 }, (_, i) => {
          const a = (i / 14) * Math.PI * 2;
          const far = 40 + open * 120;
          return (
            <line
              key={i}
              x1={vx + Math.cos(a) * far}
              y1={vy + Math.sin(a) * far * 0.6}
              x2={vx + Math.cos(a) * 1900}
              y2={vy + Math.sin(a) * 1500}
              stroke="rgba(160,200,255,0.20)"
              strokeWidth={3}
            />
          );
        })}
        {/* moving rings along the tunnel */}
        {Array.from({ length: 7 }, (_, i) => {
          const p = ((frame * 0.012 + i / 7) % 1) ** 2.2;
          return (
            <ellipse
              key={i}
              cx={vx}
              cy={vy}
              rx={60 + p * 1500}
              ry={40 + p * 950}
              fill="none"
              stroke="rgba(190,225,255,0.35)"
              strokeWidth={2 + p * 8}
              opacity={1 - p * 0.9}
            />
          );
        })}
        {/* crowd equalizer */}
        {Array.from({ length: 64 }, (_, i) => {
          const h =
            (40 +
              Math.abs(Math.sin(frame / 5 + i * 1.3)) * 120 +
              random(`eq${i}`) * 60) *
            ramp(frame, 20, 70);
          return (
            <rect
              key={i}
              x={i * 30}
              y={1080 - h}
              width={20}
              height={h}
              rx={6}
              fill={i % 2 ? LIME : CYAN}
              opacity={0.55}
            />
          );
        })}
      </svg>

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%)",
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 600,
            letterSpacing: 18,
            color: GOLD,
            opacity: ramp(frame, 60, 90),
            textShadow: "0 0 40px rgba(0,0,0,0.9)",
          }}
        >
          NO ES SOLO
        </div>
        <div
          style={{
            fontSize: 250,
            fontWeight: 800,
            fontStyle: "italic",
            lineHeight: 1,
            color: WHITE,
            clipPath: `inset(0 ${(1 - lineA) * 100}% 0 0)`,
            textShadow: "0 0 60px rgba(0,0,0,0.9)",
          }}
        >
          UN JUEGO
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 84,
            fontWeight: 600,
            color: LIME,
            opacity: interpolate(lineB, [0, 0.5], [0, 1], clamp),
            scale: interpolate(lineB, [0, 1], [1.3, 1]),
            textShadow: "0 0 40px rgba(0,0,0,0.9)",
          }}
        >
          60 segundos de fútbol
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* Scene 2 — the tactical play                                         */
/* ================================================================== */

const att = [
  { n: 8, x: 360, y: 540 },
  { n: 10, x: 700, y: 330 },
  { n: 7, x: 990, y: 720 },
  { n: 11, x: 1330, y: 440 },
  { n: 9, x: 1580, y: 560 },
];
const T = [26, 68, 108, 148, 186, 214];
const ballKeys = [
  [att[0].x, att[0].y],
  [att[1].x, att[1].y],
  [att[2].x, att[2].y],
  [att[3].x, att[3].y],
  [att[4].x, att[4].y],
  [1782, 505],
];

const Dot: React.FC<{
  x: number;
  y: number;
  color: string;
  n: number;
  glow?: boolean;
}> = ({ x, y, color, n, glow }) => (
  <g transform={`translate(${x} ${y})`}>
    {glow && <circle r={52} fill={color} opacity={0.25} />}
    <circle r={30} fill={color} stroke="white" strokeWidth={4} />
    <text
      y={11}
      textAnchor="middle"
      fontSize={32}
      fontWeight={800}
      fill="#05101c"
      fontFamily={FONT}
    >
      {n}
    </text>
  </g>
);

export const Play: React.FC = () => {
  const frame = useCurrentFrame();
  const draw = ramp(frame, 0, 38);

  const bx = interpolate(
    frame,
    T,
    ballKeys.map((k) => k[0]),
    { ...clamp, easing: Easing.inOut(Easing.quad) },
  );
  const by = interpolate(
    frame,
    T,
    ballKeys.map((k) => k[1]),
    { ...clamp, easing: Easing.inOut(Easing.quad) },
  );
  const moving = frame > T[0] && frame < T[5];
  const ballLift = moving
    ? Math.sin((((frame - T[0]) % 40) / 40) * Math.PI) * 0
    : 0;

  // defenders drift toward the ball
  const defs = [
    { n: 4, x: 560, y: 470 },
    { n: 5, x: 860, y: 600 },
    { n: 3, x: 1180, y: 560 },
    { n: 6, x: 1480, y: 700 },
  ].map((d, i) => ({
    ...d,
    x: d.x + (bx - d.x) * 0.08 + Math.sin(frame / 18 + i) * 14,
    y: d.y + (by - d.y) * 0.1 + Math.cos(frame / 15 + i) * 12,
  }));

  // attackers: small runs
  const atk = att.map((p, i) => ({
    ...p,
    x:
      p.x +
      Math.sin(frame / 22 + i) * 10 +
      (i >= 3 ? ramp(frame, 100, 180) * 70 : 0),
    y:
      p.y +
      Math.cos(frame / 19 + i) * 8 -
      (i === 4 ? ramp(frame, 120, 186) * 40 : 0),
  }));

  const shake = frame > 214 ? Math.max(0, 1 - (frame - 214) / 14) * 12 : 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#04140f",
        translate: `${Math.sin(frame * 3) * shake}px ${Math.cos(frame * 4) * shake}px`,
      }}
    >
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0 }}
      >
        <rect width={1920} height={1080} fill="#04140f" />
        <Pitch draw={draw} fillOpacity={ramp(frame, 0, 30)} />
        {/* pass lines */}
        {ballKeys.slice(0, 5).map((p, k) => {
          const q = ballKeys[k + 1];
          const prog = interpolate(frame, [T[k], T[k + 1]], [0, 1], {
            ...clamp,
            easing: Easing.inOut(Easing.quad),
          });
          const x2 = p[0] + (q[0] - p[0]) * prog;
          const y2 = p[1] + (q[1] - p[1]) * prog;
          return (
            <line
              key={k}
              x1={p[0]}
              y1={p[1]}
              x2={x2}
              y2={y2}
              stroke={k === 4 ? GOLD : LIME}
              strokeWidth={k === 4 ? 10 : 6}
              strokeDasharray={k === 4 ? undefined : "16 12"}
              strokeLinecap="round"
              opacity={prog > 0 ? 0.85 : 0}
            />
          );
        })}
        {defs.map((d) => (
          <Dot key={d.n} x={d.x} y={d.y} color={RED} n={d.n} />
        ))}
        {atk.map((p, i) => (
          <Dot
            key={p.n}
            x={p.x}
            y={p.y}
            color={CYAN}
            n={p.n}
            glow={i === 4 && frame > 150}
          />
        ))}
        {/* goalkeeper */}
        <Dot
          x={1752}
          y={
            540 +
            Math.sin(frame / 14) * 40 +
            (frame > 196 ? ramp(frame, 196, 214) * 50 : 0)
          }
          color={GOLD}
          n={1}
        />
        {/* ball */}
        <foreignObject
          x={bx - 22}
          y={by - 22 + ballLift}
          width={44}
          height={44}
        >
          <Ball size={44} rotation={frame * 14} />
        </foreignObject>
        {/* goal flash */}
        <circle
          cx={1782}
          cy={505}
          r={ramp(frame, 214, 236) * 260}
          fill="none"
          stroke={GOLD}
          strokeWidth={10 * (1 - ramp(frame, 214, 236))}
          opacity={frame > 214 ? 1 : 0}
        />
      </svg>

      <Glass
        style={{
          position: "absolute",
          left: 70,
          top: 28,
          padding: "10px 34px 18px",
        }}
      >
        <Title
          frame={frame}
          size={96}
          style={{
            position: "relative",
            translate: "0 0",
            opacity: ramp(frame, 0, 14),
          }}
        >
          Una jugada
        </Title>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 64,
            fontWeight: 600,
            color: LIME,
          }}
        >
          Once piezas. Un instante.
        </div>
      </Glass>
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* Scene 3 — the goal                                                  */
/* ================================================================== */

const IMPACT = 118;
const GX0 = 1260;
const GX1 = 1820;
const GY0 = 330;
const GY1 = 900;

export const Goal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p = interpolate(frame, [18, IMPACT], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.quad),
  });
  const pos = (q: number) => {
    // quadratic bezier: start low-left, control high, end in the net corner
    const x = (1 - q) * (1 - q) * 160 + 2 * (1 - q) * q * 900 + q * q * 1590;
    const y = (1 - q) * (1 - q) * 880 + 2 * (1 - q) * q * 80 + q * q * 470;
    return { x, y };
  };
  const bp =
    frame < IMPACT
      ? pos(p)
      : {
          x: 1590 + ramp(frame, IMPACT, IMPACT + 18) * 40,
          y:
            470 +
            ramp(frame, IMPACT, IMPACT + 40, Easing.in(Easing.quad)) * 330,
        };
  const size = interpolate(p, [0, 1], [150, 70], clamp);

  const since = frame - IMPACT;
  const shake = since >= 0 && since < 26 ? (1 - since / 26) * 22 : 0;
  const flash =
    since >= 0 ? interpolate(since, [0, 4, 18], [0.95, 0.5, 0], clamp) : 0;

  // net ripple
  const net = (x: number, y: number) => {
    if (since < 0) return { x, y };
    const d = Math.hypot(x - 1590, y - 470);
    const amp = Math.exp(-since / 24) * 46;
    const w = Math.sin(d / 38 - since * 0.55) * amp * Math.exp(-d / 420);
    return { x: x + w * 0.5, y: y + w };
  };
  const cols = 15;
  const rows = 11;
  const lines: React.ReactNode[] = [];
  for (let i = 0; i <= cols; i++) {
    const pts = Array.from({ length: rows + 1 }, (_, j) => {
      const q = net(
        GX0 + ((GX1 - GX0) * i) / cols,
        GY0 + ((GY1 - GY0) * j) / rows,
      );
      return `${q.x},${q.y}`;
    }).join(" ");
    lines.push(
      <polyline
        key={`c${i}`}
        points={pts}
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth={2}
      />,
    );
  }
  for (let j = 0; j <= rows; j++) {
    const pts = Array.from({ length: cols + 1 }, (_, i) => {
      const q = net(
        GX0 + ((GX1 - GX0) * i) / cols,
        GY0 + ((GY1 - GY0) * j) / rows,
      );
      return `${q.x},${q.y}`;
    }).join(" ");
    lines.push(
      <polyline
        key={`r${j}`}
        points={pts}
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth={2}
      />,
    );
  }

  // goalkeeper dive (too late)
  const dive = interpolate(frame, [80, 132], [0, 1], {
    ...clamp,
    easing: outCubic,
  });
  const text = spring({
    frame: frame - (IMPACT + 6),
    fps,
    config: { damping: 10, stiffness: 140 },
  });
  const stretch = interpolate(frame, [IMPACT + 6, IMPACT + 70], [0, 1], {
    ...clamp,
    easing: outCubic,
  });

  return (
    <AbsoluteFill
      style={{
        translate: `${Math.sin(frame * 5) * shake}px ${Math.cos(frame * 6) * shake}px`,
      }}
    >
      <StadiumBg intensity={1.3} />
      {/* turf */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 880,
          bottom: 0,
          background: "linear-gradient(#0e4a37, #04140f)",
        }}
      />

      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0 }}
      >
        {/* net */}
        {lines}
        {/* goalkeeper */}
        <g
          transform={`translate(${1440 + dive * 120} ${730 - dive * 170}) rotate(${-dive * 70})`}
        >
          <rect x={-34} y={-90} width={68} height={170} rx={30} fill={GOLD} />
          <circle cy={-118} r={30} fill="#f2c9a0" />
          <rect
            x={-120}
            y={-80}
            width={90}
            height={22}
            rx={11}
            fill={GOLD}
            transform={`rotate(${-20 - dive * 40} -34 -70)`}
          />
          <rect
            x={30}
            y={-80}
            width={90}
            height={22}
            rx={11}
            fill={GOLD}
            transform={`rotate(${20 + dive * 40} 34 -70)`}
          />
          <circle
            cx={-128}
            cy={-68}
            r={20}
            fill="#fff"
            transform={`rotate(${-20 - dive * 40} -34 -70)`}
          />
          <circle
            cx={128}
            cy={-68}
            r={20}
            fill="#fff"
            transform={`rotate(${20 + dive * 40} 34 -70)`}
          />
        </g>
        {/* posts */}
        <g stroke="#ffffff" strokeWidth={14} strokeLinecap="round" fill="none">
          <line x1={GX0} y1={GY0} x2={GX0} y2={GY1} />
          <line x1={GX1} y1={GY0} x2={GX1} y2={GY1} />
          <line x1={GX0 - 7} y1={GY0} x2={GX1 + 7} y2={GY0} />
        </g>
        {/* ball trail */}
        {frame < IMPACT + 4 &&
          Array.from({ length: 9 }, (_, k) => {
            const q = Math.max(0, p - k * 0.025);
            const t = pos(q);
            return (
              <circle
                key={k}
                cx={t.x}
                cy={t.y}
                r={interpolate(q, [0, 1], [75, 35], clamp) * (1 - k * 0.08)}
                fill={LIME}
                opacity={0.22 * (1 - k / 9)}
              />
            );
          })}
        {/* shockwave */}
        {since >= 0 &&
          [0, 1, 2].map((k) => {
            const r = ramp(since, k * 5, k * 5 + 30);
            return (
              <circle
                key={k}
                cx={1590}
                cy={470}
                r={r * 520}
                fill="none"
                stroke={[GOLD, WHITE, LIME][k]}
                strokeWidth={14 * (1 - r)}
                opacity={1 - r}
              />
            );
          })}
        <foreignObject
          x={bp.x - size / 2}
          y={bp.y - size / 2}
          width={size}
          height={size}
        >
          <Ball size={size} rotation={frame * 22} />
        </foreignObject>
      </svg>

      <Confetti
        seed="goal"
        count={110}
        start={IMPACT}
        origin={[1590, 470]}
        spread={1.15}
        life={120}
      />

      <AbsoluteFill
        style={{
          justifyContent: "flex-start",
          paddingLeft: 90,
          paddingTop: 70,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 800,
            fontStyle: "italic",
            fontSize: 230,
            lineHeight: 1,
            color: WHITE,
            opacity: interpolate(text, [0, 0.3], [0, 1], clamp),
            scale: interpolate(text, [0, 1], [3.2, 1]),
            transformOrigin: "left top",
            textShadow: `0 0 60px ${GOLD}, 0 14px 0 rgba(0,0,0,0.5)`,
            letterSpacing: interpolate(stretch, [0, 1], [-4, 2]),
            whiteSpace: "nowrap",
          }}
        >
          ¡G{"O".repeat(2 + Math.round(stretch * 3))}L!
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 84,
            color: LIME,
            marginTop: 8,
            marginLeft: 12,
            opacity: ramp(frame, IMPACT + 40, IMPACT + 60),
            textShadow: "0 6px 30px rgba(0,0,0,0.8)",
          }}
        >
          Minuto 90+3 · Aurora FC
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ backgroundColor: "white", opacity: flash }} />
      {/* edge vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, transparent 55%, ${NIGHT} 130%)`,
        }}
      />
    </AbsoluteFill>
  );
};
