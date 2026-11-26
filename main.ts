// Hearth Ledger — the entrypoint that assembles the submission for the
// grader. Plain words: it gathers the finished site (the static files in
// app/ — the page, the stylesheet and the JavaScript that renders the
// eight budget pages) and the screenshots in screenshots/, lays them out
// in the output directory the grader reads, and writes dossier.json there.
// The dossier is the judge's summary of the entry — the screenshots, the
// files the first load fetches and their sizes, and the source itself —
// produced by buildDossier from the vendored make.fun library in
// vendor/makefun-frontend.ts. That vendored file must stay byte-for-byte
// as the kit shipped it: the scorer re-derives the dossier from its own
// copy of the library and refuses anything that does not match.
//
// The site has no build step and makes no network requests: a browser just
// opens app/index.html. Try it locally with `node serve.ts`, then open
// http://localhost:8080. Outside the grader's container, the output
// directory is MAKEFUN_OUTPUT_DIR:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The caps below are the scorer's own gates, so this script refuses an
// entry the scorer would refuse: at most 4 screenshots, none over 256 KiB,
// at most 993 files and directories inside app/, 16 MiB of app files, and
// a 160 KiB cap on the text the dossier carries. The output is
// deterministic: run it twice and dossier.json comes out byte-identical.

import { cpSync, existsSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// Where this file lives, and where the grader looks for the entry.
const here = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Copy a directory tree, creating the destination first.
function copyDir(from, to) {
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

function assemble() {
  // Start from an empty output directory, so a file left over from an
  // earlier run can never sneak into the submission.
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  // The site itself, exactly as it ships.
  copyDir(join(here, 'app'), join(outDir, 'app'));

  // The screenshots, when the folder exists.
  const shots = join(here, 'screenshots');
  if (existsSync(shots)) copyDir(shots, join(outDir, 'screenshots'));

  // The judge's summary, written by the vendored library.
  const dossier = buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  });
  const dossierPath = join(outDir, 'dossier.json');
  writeFileSync(dossierPath, dossier);
  const size = statSync(dossierPath).size;
  console.log(`wrote ${dossierPath} (${size} bytes)`);
}

assemble();
