# DKG Landcorp website

Multi-page site for DKG Landcorp, with Aveda Arenium as its flagship project. Hosted on Vercel; every push to `main` deploys.

## Pages
- `/` — DKG Landcorp home
- `/aveda-arenium` — the Aveda Arenium scroll story
- `/connect` — careers, channel partners, land owners / JV, vendors, investors
- `/contact` — contact, site visit and call-back
- `/blog` — the Journal (Sanity CMS, rendered by `api/blog.js`)
- `/privacy`

## Editing
Page sources live in `_src/pages/`; the shared nav, footer, enquiry drawer and head are in `_src/build.mjs`.
After editing, run `node _src/build.mjs` and commit the generated files.
Preview locally with `node _src/dev.mjs` (http://localhost:3000; captured leads at `/__leads`).

- `assets/config.js` — phone, WhatsApp, email, socials, RERA (empty values stay hidden)
- `assets/site.css`, `assets/site.js` — shared styles, forms, drawer, lead tracking
- `api/lead.js` — receives every form and forwards it (see `docs/LEADS.md`)
- `studio/` — Sanity editing studio for the Journal
- `f/`, `img/` — Aveda film frames and images; `assets/img/` — DKG images

Setup of lead destinations and the CMS: **docs/LEADS.md**.
