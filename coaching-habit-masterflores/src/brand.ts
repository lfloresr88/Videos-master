import {loadFont} from '@remotion/google-fonts/Poppins';

export const {fontFamily: POPPINS} = loadFont('normal', {
  weights: ['400', '500', '600', '800'],
  subsets: ['latin', 'latin-ext'],
});

export const C = {
  blue: '#0F69F7',
  blueDark: '#194E8E',
  bgA: '#0C41CB',
  bgB: '#05398C',
  bgC: '#042a66',
  mint: '#27FCAA',
  green: '#10C47B',
  greenDeco: '#20E19E',
  gray: '#575756',
  white: '#FFFFFF',
} as const;

export const FPS = 30;
export const TOTAL_FRAMES = 120 * FPS;

export const W = {regular: 400, medium: 500, semi: 600, extra: 800} as const;

/** Ruta (dentro de public/) de la voz narrada, por ejemplo 'voz.mp3'. Con null solo suena la música. */
export const VOICE_FILE: string | null = null;
/** Volumen de la música: baja a 0.35 cuando hay voz. */
export const MUSIC_VOLUME = VOICE_FILE ? 0.35 : 1;
