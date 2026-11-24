import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, POPPINS, W} from './brand';
import {
  ForYouScene,
  HabitScene,
  IdeaScene,
  IntroScene,
  QuestionScene,
  Scene,
  norm,
} from './scenes';
import {useEnter} from './anim';
import {Layout} from './layout';

/* ------------------------------------------------------------------ */
/* Piezas compartidas                                                  */
/* ------------------------------------------------------------------ */

const STEP = 5; // frames entre palabras
const TITLE_START = 12;

const Arrow: React.FC<{size: number}> = ({size}) => (
  <svg width={size * 0.7} height={size * 0.5} viewBox="0 0 70 50" style={{verticalAlign: 'middle', margin: `0 ${size * 0.08}px`}}>
    <path d="M6 25 H62 M42 8 L62 25 L42 42" stroke={C.mint} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const Word: React.FC<{text: string; delay: number; color: string; size: number}> = ({text, delay, color, size}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 200}});
  return (
    <span
      style={{
        display: 'inline-block',
        marginRight: size * 0.24,
        opacity: p,
        transform: `translateY(${(1 - p) * 50}px)`,
        color,
      }}
    >
      {text === '→' ? <Arrow size={size} /> : text}
    </span>
  );
};

/** Frase grande que aparece palabra por palabra; las palabras clave van en verde menta. */
const WordTitle: React.FC<{
  text: string;
  keywords?: string[];
  size: number;
  start?: number;
  weight?: number;
}> = ({text, keywords = [], size, start = TITLE_START, weight = W.extra}) => {
  const words = text.split(' ');
  return (
    <div style={{fontWeight: weight, fontSize: size, lineHeight: 1.1, letterSpacing: -1.2}}>
      {words.map((w, i) => (
        <Word
          key={i}
          text={w}
          size={size}
          delay={start + i * STEP}
          color={keywords.includes(norm(w)) ? C.mint : C.white}
        />
      ))}
    </div>
  );
};

const titleSize = (text: string, k: number) => {
  const len = text.length;
  const base = len <= 14 ? 112 : len <= 24 ? 88 : len <= 40 ? 76 : 64;
  return Math.round(base * k);
};

const titleEnd = (text: string) => TITLE_START + text.split(' ').length * STEP;

const Label: React.FC<{text: string; k: number}> = ({text, k}) => {
  const e = useEnter(2, 40);
  return (
    <div
      style={{
        ...e.style,
        alignSelf: 'flex-start',
        fontWeight: W.medium,
        fontSize: 30 * k,
        color: C.mint,
        border: `2px solid ${C.mint}`,
        borderRadius: 999,
        padding: `${8 * k}px ${26 * k}px`,
        marginBottom: 24 * k,
        letterSpacing: 0.4,
      }}
    >
      {text}
    </div>
  );
};

/** Texto estático con palabras clave en verde menta. */
const Rich: React.FC<{text: string; keywords: string[]}> = ({text, keywords}) => (
  <>
    {text.split(' ').map((w, i) => (
      <span key={i} style={{color: keywords.includes(norm(w)) ? C.mint : C.white}}>
        {w}{' '}
      </span>
    ))}
  </>
);

const Enter: React.FC<{delay: number; children: React.ReactNode; style?: React.CSSProperties}> = ({delay, children, style}) => {
  const e = useEnter(delay, 44);
  return <div style={{...e.style, ...style}}>{children}</div>;
};

