// Hearth Ledger — the hand-in program (Node 22, standard library only).
//
// It gathers the entry — the site under app/ and its screenshots — into the
// output directory and writes the dossier there with make.fun's own
// buildDossier, so the dossier is exactly the one the scorer rebuilds.
// Run twice, it writes the same bytes twice: files are copied in sorted
// order and the dossier is a pure function of the files.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const REPO_ROOT = dirname(fileURLToPath(import.meta.url));

function outputDir(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  if (fromEnv && fromEnv.trim() !== "") return fromEnv;
  return "/output";
}

function gather(root: string, out: string): void {
  // Start clean so a stale file from an earlier run can never leak in.
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  for (const folder of ["app", "screenshots"]) {
    const src = join(root, folder);
    if (!existsSync(src)) throw new Error(`Hearth Ledger: missing ${folder}/ in ${root}`);
    cpSync(src, join(out, folder), { recursive: true });
  }
}

function main(): void {
  const out = outputDir();
  gather(REPO_ROOT, out);
  const dossier = buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
    app_path_max_bytes: 1000,
  });
  writeFileSync(join(out, "dossier.json"), dossier);
  console.log(`Hearth Ledger: wrote ${out}/dossier.json (${dossier.length} bytes)`);
}

main();
