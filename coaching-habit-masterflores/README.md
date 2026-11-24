# The Coaching Habit · Master flores

Video animado de 2:00 (120 s · 30 fps) sobre *The Coaching Habit* de Michael Bungay Stanier, narrado por Luis (avatar SVG) con la línea gráfica de Master flores. Remotion 4 + TypeScript.

## Composiciones
- `CoachingHabit` – 1920×1080 (16:9, YouTube)
- `CoachingHabitVertical` – 1080×1920 (Reels / TikTok)

## Scripts
```bash
npm install
npm run dev              # Remotion Studio
npm run render           # out/CoachingHabit.mp4
npm run render:vertical  # out/CoachingHabitVertical.mp4
npm run typecheck
```

## Estructura
- `src/data.ts` – escenas (8 s intro · 7 × 14 s preguntas · 14 s cierre), textos y narración
- `src/theme.ts` – paleta de marca y Poppins (`@remotion/google-fonts`)
- `src/Background.tsx` – fondo radial, cuartos de círculo, signos "?", barra de progreso
- `src/Avatar.tsx` – personaje SVG, boca, parpadeo, brazo y bocadillo
- `src/Hud.tsx` – firma en texto y círculos 1–7
- `src/Content.tsx`, `src/Subtitles.tsx` – frase palabra por palabra y subtítulos
- `src/layout.ts` – diferencias entre horizontal y vertical

Para cambiar textos o duraciones edita `src/data.ts` (la suma debe seguir siendo 3600 frames).
