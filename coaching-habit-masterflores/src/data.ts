import {FPS} from './theme';

export type SceneKind = 'intro' | 'question' | 'outro';

export type Scene = {
  kind: SceneKind;
  /** Número de pregunta (1-7) para las escenas de pregunta */
  n?: number;
  label?: string;
  /** Frase principal. Las palabras en `keywords` van en verde menta. */
  title: string;
  keywords?: string[];
  subtitle: string;
  narration: string;
  bubble: string;
  durationInFrames: number;
};

const Q = 14 * FPS;

export const SCENES: Scene[] = [
  {
    kind: 'intro',
    label: 'Libro · Michael Bungay Stanier',
    title: 'The Coaching Habit',
    keywords: ['Coaching'],
    subtitle: 'Siete preguntas para liderar con curiosidad',
    narration:
      'Hola, soy Luis, de Master flores. Hoy te cuento The Coaching Habit, de Michael Bungay Stanier: siete preguntas para dar menos consejos y generar más cambio.',
    bubble: '¡Hola, soy Luis!',
    durationInFrames: 8 * FPS,
  },
  {
    kind: 'question',
    n: 1,
    label: 'La pregunta de inicio',
    title: '¿Qué tienes en mente?',
    keywords: ['mente?'],
    subtitle: 'Empieza la conversación sin rodeos',
    narration:
      'Empieza con la pregunta de inicio: ¿qué tienes en mente? Es directa, abre la charla y lleva a la persona a hablar de lo que de verdad le importa.',
    bubble: 'Empieza aquí',
    durationInFrames: Q,
  },
  {
    kind: 'question',
    n: 2,
    label: 'La pregunta AWE',
    title: '¿Y qué más?',
    keywords: ['qué', 'más?'],
    subtitle: 'Amplía las ideas antes de decidir',
    narration:
      'Luego pregunta: ¿y qué más? Dale espacio a la persona para explorar más opciones. Funciona hasta tres veces y frena la prisa por dar soluciones.',
    bubble: 'Hasta 3 veces',
    durationInFrames: Q,
  },
  {
    kind: 'question',
    n: 3,
    label: 'La pregunta de enfoque',
    title: '¿Cuál es el verdadero desafío para ti?',
    keywords: ['verdadero', 'desafío'],
    subtitle: 'Ve al corazón del asunto',
    narration:
      'Después enfoca: ¿cuál es el verdadero desafío para ti? Así dejas de resolver el problema equivocado y descubres lo que realmente pesa.',
    bubble: 'Enfoca la charla',
    durationInFrames: Q,
  },
  {
    kind: 'question',
    n: 4,
    label: 'La pregunta base',
    title: '¿Qué quieres?',
    keywords: ['quieres?'],
    subtitle: 'Haz visible el deseo detrás del pedido',
    narration:
      'La pregunta base es: ¿qué quieres? Pone sobre la mesa el deseo real, para que la conversación no se quede en quejas ni en suposiciones.',
    bubble: 'Aclara el deseo',
    durationInFrames: Q,
  },
  {
    kind: 'question',
    n: 5,
    label: 'La pregunta perezosa',
    title: '¿Cómo puedo ayudarte?',
    keywords: ['ayudarte?'],
    subtitle: 'Pide claridad, no adivines',
    narration:
      'Cuando alguien te pide ayuda, pregunta: ¿cómo puedo ayudarte? Evitas cargar con todo y la otra persona debe hacer un pedido concreto.',
    bubble: 'Sin adivinar',
    durationInFrames: Q,
  },
  {
    kind: 'question',
    n: 6,
    label: 'La pregunta estratégica',
    title: 'Si dices sí a esto, ¿a qué le estás diciendo no?',
    keywords: ['sí', 'no?'],
    subtitle: 'Elegir es renunciar con intención',
    narration:
      'La pregunta estratégica: si dices sí a esto, ¿a qué le estás diciendo no? Todo compromiso tiene un costo, y verlo te ayuda a decidir mejor.',
    bubble: 'Todo tiene un costo',
    durationInFrames: Q,
  },
  {
    kind: 'question',
    n: 7,
    label: 'La pregunta de aprendizaje',
    title: '¿Qué ha sido lo más útil para ti?',
    keywords: ['más', 'útil'],
    subtitle: 'Convierte la charla en aprendizaje',
    narration:
      'Cierra con aprendizaje: ¿qué ha sido lo más útil para ti? Ayuda a fijar las ideas y hace que la próxima conversación sea todavía mejor.',
    bubble: 'Cierra aprendiendo',
    durationInFrames: Q,
  },
  {
    kind: 'outro',
    label: 'Para recordar',
    title: 'Menos consejos, más preguntas',
    keywords: ['preguntas'],
    subtitle: 'Practica una pregunta por semana',
    narration:
      'Recuerda: no se trata de saber más, sino de preguntar mejor. Practica una pregunta por semana y verás cómo cambian tus conversaciones. Aprendizaje en acción.',
    bubble: '¡Nos vemos pronto!',
    durationInFrames: 14 * FPS,
  },
];

export const RECAP = [
  'Qué tienes en mente',
  'Y qué más',
  'El verdadero desafío',
  'Qué quieres',
  'Cómo puedo ayudarte',
  'Sí a esto, no a qué',
  'Qué fue lo más útil',
];

export const SCENE_STARTS: number[] = SCENES.reduce<number[]>((acc, s, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + SCENES[i - 1].durationInFrames);
  return acc;
}, []);

export const TOTAL = SCENES.reduce((a, s) => a + s.durationInFrames, 0);

export function sceneAt(frame: number) {
  let index = SCENES.length - 1;
  for (let i = 0; i < SCENES.length; i++) {
    if (frame < SCENE_STARTS[i] + SCENES[i].durationInFrames) {
      index = i;
      break;
    }
  }
  return {index, local: frame - SCENE_STARTS[index], scene: SCENES[index]};
}
