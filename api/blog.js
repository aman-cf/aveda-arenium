// /blog and /blog/:slug are rewritten here (see vercel.json). Pages are rendered on the server, so search
// engines see full articles. Content comes from Sanity when SANITY_PROJECT_ID is set; otherwise the
// starter posts in _posts.js are used. ?format=json returns the post list for the home page.
const UI = require('./_chrome.js');
const STARTER = require('./_posts.js');

const E = process.env;
const PID = E.SANITY_PROJECT_ID, DS = E.SANITY_DATASET || 'production';
const CATS = ['Project updates', 'Location & market', 'Home-buying guides', 'Company news'];

function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function slugify(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function fmtDate(d) { try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return ''; } }
function img(u, w) { return u && u.indexOf('cdn.sanity.io') > -1 ? u + (u.includes('?') ? '&' : '?') + 'w=' + w + '&auto=format&q=75' : u; }

async function getPosts() {
  if (!PID) return STARTER;
  const q = `*[_type=="post" && defined(slug.current) && !(_id in path("drafts.**"))] | order(publishedAt desc){
    title, "slug": slug.current, excerpt, publishedAt, readMins, cta, "category": category->title,
    "image": mainImage.asset->url, "imageAlt": mainImage.alt,
    body[]{..., _type == "image" => {..., "url": asset->url}}
  }`;
  try {
    const r = await fetch(`https://${PID}.apicdn.sanity.io/v2023-10-01/data/query/${DS}?query=${encodeURIComponent(q)}`);
    if (!r.ok) throw new Error('sanity ' + r.status);
    const j = await r.json(); const list = (j.result || []).map((p) => Object.assign({ readMins: Math.max(2, Math.round(wordCount(p.body) / 220)) }, p, { readMins: p.readMins || Math.max(2, Math.round(wordCount(p.body) / 220)), category: p.category || 'Journal' }));
    return list.length ? list : STARTER;
  } catch (e) { console.error('blog: falling back to starter posts', String(e)); return STARTER; }
}
function wordCount(body) { return (body || []).reduce((n, b) => n + (b.children || []).reduce((m, c) => m + String(c.text || '').split(/\s+/).length, 0), 0); }

// Portable Text → HTML (paragraphs, headings, quotes, lists, bold/italic/links, images)
function blocks(body) {
  let out = '', list = null;
  const close = () => { if (list) { out += `</${list}>`; list = null; } };
  for (const b of body || []) {
    if (b._type === 'image' && (b.url || b.asset)) { close(); out += `<figure class="pimg"><img src="${esc(img(b.url, 1400))}" alt="${esc(b.alt || '')}" loading="lazy" decoding="async">${b.caption ? `<figcaption class="cap muted">${esc(b.caption)}</figcaption>` : ''}</figure>`; continue; }
    if (b._type !== 'block') continue;
    const defs = {}; (b.markDefs || []).forEach((d) => { defs[d._key] = d; });
    const html = (b.children || []).map((c) => {
      let t = esc(c.text || '').replace(/\n/g, '<br>');
      (c.marks || []).forEach((m) => {
        if (m === 'strong') t = `<strong>${t}</strong>`; else if (m === 'em') t = `<em>${t}</em>`;
        else if (defs[m] && defs[m]._type === 'link') { const h = String(defs[m].href || ''); const ext = /^https?:/.test(h) && !h.includes('dkglandcorp'); t = `<a href="${esc(h)}"${ext ? ' target="_blank" rel="noopener"' : ''}>${t}</a>`; }
      });
      return t;
    }).join('');
    if (b.listItem) { const tag = b.listItem === 'number' ? 'ol' : 'ul'; if (list !== tag) { close(); out += `<${tag}>`; list = tag; } out += `<li>${html}</li>`; continue; }
    close();
    const st = b.style || 'normal';
    if (st === 'h2' || st === 'h3') out += `<${st} id="${slugify(b.children.map((c) => c.text).join(''))}">${html}</${st}>`;
    else if (st === 'blockquote') out += `<blockquote>${html}</blockquote>`;
    else out += `<p>${html}</p>`;
  }
  close(); return out;
}

