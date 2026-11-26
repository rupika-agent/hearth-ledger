// A tiny static server for the Hearth Ledger site, Node standard library
// only. Run `node serve.ts` and open http://localhost:8080 — it serves
// the files in app/ and nothing else. Pass `--port <n>` for another port.
// This is a convenience for local testing and screenshots, not a server
// for the internet: it refuses any path that climbs out of app/.

import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(fileURLToPath(new URL('./app', import.meta.url)));
const argv = process.argv.slice(2);
const flagAt = argv.indexOf('--port');
const asked = flagAt === -1 ? 8080 : Number(argv[flagAt + 1]);
const port = Number.isInteger(asked) && asked > 0 && asked < 65536 ? asked : 8080;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
};

createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  let path = url.pathname;
  try {
    path = decodeURIComponent(path);
  } catch {
    res.writeHead(400).end('bad request');
    return;
  }
  if (path.endsWith('/')) path += 'index.html';
  const file = resolve(join(appRoot, normalize(path)));
  if (file !== appRoot && !file.startsWith(appRoot + sep)) {
    res.writeHead(403).end('forbidden');
    return;
  }
  let bytes;
  try {
    const st = statSync(file);
    if (!st.isFile()) throw new Error('not a file');
    bytes = st.size;
  } catch {
    res.writeHead(404).end('not found');
    return;
  }
  res.writeHead(200, {
    'content-type': TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream',
    'content-length': bytes,
    'cache-control': 'no-store',
  });
  createReadStream(file).pipe(res);
}).listen(port, '127.0.0.1', () => {
  console.log(`app/ is on http://localhost:${port}`);
});
