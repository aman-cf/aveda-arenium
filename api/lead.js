// POST /api/lead — receives every form on the site and forwards the lead to whichever
// destinations are switched on in Vercel → Project → Settings → Environment Variables.
// Nothing is hard-wired: add a variable, redeploy, and that destination starts receiving leads.
//
//   LEADS_SHEET_WEBHOOK   Google Sheet: the web-app URL of the Apps Script in /docs/LEADS.md
//   RESEND_API_KEY        Email alerts via resend.com, with
//   LEADS_EMAIL_TO          comma-separated recipients, e.g. sales@dkglandcorp.com
//   LEADS_EMAIL_FROM        verified sender, e.g. "DKG Website <leads@dkglandcorp.com>"
//   LEADS_CRM_WEBHOOK     Any CRM that accepts a JSON webhook (optional LEADS_CRM_TOKEN sent as Bearer)
//   WHATSAPP_WEBHOOK      WhatsApp provider endpoint (Interakt, AiSensy, Gupshup…; optional WHATSAPP_TOKEN)
//
// Until at least one is set, leads are written to the Vercel runtime log (Project → Logs) so none are lost
// silently during setup — but logs are short-lived, so connect a destination before running ads.

const TYPES = ['general', 'brochure', 'price-list', 'floor-plans', 'site-visit', 'callback', 'future-launch', 'home-enquiry',
  'aveda-enquiry', 'contact', 'careers', 'channel-partner', 'land-jv', 'vendor', 'investor', 'newsletter'];
const LABEL = { 'general': 'General enquiry', 'brochure': 'Brochure request', 'price-list': 'Price list request', 'floor-plans': 'Floor plans request',
  'site-visit': 'Site visit booking', 'callback': 'Call-back request', 'future-launch': 'Future launch interest', 'home-enquiry': 'Home page enquiry',
  'aveda-enquiry': 'Aveda Arenium enquiry', 'contact': 'Contact form', 'careers': 'Job application', 'channel-partner': 'Channel partner registration',
  'land-jv': 'Land / JV proposal', 'vendor': 'Vendor empanelment', 'investor': 'Investor enquiry', 'newsletter': 'Newsletter sign-up' };

function clean(v, max = 500) { return typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max) : v; }
function host(u) { try { return new URL(u).hostname; } catch (e) { return String(u).slice(0, 80); } }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

function normalise(b) {
  const flat = {};
  for (const [k, v] of Object.entries(b || {})) {
    if (['first_touch', 'last_touch'].includes(k)) continue;
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') flat[k.slice(0, 40)] = clean(String(v), k === 'message' ? 3000 : 500);
  }
  const ft = b.first_touch || {}, lt = b.last_touch || {};
  const src = Object.keys(lt).length ? lt : ft;
  return {
    id: 'L' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    received_at: new Date().toISOString(),
    type: TYPES.includes(flat.type) ? flat.type : 'general',
    type_label: LABEL[flat.type] || 'Enquiry',
    name: flat.name || '', phone: flat.phone || '', email: flat.email || '',
    project: flat.project || (String(flat.interest || '').includes('Aveda') ? 'Aveda Arenium' : ''),
    page: flat.page || '',
    source: src.utm_source || (src.referrer ? host(src.referrer) : (ft.direct ? 'direct' : '')),
    medium: src.utm_medium || '', campaign: src.utm_campaign || '', term: src.utm_term || '', content: src.utm_content || '',
    gclid: src.gclid || '', fbclid: src.fbclid || '', referrer: src.referrer || '', landing_page: ft.landing || '',
    fields: flat
  };
}

async function post(url, data, token) {
  const r = await fetch(url, { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { Authorization: 'Bearer ' + token } : {}), body: JSON.stringify(data) });
  if (!r.ok) throw new Error(url.split('/')[2] + ' ' + r.status);
  return true;
}

function emailHtml(L) {
  const rows = Object.entries(L.fields).filter(([k]) => !['type', 'page', 'page_title', 'submitted_at', 'tz', 'consent'].includes(k))
    .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#6f6763;font:600 11px Arial;text-transform:uppercase">${esc(k.replace(/_/g, ' '))}</td><td style="padding:6px 0;font:15px Georgia">${esc(v)}</td></tr>`).join('');
  return `<div style="font-family:Georgia,serif;color:#161211"><p style="font:600 11px Arial;text-transform:uppercase;color:#dd4d4d">${esc(L.type_label)}</p><h2 style="font-weight:400;margin:0 0 12px">${esc(L.name)} · ${esc(L.phone)}</h2><table>${rows}</table><p style="font:12px Arial;color:#6f6763;margin-top:16px">Page ${esc(L.page)} · Source ${esc(L.source || 'unknown')} ${L.campaign ? '· Campaign ' + esc(L.campaign) : ''} · ${esc(L.received_at)}</p></div>`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'Use POST' }); return; }
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};
  if (body.website) { res.status(200).json({ ok: true }); return; }                      // honeypot: quietly accept bots

  const L = normalise(body);
  const digits = L.phone.replace(/\D/g, '');
  if (L.type === 'newsletter') { if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(L.email)) { res.status(400).json({ ok: false, error: 'Enter a valid email address.' }); return; } }
  else if (!L.name || digits.length < 10) { res.status(400).json({ ok: false, error: 'Name and a 10-digit mobile number are required.' }); return; }

  const E = process.env, jobs = [];
  if (E.LEADS_SHEET_WEBHOOK) jobs.push(['sheet', post(E.LEADS_SHEET_WEBHOOK, Object.assign({}, L, { fields: JSON.stringify(L.fields) }))]);
  if (E.LEADS_CRM_WEBHOOK) jobs.push(['crm', post(E.LEADS_CRM_WEBHOOK, L, E.LEADS_CRM_TOKEN)]);
  if (E.WHATSAPP_WEBHOOK) jobs.push(['whatsapp', post(E.WHATSAPP_WEBHOOK, { lead: L, text: `New ${L.type_label}: ${L.name}, ${L.phone}${L.project ? ' · ' + L.project : ''} · ${L.source || 'direct'}` }, E.WHATSAPP_TOKEN)]);
  if (E.RESEND_API_KEY && E.LEADS_EMAIL_TO) jobs.push(['email', fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + E.RESEND_API_KEY },
    body: JSON.stringify({ from: E.LEADS_EMAIL_FROM || 'DKG Website <onboarding@resend.dev>', to: E.LEADS_EMAIL_TO.split(',').map((s) => s.trim()), reply_to: L.email || undefined, subject: `${L.type_label}: ${L.name} (${L.phone})`, html: emailHtml(L) })
  }).then((r) => { if (!r.ok) throw new Error('resend ' + r.status); return true; })]);

  if (!jobs.length) { console.log('LEAD (no destination configured yet)', JSON.stringify(L)); res.status(200).json({ ok: true, id: L.id, stored: false }); return; }

  const results = await Promise.allSettled(jobs.map((j) => j[1]));
  const delivered = results.filter((r) => r.status === 'fulfilled').length;
  results.forEach((r, i) => { if (r.status === 'rejected') console.error('lead destination failed', jobs[i][0], String(r.reason), L.id); });
  if (!delivered) { console.log('LEAD (all destinations failed)', JSON.stringify(L)); res.status(502).json({ ok: false, error: 'We could not send your details. Please try again in a minute.' }); return; }
  res.status(200).json({ ok: true, id: L.id });
};