const CSS = `<style>
.bl-hero { padding-top: clamp(120px, 18vh, 200px); }
.bl-cats { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 40px; border-top: 1px solid var(--hair-l15); padding-top: 16px; }
.bl-cats a { text-decoration: none; color: var(--clay-deep); display: inline-flex; gap: 8px; align-items: center; }
.bl-cats a .dot { opacity: 0; } .bl-cats a.on { color: var(--espresso); } .bl-cats a.on .dot { opacity: 1; }
.bl-feat { display: grid; grid-template-columns: 7fr 5fr; gap: 16px 48px; align-items: end; margin-top: clamp(48px, 6vw, 88px); text-decoration: none; }
.bl-feat .im, .bl-card .im { position: relative; overflow: hidden; background: var(--stone); }
.bl-feat .im { aspect-ratio: 16/10; } .bl-card .im { aspect-ratio: 4/3; }
.bl-feat img, .bl-card img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 1.2s var(--ease); }
.bl-feat:hover img, .bl-card:hover img { transform: scale(1.04); }
.bl-feat h2 { font: 400 clamp(34px, 3.6vw, 52px)/.96 var(--serif); letter-spacing: -.03em; margin: 0; }
.bl-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 48px 16px; margin-top: clamp(64px, 8vw, 112px); }
.bl-card { display: grid; gap: 14px; text-decoration: none; align-content: start; }
.bl-card h3 { font: 400 26px/1.04 var(--serif); letter-spacing: -.025em; margin: 0; }
.bl-empty { margin-top: 64px; }
.art-hero { padding-top: clamp(120px, 18vh, 200px); }
.art-hero h1 { font: 400 clamp(40px, 5vw, 76px)/.94 var(--serif); letter-spacing: -.035em; margin: 0; max-width: 18ch; text-wrap: balance; }
.art-cover { position: relative; overflow: hidden; aspect-ratio: 21/9; margin: clamp(40px, 6vw, 80px) 0 0; background: var(--stone); }
.art-cover img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.art { display: grid; grid-template-columns: 1fr minmax(0, 680px) 1fr; padding-block: clamp(56px, 7vw, 104px); }
.art-body { grid-column: 2; font: 400 18px/1.62 var(--sans); letter-spacing: -.005em; color: #2b2422; }
.art-body p { margin: 0 0 1.1em; }
.art-body h2 { font: 400 clamp(28px, 2.6vw, 36px)/1.05 var(--serif); letter-spacing: -.025em; color: var(--espresso); margin: 1.8em 0 .6em; }
.art-body h3 { font: 400 24px/1.1 var(--serif); margin: 1.4em 0 .5em; color: var(--espresso); }
.art-body ul, .art-body ol { margin: 0 0 1.2em; padding-left: 1.1em; } .art-body li { margin-bottom: .5em; }
.art-body blockquote { margin: 1.6em 0; padding-left: 20px; border-left: 2px solid var(--coral); font: 400 26px/1.2 var(--serif); color: var(--espresso); }
.art-body a { color: var(--espresso); text-decoration-color: var(--coral); text-underline-offset: 3px; }
.art-body .pimg { margin: 2em 0; } .art-body .pimg img { width: 100%; }
.art-cta { grid-column: 1 / -1; margin-top: 48px; background: var(--stone); padding: clamp(32px, 5vw, 64px) var(--gutr) clamp(32px, 5vw, 64px) var(--gut); display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: end; }
.art-cta h2 { font: 400 clamp(32px, 3.4vw, 48px)/.96 var(--serif); letter-spacing: -.03em; margin: 0; }
.art-share { display: flex; gap: 20px; margin-top: 32px; grid-column: 2; }
.art-share a { text-decoration: none; }
@media (max-width: 820px) { .bl-feat, .bl-grid, .art-cta { grid-template-columns: 1fr; } .art { grid-template-columns: 1fr; padding-left: var(--gut); padding-right: var(--gutr); } .art-body, .art-share { grid-column: 1; } .art-body { font-size: 17px; } .art-cover { aspect-ratio: 4/3; } }
</style>`;

function page({ title, desc, path, image, body, jsonld }) {
  return `${UI.head({ title, desc, path, image: image && image.startsWith('/') ? image : undefined, extra: CSS + (jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>` : '') })}
