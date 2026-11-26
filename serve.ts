// Hearth Ledger — a tiny static file server for local testing only.
// Serves app/ at http://localhost:8080 (or --port <n>). It reads files from
// disk on each request and never writes anything.

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const APP_DIR = join(HERE, "app");

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
};

function portFromArgs(): number {
  const flag = process.argv.indexOf("--port");
  if (flag >= 0) {
    const n = Number(process.argv[flag + 1]);
    if (Number.isInteger(n) && n > 0) return n;
  }
  return 8080;
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", "http://localhost");
    let rel = decodeURIComponent(url.pathname);
    if (rel === "/") rel = "/index.html";
    const file = join(APP_DIR, normalize(rel));
    if (!file.startsWith(APP_DIR)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    const bytes = await readFile(file);
    res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
    res.end(bytes);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});

const port = portFromArgs();
server.listen(port, () => {
  console.log(`Hearth Ledger serving app/ at http://localhost:${port}`);
});