/** Tarjetas blancas: texto azul oscuro y gris solo para el texto secundario. */
const Cards: React.FC<{
  items: {title: string; body?: string}[];
  start: number;
  layout: Layout;
  column?: boolean;
}> = ({items, start, layout, column}) => {
  const {k, vertical} = layout;
  const stack = column ?? vertical;
  return (
    <div style={{display: 'flex', flexDirection: stack ? 'column' : 'row', gap: 16 * k}}>
      {items.map((it, i) => (
        <Enter
          key={i}
          delay={start + i * 8}
          style={{
            flex: 1,
            background: C.white,
            borderRadius: 28 * k,
            padding: `${18 * k}px ${24 * k}px`,
            borderTop: `${8 * k}px solid ${C.mint}`,
            boxShadow: '0 12px 30px rgba(4,42,102,0.28)',
          }}
        >
          <div style={{fontWeight: W.semi, fontSize: 32 * k, color: C.blueDark, lineHeight: 1.15}}>{it.title}</div>
          {it.body && (
            <div style={{fontWeight: W.regular, fontSize: 25 * k, color: C.gray, lineHeight: 1.3, marginTop: 6 * k}}>
              {it.body}
            </div>
          )}
        </Enter>
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Escenas                                                             */
/* ------------------------------------------------------------------ */

const Intro: React.FC<{s: IntroScene; layout: Layout}> = ({s, layout}) => {
  const {k} = layout;
  const end = titleEnd(s.title);
  return (
    <>
      <Label text={s.label} k={k} />
      <WordTitle text={s.title} size={titleSize(s.title, k) * 1.1} keywords={s.keywords} />
      <Enter delay={end + 4} style={{fontWeight: W.semi, fontSize: 48 * k, marginTop: 24 * k}}>
        <Rich text={s.subtitle} keywords={s.subtitleKeywords} />
      </Enter>
      <Enter
        delay={end + 14}
        style={{
          alignSelf: 'flex-start',
          marginTop: 30 * k,
          fontWeight: W.medium,
          fontSize: 32 * k,
          color: C.bgC,
          background: C.mint,
          borderRadius: 999,
          padding: `${10 * k}px ${30 * k}px`,
        }}
      >
        {s.author}
      </Enter>
    </>
  );
};

const Strike: React.FC<{text: string; k: number}> = ({text, k}) => {
  const frame = useCurrentFrame();
  const e = useEnter(8, 40);
  const line = interpolate(frame, [32, 50], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        ...e.style,
        position: 'relative',
        alignSelf: 'flex-start',
        fontWeight: W.semi,
        fontSize: 44 * k,
        color: C.mint,
        marginBottom: 14 * k,
      }}
    >
      “{text}”
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: '54%',
          height: 5 * k,
          width: `${line * 100}%`,
          background: C.mint,
          borderRadius: 4,
        }}
      />
    </div>
  );
};

const Idea: React.FC<{s: IdeaScene; layout: Layout}> = ({s, layout}) => {
  const {k} = layout;
  const start = 22;
  const end = titleEnd(s.title) + start - TITLE_START;
  return (
    <>
      <Label text={s.label} k={k} />
      <Strike text={s.strike} k={k} />
      <WordTitle text={s.title} size={titleSize(s.title, k)} keywords={s.keywords} start={start} />
      <div style={{marginTop: 24 * k}}>
        <Cards items={s.cards} start={end + 4} layout={layout} />
      </div>
    </>
  );
};

const Question: React.FC<{s: QuestionScene; layout: Layout}> = ({s, layout}) => {
  const {k} = layout;
  const end = titleEnd(s.title);
  return (
    <>
      <Label text={s.label} k={k} />
      <WordTitle text={s.title} size={titleSize(s.title, k)} keywords={s.keywords} />
      <Enter
        delay={end + 4}
        style={{fontWeight: W.medium, fontSize: 32 * k, color: C.white, opacity: 0.85, marginTop: 14 * k}}
      >
        “{s.english}”
      </Enter>
      <Enter
        delay={end + 16}
        style={{
          marginTop: 24 * k,
          background: 'rgba(255,255,255,0.12)',
          borderLeft: `${7 * k}px solid ${C.mint}`,
          borderRadius: `${6 * k}px ${22 * k}px ${22 * k}px ${6 * k}px`,
          padding: `${14 * k}px ${26 * k}px`,
        }}
      >
        <div style={{fontWeight: W.medium, fontSize: 22 * k, color: C.mint, letterSpacing: 0.6, textTransform: 'uppercase'}}>
          Por qué funciona
        </div>
        <div style={{fontWeight: W.regular, fontSize: 31 * k, color: C.white, lineHeight: 1.3, marginTop: 4 * k}}>
          {s.why}
        </div>
      </Enter>
      {s.tags && (
        <Enter delay={end + 30} style={{display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12 * k, marginTop: 20 * k}}>
          {s.tags.map((t) => (
            <div
              key={t}
              style={{
                fontWeight: W.medium,
                fontSize: 28 * k,
                color: C.white,
                border: `3px dashed ${C.mint}`,
                borderRadius: 999,
                padding: `${6 * k}px ${24 * k}px`,
              }}
            >
              {t}
            </div>
          ))}
          <div style={{fontWeight: W.regular, fontSize: 24 * k, color: C.white, opacity: 0.85}}>{s.tagsCaption}</div>
        </Enter>
      )}
    </>
  );
};

const DrawArrow: React.FC<{delay: number; w: number; k: number}> = ({delay, w, k}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <svg width={w} height={60 * k} viewBox="0 0 80 60" style={{flex: 'none', alignSelf: 'center'}}>
      <path
        d="M6 30 H66 M46 12 L66 30 L46 48"
        stroke={C.mint}
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - p}
      />
    </svg>
  );
};