<body class="dkg" data-wa-msg="Hello DKG Landcorp, I read your journal and would like to know more.">
${UI.navBlog}
<main>${body}</main>
${UI.footer}
${UI.chromeBlog}
${UI.scripts}
</body>
</html>`;
}
const card = (p) => `<a class="bl-card up" href="/blog/${esc(p.slug)}"><div class="im"><img src="${esc(img(p.image, 900))}" alt="${esc(p.imageAlt || '')}" loading="lazy" decoding="async"></div><span class="lbl muted">${esc(p.category)} · ${esc(p.readMins)} min read</span><h3>${esc(p.title)}</h3><p class="body muted">${esc(p.excerpt)}</p></a>`;

function ctaFor(p) {
  if (p.cta === 'careers') return { t: 'Build your <em>career</em> at DKG.', b: 'We hire across sales, site engineering, design and marketing.', l: `<a class="tl" href="/connect#careers">See careers${UI.arrow}</a>` };
  if (p.cta === 'partner') return { t: 'Partner with <em>DKG</em>.', b: 'Channel partners, land owners and vendors: start a conversation.', l: `<a class="tl" href="/connect">Connect${UI.arrow}</a>` };
  if (p.cta === 'general') return { t: 'Talk to <em>DKG</em>.', b: 'Questions about our projects or how we build? Our team will call you back.', l: `<button class="tl" type="button" data-enquire="callback">Request a call back<span class="dot"></span></button><a class="tl" href="/aveda-arenium">Aveda Arenium${UI.arrow}</a>` };
  return { t: 'Considering a home at Aveda <em>Arenium</em>?', b: 'Get the brochure and floor plans, or see the site with a relationship manager.', l: `<button class="tl" type="button" data-enquire="brochure" data-project="Aveda Arenium">Get the brochure<span class="dot"></span></button><button class="tl" type="button" data-enquire="visit" data-project="Aveda Arenium">Book a site visit<span class="dot"></span></button>` };
}

module.exports = async function handler(req, res) {
  const url = new URL(req.url, 'http://x'), slug = (req.query && req.query.slug) || url.searchParams.get('slug'), fmt = url.searchParams.get('format');
  const posts = await getPosts();
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');

  if (fmt === 'json') {
    const n = Math.min(12, +(url.searchParams.get('limit') || 6));
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).send(JSON.stringify({ posts: posts.slice(0, n).map((p) => ({ slug: p.slug, title: p.title, excerpt: p.excerpt, category: p.category, readMins: p.readMins, publishedAt: p.publishedAt, image: img(p.image, 900), imageAlt: p.imageAlt })) }));
    return;
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  if (slug) {
    const p = posts.find((x) => x.slug === slug);
    if (!p) { res.status(404).send(page({ title: 'Article not found | DKG Landcorp', desc: 'This article is not available.', path: '/blog', body: `<section class="wrap bl-hero"><span class="lbl muted">Journal</span><h1 class="dxxl" style="margin-top:16px">This article has moved <em>on</em>.</h1><p style="margin-top:32px"><a class="tl" href="/blog">All articles${UI.arrow}</a></p></section><div style="height:120px"></div>` })); return; }
    const more = posts.filter((x) => x.slug !== slug).slice(0, 3), c = ctaFor(p), abs = (u) => (u && u.startsWith('/') ? UI.SITE + u : u);
    const body = `<article>
