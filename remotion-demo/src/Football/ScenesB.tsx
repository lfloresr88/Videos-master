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
  CYAN,
  FONT,
  GOLD,
  Glass,
  LIME,
  Pitch,
  ramp,
  RED,
  StadiumBg,
  Title,
  WHITE,
} from "./common";

const TEAM_A = "AURORA FC";
const TEAM_B = "METEORO FC";

/* ================================================================== */
/* Scene 4 — match numbers                                             */
/* ================================================================== */

const Donut: React.FC<{
  value: number;
  prog: number;
  color: string;
  size: number;
}> = ({ value, prog, color, size }) => {
  const r = size / 2 - 22;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={28}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={28}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - (value / 100) * prog)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
};

const BarRow: React.FC<{
  label: string;
  a: number;
  b: number;
  frame: number;
  delay: number;
}> = ({ label, a, b, frame, delay }) => {
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, stiffness: 100 },
  });
  const max = Math.max(a, b) * 1.15;
  return (
    <div style={{ marginBottom: 26 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 54,
          fontWeight: 600,
          color: WHITE,
          fontFamily: FONT,
        }}
      >
        <span style={{ color: CYAN, fontWeight: 800 }}>
          {Math.round(a * s)}
        </span>
        <span>{label}</span>
        <span style={{ color: RED, fontWeight: 800 }}>{Math.round(b * s)}</span>
      </div>
      <div style={{ display: "flex", gap: 14, height: 22 }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "flex-end",
            backgroundColor: "rgba(255,255,255,0.08)",
            borderRadius: 11,
          }}
        >
          <div
            style={{
              width: `${(a / max) * 100 * s}%`,
              backgroundColor: CYAN,
              borderRadius: 11,
            }}
          />
        </div>
        <div
          style={{
            flex: 1,
            backgroundColor: "rgba(255,255,255,0.08)",
            borderRadius: 11,
          }}
        >
          <div
            style={{
              width: `${(b / max) * 100 * s}%`,
              backgroundColor: RED,
              borderRadius: 11,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const Numbers: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({
    frame: frame - 6,
    fps,
    config: { damping: 12, stiffness: 120 },
  });
  const sa = Math.round(interpolate(frame, [20, 50], [0, 3], clamp));
  const sb = Math.round(interpolate(frame, [30, 58], [0, 2], clamp));
  const prog = ramp(frame, 40, 110, Easing.inOut(Easing.cubic));
  const pass = ramp(frame, 60, 130, Easing.inOut(Easing.cubic));

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <StadiumBg intensity={0.7} />
      {/* scoreboard */}
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 50,
          scale: interpolate(pop, [0, 1], [0.6, 1]),
          opacity: interpolate(pop, [0, 0.4], [0, 1], clamp),
        }}
      >
        <span
          style={{
            fontSize: 96,
            fontWeight: 800,
            color: CYAN,
            fontStyle: "italic",
          }}
        >
          {TEAM_A}
        </span>
        <Glass
          style={{
            padding: "0 40px",
            display: "flex",
            alignItems: "center",
            gap: 28,
          }}
        >
          <span
            style={{
              fontSize: 190,
              fontWeight: 800,
              color: WHITE,
              lineHeight: 1.15,
            }}
          >
            {sa}
          </span>
          <span style={{ fontSize: 120, fontWeight: 800, color: GOLD }}>-</span>
          <span
            style={{
              fontSize: 190,
              fontWeight: 800,
              color: WHITE,
              lineHeight: 1.15,
            }}
          >
            {sb}
          </span>
        </Glass>
        <span
          style={{
            fontSize: 96,
            fontWeight: 800,
            color: RED,
            fontStyle: "italic",
          }}
        >
          {TEAM_B}
        </span>
      </div>

      {/* three panels */}
      <div
        style={{
          position: "absolute",
          top: 340,
          left: 90,
          right: 90,
          display: "flex",
          gap: 40,
        }}
      >
        <Glass
          style={{ flex: 1, padding: 30, textAlign: "center", height: 640 }}
        >
          <div style={{ fontSize: 60, fontWeight: 600, color: LIME }}>
            POSESIÓN
          </div>
          <div
            style={{
              position: "relative",
              width: 380,
              height: 380,
              margin: "10px auto 0",
            }}
          >
            <Donut value={58} prog={prog} color={CYAN} size={380} />
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: 124,
                fontWeight: 800,
                color: WHITE,
              }}
            >
              {Math.round(58 * prog)}%
            </div>
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 600,
              color: WHITE,
              marginTop: 16,
            }}
          >
            <span style={{ color: CYAN }}>58</span> ·{" "}
            <span style={{ color: RED }}>42</span>
          </div>
        </Glass>

        <Glass style={{ flex: 1.45, padding: "30px 40px", height: 640 }}>
          <div
            style={{
              fontSize: 60,
              fontWeight: 600,
              color: LIME,
              textAlign: "center",
              marginBottom: 26,
            }}
          >
            EL PARTIDO
          </div>
          <BarRow label="Tiros" a={14} b={9} frame={frame} delay={34} />
          <BarRow label="Al arco" a={7} b={5} frame={frame} delay={46} />
          <BarRow label="Corners" a={8} b={4} frame={frame} delay={58} />
          <BarRow label="Faltas" a={9} b={13} frame={frame} delay={70} />
        </Glass>

        <Glass
          style={{ flex: 1, padding: 30, textAlign: "center", height: 640 }}
        >
          <div style={{ fontSize: 60, fontWeight: 600, color: LIME }}>
            PASES
          </div>
          <div
            style={{
              position: "relative",
              width: 380,
              height: 380,
              margin: "10px auto 0",
            }}
          >
            <Donut value={91} prog={pass} color={GOLD} size={380} />
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: 124,
                fontWeight: 800,
                color: WHITE,
              }}
            >
              {Math.round(91 * pass)}%
            </div>
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 600,
              color: WHITE,
              marginTop: 16,
            }}
          >
            precisión
          </div>
        </Glass>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* Scene 5 — heatmap + passing network                                 */
