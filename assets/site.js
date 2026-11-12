/* DKG Landcorp — shared behaviour for every page:
   navigation and menu, the enquiry drawer, lead forms (with source tracking), contact buttons,
   smooth scrolling and light reveal animations. Page-specific motion lives in each page. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var C = window.DKG_CONFIG || {}, body = document.body;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ownScroll = body.hasAttribute('data-own-scroll');           // the Aveda page runs its own scroll engine
  function store(k, v, s) { try { (s ? sessionStorage : localStorage).setItem(k, JSON.stringify(v)); } catch (e) {} }
  function load(k, s) { try { return JSON.parse((s ? sessionStorage : localStorage).getItem(k) || 'null'); } catch (e) { return null; } }

  /* ---------- where the visitor came from (first and latest touch) ---------- */
  (function () {
    var q = new URLSearchParams(location.search), t = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'].forEach(function (k) { if (q.get(k)) t[k] = q.get(k); });
    var ref = document.referrer && document.referrer.indexOf(location.host) < 0 ? document.referrer : '';
    if (Object.keys(t).length || ref) { t.referrer = ref; t.landing = location.pathname; t.at = new Date().toISOString(); store('dkg_last', t, true); if (!load('dkg_first')) store('dkg_first', t); }
    if (!load('dkg_first')) store('dkg_first', { referrer: '', landing: location.pathname, at: new Date().toISOString(), direct: true });
  })();

  /* ---------- contact details from config ---------- */
  var waMsg = body.getAttribute('data-wa-msg') || 'Hello DKG Landcorp, I would like to know more.';
  function waLink(msg) { return C.whatsapp ? 'https://wa.me/' + C.whatsapp.replace(/\D/g, '') + '?text=' + encodeURIComponent(msg || waMsg) : ''; }
  $$('[data-phone]').forEach(function (el) { if (!C.phone) { el.hidden = true; return; } if (el.tagName === 'A') el.href = 'tel:' + C.phone.replace(/[^\d+]/g, ''); if (!el.hasAttribute('data-keep')) el.textContent = C.phone; });
  $$('[data-email]').forEach(function (el) { if (!C.email) { el.hidden = true; return; } if (el.tagName === 'A') el.href = 'mailto:' + C.email; if (!el.hasAttribute('data-keep')) el.textContent = C.email; });
  $$('[data-whatsapp]').forEach(function (el) { if (!C.whatsapp) { el.hidden = true; return; } el.href = waLink(el.getAttribute('data-wa-msg')); el.target = '_blank'; el.rel = 'noopener'; });
  $$('[data-hours]').forEach(function (el) { if (!C.hours) el.hidden = true; else el.textContent = C.hours; });
  $$('[data-social]').forEach(function (el) { var u = (C.social || {})[el.getAttribute('data-social')]; if (!u) el.hidden = true; else { el.href = u; el.target = '_blank'; el.rel = 'noopener'; } });
  $$('[data-rera]').forEach(function (el) { var v = (C.rera || {})[el.getAttribute('data-rera')]; if (!v) el.hidden = true; else { var t = el.querySelector('[data-rera-no]'); (t || el).textContent = t ? v : 'RERA ' + v; } });
  $$('[data-hide-empty]').forEach(function (el) { var k = $$('[data-phone],[data-email],[data-whatsapp],[data-hours],[data-social],[data-rera]', el); if (k.length && !k.some(function (x) { return !x.hidden; })) el.hidden = true; });

  /* ---------- menu ---------- */
  var menu = $('#gmenu'), menuBtn = $$('[data-menu]');
  function setMenu(open) {
    if (!menu) return; menu.classList.toggle('open', open); menu.setAttribute('aria-hidden', String(!open));
    menuBtn.forEach(function (b) { b.setAttribute('aria-expanded', String(open)); });
    body.classList.toggle('locked', open); if (window.__lenis) open ? window.__lenis.stop() : window.__lenis.start();
    if (open) { var a = menu.querySelector('nav a'); a && a.focus(); }
  }
  menuBtn.forEach(function (b) { b.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); }); });
  $$('[data-menu-close]').forEach(function (b) { b.addEventListener('click', function () { setMenu(false); }); });
  if (menu) $$('nav a', menu).forEach(function (a, i) { a.style.transitionDelay = (.15 + i * .05) + 's'; });

  /* ---------- enquiry drawer ---------- */
  var drawer = $('#drawer'), dbg = $('#drawer-bg'), lastFocus = null;
  var OFFERS = {
    general: ['Enquire', 'Talk to <em>DKG</em>.', 'Leave your number and our team will call you back, usually the same working day.', 'general'],
    brochure: ['Brochure', 'Get the Aveda Arenium <em>brochure</em>.', 'We will send the brochure to your WhatsApp or email, and a relationship manager will be in touch.', 'brochure'],
    pricelist: ['Price list', 'Request the <em>price list</em>.', 'Current prices and payment plans for each residence type, shared directly with you.', 'price-list'],
    floorplans: ['Floor plans', 'Get the <em>floor plans</em>.', 'Detailed plans for every typology, from 3,080 to 7,000 sq ft.', 'floor-plans'],
    visit: ['Site visit', 'Book a <em>site visit</em>.', 'Choose a day that suits you. We will confirm the time on a call.', 'site-visit'],
    callback: ['Call back', 'Request a <em>call back</em>.', 'Tell us when to call. A relationship manager will ring at that time.', 'callback'],
    future: ['Register interest', 'Be first to hear about our <em>next</em> launch.', 'Register now for early access to future DKG projects, before public launch.', 'future-launch']
  };
  function openDrawer(kind, extra) {
    if (!drawer) return; var o = OFFERS[kind] || OFFERS.general, f = $('form', drawer);
    $('[data-d-eyebrow]', drawer).textContent = o[0]; $('[data-d-title]', drawer).innerHTML = o[1]; $('[data-d-sub]', drawer).textContent = o[2];
    f.elements.type.value = o[3]; f.elements.project.value = (extra && extra.project) || body.getAttribute('data-project') || '';
    $('[data-d-visit]', drawer).hidden = kind !== 'visit';
    f.hidden = false; var done = $('.lf-done', drawer); if (done) done.hidden = true;
    lastFocus = document.activeElement; drawer.classList.add('open'); dbg.classList.add('open'); drawer.setAttribute('aria-hidden', 'false');
    body.classList.add('locked'); if (window.__lenis) window.__lenis.stop();
    setTimeout(function () { var i = f.querySelector('input:not([type=hidden]):not(.hp input)'); i && i.focus(); }, 350);
    push('enquiry_open', { offer: o[3] });
  }
  function closeDrawer() { if (!drawer) return; drawer.classList.remove('open'); dbg.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); body.classList.remove('locked'); if (window.__lenis) window.__lenis.start(); lastFocus && lastFocus.focus && lastFocus.focus(); }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-enquire]'); if (!t) return; e.preventDefault(); setMenu(false); openDrawer(t.getAttribute('data-enquire') || 'general', { project: t.getAttribute('data-project') });
  });
  if (dbg) dbg.addEventListener('click', closeDrawer);
  $$('[data-drawer-close]').forEach(function (b) { b.addEventListener('click', closeDrawer); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeDrawer(); setMenu(false); } });
  var vd = $('[name="visit_date"]'); if (vd) { var d = new Date(); d.setDate(d.getDate() + 1); vd.min = d.toISOString().slice(0, 10); }

  /* ---------- lead forms ---------- */
  function push(ev, data) { try { window.dataLayer = window.dataLayer || []; window.dataLayer.push(Object.assign({ event: ev }, data || {})); if (window.fbq && ev === 'lead_submit') window.fbq('track', 'Lead', data); if (window.gtag && ev === 'lead_submit') window.gtag('event', 'generate_lead', data); } catch (e) {} }
  function validate(f) {
    var need = (f.getAttribute('data-need') || 'name,phone').split(','), el, v;
    for (var i = 0; i < need.length; i++) {
      el = f.elements[need[i]]; if (!el) continue; v = (el.value || '').trim();
      if (need[i] === 'phone' && v.replace(/\D/g, '').length < 10) return [el, 'Enter a mobile number with at least 10 digits.'];
      if (need[i] === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return [el, 'Enter a valid email address.'];
      if (!v) return [el, 'Please fill in ' + ((el.closest('.f') && el.closest('.f').querySelector('label') || {}).textContent || need[i]).toLowerCase() + '.'];
    }
    var em = f.elements.email; if (em && em.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim())) return [em, 'Enter a valid email address.'];
    var ok = f.querySelector('[name="consent"]'); if (ok && !ok.checked) return [ok, 'Tick the box so we can contact you.'];
    return null;
  }
  function payload(f) {
    var d = {}; Array.prototype.forEach.call(f.elements, function (el) {
      if (!el.name || el.type === 'submit' || el.name === 'website') return;
      if (el.type === 'checkbox') d[el.name] = el.checked; else if (el.value.trim()) d[el.name] = el.value.trim();
    });
    d.type = d.type || f.getAttribute('data-type') || 'general';
    d.page = location.pathname; d.page_title = document.title; d.first_touch = load('dkg_first'); d.last_touch = load('dkg_last', true);
    d.submitted_at = new Date().toISOString(); d.tz = (Intl.DateTimeFormat().resolvedOptions() || {}).timeZone;
    return d;
  }
  $$('form.lf').forEach(function (f) {
    f.setAttribute('novalidate', '');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var errEl = f.querySelector('.err'), hp = f.elements.website, btn = f.querySelector('[type=submit]');
      if (hp && hp.value) return;                                                          // bots fill the hidden field
      var bad = validate(f); if (bad) { if (errEl) errEl.textContent = bad[1]; bad[0].focus(); return; }
      if (errEl) errEl.textContent = ''; if (btn) btn.disabled = true;
      var data = payload(f);
      fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || j.ok === false) throw new Error(j.error || 'Failed'); return j; }); })
        .then(function () {
          push('lead_submit', { form_type: data.type, project: data.project || '' });
          var done = f.parentNode.querySelector('.lf-done'), first = (data.name || '').split(' ')[0];
          if (done) { var t = done.querySelector('[data-thx]'); if (t && first) t.textContent = 'Thank you, ' + first + '.'; f.hidden = true; done.hidden = false; }
          else { f.innerHTML = '<p class="ttl">Thank you' + (first ? ', ' + first.replace(/[<>&]/g, '') : '') + '.</p><p class="note">We have your details and will be in touch shortly.</p>'; }
          if (btn) btn.disabled = false;
        })
        .catch(function () {
          if (btn) btn.disabled = false;
          var alt = []; if (C.phone) alt.push('call ' + C.phone); if (C.whatsapp) alt.push('WhatsApp us');
          if (errEl) errEl.textContent = 'We could not send this right now. Please try again' + (alt.length ? ', or ' + alt.join(' or ') : '') + '.';
        });
    });
  });

  /* ---------- action bar + WhatsApp button ---------- */
  var mbar = $('#mbar'), wa = $('#wa');
  if (mbar && !$$('a:not([hidden]), button', mbar).length) mbar.remove();
  if (mbar) body.classList.add('has-mbar');
  if (wa && !C.whatsapp) wa.remove();
  function bars() { var y = window.scrollY || 0, show = y > window.innerHeight * .6; if (mbar) mbar.classList.toggle('show', show); if (wa) wa.classList.toggle('show', show); }
  addEventListener('scroll', bars, { passive: true }); bars();

  /* ---------- light reveals for DKG pages ---------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -12% 0px' });
    $$('.up').forEach(function (el) { io.observe(el); });
  } else $$('.up').forEach(function (el) { el.classList.add('in'); });

  /* ---------- nav tone (all pages) ---------- */
  var nav = $('#nav'), darks = $$('[data-tone="dark"]'), film = ownScroll ? $('.film') : null, lastK = '';
  function tone() {
    if (!nav) return; var y = 30, dark = false, sy = window.scrollY || 0;
    for (var i = 0; i < darks.length; i++) { var r = darks[i].getBoundingClientRect(); if (r.top <= y && r.bottom > y) { dark = true; break; } }
    // on the Aveda page the nav stays clear over the film, and turns solid once the story sections begin
    var solid = film ? film.getBoundingClientRect().bottom <= 60 : sy > 40, k = (dark ? 'd' : 'l') + (solid ? 's' : '');
    if (k !== lastK) { lastK = k; nav.classList.toggle('dark', dark && solid || dark && !film); nav.classList.toggle('solid', solid); }
  }
  addEventListener('scroll', tone, { passive: true }); addEventListener('resize', tone); tone();

  /* ---------- smooth scroll (DKG pages; Aveda runs its own) ---------- */
  if (!ownScroll) {
    var lenis = null;
    if (!reduce && window.Lenis) { lenis = new Lenis({ lerp: .09, smoothWheel: true, wheelMultiplier: .9 }); window.__lenis = lenis; (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now()); }
    $$('a[href^="#"]').forEach(function (a) { a.addEventListener('click', function (e) { var id = a.getAttribute('href'); if (id.length < 2) return; var el = $(id); if (!el) return; e.preventDefault(); var y = el.getBoundingClientRect().top + window.scrollY - 64; if (lenis) lenis.scrollTo(y, { duration: 1.2 }); else window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' }); history.replaceState(null, '', id); }); });
  }

  window.DKG = { openDrawer: openDrawer, closeDrawer: closeDrawer, waLink: waLink };
})();
