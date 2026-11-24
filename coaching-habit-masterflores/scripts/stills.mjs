// Exporta fotogramas de prueba (segundos) en ambos formatos hacia out/stills/.
// Uso: node scripts/stills.mjs [segundos separados por coma]
// Si no hay internet para descargar Chrome: BROWSER=/ruta/a/chrome node scripts/stills.mjs
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const seconds = (process.argv[2] ?? '2,15,25,60,100,115').split(',').map(Number);
const browserExecutable = process.env.BROWSER || undefined;
const chromeMode = process.env.BROWSER ? 'chrome-for-testing' : undefined;
const outDir = path.resolve('out/stills');
fs.mkdirSync(outDir, {recursive: true});

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
for (const id of ['CoachingHabit', 'CoachingHabitVertical']) {
  const composition = await selectComposition({serveUrl, id, browserExecutable, chromeMode});
  for (const s of seconds) {
    const output = path.join(outDir, `${id}-${String(s).replace('.', '_')}s.png`);
    await renderStill({
      composition, serveUrl, output, browserExecutable, chromeMode,
      frame: Math.min(Math.round(s * 30), composition.durationInFrames - 1),
      timeoutInMilliseconds: 90000,
    });
    console.log('ok', output);
  }
}
