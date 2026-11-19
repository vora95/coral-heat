// Server statis kecil untuk memainkan Coral Heat secara lokal (Node 22, stdlib saja).
// Cara pakai: `node serve.ts` lalu buka http://localhost:8080 (atau --port N).
// Hanya melayani file di bawah game/, menolak path yang keluar dari sana, dan
// mengirim tipe MIME yang dibutuhkan game browser. Bukan server untuk internet.
import { readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('./game', import.meta.url)));
const args = process.argv.slice(2);
const portArg = args.indexOf('--port');
const wanted = portArg === -1 ? 8080 : Number(args[portArg + 1]);
const port = Number.isInteger(wanted) && wanted > 0 && wanted < 65536 ? wanted : 8080;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.txt': 'text/plain; charset=utf-8',
};

function sendFile(response, file) {
  const body = readFileSync(file);
  response.writeHead(200, {
    'content-type': MIME[extname(file).toLowerCase()] ?? 'application/octet-stream',
    'content-length': body.length,
    'cache-control': 'no-store',
  });
  response.end(body);
}

createServer((request, response) => {
  let pathname = '/';
  try {
    pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end('bad request');
    return;
  }
  if (pathname.endsWith('/')) pathname += 'index.html';
  if (pathname === '/favicon.ico') {
    response.writeHead(204);
    response.end();
    return;
  }
  const file = resolve(join(root, normalize(pathname)));
  if (file !== root && !file.startsWith(root + sep)) {
    response.writeHead(403).end('forbidden');
    return;
  }
  try {
    if (!statSync(file).isFile()) throw new Error('bukan file');
  } catch {
    response.writeHead(404).end('not found');
    return;
  }
  try {
    sendFile(response, file);
  } catch {
    response.writeHead(500).end('read error');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Coral Heat di http://localhost:${port}`);
});
