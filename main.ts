// Hearth Ledger — the entrypoint that assembles the submission.
//
// What this does, in plain terms: it takes the finished site (the static
// files in app/ — HTML, CSS and the JavaScript that renders the budget
// pages) plus the screenshots in screenshots/, copies them into the output
// directory the grader reads, and writes dossier.json there. The dossier
// is the judge's summary of the entry: which screenshots were submitted,
// which files the site loads first, how big they are, and the source
// itself. It is produced by buildDossier from the vendored make.fun
// library (vendor/makefun-frontend.ts) — that file must stay untouched,
// because the scorer re-derives the dossier byte for byte from its own
// copy of the library and rejects anything that does not match.
//
// The site needs no build step and no network: a browser just opens
// app/index.html. To try it locally, run `node serve.ts` and open
// http://localhost:8080. To build the submission by hand, outside the
// grader's container, point MAKEFUN_OUTPUT_DIR at a folder:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The limits below mirror the scorer's own gates, so this script refuses
// an entry the scorer would refuse: at most 4 screenshots and none over
// 256 KiB, at most 993 files/directories inside app/ and 16 MiB of app
// files, and a 160 KiB cap on the text the dossier carries.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The folder this file lives in, and the folder the grader reads from.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(source, dest) {
  cpSync(source, dest, { recursive: true });
}

function build() {
  // Start clean so a stale file from an earlier run can never sneak in.
  rmSync(outputDir, { recursive: true, force: true });
  mkdirSync(outputDir, { recursive: true });

  // The site itself.
  copyTree(join(repoRoot, 'app'), join(outputDir, 'app'));

  // The screenshots, when they exist.
  const shotsDir = join(repoRoot, 'screenshots');
  mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
  if (existsSync(shotsDir)) copyTree(shotsDir, join(outputDir, 'screenshots'));

  // The judge's summary, written by the vendored library.
  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  });
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
}

build();
