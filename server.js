// Minimal zero-dependency static file server for the built SPA (dist/).
// Used in production (Railway) so the runtime needs no devDependencies.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('./dist', import.meta.url));
const PORT = Number(process.env.PORT) || 4173;
const HOST = '0.0.0.0';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8',
};

async function readIfFile(path) {
  try {
    const info = await stat(path);
    if (!info.isFile()) return null;
    return await readFile(path);
  } catch {
    return null;
  }
}

const server = createServer(async (req, res) => {
  // Strip query string and prevent path traversal outside dist/.
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const safePath = normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
  const candidate = join(DIST, safePath === '/' ? 'index.html' : safePath);

  let body = candidate.startsWith(DIST) ? await readIfFile(candidate) : null;
  let filePath = candidate;

  // SPA fallback: unknown non-asset routes serve index.html.
  if (body === null) {
    filePath = join(DIST, 'index.html');
    body = await readIfFile(filePath);
    if (body === null) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
  }

  const type = MIME[extname(filePath)] ?? 'application/octet-stream';
  const isHashed = /\.[0-9a-f]{8,}\./i.test(filePath);
  res.writeHead(200, {
    'Content-Type': type,
    'Cache-Control': isHashed
      ? 'public, max-age=31536000, immutable'
      : 'no-cache',
  });
  res.end(body);
});

server.listen(PORT, HOST, () => {
  console.log(`Static server listening on http://${HOST}:${PORT} (serving dist/)`);
});
