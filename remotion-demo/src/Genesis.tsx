import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Poppins";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
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

const { fontFamily } = loadFont("normal", {
  weights: ["600", "800"],
  subsets: ["latin"],
});
const MONO = "'DejaVu Sans Mono', Menlo, Consolas, monospace";

const BG = "#07070f";
const VIOLET = "#7c4dff";
const PINK = "#ff4d8d";
const CYAN = "#3df5ff";
const GOLD = "#ffd166";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
const outCubic = Easing.out(Easing.cubic);

const Aurora: React.FC<{ speed?: number }> = ({ speed = 1 }) => {
  const frame = useCurrentFrame();
  const t = frame * speed;
  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          left: -200 + Math.sin(t / 60) * 120,
          top: -300 + Math.cos(t / 70) * 100,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${VIOLET}66 0%, transparent 65%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1000,
          height: 1000,
          right: -250 + Math.cos(t / 55) * 120,
          bottom: -350 + Math.sin(t / 65) * 100,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${PINK}55 0%, transparent 65%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          left: 700 + Math.sin(t / 80) * 200,
          top: 500 + Math.cos(t / 50) * 80,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${CYAN}22 0%, transparent 65%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Scene 1 — live code editor + what the code draws                    */
/* ------------------------------------------------------------------ */

type Seg = readonly [string, string];
const CODE: readonly (readonly Seg[])[] = [
  [
    ["const ", PINK],
    ["Hero ", CYAN],
    ["= () => {", "#e6e6f0"],
  ],
  [
    ["  const ", PINK],
    ["frame ", "#e6e6f0"],
    ["= ", PINK],
    ["useCurrentFrame", GOLD],
    ["();", "#e6e6f0"],
  ],
  [["  return (", "#e6e6f0"]],
  [
    ["    <", PINK],
    ["Circle", CYAN],
  ],
  [
    ["      scale", "#9ad1ff"],
    ["={", "#e6e6f0"],
    ["spring", GOLD],
    ["({frame})}", "#e6e6f0"],
  ],
  [
    ["      fill", "#9ad1ff"],
    ["=", "#e6e6f0"],
    ['"aurora"', "#a5f3a0"],
  ],
  [["    />", PINK]],
  [["  );", "#e6e6f0"]],
  [["};", "#e6e6f0"]],
];
const TOTAL_CHARS = CODE.reduce(
  (n, l) => n + l.reduce((m, [t]) => m + t.length, 0) + 1,
  0,
);

const CodeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const typed = Math.floor(
    interpolate(frame, [14, 92], [0, TOTAL_CHARS], {
      ...clamp,
      easing: Easing.linear,
    }),
  );
  let remaining = typed;

  const run = spring({
    frame: frame - 98,
    fps,
    config: { damping: 9, stiffness: 90 },
  });
  const windowIn = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 100 },
  });

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Aurora />
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 120,
          fontSize: 150,
          fontWeight: 800,
          color: "white",
          lineHeight: 1,
          opacity: interpolate(frame, [0, 16], [0, 1], clamp),
        }}
      >
        De <span style={{ color: GOLD }}>código</span> a video
      </div>

      {/* editor */}
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 280,
          width: 1080,
          height: 700,
          borderRadius: 28,
          backgroundColor: "rgba(16,16,32,0.92)",
          border: "2px solid rgba(255,255,255,0.12)",
          boxShadow: "0 40px 120px rgba(0,0,0,0.6)",
          opacity: windowIn,
          translate: `0px ${interpolate(windowIn, [0, 1], [80, 0])}px`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: 70,
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "0 28px",
            backgroundColor: "rgba(255,255,255,0.05)",
          }}
        >
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <div
              key={c}
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: c,
              }}
            />
          ))}
          <span
            style={{
              marginLeft: 20,
              fontSize: 30,
              color: "#8a8aa8",
              fontWeight: 600,
            }}
          >
            Hero.tsx
          </span>
        </div>
        <div
          style={{
            padding: "26px 40px",
            fontFamily: MONO,
            fontSize: 42,
            lineHeight: 1.45,
          }}
        >
          {CODE.map((line, li) => {
            const lineLen = line.reduce((m, [t]) => m + t.length, 0) + 1;
            const show = Math.max(0, Math.min(remaining, lineLen));
            remaining -= lineLen;
            let left = show;
            const isCursorLine =
              show > 0 && show < lineLen + 0 && remaining < 0;
            return (
              <div key={li} style={{ whiteSpace: "pre", height: 61 }}>
                {line.map(([text, color], si) => {
                  const part = text.slice(0, Math.max(0, left));
                  left -= text.length;
                  return (
                    <span key={si} style={{ color }}>
                      {part}
                    </span>
                  );
                })}
                {isCursorLine && frame % 16 < 10 ? (
                  <span style={{ color: GOLD }}>▌</span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* preview */}
      <div
        style={{
          position: "absolute",
          left: 1260,
          top: 280,
          width: 540,
          height: 700,
          borderRadius: 28,
          border: "2px solid rgba(255,255,255,0.12)",
          backgroundColor: "rgba(255,255,255,0.04)",
          opacity: windowIn,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: `conic-gradient(from ${frame * 3}deg, ${VIOLET}, ${PINK}, ${GOLD}, ${CYAN}, ${VIOLET})`,
            scale:
              interpolate(run, [0, 1], [0, 1]) *
              (1 + Math.sin(frame / 8) * 0.03),
            boxShadow: `0 0 ${interpolate(run, [0, 1], [0, 140])}px ${PINK}99`,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 34,
            fontSize: 38,
            fontWeight: 600,
            color: "#a5f3a0",
            opacity: interpolate(frame, [96, 108], [0, 1], clamp),
          }}
        >
          ● render en vivo
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Scene 2 — generative particle galaxy                                */
/* ------------------------------------------------------------------ */

const COLORS = [VIOLET, PINK, GOLD, CYAN, "#ffffff"];
const N = 140;
const PARTICLES = Array.from({ length: N }, (_, i) => ({
  r: 140 + random(`r${i}`) * 700,
  a0: random(`a${i}`) * Math.PI * 2,
  speed: (0.6 + random(`s${i}`)) * (random(`d${i}`) > 0.5 ? 1 : -1),
  size: 3 + random(`z${i}`) * 9,
  color: COLORS[Math.floor(random(`c${i}`) * COLORS.length)],
  tilt: 0.32 + random(`t${i}`) * 0.4,
}));

const Galaxy: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const burst = interpolate(frame, [0, 45], [0, 1], {
    ...clamp,
    easing: outCubic,
  });
  const textIn = spring({
    frame: frame - 22,
    fps,
    config: { damping: 16, stiffness: 100 },
  });

  const pos = (p: (typeof PARTICLES)[number], f: number) => {
    const ang = p.a0 + (f * p.speed * 70) / (p.r + 60);
    return {
      x: 960 + Math.cos(ang) * p.r * burst,
      y: 540 + Math.sin(ang) * p.r * p.tilt * burst,
    };
  };

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Aurora speed={1.6} />
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="28" />
          </filter>
          <radialGradient id="core">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="40%" stopColor={GOLD} />
            <stop offset="100%" stopColor={PINK} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle
          cx={960}
          cy={540}
          r={170 + Math.sin(frame / 7) * 14}
          fill="url(#core)"
          filter="url(#soft)"
          opacity={burst}
        />
        {[0, 1, 2].map((k) => (
          <ellipse
            key={k}
            cx={960}
            cy={540}
            rx={(300 + k * 190) * burst}
            ry={(300 + k * 190) * 0.4 * burst}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={2}
          />
        ))}
        {PARTICLES.map((p, i) =>
          [0, 1, 2, 3].map((k) => {
            const { x, y } = pos(p, frame - k * 2.2);
            return (
              <circle
                key={`${i}-${k}`}
                cx={x}
                cy={y}
                r={p.size * (1 - k * 0.2)}
                fill={p.color}
                opacity={
                  (0.9 - k * 0.22) * (0.65 + 0.35 * Math.sin(frame / 6 + i))
                }
              />
            );
          }),
        )}
      </svg>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            textAlign: "center",
            fontSize: 164,
            fontWeight: 800,
            lineHeight: 1.02,
            color: "white",
            opacity: interpolate(textIn, [0, 0.5], [0, 1], clamp),
            scale: interpolate(textIn, [0, 1], [0.85, 1]),
            textShadow: "0 10px 60px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.6)",
          }}
        >
          Cada píxel,
          <br />
          <span style={{ color: GOLD }}>programado.</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Scene 3 — data: bars, line and counter                              */
/* ------------------------------------------------------------------ */

const BARS = [38, 52, 44, 68, 59, 81, 74, 92, 85, 100];
const LINE = [18, 30, 26, 46, 40, 62, 58, 78, 74, 96];

const DataScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const CH_X = 760;
  const CH_Y = 330;
  const CH_W = 1040;
  const CH_H = 640;
  const pct = Math.round(
    interpolate(frame, [10, 70], [0, 98], { ...clamp, easing: outCubic }),
  );
  const lineProg = interpolate(frame, [30, 90], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const pts = LINE.map((v, i) => [
    CH_X + 50 + (i * (CH_W - 100)) / (LINE.length - 1),
    CH_Y + CH_H - 50 - (v / 100) * (CH_H - 120),
  ]);

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Aurora speed={0.8} />
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 120,
          fontSize: 150,
          fontWeight: 800,
          color: "white",
          lineHeight: 1,
          opacity: interpolate(frame, [0, 14], [0, 1], clamp),
          translate: `${interpolate(frame, [0, 20], [-80, 0], { ...clamp, easing: outCubic })}px 0px`,
        }}
      >
        Datos que <span style={{ color: CYAN }}>cobran vida</span>
      </div>

      <div
        style={{ position: "absolute", left: 120, top: 380, color: "white" }}
      >
        <div
          style={{
            fontSize: 240,
            fontWeight: 800,
            lineHeight: 1,
            background: `linear-gradient(90deg, ${GOLD}, ${PINK})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {pct}%
        </div>
        <div
          style={{
            fontSize: 76,
            fontWeight: 600,
            opacity: 0.9,
            lineHeight: 1.1,
          }}
        >
          generado
          <br />
          por código
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: CH_X,
          top: CH_Y,
          width: CH_W,
          height: CH_H,
          borderRadius: 28,
          backgroundColor: "rgba(16,16,32,0.7)",
          border: "2px solid rgba(255,255,255,0.12)",
        }}
      />
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0 }}
      >
        {BARS.map((v, i) => {
          const s = spring({
            frame: frame - 12 - i * 3,
            fps,
            config: { damping: 14, stiffness: 110 },
          });
          const w = (CH_W - 100) / BARS.length - 14;
          const h = (v / 100) * (CH_H - 120) * s;
          return (
            <rect
              key={i}
              x={CH_X + 50 + i * ((CH_W - 100) / BARS.length) + 7}
              y={CH_Y + CH_H - 50 - h}
              width={w}
              height={h}
              rx={10}
              fill={i === BARS.length - 1 ? GOLD : VIOLET}
              opacity={0.9}
            />
          );
        })}
        <polyline
          points={pts.map((p) => p.join(",")).join(" ")}
          fill="none"
          stroke={CYAN}
          strokeWidth={10}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - lineProg}
        />
        {pts.map(([x, y], i) => {
          const visible = lineProg >= i / (pts.length - 1) - 0.001;
          return visible ? (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={13}
              fill="white"
              stroke={CYAN}
              strokeWidth={6}
            />
          ) : null;
        })}
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Scene 4 — logo reveal                                               */
/* ------------------------------------------------------------------ */

const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const letters = "REMOTION".split("");

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Aurora speed={2} />
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0 }}
      >
        {[0, 1, 2, 3].map((k) => {
          const p = interpolate(frame, [k * 8, k * 8 + 60], [0, 1], {
            ...clamp,
            easing: outCubic,
          });
          return (
            <circle
              key={k}
              cx={960}
              cy={470}
              r={p * 1100}
              fill="none"
              stroke={[VIOLET, PINK, GOLD, CYAN][k]}
              strokeWidth={14 * (1 - p)}
              opacity={1 - p}
            />
          );
        })}
        {Array.from({ length: 48 }, (_, i) => {
          const a = (i / 48) * Math.PI * 2 + random(`ba${i}`);
          const dist = interpolate(
            frame,
            [0, 70],
            [0, 300 + random(`bd${i}`) * 800],
            { ...clamp, easing: outCubic },
          );
          return (
            <circle
              key={i}
              cx={960 + Math.cos(a) * dist}
              cy={470 + Math.sin(a) * dist}
              r={4 + random(`bz${i}`) * 8}
              fill={COLORS[i % COLORS.length]}
              opacity={interpolate(frame, [0, 70], [1, 0], clamp)}
            />
          );
        })}
      </svg>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ display: "flex", marginTop: -50 }}>
          {letters.map((l, i) => {
            const s = spring({
              frame: frame - 10 - i * 3,
              fps,
              config: { damping: 11, stiffness: 150 },
            });
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  fontSize: 290,
                  fontWeight: 800,
                  letterSpacing: -8,
                  color: "white",
                  opacity: interpolate(s, [0, 0.4], [0, 1], clamp),
                  translate: `0px ${interpolate(s, [0, 1], [220, 0])}px`,
                  rotate: `${interpolate(s, [0, 1], [-16, 0])}deg`,
                  textShadow: `0 0 70px ${PINK}aa`,
                }}
              >
                {l}
              </span>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 82,
            fontWeight: 600,
            color: GOLD,
            opacity: interpolate(frame, [48, 66], [0, 1], clamp),
            translate: `0px ${interpolate(frame, [48, 66], [30, 0], { ...clamp, easing: outCubic })}px`,
          }}
        >
          Videos programados. Sin límites.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */

const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        bottom: 0,
        height: 10,
        width: `${(frame / durationInFrames) * 100}%`,
        background: `linear-gradient(90deg, ${VIOLET}, ${PINK}, ${GOLD})`,
      }}
    />
  );
};

export const Genesis: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const T = linearTiming({
    durationInFrames: 12,
    easing: Easing.bezier(0.7, 0, 0.3, 1),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <TransitionSeries>
        <TransitionSeries.Sequence name="Code" durationInFrames={126}>
          <CodeScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={T} />
        <TransitionSeries.Sequence name="Galaxy" durationInFrames={126}>
          <Galaxy />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={T}
        />
        <TransitionSeries.Sequence name="Data" durationInFrames={126}>
          <DataScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-bottom" })}
          timing={T}
        />
        <TransitionSeries.Sequence name="Reveal" durationInFrames={108}>
          <Reveal />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Audio
        src={staticFile("music.mp3")}
        volume={interpolate(
          frame,
          [0, 20, durationInFrames - 30, durationInFrames],
          [0, 0.8, 0.8, 0],
          clamp,
        )}
      />
      <ProgressBar />
    </AbsoluteFill>
  );
};
