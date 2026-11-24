import {FPS} from './brand';

/**
 * Todos los textos y duraciones del video. Edita aquí para cambiar el contenido.
 * La suma de las duraciones debe ser 120 s.
 * Las palabras en `keywords` se resaltan en verde menta (sin signos de puntuación, en minúscula).
 */

type Base = {
  /** Duración en segundos */
  seconds: number;
  label: string;
  title: string;
  keywords?: string[];
  /** Texto corto del bocadillo del avatar */
  bubble: string;
  /** Narración (se muestra como subtítulos) */
  narration: string;
};

export type IntroScene = Base & {
  kind: 'intro';
  subtitle: string;
  subtitleKeywords: string[];
  author: string;
};

export type IdeaScene = Base & {
  kind: 'idea';
  strike: string;
  cards: {title: string; body: string}[];
};

export type QuestionScene = Base & {
  kind: 'question';
  n: number;
  english: string;
  why: string;
  /** Etiquetas con borde punteado (solo P5) */
  tags?: string[];
  tagsCaption?: string;
};

export type HabitScene = Base & {
  kind: 'habit';
  flow: {tag: string; text: string; accent?: boolean}[];
  cards: {title: string; body?: string}[];
};

export type ForYouScene = Base & {
  kind: 'foryou';
  cards: {title: string; body: string}[];
  closing: string;
  closingKeywords: string[];
};

export type Scene = IntroScene | IdeaScene | QuestionScene | HabitScene | ForYouScene;

