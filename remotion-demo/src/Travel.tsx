import { Audio, Video } from "@remotion/media";
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
import { clamp, FONT, LIME, ramp, WHITE } from "./Football/common";

const SEG = [110, 110, 110, 108] as const;
const OVERLAP = 10;
const CUTS = [100, 200, 300]; // global frames where a transition starts
const AMBER = "#ffb347";
const TEAL = "#2ee6d6";

/* -------------------------- footage segment -------------------------- */

const Segment: React.FC<{ index: number }> = ({ index }) => {
  const frame = useCurrentFrame();
  const dir = index % 2 ? -1 : 1;
  const start = index * (SEG[0] - OVERLAP);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          scale: interpolate(frame, [0, SEG[index]], [1.0, 1.1], {
            ...clamp,
            easing: Easing.inOut(Easing.quad),
          }),
          rotate: `${dir * interpolate(frame, [0, SEG[index]], [0, 1.2], clamp)}deg`,
        }}
      >
        <Video
          src={staticFile("travel.mp4")}
          muted
          trimBefore={start}
          objectFit="cover"
          style={{
            width: "100%",
            height: "100%",
            filter: "contrast(1.14) saturate(1.38) brightness(1.04)",
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------- cinematic finishing ------------------------ */

const Grade: React.FC = () => {
  const frame = useCurrentFrame();
  const leak = (c: number, w: number) => {
    const d = Math.abs(frame - c);
    return Math.exp(-(d * d) / (2 * w * w));
  };
  const flash = CUTS.reduce((m, c) => Math.max(m, leak(c + 5, 5)), 0);
  const drift = (frame / 408) * 1500;
  return (
    <>
      {/* teal / orange grade */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,140,190,0.35), rgba(255,150,70,0.28))",
          mixBlendMode: "soft-light",
        }}
      />
      {/* drifting warm light leak */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 700px 900px at ${-300 + drift}px 300px, rgba(255,170,80,0.55), transparent 70%)`,
          mixBlendMode: "screen",
          opacity: 0.55,
        }}
      />
      {/* flashes on cuts */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(255,240,210,1), rgba(255,170,90,0.6) 60%, transparent 100%)",
          mixBlendMode: "screen",
          opacity: flash * 0.9,
        }}
      />
      {/* bokeh dust */}
      <AbsoluteFill style={{ mixBlendMode: "screen", opacity: 0.8 }}>
        {Array.from({ length: 16 }, (_, i) => {
          const sz = 20 + random(`bk${i}`) * 70;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left:
                  (random(`bx${i}`) * 1200 -
                    60 +
                    frame * (0.4 + random(`bs${i}`) * 0.8)) %
                  1200,
                top: random(`by${i}`) * 1900 + Math.sin(frame / 30 + i) * 40,
                width: sz,
                height: sz,
                borderRadius: "50%",
                background: `radial-gradient(circle, rgba(255,235,190,${0.35 + random(`bo${i}`) * 0.3}), transparent 70%)`,
                filter: "blur(2px)",
              }}
            />
          );
        })}
      </AbsoluteFill>
      {/* vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 120%)",
        }}
      />
      {/* film grain */}
      <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.16 }}>
        <svg width="100%" height="100%">
          <filter id="grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="2"
              seed={frame % 24}
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </AbsoluteFill>
    </>
  );
};

/* ------------------------------ overlays ------------------------------ */

const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lines = ["RUMBO", "AL MAR"];
  const out = ramp(frame, 76, 100, Easing.in(Easing.cubic));
  if (frame > 105) return null;
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT,
        opacity: 1 - out,
        translate: `0px ${-out * 160}px`,
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.5), transparent 70%)",
        }}
      />
      <div
        style={{
          fontSize: 40,
          fontWeight: 600,
          letterSpacing: 16,
          color: AMBER,
          opacity: ramp(frame, 4, 22),
          marginBottom: 14,
          textShadow: "0 4px 24px rgba(0,0,0,0.8)",
        }}
      >
        ROAD TRIP · COSTA
      </div>
      {lines.map((line, li) => (
        <div
          key={li}
          style={{ display: "flex", overflow: "hidden", padding: "0 10px" }}
        >
          {line.split("").map((ch, i) => {
            const s = spring({
              frame: frame - 10 - li * 8 - i * 2.5,
              fps,
              config: { damping: 13, stiffness: 140 },
            });
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  whiteSpace: "pre",
                  fontSize: 230,
                  lineHeight: 1.0,
                  fontWeight: 800,
                  fontStyle: "italic",
                  color: li ? AMBER : WHITE,
                  translate: `0px ${interpolate(s, [0, 1], [260, 0])}px`,
                  rotate: `${interpolate(s, [0, 1], [10, 0])}deg`,
                  textShadow: "0 12px 60px rgba(0,0,0,0.75)",
                }}
              >
                {ch}
              </span>
            );
          })}
        </div>
      ))}
      <div
        style={{
          marginTop: 28,
          height: 8,
          borderRadius: 4,
          width: interpolate(frame, [44, 74], [0, 520], {
            ...clamp,
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          background: `linear-gradient(90deg, ${AMBER}, ${TEAL})`,
        }}
      />
    </AbsoluteFill>
  );
};

const Hud: React.FC = () => {
  const frame = useCurrentFrame();
  const sec = Math.floor(frame / 30);
  const vis = ramp(frame, 96, 118);
  const rec = frame % 40 < 24;
  return (
    <AbsoluteFill style={{ fontFamily: FONT, opacity: vis }}>
      {/* top bar */}
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 100,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            background: rec ? "#ff4d4d" : "transparent",
            border: "3px solid #ff4d4d",
          }}
        />
        <span
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: WHITE,
            letterSpacing: 4,
            textShadow: "0 3px 16px rgba(0,0,0,0.7)",
          }}
        >
          EN RUTA
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          right: 80,
          top: 100,
          fontSize: 48,
          fontWeight: 800,
          color: WHITE,
          textShadow: "0 3px 16px rgba(0,0,0,0.7)",
        }}
      >
        00:{String(sec).padStart(2, "0")}
      </div>
      {/* route progress */}
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", inset: 0 }}
      >
        <path
          d="M 100 1800 C 300 1740, 420 1840, 600 1780 S 880 1740, 980 1790"
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray="2 18"
        />
        <path
          d="M 100 1800 C 300 1740, 420 1840, 600 1780 S 880 1740, 980 1790"
          fill="none"
          stroke={AMBER}
          strokeWidth={10}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - Math.min(1, frame / 408)}
        />
        {(() => {
          const p = Math.min(1, frame / 408);
          const x = 100 + p * 880;
          const y = 1800 + Math.sin(p * Math.PI * 2.4) * -28 + p * -8;
          return (
            <g>
              <circle
                cx={x}
                cy={y}
                r={30}
                fill={AMBER}
                opacity={0.3 + 0.2 * Math.sin(frame / 5)}
              />
              <circle cx={x} cy={y} r={15} fill="white" />
            </g>
          );
        })()}
        <text
          x={100}
          y={1868}
          fontSize={36}
          fontWeight={600}
          fill="rgba(255,255,255,0.85)"
          fontFamily={FONT}
        >
          INICIO
        </text>
        <text
          x={980}
          y={1868}
          fontSize={36}
          fontWeight={600}
          fill="rgba(255,255,255,0.85)"
          fontFamily={FONT}
          textAnchor="end"
        >
          MAR
        </text>
      </svg>
    </AbsoluteFill>
  );
};

const Callout: React.FC<{
  from: number;
  to: number;
  label: string;
  sub: string;
  y: number;
}> = ({ from, to, label, sub, y }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inn = spring({
    frame: frame - from,
    fps,
    config: { damping: 15, stiffness: 120 },
  });
  const out = ramp(frame, to - 14, to, Easing.in(Easing.cubic));
  if (frame < from || frame > to) return null;
  return (
    <>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.35) 28%, transparent 48%)",
          opacity: interpolate(inn, [0, 1], [0, 1], clamp) * (1 - out),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: y,
          fontFamily: FONT,
          opacity: interpolate(inn, [0, 0.4], [0, 1], clamp) * (1 - out),
          translate: `${interpolate(inn, [0, 1], [-140, 0]) - out * 120}px 0px`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              width: 12,
              height: 110,
              borderRadius: 6,
              background: `linear-gradient(${AMBER}, ${TEAL})`,
              scale: `1 ${inn}`,
            }}
          />
          <div>
            <div
              style={{
                fontSize: 92,
                fontWeight: 800,
                fontStyle: "italic",
                lineHeight: 1,
                color: WHITE,
                textTransform: "uppercase",
                textShadow: "0 6px 34px rgba(0,0,0,0.8)",
              }}
            >
              {label}
            </div>
            <div
              style={{
                fontSize: 48,
                fontWeight: 600,
                color: AMBER,
                textShadow: "0 4px 24px rgba(0,0,0,0.8)",
              }}
            >
              {sub}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame - 352;
  if (t < 0) return null;
  const s = spring({ frame: t, fps, config: { damping: 13, stiffness: 110 } });
  const fadeOut = ramp(frame, 394, 408, Easing.in(Easing.quad));
  return (
    <>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.78), transparent 55%)",
          opacity: ramp(frame, 352, 372),
        }}
      />
      <AbsoluteFill
        style={{
          fontFamily: FONT,
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 330,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontWeight: 800,
            fontStyle: "italic",
            lineHeight: 1,
            color: WHITE,
            textTransform: "uppercase",
            opacity: interpolate(s, [0, 0.4], [0, 1], clamp),
            scale: interpolate(s, [0, 1], [0.7, 1]),
            textShadow: "0 8px 50px rgba(0,0,0,0.85)",
          }}
        >
          El camino <span style={{ color: AMBER }}>continúa</span>
        </div>
        <div
          style={{
            marginTop: 26,
            fontSize: 52,
            fontWeight: 600,
            color: LIME,
            opacity: ramp(frame, 376, 396),
          }}
        >
          Edición hecha con Remotion
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#000", opacity: fadeOut }} />
    </>
  );
};

/* -------------------------------- root -------------------------------- */

export const Travel: React.FC = () => {
  const frame = useCurrentFrame();
  const T = linearTiming({
    durationInFrames: OVERLAP,
    easing: Easing.bezier(0.7, 0, 0.3, 1),
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence name="Tramo 1" durationInFrames={SEG[0]}>
          <Segment index={0} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={T}
        />
        <TransitionSeries.Sequence name="Tramo 2" durationInFrames={SEG[1]}>
          <Segment index={1} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-bottom" })}
          timing={T}
        />
        <TransitionSeries.Sequence name="Tramo 3" durationInFrames={SEG[2]}>
          <Segment index={2} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={T} />
        <TransitionSeries.Sequence name="Tramo 4" durationInFrames={SEG[3]}>
          <Segment index={3} />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Grade />
      <Title />
      <Hud />
      <Callout
        from={124}
        to={196}
        label="Ruta costera"
        sub="vegetación · viento · sol"
        y={1400}
      />
      <Callout
        from={226}
        to={296}
        label="Ventana abierta"
        sub="el paisaje pasa volando"
        y={1400}
      />
      <Callout
        from={306}
        to={372}
        label="Océano a la vista"
        sub="rumbo al mar"
        y={1400}
      />
      <EndCard />

      <Audio
        src={staticFile("travel.mp4")}
        volume={interpolate(
          frame,
          [0, 20, 380, 408],
          [0, 0.35, 0.35, 0],
          clamp,
        )}
      />
      <Audio
        src={staticFile("travel-music.mp3")}
        volume={interpolate(frame, [0, 6, 390, 408], [0, 0.95, 0.95, 0], clamp)}
      />
    </AbsoluteFill>
  );
};