const Habit: React.FC<{s: HabitScene; layout: Layout}> = ({s, layout}) => {
  const {k} = layout;
  const end = titleEnd(s.title);
  const arrowW = 72 * (layout.vertical ? 0.85 : 1);
  return (
    <>
      <Label text={s.label} k={k} />
      <WordTitle text={s.title} size={titleSize(s.title, k)} keywords={s.keywords} />
      <div style={{display: 'flex', alignItems: 'stretch', marginTop: 28 * k}}>
        {s.flow.map((f, i) => (
          <React.Fragment key={i}>
            <Enter
              delay={end + 4 + i * 24}
              style={{
                flex: 1,
                background: f.accent ? C.mint : 'rgba(255,255,255,0.14)',
                border: f.accent ? `3px solid ${C.mint}` : '3px solid rgba(255,255,255,0.35)',
                borderRadius: 26 * k,
                padding: `${16 * k}px ${18 * k}px`,
                minHeight: 120 * k,
              }}
            >
              <div style={{fontWeight: W.medium, fontSize: 22 * k, color: f.accent ? C.bgC : C.mint, textTransform: 'uppercase', letterSpacing: 0.6}}>
                {f.tag}
              </div>
              <div style={{fontWeight: W.semi, fontSize: 31 * k, color: f.accent ? C.bgC : C.white, lineHeight: 1.2, marginTop: 4 * k}}>
                {f.text}
              </div>
            </Enter>
            {i < s.flow.length - 1 && <DrawArrow delay={end + 4 + i * 24 + 18} w={arrowW} k={k} />}
          </React.Fragment>
        ))}
      </div>
      <div style={{marginTop: 22 * k}}>
        <Cards items={s.cards} start={end + 84} layout={layout} column={false} />
      </div>
    </>
  );
};

const ForYou: React.FC<{s: ForYouScene; layout: Layout}> = ({s, layout}) => {
  const {k} = layout;
  const end = titleEnd(s.title);
  const closingStart = end + 4 + 3 * 8 + 14;
  return (
    <>
      <Label text={s.label} k={k} />
      <WordTitle text={s.title} size={titleSize(s.title, k)} keywords={s.keywords} />
      <div style={{marginTop: 22 * k}}>
        <Cards items={s.cards} start={end + 4} layout={layout} />
      </div>
      <div style={{marginTop: 28 * k}}>
        <WordTitle text={s.closing} size={Math.round(60 * k)} keywords={s.closingKeywords} start={closingStart} />
      </div>
    </>
  );
};

export const SceneBody: React.FC<{scene: Scene; layout: Layout}> = ({scene, layout}) => {
  const {content} = layout;
  return (
    <div
      style={{
        position: 'absolute',
        left: content.left,
        top: content.top,
        width: content.width,
        height: content.height,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        fontFamily: POPPINS,
        color: C.white,
      }}
    >
      {scene.kind === 'intro' && <Intro s={scene} layout={layout} />}
      {scene.kind === 'idea' && <Idea s={scene} layout={layout} />}
      {scene.kind === 'question' && <Question s={scene} layout={layout} />}
      {scene.kind === 'habit' && <Habit s={scene} layout={layout} />}
      {scene.kind === 'foryou' && <ForYou s={scene} layout={layout} />}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Subtítulos                                                          */
/* ------------------------------------------------------------------ */

/** Las palabras se iluminan progresivamente hasta el 85 % de la duración de la escena. */
export const Subtitles: React.FC<{text: string; sceneDuration: number; layout: Layout}> = ({
  text,
  sceneDuration,
  layout,
}) => {
  const frame = useCurrentFrame();
  const enter = useEnter(8, 40);
  const words = text.split(' ');
  const start = 14;
  const end = sceneDuration * 0.85;
  const step = (end - start) / words.length;
  const {subs} = layout;

  return (
    <div
      style={{
        position: 'absolute',
        left: subs.left,
        width: subs.width,
        bottom: subs.bottom,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          ...enter.style,
          background: 'rgba(4,42,102,0.8)',
          borderRadius: 32,
          padding: '18px 32px',
          fontFamily: POPPINS,
          fontWeight: W.regular,
          fontSize: subs.font,
          lineHeight: 1.35,
          color: C.white,
          textAlign: 'center',
        }}
      >
        {words.map((w, i) => {
          const t = start + i * step;
          const lit = interpolate(frame, [t, t + 5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return (
            <span key={i} style={{opacity: 0.32 + 0.68 * lit}}>
              {w}{' '}
            </span>
          );
        })}
      </div>
    </div>
  );
};
