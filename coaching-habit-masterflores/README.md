# The Coaching Habit · Master flores

Video animado de **2:00 exactos** (120 s · 30 fps) sobre *The Coaching Habit* de Michael Bungay Stanier, narrado por Luis (avatar SVG) con la línea gráfica de Master flores. Remotion 4 + TypeScript.

## Composiciones
| Id | Tamaño | Uso |
|---|---|---|
| `CoachingHabit` | 1920×1080 (16:9) | YouTube |
| `CoachingHabitVertical` | 1080×1920 (9:16) | Reels / TikTok (avatar abajo al centro, texto arriba) |

## Instalar y usar
```bash
npm install
npm run dev              # Remotion Studio
npm run render           # out/CoachingHabit.mp4
npm run render:vertical  # out/CoachingHabitVertical.mp4
npx tsc --noEmit         # revisar tipos
node scripts/stills.mjs 2,15,25,60,100,115   # fotogramas de prueba en out/stills/
```
Si el equipo no puede descargar el Chrome de Remotion, pasa un navegador propio:
`--browser-executable=/ruta/a/chrome --chrome-mode=chrome-for-testing` (o `BROWSER=/ruta/a/chrome node scripts/stills.mjs`).

## Estructura
| Archivo | Contenido |
|---|---|
| `src/brand.ts` | Paleta de marca, Poppins (`@remotion/google-fonts`), `VOICE_FILE` |
| `src/scenes.ts` | **Todos los textos y duraciones** (arreglo tipado). Edita aquí. |
| `src/CoachingHabit.tsx` | Composición: `<Sequence>` por escena, audio, avatar, HUD |
| `src/SceneBodies.tsx` | Diseño de cada tipo de escena + subtítulos |
| `src/Avatar.tsx` | Luis: SVG, parpadeo, boca, brazo, bocadillo pop |
| `src/Background.tsx` | Fondo radial, cuartos de círculo, signos "?", barra de progreso |
| `src/Hud.tsx` | Firma "Master flores" y círculos 1–7 |
| `src/layout.ts` | Adaptación horizontal / vertical (`useVideoConfig`) |
| `src/anim.ts` | Entrada con spring (damping 200) y fundido de salida de 0.4 s |
| `scripts/make_music.py` | Genera `public/music.mp3` |

Escenas (s): intro 8 · idea 12 · 7 preguntas × 11 · hábito 11 · para ti 12 = **120**. La suma se valida al cargar (`Root.tsx`).

## Audio
`public/music.mp3` es original y libre de derechos: ambiental a 72 BPM (Cmaj7 – Am7 – Fmaj7 – G6), pads triangulares, bajo senoidal, arpegio con delay y campanita (C6-G6-C7) al inicio de cada escena. Para regenerarlo: `python3 scripts/make_music.py` (requiere numpy y ffmpeg).

## Poner tu voz
1. Graba la narración (120 s) y guárdala como `public/voz.mp3`.
2. En `src/brand.ts` cambia `VOICE_FILE` de `null` a `'voz.mp3'`.
3. La voz se reproduce y la música baja automáticamente a 0.35 de volumen.

Los textos de narración de `scenes.ts` sirven de guion y se muestran como subtítulos.
