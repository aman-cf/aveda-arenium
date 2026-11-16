// Builds a GitHub Pages copy of the site into dist-pages/.
// GitHub Pages serves a project site from a sub-address (https://<user>.github.io/<Repo>/) and has no
// server, so this copy (1) prefixes every site-root path with that sub-address and (2) marks the
// pages as static so forms send leads to the Google Sheet web app set in assets/config.js.
//
// Run:  node _src/build.mjs && node _src/pages-build.mjs /Aveda-Arenium/
// Then upload the CONTENTS of dist-pages/ to the root of the GitHub repo.
import { cp, rm, mkdir, readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'dist-pages');
let BASE = process.argv[2] || '/Aveda-Arenium/';
if (!BASE.startsWith('/')) BASE = '/' + BASE;
if (!BASE.endsWith('/')) BASE += '/';

const COPY = ['index.html', '404.html', 'aveda-arenium', 'connect', 'contact', 'privacy', 'assets', 'img', 'f', 'h'];

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
for (const p of COPY) await cp(join(ROOT, p), join(OUT, p), { recursive: true });

// Rewrite root-absolute paths ("/assets/…", "/aveda-arenium", "/") to sit under BASE.
const b = BASE.slice(0, -1);                                         // "/Aveda-Arenium"
function rewriteHtml(s) {
  s = s.replace(/(\s(?:href|src|action|poster|data-src)=")\/(?!\/)/g, `$1${BASE}`);
  s = s.replace(/url\((['"]?)\/(?!\/)/g, `url($1${BASE}`);
  s = s.replace(/location\.origin \+ '\/'/g, `location.origin + '${BASE}'`);
  s = s.replace(/(['"])\/(img|assets|f|h)\//g, `$1${BASE}$2/`);               // paths inside scripts
  // mark the page as static (no /api) before any other script runs
  s = s.replace('<script src="' + BASE + 'assets/config.js', '<script>window.DKG_STATIC=true;window.DKG_BASE="' + BASE + '"</script>\n<script src="' + BASE + 'assets/config.js');
  return s;
}
function rewriteCss(s) { return s.replace(/url\((['"]?)\/(?!\/)/g, `url($1${BASE}`); }

async function walk(dir) {
  for (const name of await readdir(dir)) {
    const p = join(dir, name), st = await stat(p);
    if (st.isDirectory()) { if (!/^(f|h)$/.test(name) || dir !== OUT) await walk(p); continue; }
    const ext = extname(name);
    if (ext === '.html') await writeFile(p, rewriteHtml(await readFile(p, 'utf8')));
    else if (ext === '.css') await writeFile(p, rewriteCss(await readFile(p, 'utf8')));
  }
}
await walk(OUT);
await writeFile(join(OUT, '.nojekyll'), '');                        // serve files as they are, no Jekyll
console.log('GitHub Pages copy written to dist-pages/ for base ' + BASE);