export const SCENES: Scene[] = [
  {
    kind: 'intro',
    seconds: 8,
    label: 'Libro en 2 minutos',
    title: 'The Coaching Habit',
    subtitle: 'Di menos. Pregunta más.',
    subtitleKeywords: ['menos', 'más'],
    author: 'Michael Bungay Stanier',
    bubble: '¡Hola!',
    narration:
      'Hola, soy Master Flores. En dos minutos te llevo a la esencia de The Coaching Habit: decir menos, preguntar más, y liderar distinto.',
  },
  {
    kind: 'idea',
    seconds: 12,
    label: 'El enemigo silencioso',
    strike: 'Yo tengo la respuesta',
    title: 'El monstruo del consejo',
    keywords: ['monstruo'],
    cards: [
      {title: 'Dependencia', body: 'El equipo espera tus soluciones'},
      {title: 'Saturación', body: 'Haces trabajo que no es tuyo'},
      {title: 'Desconexión', body: 'Pierdes lo que de verdad importa'},
    ],
    bubble: 'Mmm… ¿y si pregunto?',
    narration:
      'Todos llevamos dentro un monstruo del consejo: las ganas de dar la respuesta. Eso crea dependencia, saturación y desconexión. La salida: quedarte curioso un poco más.',
  },
  {
    kind: 'question',
    seconds: 11,
    n: 1,
    label: 'Pregunta 1 · Arranque',
    title: '¿Qué tienes en mente?',
    keywords: ['mente'],
    english: "What's on your mind?",
    why: 'Abre sin charla vacía y va directo a lo que le importa a la otra persona.',
    bubble: '¡Buena pregunta!',
    narration:
      'Pregunta uno, la de arranque: ¿qué tienes en mente? Abre la conversación y va directo a lo que importa.',
  },
  {
    kind: 'question',
    seconds: 11,
    n: 2,
    label: 'Pregunta 2 · La mejor del mundo',
    title: '¿Y qué más?',
    keywords: ['qué', 'más'],
    english: 'And what else?',
    why: 'La primera respuesta casi nunca es la única. Repítela dos o tres veces.',
    bubble: 'Escucha…',
    narration: 'Pregunta dos, la mejor del mundo: ¿y qué más? La primera respuesta casi nunca es la única.',
  },
  {
    kind: 'question',
    seconds: 11,
    n: 3,
    label: 'Pregunta 3 · Foco',
    title: '¿Cuál es el verdadero reto aquí para ti?',
    keywords: ['verdadero', 'reto'],
    english: "What's the real challenge here for you?",
    why: 'Evita resolver el problema equivocado. El "para ti" lo vuelve personal.',
    bubble: 'Curiosidad',
    narration: 'Tres, la de foco: ¿cuál es el verdadero reto aquí para ti? Así no resuelves el problema equivocado.',
  },
  {
    kind: 'question',
    seconds: 11,
    n: 4,
    label: 'Pregunta 4 · Fundamento',
    title: '¿Qué quieres?',
    keywords: ['quieres'],
    english: 'What do you want?',
    why: 'Detrás de cada petición hay un deseo y una necesidad. Nómbralos.',
    bubble: 'Silencio…',
    narration: 'Cuatro, la de fundamento: ¿qué quieres? Detrás de cada petición hay un deseo.',
  },
  {
    kind: 'question',
    seconds: 11,
    n: 5,
    label: 'Pregunta 5 · La perezosa',
    title: '¿Cómo puedo ayudarte?',
    keywords: ['ayudarte'],
    english: 'How can I help?',
    why: 'Pide claridad y frena el rescate automático.',
    tags: ['Víctima', 'Perseguidor', 'Salvador'],
    tagsCaption: 'El triángulo del drama',
    bubble: 'Sin rescatar',
    narration: 'Cinco, la perezosa: ¿cómo puedo ayudarte? Te saca del papel de salvador.',
  },
  {
    kind: 'question',
    seconds: 11,
    n: 6,
    label: 'Pregunta 6 · Estratégica',
    title: 'Si dices sí a esto, ¿a qué dices no?',
    keywords: ['sí', 'no'],
    english: "If you're saying yes to this, what are you saying no to?",
    why: 'Toda prioridad tiene un precio. Hacerlo visible es estrategia.',
    bubble: 'Elegir es renunciar',
    narration: 'Seis, la estratégica: si dices sí a esto, ¿a qué dices no?',
  },
  {
    kind: 'question',
    seconds: 11,
    n: 7,
    label: 'Pregunta 7 · Aprendizaje',
    title: '¿Qué fue lo más útil para ti?',
    keywords: ['útil'],
    english: 'What was most useful for you?',
    why: 'Cierra la conversación y convierte la charla en aprendizaje que se queda.',
    bubble: '¿Qué te llevas?',
    narration: 'Siete, la de aprendizaje: ¿qué fue lo más útil para ti? Así lo aprendido se queda.',
  },
  {
    kind: 'habit',
    seconds: 11,
    label: 'Cómo se vuelve hábito',
    title: 'Disparador → viejo hábito → nueva pregunta',
    keywords: ['nueva', 'pregunta'],
    flow: [
      {tag: 'Cuando', text: 'me piden una solución'},
      {tag: 'En vez de', text: 'dar la respuesta'},
      {tag: 'Pregunto', text: '¿Y qué más?', accent: true},
    ],
    cards: [
      {title: 'Una pregunta a la vez'},
      {title: 'Abraza el silencio', body: 'Ahí ocurre el pensamiento'},
    ],
    bubble: 'Una a la vez…',
    narration:
      'Para volverlo hábito: identifica el disparador, el viejo hábito y la nueva pregunta. Haz una pregunta a la vez, y deja que el silencio trabaje.',
  },
  {
    kind: 'foryou',
    seconds: 12,
    label: 'Aprendizaje en acción',
    title: 'Luis, esto ya es tuyo',
    keywords: ['tuyo'],
    cards: [
      {title: 'Coach ejecutivo', body: 'Las 7 preguntas, tu caja de herramientas'},
      {title: 'Líder en BAC', body: 'Pregunta antes de proponer en tu próxima reunión'},
      {title: 'Master flores', body: 'Hacer visible lo invisible'},
    ],
    closing: '¿Qué pregunta harás mañana?',
    closingKeywords: ['mañana'],
    bubble: '¿Y tú?',
    narration:
      'Luis, como coach y como líder de producto, esto ya es tuyo. Hacer visible lo invisible empieza con una buena pregunta. Mañana, ¿cuál harás primero?',
  },
];

export const DURATIONS = SCENES.map((s) => Math.round(s.seconds * FPS));
export const SCENE_STARTS: number[] = DURATIONS.reduce<number[]>((acc, _d, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + DURATIONS[i - 1]);
  return acc;
}, []);
export const TOTAL = DURATIONS.reduce((a, b) => a + b, 0);

export function sceneAt(frame: number) {
  let index = SCENES.length - 1;
  for (let i = 0; i < SCENES.length; i++) {
    if (frame < SCENE_STARTS[i] + DURATIONS[i]) {
      index = i;
      break;
    }
  }
  return {
    index,
    local: frame - SCENE_STARTS[index],
    scene: SCENES[index],
    duration: DURATIONS[index],
  };
}

/** Estado de los 7 círculos: pregunta actual (0-6, o -1) y cuántas ya se vieron. */
export function questionProgress(index: number) {
  const s = SCENES[index];
  if (s.kind === 'question') return {current: s.n - 1, seen: s.n - 1};
  const before = SCENES.slice(0, index).filter((x) => x.kind === 'question').length;
  return {current: -1, seen: before};
}

/** Normaliza una palabra para comparar con `keywords`. */
export const norm = (w: string) => w.replace(/[¿?¡!.,:;"“”…→]/g, '').toLowerCase();
