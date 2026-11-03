import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
const types = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.svg':'image/svg+xml', '.png':'image/png', '.webmanifest':'application/manifest+json' };
http.createServer(async (req, res) => {
  try {
    const name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + (name === '/' ? '/index.html' : name));
    if (!file.startsWith(root + path.sep) || !['.html','.css','.js','.svg','.png','.webmanifest'].includes(path.extname(file))) { res.writeHead(403); return res.end(); }
    res.setHeader('Content-Type', (types[path.extname(file)] || 'text/plain') + '; charset=utf-8');
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(Number(process.env.PORT || 5173), '127.0.0.1', () => console.log('Wordwild: http://127.0.0.1:' + (process.env.PORT || 5173)));
