import { Audio, Video } from "@remotion/media";
import { chromaticAberration } from "@remotion/effects/chromatic-aberration";
import { contrast } from "@remotion/effects/contrast";
import { glow } from "@remotion/effects/glow";
import { pixelate } from "@remotion/effects/pixelate";
import { saturation } from "@remotion/effects/saturation";
import { scanlines } from "@remotion/effects/scanlines";
import { vignette } from "@remotion/effects/vignette";
import { loadFont } from "@remotion/google-fonts/Poppins";
import { Circle, Heart, Star } from "@remotion/shapes";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { createContext, useContext } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const { fontFamily } = loadFont("normal", {
  weights: ["600", "800"],
  subsets: ["latin"],
});

const ACCENT = "#ffd166";
const PINK = "#ff4d8d";
const CYAN = "#3df5ff";
const INK = "#0b0b14";

/** gpu=true uses WebGL/WebGPU effects (needs a real GPU). gpu=false uses CSS fallbacks. */
const GpuContext = createContext(true);
const useGpu = () => useContext(GpuContext);

const VignetteOverlay: React.FC<{ strength: number }> = ({ strength }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,${strength}) 100%)`,
    }}
  />
);

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

/* ------------------------------------------------------------------ */
/* Scene 1 — cinematic opening with the footage + kinetic title        */
/* ------------------------------------------------------------------ */

const Opening: React.FC = () => {
  const gpu = useGpu();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const letters = "REMOTION".split("");

  return (
    <AbsoluteFill style={{ backgroundColor: INK, fontFamily }}>
      <AbsoluteFill
        style={{
          scale: interpolate(frame, [0, 160], [1.18, 1], {
            ...clamp,
            easing: Easing.out(Easing.quad),
          }),
        }}
      >
        <Video
          src={staticFile("video.mp4")}
          muted
          objectFit="cover"
          style={{ width: "100%", height: "100%" }}
          effects={[
            contrast({ amount: 1.15 }),
            saturation({ amount: 1.25 }),
            ...(gpu
              ? [
                  chromaticAberration({
                    amount: interpolate(frame, [0, 40], [38, 3], {
                      ...clamp,
                      easing: Easing.out(Easing.cubic),
                    }),
                    angle: 20,
                  }),
                  vignette({ amount: 0.7 }),
                ]
              : []),
          ]}
        />
      </AbsoluteFill>
      {!gpu && <VignetteOverlay strength={0.7} />}

      {/* legibility gradient */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(11,11,20,0.95) 0%, rgba(11,11,20,0.55) 32%, rgba(11,11,20,0) 60%)",
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 260,
        }}
      >
        <div
          style={{
            fontSize: 44,
            fontWeight: 600,
            letterSpacing: 14,
            color: ACCENT,
            opacity: interpolate(frame, [8, 30], [0, 1], clamp),
            translate: `0px ${interpolate(frame, [8, 30], [30, 0], {
              ...clamp,
              easing: Easing.out(Easing.cubic),
            })}px`,
          }}
        >
          VIDEO CON CÓDIGO
        </div>

        <div style={{ display: "flex", marginTop: 8 }}>
          {letters.map((letter, i) => {
            const s = spring({
              frame: frame - 14 - i * 3,
              fps,
              config: { damping: 11, stiffness: 140 },
            });
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  fontSize: 168,
                  fontWeight: 800,
                  color: "white",
                  letterSpacing: -4,
                  opacity: interpolate(s, [0, 0.4], [0, 1], clamp),
                  translate: `0px ${interpolate(s, [0, 1], [160, 0])}px`,
                  rotate: `${interpolate(s, [0, 1], [18, 0])}deg`,
                  textShadow: `0 0 50px ${PINK}88`,
                }}
              >
                {letter}
              </span>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 18,
            height: 8,
            borderRadius: 4,
            backgroundColor: ACCENT,
            width: interpolate(frame, [40, 85], [0, 640], {
              ...clamp,
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Scene 2 — animated gradient, floating phone card, shapes, stats      */
/* ------------------------------------------------------------------ */

const Chip: React.FC<{
  label: string;
  value: string;
  color: string;
  delay: number;
  side: "left" | "right";
  top: number;
}> = ({ label, value, color, delay, side, top }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 13, stiffness: 120 },
  });
  const float = Math.sin((frame + delay * 3) / 14) * 10;

  return (
    <div
      style={{
        position: "absolute",
        top,
        [side]: 40,
        padding: "22px 36px",
        borderRadius: 28,
        backgroundColor: "rgba(255,255,255,0.14)",
        border: "2px solid rgba(255,255,255,0.35)",
        backdropFilter: "blur(14px)",
        color: "white",
        opacity: interpolate(s, [0, 0.5], [0, 1], clamp),
        translate: `${interpolate(s, [0, 1], [side === "left" ? -400 : 400, 0])}px ${float}px`,
        boxShadow: `0 20px 60px ${color}66`,
      }}
    >
      <div style={{ fontSize: 64, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 34, fontWeight: 600 }}>{label}</div>
    </div>
  );
};

const Showcase: React.FC = () => {
  const gpu = useGpu();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - 6,
    fps,
    config: { damping: 15, stiffness: 90 },
  });
  const counter = Math.round(
    interpolate(frame, [30, 100], [0, 60], {
      ...clamp,
      easing: Easing.out(Easing.cubic),
    }),
  );

  return (
    <AbsoluteFill style={{ fontFamily, backgroundColor: INK }}>
      {/* moving gradient background */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(${interpolate(frame, [0, 160], [150, 250])}deg, #5b21ff 0%, ${PINK} 55%, ${ACCENT} 100%)`,
        }}
      />

      {/* floating shapes */}
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 1480,
          rotate: `${frame * 2}deg`,
        }}
      >
        <Star points={5} innerRadius={50} outerRadius={110} fill={ACCENT} />
      </div>
      <div
        style={{
          position: "absolute",
          right: 60,
          top: 1660,
          translate: `0px ${Math.sin(frame / 12) * 24}px`,
        }}
      >
        <Heart height={140} fill="white" />
      </div>
      <div
        style={{
          position: "absolute",
          right: 160,
          top: 1470,
          scale: 1 + Math.sin(frame / 9) * 0.12,
        }}
      >
        <Circle radius={70} fill={CYAN} />
      </div>

      {/* headline */}
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 0,
          right: 0,
          textAlign: "center",
          color: "white",
          fontSize: 92,
          fontWeight: 800,
          lineHeight: 1.05,
          opacity: interpolate(frame, [0, 20], [0, 1], clamp),
          translate: `0px ${interpolate(frame, [0, 24], [-60, 0], {
            ...clamp,
            easing: Easing.out(Easing.cubic),
          })}px`,
        }}
      >
        Efectos
        <br />
        en tiempo real
      </div>

      {/* video card */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            width: 640,
            height: 1138,
            marginTop: 190,
            borderRadius: 64,
            overflow: "hidden",
            border: "10px solid white",
            boxShadow: "0 60px 140px rgba(0,0,0,0.55)",
            translate: `0px ${interpolate(enter, [0, 1], [1200, 0])}px`,
            rotate: `${interpolate(enter, [0, 1], [14, 0]) + Math.sin(frame / 25) * 1.5}deg`,
          }}
        >
          <Video
            src={staticFile("video.mp4")}
            muted
            trimBefore={3 * fps}
            objectFit="cover"
            style={{ width: "100%", height: "100%" }}
            effects={[
              saturation({ amount: 1.2 }),
              ...(gpu
                ? [
                    glow({
                      radius: 30,
                      intensity: 0.6,
                      threshold: 0.7,
                      color: "#ffffff",
                    }),
                    scanlines({
                      amount: 0.18,
                      spacing: 6,
                      thickness: 2,
                      offset: frame * 0.6,
                    }),
                  ]
                : []),
            ]}
          />
          {!gpu && (
            <AbsoluteFill
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 2px, transparent 2px, transparent 6px)",
                backgroundPosition: `0px ${frame * 0.6}px`,
              }}
            />
          )}
        </div>
      </AbsoluteFill>

      <Chip
        label="efectos GPU"
        value={`${counter}+`}
        color={ACCENT}
        delay={34}
        side="left"
        top={560}
      />
      <Chip
        label="puro React"
        value="100%"
        color={CYAN}
        delay={50}
        side="right"
        top={1180}
      />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Scene 3 — pixelate-in, word-by-word captions, end card              */
