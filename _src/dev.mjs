// Local preview that mimics Vercel: clean URLs, the blog rewrites and the /api functions.
// Run:  node _src/build.mjs && node _src/dev.mjs   → http://localhost:3000
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = +(process.env.PORT || 3000);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.avif': 'image/avif', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.svg': 'image/svg+xml' };
const leads = [];

function wrapRes(res) {
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (o) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); return res; };
  res.send = (b) => { res.end(b); return res; };
  return res;
}
async function api(name, req, res, query) {
  const mod = require(join(ROOT, 'api', name + '.js'));
  let body = '';
  for await (const c of req) body += c;
  req.body = body ? (() => { try { return JSON.parse(body); } catch (e) { return body; } })() : undefined;
  req.query = query;
  if (name === 'lead' && req.body) leads.push(req.body);
  await mod(req, wrapRes(res));
}
http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://localhost'); let p = decodeURIComponent(u.pathname);
  try {
    if (p === '/__leads') { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(leads)); return; }
    if (p === '/blog') return await api('blog', req, res, Object.fromEntries(u.searchParams));
    if (p.startsWith('/blog/')) { req.url = '/api/blog?slug=' + p.slice(6); return await api('blog', req, res, { slug: p.slice(6) }); }
    if (p.startsWith('/api/') && !p.slice(5).startsWith('_')) return await api(p.slice(5).replace(/\.js$/, ''), req, res, Object.fromEntries(u.searchParams));
    let f = join(ROOT, p);
    try { const s = await stat(f); if (s.isDirectory()) f = join(f, 'index.html'); } catch (e) { f = f + '.html'; try { await stat(f); } catch (e2) { f = join(ROOT, p, 'index.html'); } }
    const data = await readFile(f);
    res.setHeader('Content-Type', TYPES[extname(f)] || 'application/octet-stream'); res.end(data);
  } catch (e) {
    res.statusCode = 404; res.setHeader('Content-Type', 'text/html'); res.end(await readFile(join(ROOT, '404.html')).catch(() => 'Not found'));
  }
}).listen(PORT, () => console.log('DKG preview on http://localhost:' + PORT));