/* ================================================================== */

const BOX = { x0: 160, y0: 250, w: 1600, h: 760 };
const FORM: ReadonlyArray<readonly [number, number, number]> = [
  // [num, x(0..1), y(0..1)] 4-3-3 attacking left→right
  [1, 0.07, 0.5],
  [2, 0.24, 0.16],
  [4, 0.22, 0.38],
  [5, 0.22, 0.62],
  [3, 0.24, 0.84],
  [6, 0.45, 0.3],
  [8, 0.42, 0.5],
  [10, 0.45, 0.7],
  [7, 0.72, 0.18],
  [9, 0.8, 0.5],
  [11, 0.72, 0.82],
];
const EDGES: ReadonlyArray<readonly [number, number, number]> = [
  [0, 2, 3],
  [0, 3, 3],
  [2, 6, 5],
  [3, 6, 5],
  [1, 5, 4],
  [4, 7, 4],
  [5, 6, 6],
  [6, 7, 6],
  [5, 8, 6],
  [6, 9, 8],
  [7, 10, 6],
  [8, 9, 5],
  [10, 9, 5],
  [2, 5, 3],
  [3, 7, 3],
];

export const Network: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const px = (x: number) => BOX.x0 + x * BOX.w;
  const py = (y: number) => BOX.y0 + y * BOX.h;
  const heat = ramp(frame, 20, 90);

  return (
    <AbsoluteFill style={{ fontFamily: FONT, backgroundColor: "#04140f" }}>
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <filter id="heatBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="46" />
          </filter>
        </defs>
        <rect width={1920} height={1080} fill="#04140f" />
        <Pitch
          box={BOX}
          draw={ramp(frame, 0, 30)}
          fillOpacity={0.9}
          lineColor="rgba(255,255,255,0.55)"
        />
        {/* heat */}
        <g filter="url(#heatBlur)" opacity={0.9 * heat}>
          {FORM.map(([n, x, y], i) => (
            <circle
              key={n}
              cx={px(x) + Math.sin(frame / 30 + i) * 16}
              cy={py(y) + Math.cos(frame / 26 + i) * 16}
              r={
                (70 + random(`h${i}`) * 70 + Math.sin(frame / 12 + i) * 10) *
                heat
              }
              fill={x > 0.6 ? "#ff3d3d" : x > 0.35 ? GOLD : LIME}
              opacity={0.5 + random(`ho${i}`) * 0.4}
            />
          ))}
        </g>
        {/* edges */}
        {EDGES.map(([a, b, w], i) => {
          const A = FORM[a];
          const B = FORM[b];
          const prog = ramp(frame, 40 + i * 4, 70 + i * 4);
          const tt = (frame * 0.02 + i * 0.17) % 1;
          return (
            <g key={i} opacity={prog}>
              <line
                x1={px(A[1])}
                y1={py(A[2])}
                x2={px(B[1])}
                y2={py(B[2])}
                stroke="rgba(255,255,255,0.8)"
                strokeWidth={w}
              />
              <circle
                cx={px(A[1]) + (px(B[1]) - px(A[1])) * tt}
                cy={py(A[2]) + (py(B[2]) - py(A[2])) * tt}
                r={9}
                fill={LIME}
              />
            </g>
          );
        })}
        {/* nodes */}
        {FORM.map(([n, x, y], i) => {
          const s = spring({
            frame: frame - 30 - i * 3,
            fps,
            config: { damping: 12 },
          });
          return (
            <g key={n} transform={`translate(${px(x)} ${py(y)}) scale(${s})`}>
              <circle r={36} fill="#05101c" stroke={CYAN} strokeWidth={6} />
              <text
                y={13}
                textAnchor="middle"
                fontSize={38}
                fontWeight={800}
                fill="white"
                fontFamily={FONT}
              >
                {n}
              </text>
            </g>
          );
        })}
      </svg>
      <Title frame={frame} size={120} style={{ left: 90, top: 50 }}>
        El mapa del <span style={{ color: GOLD }}>juego</span>
      </Title>
      <div
        style={{
          position: "absolute",
          left: 96,
          top: 176,
          fontSize: 58,
          fontWeight: 600,
          color: LIME,
          opacity: ramp(frame, 60, 80),
        }}
      >
        zonas calientes · red de pases
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* Scene 6 — match timeline                                            */
/* ================================================================== */

const GOALS = [
  { m: 12, team: "A", label: "12'" },
  { m: 34, team: "B", label: "34'" },
  { m: 58, team: "A", label: "58'" },
  { m: 71, team: "B", label: "71'" },
  { m: 93, team: "A", label: "90+3'" },
] as const;
const TL = { x0: 170, x1: 1750, y: 700 };

export const Timeline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const minute = interpolate(frame, [20, 215], [0, 93], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });
  const mx = (m: number) => TL.x0 + (m / 93) * (TL.x1 - TL.x0);
  const a = GOALS.filter((g) => g.team === "A" && g.m <= minute).length;
  const b = GOALS.filter((g) => g.team === "B" && g.m <= minute).length;
  const mm = Math.floor(minute);

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <StadiumBg intensity={0.8} />
      <Title frame={frame} size={120} style={{ left: 90, top: 50 }}>
        90 minutos. <span style={{ color: LIME }}>5 goles.</span>
      </Title>

      <Glass
        style={{
          position: "absolute",
          left: 500,
          top: 230,
          width: 920,
          padding: "10px 0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 36,
        }}
      >
        <span style={{ fontSize: 110, fontWeight: 800, color: CYAN }}>{a}</span>
        <span
          style={{
            fontSize: 120,
            fontWeight: 800,
            color: GOLD,
            width: 380,
            textAlign: "center",
          }}
        >
          {String(mm).padStart(2, "0")}:
          {String(Math.floor((minute % 1) * 60)).padStart(2, "0")}
        </span>
        <span style={{ fontSize: 110, fontWeight: 800, color: RED }}>{b}</span>
      </Glass>

      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0 }}
      >
        <line
          x1={TL.x0}
          y1={TL.y}
          x2={TL.x1}
          y2={TL.y}
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={10}
          strokeLinecap="round"
        />
        <line
          x1={TL.x0}
          y1={TL.y}
          x2={mx(minute)}
          y2={TL.y}
          stroke={GOLD}
          strokeWidth={10}
          strokeLinecap="round"
        />
        {[0, 45, 90].map((m) => (
          <g key={m}>
            <line
              x1={mx(m)}
              y1={TL.y - 22}
              x2={mx(m)}
              y2={TL.y + 22}
              stroke="rgba(255,255,255,0.5)"
              strokeWidth={4}
            />
            <text
              x={mx(m)}
              y={TL.y + 84}
              textAnchor="middle"
              fontSize={50}
              fontWeight={600}
              fill="rgba(255,255,255,0.7)"
              fontFamily={FONT}
            >
              {m === 0 ? "INICIO" : m === 45 ? "45'" : "90'"}
            </text>
          </g>
        ))}
        {GOALS.map((g, i) => {
          const t0 = 20 + (g.m / 93) * 195;
          const s = spring({
            frame: frame - t0,
            fps,
            config: { damping: 9, stiffness: 160 },
          });
          const up = g.team === "A";
          const col = up ? CYAN : RED;
          return (
            <g
              key={i}
              transform={`translate(${mx(g.m)} ${TL.y})`}
              opacity={interpolate(s, [0, 0.2], [0, 1], clamp)}
            >
              <line
                x1={0}
                y1={0}
                x2={0}
                y2={(up ? -1 : 1) * 110 * s}
                stroke={col}
                strokeWidth={6}
              />
              <circle r={22} fill={col} stroke="white" strokeWidth={5} />
              <g transform={`translate(0 ${(up ? -1 : 1) * 160 * s})`}>
                <foreignObject x={-48} y={-48} width={96} height={96}>
                  <Ball size={96} rotation={frame * 6} />
                </foreignObject>
              </g>
              <text
                y={(up ? -1 : 1) * 225 * s + (up ? 0 : 36)}
                textAnchor="middle"
                fontSize={62}
                fontWeight={800}
                fill={col}
                fontFamily={FONT}
              >
                {g.label}
              </text>
              {g.m === 93 && frame > t0 && (
                <circle
                  r={ramp(frame, t0, t0 + 30) * 160}
                  fill="none"
                  stroke={GOLD}
                  strokeWidth={10 * (1 - ramp(frame, t0, t0 + 30))}
                />
              )}
            </g>
          );
        })}
        {/* playhead */}
        <g transform={`translate(${mx(minute)} ${TL.y})`}>
          <circle r={18} fill={GOLD} />
          <circle
            r={34}
            fill="none"
            stroke={GOLD}
            strokeWidth={4}
            opacity={0.5 + 0.5 * Math.sin(frame / 4)}
          />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
