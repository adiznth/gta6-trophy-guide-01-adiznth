// Leonida Trophy Guide — the entry program (Node 22, standard library only).
//
// The guide itself is the static files in app/: index.html opens in a desktop
// browser with no build step and no network, its data is
// app/data/trophies.json (all 55 PS5 trophies, each with its official name,
// description and grade, a guide in our own words and its sources), and the
// screenshots in screenshots/ show the guide running in a browser.
//
// This program hands the entry in: it copies app/ and screenshots/ from the
// directory this file lives in to the output directory and writes
// dossier.json there, using the vendored make.fun library. The dossier is
// what the judge reads: the screenshots, the first load's files and bytes,
// and the source. vendor/makefun-frontend.ts stays untouched — the scorer
// rebuilds the dossier with its own copy and the two must match byte for byte.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// (inside the grader, MAKEFUN_OUTPUT_DIR is unset and /output is used).
// Serve the guide locally with `node serve.ts`, then open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Refuse to hand in an entry with no screenshots: the judge reads the guide
// through them, and the gate needs 3 or 4.
const shotDir = join(repoRoot, 'screenshots');
const shots = existsSync(shotDir)
  ? readdirSync(shotDir).filter((name) => statSync(join(shotDir, name)).isFile())
  : [];
if (shots.length < 3 || shots.length > 4) {
  throw new Error(`expected 3 or 4 screenshots in screenshots/, found ${shots.length}`);
}

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
cpSync(shotDir, join(outputDir, 'screenshots'), { recursive: true });

// The caps mirror the scorer's gate: at most 4 screenshots of 256 KiB each,
// at most 993 files and directories in app/ totalling 48 MiB, and the
// dossier text capped at 160 KiB. An entry past any of them is refused here
// with the library's own words, the same way the scorer would refuse it.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