/* ------------------------------------------------------------------ */

const WORDS = [
  { text: "Cada", from: 14 },
  { text: "fotograma", from: 28 },
  { text: "es", from: 46 },
  { text: "código.", from: 58 },
];

const Finale: React.FC = () => {
  const gpu = useGpu();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const block = Math.round(
    interpolate(frame, [0, 34], [90, 1], {
      ...clamp,
      easing: Easing.out(Easing.cubic),
    }),
  );
  const endCard = interpolate(frame, [96, 120], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ fontFamily, backgroundColor: INK }}>
      <AbsoluteFill
        style={{
          scale: interpolate(frame, [0, 160], [1, 1.12]),
        }}
      >
        <Video
          src={staticFile("video.mp4")}
          muted
          trimBefore={6 * fps}
          objectFit="cover"
          style={{
            width: "100%",
            height: "100%",
            filter: gpu ? undefined : `blur(${(block - 1) / 5}px)`,
          }}
          effects={[
            ...(gpu ? [pixelate({ blockSize: block })] : []),
            contrast({ amount: 1.2 }),
            saturation({ amount: interpolate(endCard, [0, 1], [1.2, 0.3]) }),
            ...(gpu ? [vignette({ amount: 0.65 })] : []),
          ]}
        />
      </AbsoluteFill>
      {!gpu && <VignetteOverlay strength={0.65} />}

      <AbsoluteFill
        style={{
          backgroundColor: INK,
          opacity: interpolate(endCard, [0, 1], [0, 0.78]),
        }}
      />

      {/* word-by-word captions */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: interpolate(frame, [96, 112], [1, 0], clamp),
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "0 28px",
            padding: "0 80px",
            marginTop: 520,
          }}
        >
          {WORDS.map((w, i) => {
            const s = spring({
              frame: frame - w.from,
              fps,
              config: { damping: 10, stiffness: 180 },
            });
            const active =
              frame >= w.from &&
              (i === WORDS.length - 1 || frame < WORDS[i + 1].from);
            return (
              <span
                key={w.text}
                style={{
                  fontSize: 130,
                  fontWeight: 800,
                  color: active ? ACCENT : "white",
                  opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
                  scale: interpolate(s, [0, 1], [0.4, active ? 1.1 : 1]),
                  textShadow: "0 8px 40px rgba(0,0,0,0.7)",
                  WebkitTextStroke: "3px rgba(0,0,0,0.5)",
                  paintOrder: "stroke fill",
                }}
              >
                {w.text}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* end card */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: endCard,
        }}
      >
        <div
          style={{
            translate: `0px ${interpolate(endCard, [0, 1], [60, 0])}px`,
            textAlign: "center",
            color: "white",
          }}
        >
          <div
            style={{
              fontSize: 48,
              fontWeight: 600,
              letterSpacing: 12,
              color: ACCENT,
            }}
          >
            HECHO CON
          </div>
          <div
            style={{
              fontSize: 190,
              fontWeight: 800,
              letterSpacing: -6,
              textShadow: `0 0 70px ${PINK}`,
            }}
          >
            Remotion
          </div>
          <div
            style={{
              fontSize: 46,
              fontWeight: 600,
              opacity: 0.85,
              marginTop: 6,
            }}
          >
            15 segundos · 100% código
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Root composition                                                    */
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
        height: 12,
        width: `${(frame / durationInFrames) * 100}%`,
        background: `linear-gradient(90deg, ${PINK}, ${ACCENT})`,
      }}
    />
  );
};

