// DKG Landcorp site builder — no dependencies. Run:  node _src/build.mjs
// Reads page sources from _src/pages, fills in the shared pieces (head, menu, drawer, footer)
// and writes the finished pages to the site root. Also writes api/_chrome.js so the
// server-rendered blog pages use exactly the same header and footer.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = dirname(fileURLToPath(import.meta.url));
const ROOT = join(SRC, '..');
const SITE = 'https://dkglandcorp.com';
// The Journal (blog) is built but switched off for launch. Set to true to bring back its links and home section,
// and restore the /blog rewrites in vercel.json (see docs/LEADS.md).
const JOURNAL = false;
const V = '20261113f';                                   // bump to refresh cached CSS/JS

const arrow = '<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 8.5 L8.5 1.5 M3 1.5 H8.5 V7" fill="none" stroke="currentColor"/></svg>';
const waIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3a.5.5 0 0 0 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.9-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z"/></svg>';

export const parts = {
  arrow, waIcon,
  head({ title, desc, path = '/', image = '/assets/img/og-dkg.jpg', extra = '' }) {
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${SITE}${path}">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${SITE}${path}">
<meta property="og:image" content="${SITE}${image}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#161211">
<link rel="icon" href="/assets/img/favicon.png" type="image/png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600&family=Instrument+Serif:ital@0;1&display=swap">
<link rel="stylesheet" href="/assets/site.css?v=${V}">
<script src="/assets/config.js?v=${V}"></script>
${extra}
</head>`;
  },
  nav(current = '', brand = 'dkg') {
    const cur = (k) => (k === current ? ' aria-current="page"' : '');
    const wm = brand === 'aveda'
      ? `<a class="gnav-wm" href="/" aria-label="Aveda Arenium by DKG Landcorp, go to the DKG Landcorp home page">Aveda Arenium<small>by DKG Landcorp</small></a>`
      : `<a class="gnav-wm" href="/" aria-label="DKG Landcorp, home">DKG Landcorp</a>`;
    return `<header class="gnav${brand === 'aveda' ? ' pre' : ''}" id="nav">
  <ul class="gnav-links">
    <li><a href="/"${cur('home')}>Home</a></li>
    <li><a class="gbtn" href="/aveda-arenium"${cur('aveda')}>Aveda Arenium<span class="sub">· Project</span></a></li>
    <li><a href="/connect"${cur('connect')}>Connect</a></li>
${JOURNAL ? `    <li><a href="/blog"${cur('blog')}>Journal</a></li>
` : ''}  </ul>
  ${wm}
  <div class="gnav-end">
    <a class="u hide-m" href="/contact"${cur('contact')}>Contact us</a>
    <button class="enq hide-m" type="button" data-enquire="general"><span class="dot"></span>Enquire</button>
    <button class="gnav-menu" type="button" data-menu aria-expanded="false" aria-controls="gmenu"><i></i>Menu</button>
  </div>
</header>`;
  },
  chrome(current = '') {
    const cur = (k) => (k === current ? ' aria-current="page"' : '');
    return `<div class="gmenu" id="gmenu" aria-hidden="true" role="dialog" aria-label="Site menu">
  <div class="gmenu-top"><a class="gnav-wm" href="/">DKG Landcorp</a><button type="button" data-menu-close>Close</button></div>
  <nav aria-label="Main">
    <a href="/"${cur('home')}><small>01</small><em>Home</em></a>
    <a href="/aveda-arenium"${cur('aveda')}><small>02</small><em>Aveda Arenium</em></a>
    <a href="/connect"${cur('connect')}><small>03</small><em>Connect</em></a>
${JOURNAL ? `    <a href="/blog"${cur('blog')}><small>04</small><em>Journal</em></a>
` : ''}    <a href="/contact"${cur('contact')}><small>${JOURNAL ? '05' : '04'}</small><em>Contact us</em></a>
  </nav>
  <div class="gmenu-foot lbl">
    <span>World Tech 83, IT City Road, Sector 83, Mohali</span>
    <a data-phone href="#"></a><a data-email href="#"></a>
    <button class="tl" type="button" data-enquire="general" style="color:var(--bone);margin-top:12px">Enquire<span class="dot"></span></button>
  </div>
</div>

<div class="drawer-bg" id="drawer-bg"></div>
<aside class="drawer" id="drawer" aria-hidden="true" aria-labelledby="drawer-title" role="dialog">
  <div class="drawer-top"><span data-d-eyebrow>Enquire</span><button type="button" data-drawer-close>Close</button></div>
  <div class="drawer-body">
    <h2 id="drawer-title" data-d-title>Talk to <em>DKG</em>.</h2>
    <p class="body muted" data-d-sub style="max-width:380px">Leave your number and our team will call you back, usually the same working day.</p>
    <form class="lf" data-type="general">
      <input type="hidden" name="type" value="general"><input type="hidden" name="project" value="">
      <div class="hp" aria-hidden="true"><label>Website <input name="website" tabindex="-1" autocomplete="off"></label></div>
      <div class="f"><label for="d-name">Full name</label><input id="d-name" name="name" autocomplete="name" placeholder="Your full name"></div>
      <div class="f2">
        <div class="f"><label for="d-phone">Mobile number</label><input id="d-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+91"></div>
        <div class="f"><label for="d-email">Email (optional)</label><input id="d-email" name="email" type="email" autocomplete="email" placeholder="you@example.com"></div>
      </div>
      <div class="f2" data-d-visit hidden>
        <div class="f"><label for="d-date">Preferred day</label><input id="d-date" name="visit_date" type="date"></div>
        <div class="f"><label for="d-slot">Time</label><select id="d-slot" name="visit_slot"><option>Morning</option><option>Afternoon</option><option>Evening</option></select></div>
      </div>
      <div class="f"><label for="d-int">Interested in</label><select id="d-int" name="interest"><option>Aveda Arenium · 3 + 1</option><option>Aveda Arenium · 4 + 1</option><option>Aveda Arenium · 4 + 2</option><option>Aveda Arenium · 5 + 2</option><option>Future DKG projects</option><option>Something else</option></select></div>
      <label class="consent"><input type="checkbox" name="consent" id="d-ok"><span>I agree to be contacted by DKG Landcorp by phone, email or WhatsApp. See our <a href="/privacy">privacy policy</a>.</span></label>
      <p class="err" role="alert"></p>
      <button class="tl wide" type="submit">Send request${arrow}</button>
    </form>
    <div class="lf-done" hidden><span class="lbl muted">Received</span><h3 data-thx>Thank you.</h3><p class="body muted">A relationship manager will be in touch shortly. Need us sooner?</p><div class="links"><a class="tl" data-phone data-keep href="#">Call now<span class="dot"></span></a><a class="tl" data-whatsapp href="#">WhatsApp${arrow}</a></div></div>
  </div>
</aside>

<nav class="mbar" id="mbar" aria-label="Quick contact"><a data-phone data-keep href="#">Call</a><a data-whatsapp href="#">WhatsApp</a><button class="enq" type="button" data-enquire="general">Enquire</button></nav>
<a class="wa" id="wa" data-whatsapp href="#">${waIcon}<span>Chat on WhatsApp</span></a>`;
  },
  footer() {
    return `<footer class="gfoot" id="foot" data-tone="dark">
  <div class="gfoot-top">
    <div class="gfoot-news">
      <span class="lbl">Updates</span>
      <p>New launches, site progress and the Tricity market, once a month.</p>
      <form class="lf" data-type="newsletter" data-need="email" style="gap:8px">
        <div class="hp" aria-hidden="true"><label>Website <input name="website" tabindex="-1" autocomplete="off"></label></div>
        <div class="gfoot-news-row" style="display:flex;gap:12px;align-items:flex-end;border-bottom:1px solid var(--hair-d15)"><label class="sr" for="nl-email" style="position:absolute;left:-9999px">Email</label><input id="nl-email" name="email" type="email" autocomplete="email" placeholder="Your email" style="flex:1;min-width:0;border:0;background:transparent;color:var(--bone);font:400 18px/1.2 var(--serif);padding:8px 0"><button type="submit" style="background:none;border:0;color:var(--bone);font:600 11px/1 var(--sans);text-transform:uppercase;letter-spacing:.02em;padding:10px 0;cursor:pointer">Subscribe</button></div>
        <p class="err" role="alert" style="color:#f08a7f"></p>
      </form>
    </div>
    <div><span class="lbl">Explore</span><a href="/">Home</a><a href="/aveda-arenium">Aveda Arenium</a><a href="/connect">Connect</a>${JOURNAL ? '<a href="/blog">Journal</a>' : ''}<a href="/contact">Contact us</a></div>
    <div><span class="lbl">Work with us</span><a href="/connect#careers">Careers</a><a href="/connect#partners">Channel partners</a><a href="/connect#land">Land owners &amp; JV</a><a href="/connect#vendors">Vendors &amp; investors</a></div>
    <div><span class="lbl">Corporate office</span><span>World Tech 83, Ground Floor, Plot I-9, IT City Road, Sector 83, Mohali, Punjab 140306</span><a data-phone href="#"></a><a data-email href="#"></a>
      <span style="display:flex;gap:16px;margin-top:8px" data-hide-empty><a data-social="instagram" href="#">Instagram</a><a data-social="facebook" href="#">Facebook</a><a data-social="youtube" href="#">YouTube</a><a data-social="linkedin" href="#">LinkedIn</a></span></div>
  </div>
  <div class="gfoot-big" aria-hidden="true">DKG <em>Landcorp</em></div>
  <div class="gfoot-bot"><span>© 2026 DKG Landcorp, a DMR Builders company · Developing With Purpose</span><nav><a href="/privacy">Privacy</a><span data-rera="aveda">RERA <span data-rera-no></span></span></nav></div>
</footer>`;
  },
  scripts(extra = '') {
    return `<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.20/dist/lenis.min.js"></script>
<script src="/assets/site.js?v=${V}"></script>
${extra}`;
  }
};

// ---- page assembly: markers in _src/pages/*.html ----
// <!--@head {"title":"…","desc":"…","path":"/"}-->  <!--@nav home-->  <!--@nav aveda aveda-->  <!--@chrome home-->  <!--@footer-->  <!--@scripts-->
function fill(src) {
  return src
    .replace(/<!--@journal-->[\s\S]*?<!--@\/journal-->\n*/g, (m) => (JOURNAL ? m.replace(/<!--@\/?journal-->\n?/g, '') : ''))
    .replace(/<!--@head (\{.*?\})-->/s, (_, j) => parts.head(JSON.parse(j)))
    .replace(/<!--@nav ?(\w*) ?(\w*)-->/, (_, c, b) => parts.nav(c, b || 'dkg'))
    .replace(/<!--@chrome ?(\w*)-->/, (_, c) => parts.chrome(c))
    .replace(/<!--@footer-->/, parts.footer())
    .replace(/<!--@scripts-->/, parts.scripts())
    .replace(/\{\{arrow\}\}/g, arrow);
}
const OUT = { 'home.html': 'index.html', 'aveda-arenium.html': 'aveda-arenium/index.html', 'connect.html': 'connect/index.html', 'contact.html': 'contact/index.html', 'privacy.html': 'privacy/index.html', '404.html': '404.html' };
for (const f of readdirSync(join(SRC, 'pages'))) {
  if (!OUT[f]) continue;
  const html = fill(readFileSync(join(SRC, 'pages', f), 'utf8'));
  const dest = join(ROOT, OUT[f]); mkdirSync(dirname(dest), { recursive: true }); writeFileSync(dest, html);
  console.log('built', OUT[f], (html.length / 1024).toFixed(1) + ' KB');
}
// chrome for server-rendered blog pages
const chrome = `// Generated by _src/build.mjs — do not edit by hand.\nmodule.exports = ${JSON.stringify({ head: null, navBlog: parts.nav('blog'), chromeBlog: parts.chrome('blog'), footer: parts.footer(), scripts: parts.scripts(), arrow })};\nmodule.exports.head = ${parts.head.toString().replace(/^head/, 'function')};\nmodule.exports.SITE = ${JSON.stringify(SITE)}; module.exports.V = ${JSON.stringify(V)};\n`;
writeFileSync(join(ROOT, 'api', '_chrome.js'), chrome.replace(/\$\{SITE\}/g, '${module.exports.SITE}').replace(/\$\{V\}/g, '${module.exports.V}'));
console.log('built api/_chrome.js');