<header class="wrap art-hero"><div class="split"><a class="lbl muted" href="/blog" style="text-decoration:none">← Journal · ${esc(p.category)}</a><div class="rc stack" style="gap:20px"><h1>${esc(p.title)}</h1><p class="body muted">${esc(p.excerpt)}</p><span class="lbl muted">${esc(fmtDate(p.publishedAt))} · ${esc(p.readMins)} min read</span></div></div>
<figure class="art-cover"><img src="${esc(img(p.image, 2000))}" alt="${esc(p.imageAlt || '')}" fetchpriority="high"></figure></header>
<div class="art"><div class="art-body">${blocks(p.body)}</div>
<div class="art-share lbl"><span class="muted">Share</span><a href="https://wa.me/?text=${encodeURIComponent(p.title + ' ' + UI.SITE + '/blog/' + p.slug)}" target="_blank" rel="noopener">WhatsApp</a><a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(UI.SITE + '/blog/' + p.slug)}" target="_blank" rel="noopener">LinkedIn</a><a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(UI.SITE + '/blog/' + p.slug)}&text=${encodeURIComponent(p.title)}" target="_blank" rel="noopener">X</a></div>
<aside class="art-cta"><div class="stack"><span class="lbl muted">Next step</span><h2>${c.t}</h2></div><div class="stack"><p class="body">${c.b}</p><div class="links">${c.l}</div></div></aside></div>
</article>
${more.length ? `<section class="wrap" style="padding-bottom:clamp(96px,12vw,160px)"><div style="display:flex;justify-content:space-between;align-items:end;gap:24px;flex-wrap:wrap"><h2 class="dxl">Keep <em>reading</em>.</h2><a class="tl" href="/blog">All articles${UI.arrow}</a></div><div class="bl-grid" style="margin-top:48px">${more.map(card).join('')}</div></section>` : ''}`;
    res.status(200).send(page({ title: `${p.title} | DKG Landcorp`, desc: p.excerpt, path: '/blog/' + p.slug, image: p.image, body,
      jsonld: { '@context': 'https://schema.org', '@type': 'Article', headline: p.title, description: p.excerpt, image: abs(img(p.image, 1600)), datePublished: p.publishedAt, author: { '@type': 'Organization', name: 'DKG Landcorp' }, publisher: { '@type': 'Organization', name: 'DKG Landcorp' }, mainEntityOfPage: UI.SITE + '/blog/' + p.slug } }));
    return;
  }

  const cat = url.searchParams.get('category');
  const list = cat ? posts.filter((p) => slugify(p.category) === cat) : posts;
  const cats = Array.from(new Set(CATS.concat(posts.map((p) => p.category))));
  const [first, ...rest] = list;
  const body = `<section class="wrap bl-hero">
  <div class="split"><span class="lbl muted">Journal</span><div class="rc stack"><h1 class="dxxl">The <em>journal</em>.</h1><p class="body">Project updates, guides for home buyers, and notes on the Tricity's fastest-changing corridor.</p></div></div>
  <nav class="bl-cats lbl" aria-label="Categories"><a href="/blog" class="${cat ? '' : 'on'}"><span class="dot"></span>All</a>${cats.map((c) => `<a href="/blog?category=${slugify(c)}" class="${cat === slugify(c) ? 'on' : ''}"><span class="dot"></span>${esc(c)}</a>`).join('')}</nav>
  ${first ? `<a class="bl-feat" href="/blog/${esc(first.slug)}"><div class="im"><img src="${esc(img(first.image, 1600))}" alt="${esc(first.imageAlt || '')}" fetchpriority="high"></div><div class="stack" style="gap:16px"><span class="lbl muted">${esc(first.category)} · ${esc(fmtDate(first.publishedAt))}</span><h2>${esc(first.title)}</h2><p class="body muted">${esc(first.excerpt)}</p><span class="tl">Read article${UI.arrow}</span></div></a>` : `<p class="bl-empty body muted">No articles in this category yet. <a href="/blog">See all articles</a>.</p>`}
  ${rest.length ? `<div class="bl-grid">${rest.map(card).join('')}</div>` : ''}
</section>
<section class="wrap" style="padding-block:clamp(96px,12vw,160px)"><div class="split" style="align-items:end"><div class="stack"><span class="lbl muted">Stay informed</span><h2 class="dxl">New launches and site progress, <em>monthly</em>.</h2></div><div class="rc"><form class="lf" data-type="newsletter" data-need="email" style="max-width:440px"><div class="hp" aria-hidden="true"><label>Website <input name="website" tabindex="-1" autocomplete="off"></label></div><div class="f"><label for="bl-email">Email</label><input id="bl-email" name="email" type="email" autocomplete="email" placeholder="you@example.com"></div><p class="err" role="alert"></p><button class="tl wide" type="submit">Subscribe${UI.arrow}</button></form><div class="lf-done" hidden><h3 data-thx>You're subscribed.</h3><p class="body muted">The next issue arrives early next month.</p></div></div></div></section>`;
  res.status(200).send(page({ title: cat ? `${cats.find((c) => slugify(c) === cat) || 'Journal'} | DKG Landcorp Journal` : 'Journal | DKG Landcorp', desc: 'Project updates, home-buying guides and notes on Mohali\'s airport corridor from DKG Landcorp.', path: '/blog', body }));
};