export type ShowcaseProps = { readonly gpu: boolean };

export const MyComposition: React.FC<ShowcaseProps> = ({ gpu }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <GpuContext.Provider value={gpu}>
      <AbsoluteFill style={{ backgroundColor: INK }}>
        <TransitionSeries>
          <TransitionSeries.Sequence name="Opening" durationInFrames={160}>
            <Opening />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition
            presentation={slide({ direction: "from-bottom" })}
            timing={linearTiming({
              durationInFrames: 15,
              easing: Easing.bezier(0.7, 0, 0.3, 1),
            })}
          />
          <TransitionSeries.Sequence name="Showcase" durationInFrames={160}>
            <Showcase />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition
            presentation={wipe({ direction: "from-left" })}
            timing={linearTiming({
              durationInFrames: 15,
              easing: Easing.bezier(0.7, 0, 0.3, 1),
            })}
          />
          <TransitionSeries.Sequence name="Finale" durationInFrames={160}>
            <Finale />
          </TransitionSeries.Sequence>
        </TransitionSeries>

        <Audio
          src={staticFile("video.mp4")}
          durationInFrames={Math.round(12 * fps)}
          volume={interpolate(
            frame,
            [0, 12 * fps - 20, 12 * fps],
            [1, 1, 0],
            clamp,
          )}
        />

        <ProgressBar />
      </AbsoluteFill>
    </GpuContext.Provider>
  );
};
