/* Maison d'Mist — release checks.
   Serves the site from this repository on a free local port, then drives
   both pages in Chromium: layout, direction, the mobile menu, ordering with
   contact details filled in, file:// preview, JavaScript off, reduced motion.

   Run from the repository root:   node tools/check-site.cjs
   Needs Node 18+ and Playwright (npm i -g playwright && npx playwright install chromium).
   Screenshots go to tools/shots/ (ignored by git). Exit code 0 = all passed. */

const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(__dirname, 'shots');
// Expected counts come from the product file itself, so adding a product
// never needs a test edit.
const DATA = (() => { const window = {}; new Function('window', fs.readFileSync(path.join(ROOT, 'data', 'products.js'), 'utf8'))(window); return window; })();
const PRODUCTS = DATA.MDM_PRODUCTS, CATEGORIES = DATA.MDM_CATEGORIES || [];
const SHOWN = PRODUCTS.filter(p => p.status !== 'hidden').length;
const FILMS = PRODUCTS.filter(p => p.status !== 'hidden' && p.video).length;
const SITE = (() => { const window = {}; new Function('window', fs.readFileSync(path.join(ROOT, 'data', 'site.js'), 'utf8'))(window); return window.MDM_SITE; })();
const AVAILABLE = PRODUCTS.filter(p => p.status === 'available').length;
const ANIMATED = PRODUCTS.filter(p => p.status !== 'hidden' && !p.video && p.image && p.animation).length;
fs.mkdirSync(OUT, { recursive: true });
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript',
  '.webp': 'image/webp', '.png': 'image/png', '.ico': 'image/x-icon', '.xml': 'application/xml',
  '.txt': 'text/plain', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml' };
let swRevision = 0, productsChanged = false;
const server = http.createServer((req, res) => {
  if (req.url.startsWith('/test-partial.webm')) {
    res.writeHead(206, { 'Content-Type': 'video/webm', 'Content-Range': 'bytes 0-99/1000' });
    return res.end('partial');
  }
  if ((req.url.includes('missing=1') || String(req.headers.referer || '').includes('missing=1')) && /\.(webm|mp4)$/.test(req.url)) {
    res.writeHead(404);
    return res.end();
  }
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.join(ROOT, path.normalize(rel));
  if (!file.startsWith(ROOT) || !fs.existsSync(file)) { res.writeHead(404); return res.end(); }
  if (productsChanged && file.endsWith(path.join('data', 'products.js'))) {
    // Simulates a release that renamed a product, to prove returning visitors see it at once.
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    return res.end(fs.readFileSync(file, 'utf8').replace(/name: "(Fresh Mist Lotion|Lotion Fresh Mist)"/g, 'name: "$1 (new release)"'));
  }
  if (file.endsWith('sw.js')) {
    // A release changes sw.js; swRevision > 0 makes this server answer like
    // the next release would, with different bytes at the same URL.
    res.writeHead(200, { 'Content-Type': 'application/javascript', 'Cache-Control': 'no-store' });
    return res.end(fs.readFileSync(file, 'utf8') + (swRevision ? `\n// test release ${swRevision}\n` : ''));
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

const { chromium } = require('playwright');
const out = OUT, dir = ROOT;
let BASE;
const FILLED_SITE = `window.MDM_SITE = { whatsapp: "963 912-345-678", phone: "+963 912 345 678",
  email: "hello@maisondmist.com", instagram: "@maisondmist", tiktok: "maisondmist", facebook: "", telegram: "" };`;
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); console.log((cond ? 'PASS ' : 'FAIL ') + msg); };

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  BASE = 'http://127.0.0.1:' + server.address().port;
  const b = await chromium.launch();
  const errors = [];
  const mk = async (w, h) => {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    p.on('pageerror', e => errors.push(e.message));
    return p;
  };

  // 1. Default data, both languages, both widths.
  for (const [name, url, w, h] of [
    ['en-desktop', BASE + '/', 1440, 900], ['ar-desktop', BASE + '/ar/', 1440, 900],
    ['en-mobile', BASE + '/', 390, 844],   ['ar-mobile', BASE + '/ar/', 390, 844]]) {
    const p = await mk(w, h);
    await p.goto(url, { waitUntil: 'networkidle' });
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 300) { window.scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 60)); } window.scrollTo({ top: 0, behavior: 'instant' }); });
    await p.waitForTimeout(900);
    const hiddenAfterScroll = await p.evaluate(() => [...document.querySelectorAll('.reveal')].filter(e => getComputedStyle(e).opacity !== '1').length);
    ok(hiddenAfterScroll === 0, `${name}: every section visible after scrolling (${hiddenAfterScroll} still hidden)`);
    const i = await p.evaluate(() => ({
      h1: document.querySelectorAll('h1').length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      dead: [...document.querySelectorAll('a')].filter(a => !a.getAttribute('href') || a.getAttribute('href') === '#').length,
      dir: getComputedStyle(document.body).direction,
      navVisible: getComputedStyle(document.getElementById('primary-nav')).visibility
    }));
    ok(i.h1 === 1, `${name}: exactly one h1 (${i.h1})`);
    ok(i.overflow === 0, `${name}: no horizontal scroll (${i.overflow}px)`);
    ok(i.dead === 0, `${name}: no empty/dead links (${i.dead})`);
    ok(i.dir === (name.startsWith('ar') ? 'rtl' : 'ltr'), `${name}: direction ${i.dir}`);
    if (w < 860) ok(i.navVisible === 'hidden', `${name}: closed menu is hidden (${i.navVisible})`);
    await p.screenshot({ path: `${out}/${name}.png`, fullPage: true });
    await p.close();
  }

  // 1.5 Every required width, every language: no sideways scroll, no control
  //     cut off at the screen edge, no button label broken onto two lines.
  for (const [lang, url] of [['en', BASE + '/'], ['ar', BASE + '/ar/'], ['fr', BASE + '/fr/']]) {
    for (const w of [320, 375, 390, 414, 768, 1440]) {
      const p = await mk(w, 844);
      await p.goto(url, { waitUntil: 'networkidle' });
      const r = await p.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const shown = el => {
          const cs = getComputedStyle(el), rect = el.getBoundingClientRect();
          return cs.visibility !== 'hidden' && cs.display !== 'none' && rect.width > 0 && rect.height > 0 && !el.closest('[hidden]');
        };
        const label = el => (el.getAttribute('aria-label') || el.textContent || el.className).trim().replace(/\s+/g, ' ').slice(0, 40);
        const clipped = [...document.querySelectorAll('a, button, select, input, summary, [role="button"]')]
          .filter(el => !el.classList.contains('skip') && shown(el))
          .filter(el => { const b = el.getBoundingClientRect(); return b.left < -1 || b.right > vw + 1; })
          .map(label);
        const lines = el => {
          const range = document.createRange(); range.selectNodeContents(el);
          const tops = [...range.getClientRects()].filter(q => q.width > 1).map(q => q.top).sort((a, b) => a - b);
          return tops.reduce((n, t, i) => n + (i && t - tops[i - 1] > 10 ? 1 : 0), tops.length ? 1 : 0);
        };
        const wrapped = [...document.querySelectorAll('.btn, [data-media-play], [data-anim-play], .filter, .language-current, .card__action a')]
          .filter(shown).filter(el => lines(el) > 1).map(label);
        const grid = document.getElementById('collection-grid').getBoundingClientRect();
        const cards = [...document.querySelectorAll('#collection-grid .card')].map(c => c.getBoundingClientRect());
        const offCentre = cards.length ? Math.round(Math.abs((Math.min(...cards.map(c => c.left)) - grid.left) - (grid.right - Math.max(...cards.map(c => c.right))))) : 0;
        const widths = cards.map(c => Math.round(c.width));
        const unequal = widths.length ? Math.max(...widths) - Math.min(...widths) : 0;
        return { overflow: document.documentElement.scrollWidth - vw, clipped, wrapped, offCentre, unequal };
      });
      ok(r.overflow === 0 && !r.clipped.length && !r.wrapped.length && r.offCentre <= 2 && r.unequal <= 1,
        `${lang} @ ${w}px: no sideways scroll, clipped control or two-line label; products centred, all cards one size` +
        (r.overflow || r.clipped.length || r.wrapped.length || r.offCentre > 2 || r.unequal > 1 ? ' ' + JSON.stringify(r) : ''));
      if (w === 320) await p.screenshot({ path: `${out}/${lang}-320.png`, fullPage: true });
      await p.close();
    }
  }

  // 1.55 Category filter and animated products.
  for (const [lang, url, all] of [['en', BASE + '/', 'All'], ['ar', BASE + '/ar/', 'الكل'], ['fr', BASE + '/fr/', 'Tout']]) {
    const p = await mk(1280, 900);
    await p.goto(url, { waitUntil: 'networkidle' });
    const chips = await p.locator('#collection-filters [data-filter]').evaluateAll(bs => bs.map(b => ({ id: b.dataset.filter, text: b.textContent.trim(), pressed: b.getAttribute('aria-pressed') })));
    const labelsOk = chips.length === CATEGORIES.length + 1 && chips[0].text.startsWith(all) && chips[0].pressed === 'true' &&
      CATEGORIES.every((c, n) => chips[n + 1].id === c.id && chips[n + 1].text.startsWith(c[lang]));
    let filterOk = true;
    for (const c of CATEGORIES) {
      await p.locator(`#collection-filters [data-filter="${c.id}"]`).click();
      const shown = await p.locator('#collection-grid .card:not([hidden])').evaluateAll(cs => cs.map(x => x.dataset.category));
      const expected = PRODUCTS.filter(x => x.status !== 'hidden' && x.category === c.id).length;
      if (shown.length !== expected || shown.some(x => x !== c.id)) filterOk = false;
    }
    await p.locator('#collection-filters [data-filter="all"]').press('Enter');
    const back = await p.locator('#collection-grid .card:not([hidden])').count();
    ok(labelsOk && filterOk && back === SHOWN, `${lang}: category filter shows each category's products, keyboard returns to all (${chips.map(c => c.text).join(' · ')})`);

    if (lang === 'en') {
      const stages = p.locator('[data-anim-stage]');
      const n = await stages.count();
      const first = stages.first();
      await first.scrollIntoViewIfNeeded();
      await first.hover();
      const hoverPlays = await first.evaluate(s => s.classList.contains('is-playing'));
      await p.mouse.move(0, 0);
      const leaveStops = !(await first.evaluate(s => s.classList.contains('is-playing')));
      await first.locator('[data-anim-play]').press('Enter');
      const key = await first.evaluate(s => ({ on: s.classList.contains('is-playing'), pressed: s.querySelector('[data-anim-play]').getAttribute('aria-pressed') }));
      const endsByItself = await p.waitForFunction(el => !el.classList.contains('is-playing'), await first.elementHandle(), { timeout: 9000 }).then(() => true, () => false);
      ok(n === ANIMATED, `every product without a film has an animation (${n} of ${ANIMATED})`);
      ok(hoverPlays && leaveStops && key.on && key.pressed === 'true' && endsByItself, 'product animation: hover plays, leaving stops, keyboard plays, ends by itself after one run');
    }
    await p.close();
  }
  {
    const touch = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const t = await touch.newPage();
    await t.goto(BASE + '/', { waitUntil: 'networkidle' });
    const stage = t.locator('[data-anim-stage]').first();
    await stage.scrollIntoViewIfNeeded();
    const state = want => stage.evaluate((s, w) => new Promise(res => {
      const t0 = Date.now(); (function check() { if (s.classList.contains('is-playing') === w || Date.now() - t0 > 2000) res(s.classList.contains('is-playing') === w); else setTimeout(check, 50); })();
    }), want);
    // Tap the frame, not the photo: the photo zooms while playing, and Playwright
    // waits for a moving target to settle, which would outlast the 6.5 s run.
    await stage.tap();
    const on = await state(true);
    await stage.tap();
    const off = await state(false);
    ok(on && off, 'tapping an animated product on a phone plays and stops it');
    await touch.close();
    const calm = await b.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 900 } });
    const r = await calm.newPage();
    await r.goto(BASE + '/', { waitUntil: 'networkidle' });
    const s2 = r.locator('[data-anim-stage]').first();
    await s2.scrollIntoViewIfNeeded(); await s2.hover();
    ok(!(await s2.evaluate(s => s.classList.contains('is-playing'))), 'reduced motion: hovering does not start a product animation');
    await calm.close();
  }

  // 1.6 Footer legibility in every appearance: links, contact icons and the
  //     release number must read against the footer at WCAG AA (4.5:1).
  for (const [mode, scheme, forced] of [['light', 'light', null], ['System dark', 'dark', null], ['Dark Luxury', 'light', 'dark']]) {
    const ctx = await b.newContext({ colorScheme: scheme, viewport: { width: 1280, height: 800 } });
    const p = await ctx.newPage();
    await p.goto(BASE + '/fr/', { waitUntil: 'networkidle' });
    if (forced) await p.evaluate(t => { document.documentElement.dataset.theme = t; }, forced);
    const worst = await p.evaluate(() => {
      const rgb = c => (c.match(/[\d.]+/g) || []).map(Number);
      const lum = ([r, g, b]) => [r, g, b].map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); })
        .reduce((a, v, i) => a + v * [.2126, .7152, .0722][i], 0);
      const footer = document.querySelector('.site-footer');
      const bg = rgb(getComputedStyle(footer).backgroundColor);
      const rows = [...footer.querySelectorAll('.footer__nav a, .socials a, [data-version]')].map(el => {
        let fade = 1; for (let n = el; n && n !== footer.parentElement; n = n.parentElement) fade *= Number(getComputedStyle(n).opacity);
        const fg = rgb(getComputedStyle(el).color).slice(0, 3).map((v, i) => v * fade + bg[i] * (1 - fade));
        const [hi, lo] = [lum(fg), lum(bg)].sort((a, b) => b - a);
        return { what: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 20), ratio: Math.round(((hi + .05) / (lo + .05)) * 10) / 10 };
      });
      return rows.sort((a, b) => a.ratio - b.ratio)[0];
    });
    ok(worst.ratio >= 4.5, `footer legible in ${mode} (lowest contrast ${worst.ratio}:1, "${worst.what}")`);
    if (forced) await p.locator('.site-footer').screenshot({ path: `${out}/footer-dark.png` });
    await ctx.close();
  }

  // 2. Mobile menu open/close.
  for (const url of [BASE + '/', BASE + '/ar/', BASE + '/fr/']) {
    const p = await mk(390, 844);
    await p.goto(url, { waitUntil: 'networkidle' });
    await p.click('.site-header__inner > .nav-toggle');
    await p.waitForTimeout(500);
    const box = await p.locator('#primary-nav').boundingBox();
    ok(box && box.y === 0 && Math.round(box.height) === 844 && Math.round(box.width) === 390, `menu covers the screen when open (${JSON.stringify(box)}) ${url}`);
    if (url.endsWith('/')) await p.screenshot({ path: `${out}/${url.includes('/ar/') ? 'ar' : 'en'}-menu-open.png` });
    await p.keyboard.press('Escape');
    await p.waitForTimeout(500);
    ok(await p.evaluate(() => getComputedStyle(document.getElementById('primary-nav')).visibility) === 'hidden', `Escape closes the menu ${url}`);
    await p.close();
  }

  // 2.5 Real launch products. The phone and Instagram printed on the labels are
  //     placeholders, so the shipped site links to neither; section 3 checks
  //     the contact cards with details filled in.
  {
    const p = await mk(1440, 900);
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    const i = await p.evaluate(() => ({
      names: [...document.querySelectorAll('.card__name')].map(e => e.textContent.trim()),
      ingredients: Object.fromEntries(window.MDM_PRODUCTS.map(product => [product.id, (product.ingredients || []).map(x => x.en.name)])),
      phoneHref: (document.querySelector('#contact-grid a[href^="tel:"]') || {}).href || '',
      instagramHref: (document.querySelector('#contact-grid a[href*="instagram.com"]') || {}).href || '',
      whatsappHref: (document.querySelector('#contact-grid a[href*="wa.me"]') || {}).href || '',
      orderButtons: [...document.querySelectorAll('.card__action a[href*="wa.me"]')].map(a => a.closest('[data-product-id]').dataset.productId),
      pending: !!document.querySelector('#contact-grid .notice')
    }));
    ok(i.names.join('|') === PRODUCTS.filter(x => x.status !== 'hidden').map(x => x.en.name).join('|') && !i.names.some(n => /sample/i.test(n)),
      `real products only, in data order (${i.names.length} of ${SHOWN})`);
    {
      const ids = CATEGORIES.map(c => c.id);
      const orphan = PRODUCTS.filter(x => !ids.includes(x.category)).map(x => x.id);
      const empty = CATEGORIES.filter(c => !PRODUCTS.some(x => x.category === c.id && x.status !== 'hidden')).map(c => c.id);
      const unnamed = CATEGORIES.filter(c => !c.en || !c.ar || !c.fr).map(c => c.id);
      ok(!orphan.length && !empty.length && !unnamed.length && CATEGORIES.length === 4,
        `four categories, named in three languages, each with products; every product in one (${CATEGORIES.map(c => c.id).join(', ')})` +
        (orphan.length || empty.length || unnamed.length ? ' ' + JSON.stringify({ orphan, empty, unnamed }) : ''));
    }
    {
      const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
      const problems = [];
      const ids = new Set();
      for (const prod of PRODUCTS) {
        if (ids.has(prod.id)) problems.push(prod.id + ': duplicate id'); ids.add(prod.id);
        for (const l of ['en', 'ar', 'fr']) if (!prod[l] || !prod[l].name || !prod[l].description) problems.push(`${prod.id}: ${l} text missing`);
        const file = path.join(ROOT, prod.image || '');
        if (!prod.image || !fs.existsSync(file)) { problems.push(prod.id + ': photo missing'); continue; }
        const kb = fs.statSync(file).size / 1024;
        if (kb > 300) problems.push(`${prod.id}: photo ${Math.round(kb)} KB`);
        if (!sw.includes(`'/${prod.image}'`)) problems.push(prod.id + ': photo not kept for offline use (sw.js PRECACHE)');
      }
      ok(!problems.length, `every product: three languages, a photo under 300 KB, available offline (${PRODUCTS.length} products)` + (problems.length ? ' ' + problems.join('; ') : ''));
      const ratios = await p.evaluate(async (srcs) => Promise.all(srcs.map(src => new Promise(res => {
        const im = new Image(); im.onload = () => res([src, im.naturalWidth / im.naturalHeight]); im.onerror = () => res([src, 0]); im.src = '/' + src;
      }))), PRODUCTS.map(prod => prod.image));
      const off = ratios.filter(([, r]) => Math.abs(r - 0.8) > 0.01).map(([src, r]) => `${src} ${r.toFixed(3)}`);
      ok(!off.length, 'every product photo is 4:5 portrait' + (off.length ? ' ' + off.join('; ') : ''));
    }
    ok((i.ingredients.lotion || []).join('|') === 'Rose Water|Shea Butter|Rose Oil|Coconut Oil|Sweet Almond Oil|Glycerin|Panthenol', 'exact lotion ingredients');
    ok((i.ingredients.butter || []).join('|') === 'Beeswax|Coconut Oil|Shea Butter|Cocoa Butter', 'exact butter ingredients');
    const wa = String(SITE.whatsapp || '').replace(/\D/g, ''), ig = String(SITE.instagram || '').replace(/^@/, '');
    ok((wa ? i.whatsappHref.startsWith('https://wa.me/' + wa + '?text=') : !i.whatsappHref) &&
       (ig ? i.instagramHref === 'https://instagram.com/' + ig : !i.instagramHref) &&
       (wa || ig || SITE.phone ? !i.pending : i.pending),
      `contact details match data/site.js (WhatsApp ${wa || 'none'}, Instagram ${ig || 'none'})`);
    ok(wa ? i.orderButtons.length === AVAILABLE && i.orderButtons.every(id => PRODUCTS.find(p => p.id === id).status === 'available') : i.orderButtons.length === 0,
      `WhatsApp order button on each available product only (${i.orderButtons.length} of ${AVAILABLE}; none on coming-soon soaps)`);
    await p.close();
  }

  // 2.75 French document, language links, and refined language selector.
  {
    const p = await mk(1440, 900);
    await p.goto(BASE + '/fr/', { waitUntil: 'networkidle' });
    const i = await p.evaluate(() => ({
      lang: document.documentElement.lang,
      dir: getComputedStyle(document.body).direction,
      canonical: (document.querySelector('link[rel="canonical"]') || {}).href || '',
      alternates: [...document.querySelectorAll('link[rel="alternate"]')].map(e => e.getAttribute('hreflang')).join('|'),
      ogLocale: (document.querySelector('meta[property="og:locale"]') || {}).content || '',
      nav: (document.getElementById('primary-nav') || {}).textContent || ''
    }));
    ok(i.lang === 'fr' && i.dir === 'ltr' && i.canonical === 'https://maisondmist.com/fr/', 'French document metadata');
    ok(i.alternates === 'en|ar|fr|x-default', 'complete language alternates');
    ok(i.ogLocale === 'fr', 'French Open Graph locale');
    ok(i.nav.includes('La collection') && i.nav.includes('Le rituel') && i.nav.includes('La maison'), 'French navigation content');
    ok(fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8').includes('https://maisondmist.com/fr/'), 'sitemap includes French page');
    ok(/Français|française/.test(fs.readFileSync(path.join(ROOT, '404.html'), 'utf8')), '404 includes French');

    const languageTargets = [];
    for (const url of [BASE + '/', BASE + '/ar/', BASE + '/fr/']) {
      await p.goto(url, { waitUntil: 'networkidle' });
      languageTargets.push(await p.evaluate(() => [...document.querySelectorAll('[data-lang]')].map(a => new URL(a.getAttribute('href'), location.href).pathname).sort().join('|')));
    }
    ok(languageTargets.every(targets => targets === '/|/ar/|/fr/'), 'every page links to all three languages');

    await p.goto(BASE + '/fr/', { waitUntil: 'networkidle' });
    const hasMenu = await p.locator('#language-current').count();
    ok(hasMenu === 1, 'refined language dropdown exists');
    let arrowEnter = false, menuEscapeClosed = false, menuFocusRestored = false, menuOutsideClosed = false;
    if (hasMenu) {
      await p.focus('#language-current');
      await p.keyboard.press('ArrowDown');
      await p.keyboard.press('ArrowDown');
      await p.keyboard.press('ArrowUp');
      arrowEnter = await p.evaluate(() => document.activeElement.dataset.lang === 'fr');
      await p.keyboard.press('Enter');
      arrowEnter = arrowEnter && await p.locator('#language-menu').isHidden();
      await p.keyboard.press('Enter');
      await p.keyboard.press('Escape');
      menuEscapeClosed = await p.locator('#language-menu').isHidden();
      menuFocusRestored = await p.evaluate(() => document.activeElement.id === 'language-current');
      await p.keyboard.press('Enter');
      await p.locator('main').click({ position: { x: 5, y: 5 } });
      menuOutsideClosed = await p.locator('#language-menu').isHidden();
    }
    ok(arrowEnter, 'language menu arrows and Enter work');
    ok(menuEscapeClosed && menuFocusRestored, 'language menu keyboard behavior');
    ok(menuOutsideClosed, 'language menu closes on outside click');
    await p.close();
  }

  // 2.9 Appearance preferences: System, Original Light, and Dark Luxury.
  {
    const readTheme = p => p.evaluate(() => ({
      meta: (document.querySelector('meta[name="color-scheme"]') || {}).content || '',
      themeColor: (document.querySelector('meta[name="theme-color"]') || {}).content || '',
      stored: (() => { try { return localStorage.getItem('mdm-theme'); } catch (e) { return 'blocked'; } })(),
      data: document.documentElement.dataset.theme || '',
      cards: document.querySelectorAll('.card').length
    }));

    let ctx = await b.newContext({ colorScheme: 'dark' });
    let p = await ctx.newPage();
    p.on('pageerror', e => errors.push(e.message));
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    const systemDark = await readTheme(p);
    ok(systemDark.meta === 'light dark' && systemDark.stored === null && systemDark.data === 'system', 'System follows OS without a stored override');
    const hasTheme = await p.locator('#theme-select').count();
    ok(hasTheme === 1, 'appearance selector exists');

    let dark = { meta: '', stored: '', data: '', themeColor: '' }, light = { meta: '' }, reset = { meta: '', stored: '', data: '' };
    if (hasTheme) {
      await p.selectOption('#theme-select', 'dark');
      await p.reload({ waitUntil: 'networkidle' });
      dark = await readTheme(p);
      await p.selectOption('#theme-select', 'light');
      await p.reload({ waitUntil: 'networkidle' });
      light = await readTheme(p);
      await p.selectOption('#theme-select', 'system');
      await p.reload({ waitUntil: 'networkidle' });
      reset = await readTheme(p);
    }
    ok(dark.meta === 'dark' && dark.stored === 'dark' && dark.data === 'dark', 'Dark Luxury override persists');
    ok(dark.themeColor === '#15170f', 'theme-color follows Dark Luxury');
    ok(light.meta === 'light' && light.stored === 'light' && light.data === 'light', 'Original Light override persists');
    ok(reset.meta === 'light dark' && reset.stored === null && reset.data === 'system', 'System removes the explicit override');

    const p2 = await ctx.newPage();
    p2.on('pageerror', e => errors.push(e.message));
    await p2.goto(BASE + '/', { waitUntil: 'networkidle' });
    let crossDark = '', crossSystem = '';
    if (hasTheme) {
      await p.selectOption('#theme-select', 'dark');
      await p2.waitForTimeout(300);
      crossDark = (await readTheme(p2)).meta;
      await p.selectOption('#theme-select', 'system');
      await p2.waitForTimeout(300);
      crossSystem = (await readTheme(p2)).meta;
    }
    ok(crossDark === 'dark' && crossSystem === 'light dark', 'theme synchronizes across tabs');
    await ctx.close();

    ctx = await b.newContext();
    await ctx.addInitScript(() => {
      const blocked = () => { throw new Error('storage blocked'); };
      Object.defineProperty(Storage.prototype, 'getItem', { value: blocked });
      Object.defineProperty(Storage.prototype, 'setItem', { value: blocked });
      Object.defineProperty(Storage.prototype, 'removeItem', { value: blocked });
    });
    p = await ctx.newPage();
    p.on('pageerror', e => errors.push(e.message));
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    const blocked = await readTheme(p);
    ok(blocked.cards === SHOWN && hasTheme === 1, 'blocked storage leaves the page usable');
    ok(errors.length === 0, 'blocked storage has no unhandled rejections' + (errors.length ? ': ' + errors.join(' / ') : ''));
    await ctx.close();

    ctx = await b.newContext();
    await ctx.addInitScript(() => localStorage.setItem('mdm-theme', 'dark'));
    p = await ctx.newPage();
    p.on('pageerror', e => errors.push(e.message));
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    const boot = await readTheme(p);
    ok(boot.meta === 'dark' && boot.data === 'dark', 'stored theme is applied by the head boot script');
    await ctx.close();
  }

  // 3.1 Supplied product media and localized ingredient details.
  {
    const p = await mk(1440, 900);
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    const mediaCount = await p.locator('video[data-product-video]').count();
    ok(mediaCount === FILMS, `every product film renders (${mediaCount} of ${FILMS})`);
    ok(await p.locator('video[data-product-video]').evaluateAll(vs => vs.every(v => !v.controls && !v.hasAttribute('tabindex'))),
      'films show no browser control bar over the photo and add no dead tab stop');
    {
      const touch = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
      const t = await touch.newPage();
      await t.goto(BASE + '/', { waitUntil: 'networkidle' });
      const film = t.locator('video[data-product-video]').first();
      await film.scrollIntoViewIfNeeded();
      await film.tap();
      const tapPlays = await t.waitForFunction(() => !document.querySelector('video[data-product-video]').paused, null, { timeout: 3000 }).then(() => true, () => false);
      await film.tap();
      const tapPauses = await t.waitForFunction(() => document.querySelector('video[data-product-video]').paused, null, { timeout: 3000 }).then(() => true, () => false);
      ok(tapPlays && tapPauses, 'tapping the film on a phone plays and pauses it');
      await touch.close();
    }
    let initialPaused = false, posterVisible = false, hoverPlayback = false, keyboardPlayback = false, offscreenPaused = false, endedResetsToStart = false;
    if (mediaCount) {
      initialPaused = await p.locator('video[data-product-video]').evaluateAll(videos => videos.every(v => v.paused && !v.autoplay));
      posterVisible = await p.locator('video[data-product-video]').evaluateAll(videos => videos.every(v => v.poster.includes('/assets/img/products/')));
      await p.locator('[data-media-stage]').first().hover();
      hoverPlayback = await p.waitForFunction(() => !document.querySelector('video[data-product-video]').paused, null, { timeout: 3000 })
        .then(() => true, () => false);
      await p.mouse.move(0, 0);
      await p.waitForTimeout(200);
      await p.locator('[data-media-play]').first().focus();
      await p.keyboard.press('Space');
      await p.waitForTimeout(250);
      keyboardPlayback = await p.locator('video[data-product-video]').first().evaluate(v => !v.paused);
      await p.keyboard.press('Space');
      await p.waitForTimeout(150);
      await p.evaluate(() => window.scrollTo(0, 0));
      await p.waitForTimeout(250);
      offscreenPaused = await p.locator('video[data-product-video]').first().evaluate(v => v.paused);
      await p.locator('[data-media-play]').first().focus();
      await p.locator('video[data-product-video]').first().evaluate(v => { v.playbackRate = 16; });
      await p.keyboard.press('Space');
      await p.waitForTimeout(1000);
      endedResetsToStart = await p.locator('video[data-product-video]').first().evaluate(v => v.currentTime === 0 && v.paused);
    }
    ok(initialPaused && posterVisible, 'video starts as a real poster');
    ok(hoverPlayback, 'hover starts the supplied sequence');
    ok(keyboardPlayback && offscreenPaused, 'accessible and offscreen playback');
    ok(endedResetsToStart, 'completed video resets to its opening frame');

    await p.goto(BASE + '/fr/', { waitUntil: 'networkidle' });
    const ingredientCount = await p.locator('.ingredient').count();
    const expectedIngredients = PRODUCTS.filter(x => x.status !== 'hidden').reduce((n, x) => n + (x.ingredients || []).length, 0);
    ok(ingredientCount === expectedIngredients, `all localized ingredient controls render (${ingredientCount} of ${expectedIngredients})`);
    let detailName = '', detailBody = '';
    if (ingredientCount) {
      await p.locator('.ingredient').first().hover();
      await p.waitForFunction(() => (document.querySelector('.ingredient-detail strong') || {}).textContent === 'Eau de rose', null, { timeout: 2000 }).catch(() => {});
      detailName = await p.locator('.ingredient-detail strong').first().textContent();
      detailBody = await p.locator('.ingredient-detail p').first().textContent();
    }
    ok(detailName === 'Eau de rose' && detailBody.includes('florale'), 'ingredient detail is translated into French' + (detailName === 'Eau de rose' ? '' : ` (saw "${detailName}")`));

    const reducedContext = await b.newContext({ reducedMotion: 'reduce' });
    const reducedPage = await reducedContext.newPage();
    reducedPage.on('pageerror', e => errors.push(e.message));
    await reducedPage.goto(BASE + '/', { waitUntil: 'networkidle' });
    if (await reducedPage.locator('[data-media-stage]').count()) {
      await reducedPage.locator('[data-media-stage]').first().hover();
      await reducedPage.waitForTimeout(250);
    }
    const reducedMotionPaused = await reducedPage.locator('video[data-product-video]').evaluateAll(videos => videos.every(v => v.paused));
    ok(reducedMotionPaused, 'reduced motion keeps videos paused on hover');
    await reducedContext.close();

    const missingContext = await b.newContext();
    const missingPage = await missingContext.newPage();
    missingPage.on('pageerror', e => errors.push(e.message));
    await missingPage.goto(BASE + '/', { waitUntil: 'networkidle' });
    await missingPage.evaluate(async () => {
      for (const key of await caches.keys()) await caches.delete(key);
      for (const registration of await navigator.serviceWorker.getRegistrations()) await registration.unregister();
    });
    await missingPage.goto(BASE + '/?missing=1', { waitUntil: 'networkidle' });
    for (let n = 0; n < await missingPage.locator('[data-media-play]').count(); n++) {
      const play = missingPage.locator('[data-media-play]').nth(n);
      if (await play.isVisible()) await play.press('Enter');
    }
    await missingPage.waitForTimeout(2000);
    const fallback = await missingPage.evaluate(() => ({
      posters: [...document.querySelectorAll('.product-poster')].map(img => img.src),
      messages: [...document.querySelectorAll('.media-error')].filter(e => !e.hidden).length
    }));
    ok(fallback.posters.length === FILMS && fallback.messages > 0, 'missing video keeps the real poster and shows a localized explanation');
    ok(errors.length === 0, 'media failure has no unhandled rejections' + (errors.length ? ': ' + errors.join(' / ') : ''));
    await missingContext.close();
    await p.close();
  }

  // 3.2 Installable PWA, offline cache, and update resilience.
  {
    const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.webmanifest'), 'utf8'));
    ok(manifest.id === '/' && manifest.prefer_related_applications === false && manifest.icons.some(icon => icon.src.includes('icon-maskable-512.png')), 'dedicated maskable app icon and manifest');

    const context = await b.newContext();
    const p = await context.newPage();
    p.on('pageerror', e => errors.push(e.message));
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    await p.waitForTimeout(500);
    ok(await p.evaluate(async () => !!(await navigator.serviceWorker.getRegistration())), 'service worker registered');
    ok(await p.evaluate(async () => (await caches.keys()).some(key => key.startsWith('mdm-'))), 'versioned app shell cache exists');

    if (await p.locator('[data-media-play]').count()) await p.locator('[data-media-play]').first().click();
    await p.waitForTimeout(700);
    const completeVideoCached = await p.evaluate(async () => !!(await caches.match('/assets/video/fresh-mist-lotion.webm')));
    ok(completeVideoCached, 'fully downloaded video is cached for offline reuse');

    const partialVideoCached = await p.evaluate(async () => {
      await fetch('/test-partial.webm');
      return !!(await caches.match('/test-partial.webm'));
    });
    ok(!partialVideoCached, 'partial 206 video response is not cached');

    await p.reload({ waitUntil: 'networkidle' });
    await context.setOffline(true);
    const offline = {};
    for (const [name, url] of [['English', BASE + '/'], ['Arabic', BASE + '/ar/'], ['French', BASE + '/fr/']]) {
      try {
        await p.goto(url, { waitUntil: 'networkidle' });
        offline[name] = await p.evaluate(() => ({ lang: document.documentElement.lang, cards: document.querySelectorAll('.card').length }));
      } catch (e) {
        offline[name] = { lang: 'offline-error', cards: 0 };
      }
    }
    ok(offline.English.lang === 'en' && offline.Arabic.lang === 'ar' && offline.French.lang === 'fr', 'offline navigation in every language');
    ok(offline.English.cards === SHOWN && offline.Arabic.cards === SHOWN && offline.French.cards === SHOWN, 'offline products render in every language');

    await context.setOffline(false);
    let cachedVideoPlays = false;
    if (await p.locator('video[data-product-video]').count()) {
      await p.locator('[data-media-play]').first().focus();
      await p.keyboard.press('Enter');
      await p.waitForTimeout(300);
      cachedVideoPlays = await p.locator('video[data-product-video]').first().evaluate(v => !v.paused);
    }
    ok(cachedVideoPlays, 'cached video plays offline');

    // Release discipline: the worker's cache version is the release number, so
    // every release changes sw.js and reaches phones that already have the site.
    const swVersion = (fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8').match(/const VERSION = '([^']+)'/) || [])[1];
    const repoVersion = fs.readFileSync(path.join(ROOT, 'VERSION'), 'utf8').trim();
    ok(swVersion === repoVersion, `sw.js cache version matches VERSION (${swVersion} / ${repoVersion})`);
    {
      const shown = [];
      for (const url of ['/', '/ar/', '/fr/']) {
        await p.goto(BASE + url, { waitUntil: 'networkidle' });
        shown.push(await p.locator('.site-footer [data-version]').evaluate(el => {
          const cs = getComputedStyle(el), box = el.getBoundingClientRect();
          let fade = 1; for (let n = el; n; n = n.parentElement) fade *= Number(getComputedStyle(n).opacity);
          return { text: el.textContent.trim(), visible: cs.visibility !== 'hidden' && cs.display !== 'none' && box.width > 0 && fade === 1 };
        }).catch(() => ({ text: '', visible: false })));
      }
      ok(shown.every(v => v.visible && v.text.endsWith(repoVersion)), `footer shows the release number clearly on every page (${shown.map(v => v.text).join(' | ')})`);
    }

    // Updates as a returning visitor meets them. A release changes sw.js; the new
    // worker takes over at once and an open page refreshes itself, never during
    // a film. (Before 0.41 this waited for a tap on a "Reload" bar, and phones
    // showed the new page over the previous release's scripts and products.)
    await p.goto(BASE + '/fr/', { waitUntil: 'networkidle' });
    await p.evaluate(() => navigator.serviceWorker.ready);
    await p.reload({ waitUntil: 'networkidle' });
    const controlled = await p.evaluate(() => !!navigator.serviceWorker.controller);
    await p.evaluate(async () => {
      await (await caches.open('mdm-old-test')).put('/old-test', new Response('old'));
      await (await caches.open('another-app')).put('/keep', new Response('keep'));
      window.__beforeUpdate = true;
    });
    // Keyboard only (the pointer leaving a film pauses it); films loop for the
    // test so a short one cannot end by itself mid-check.
    await p.mouse.move(0, 0);
    await p.locator('[data-media-play]').first().press('Enter');
    await p.evaluate(() => document.querySelectorAll('video').forEach(v => { v.loop = true; }));
    await p.waitForFunction(() => [...document.querySelectorAll('video')].some(v => !v.paused), null, { timeout: 5000 }).catch(() => {});
    swRevision += 1;
    await p.evaluate(async () => (await navigator.serviceWorker.getRegistration()).update());
    const noteShown = await p.locator('.pwa-update').waitFor({ state: 'visible', timeout: 15000 }).then(() => true, () => false);
    await p.waitForTimeout(800);
    const held = await p.evaluate(() => ({ samePage: window.__beforeUpdate === true, playing: [...document.querySelectorAll('video')].some(v => !v.paused),
      note: (document.querySelector('.pwa-update') || {}).textContent || '' }));
    ok(controlled && noteShown && held.samePage && held.playing && held.note.includes('Mise à jour'),
      'a new release takes over by itself; while a film plays the page only says it is updating, in its language' + (noteShown && held.samePage ? '' : ' ' + JSON.stringify({ controlled, noteShown, held })));
    const reloaded = p.waitForEvent('load', { timeout: 15000 }).then(() => true, () => false);
    await p.locator('[data-media-play]').first().press('Enter');
    ok(await reloaded, 'the page refreshes itself into the new release once the film stops');
    const after = await p.evaluate(async () => {
      const r = await navigator.serviceWorker.getRegistration();
      return { reloaded: window.__beforeUpdate !== true, waiting: !!(r && r.waiting),
        old: await caches.has('mdm-old-test'), other: await caches.has('another-app'),
        ours: (await caches.keys()).filter(k => k.startsWith('mdm-')).sort().join(',') };
    });
    ok(after.reloaded && !after.waiting && !after.old && after.other,
      `update cleans only old Maison d'Mist caches (${after.ours}; another-app kept: ${after.other})`);

    await p.evaluate(() => { window.__beforeUpdate = true; });
    swRevision += 1;
    const autoReload = p.waitForEvent('load', { timeout: 15000 }).then(() => true, () => false);
    await p.evaluate(async () => (await navigator.serviceWorker.getRegistration()).update());
    ok(await autoReload && await p.evaluate(() => window.__beforeUpdate !== true), 'with nothing playing, the page refreshes into a new release without any tap');

    productsChanged = true;
    await p.reload({ waitUntil: 'networkidle' });
    const firstName = await p.locator('.card__name').first().textContent();
    productsChanged = false;
    ok(firstName.includes('new release'), `a returning visitor sees changed products on the first load after a release ("${firstName.trim()}")`);
    await context.close();

    const failureContext = await b.newContext();
    await failureContext.addInitScript(() => {
      Object.defineProperty(navigator.serviceWorker, 'register', { value: () => Promise.reject(new Error('registration blocked')) });
    });
    const failurePage = await failureContext.newPage();
    failurePage.on('pageerror', e => errors.push(e.message));
    await failurePage.goto(BASE + '/', { waitUntil: 'networkidle' });
    ok(await failurePage.locator('.card').count() === SHOWN, 'registration failure leaves the site usable');
    ok(errors.length === 0, 'PWA failure has no unhandled rejections' + (errors.length ? ': ' + errors.join(' / ') : ''));
    await failureContext.close();
  }

  // 3. Contact details filled + one product available.
  for (const [lang, url] of [['en', BASE + '/'], ['ar', BASE + '/ar/']]) {
    const p = await mk(1440, 900);
    await p.route('**/data/site.js', r => r.fulfill({ contentType: 'application/javascript', body: FILLED_SITE }));
    await p.addInitScript(() => {
      Object.defineProperty(window, 'MDM_PRODUCTS', { configurable: true, set(v) {
        v[0].status = 'available'; v[0].price = '45,000 SYP'; v[1].status = 'sold-out';
        v.push({ ...v[0], id: 'coming-test', status: 'coming-soon' }, { ...v[0], id: 'hidden-test', status: 'hidden' });
        Object.defineProperty(window, 'MDM_PRODUCTS', { value: v, writable: true, configurable: true }); } });
    });
    await p.goto(url, { waitUntil: 'networkidle' });
    const i = await p.evaluate(() => ({
      cards: document.querySelectorAll('.card').length,
      orderBtns: [...document.querySelectorAll('.card__action a')].map(a => a.href),
      hero: (document.querySelector('[data-order-btn]') || {}).href || null,
      socials: [...document.querySelectorAll('.site-footer .socials a')].map(a => a.getAttribute('aria-label')),
      contact: [...document.querySelectorAll('#contact-grid h3')].map(h => h.textContent),
      price: (document.querySelector('.card__price') || {}).textContent,
      badges: [...document.querySelectorAll('.badge')].map(b => b.textContent),
      expectedBadges: window.MDM_PRODUCTS.filter(x => x.status === 'coming-soon' || x.status === 'sold-out').length,
      expectedOrders: window.MDM_PRODUCTS.filter(x => x.status === 'available').length,
      hiddenRendered: !!document.querySelector('[data-product-id="hidden-test"]')
    }));
    ok(i.cards === SHOWN + 1 && !i.hiddenRendered, `${lang}: hidden product removed (${i.cards} cards)`);
    ok(i.orderBtns.length === i.expectedOrders && i.orderBtns.every(h => h.startsWith('https://wa.me/963912345678?text=')), `${lang}: a WhatsApp order button per available product, number normalised (${i.orderBtns.length} of ${i.expectedOrders})`);
    console.log('     prefilled message:', decodeURIComponent((i.orderBtns[0] || '').split('text=')[1] || ''));
    ok(i.hero && i.hero.startsWith('https://wa.me/963912345678'), `${lang}: hero order button appears`);
    ok(i.socials.join(',') === 'WhatsApp,Instagram,TikTok,Email', `${lang}: footer icons ${i.socials.join(',')}`);
    ok(i.contact.length === 3, `${lang}: contact cards ${i.contact.join(' | ')}`);
    ok(i.price === '45,000 SYP', `${lang}: price shown`);
    ok(i.badges.length === i.expectedBadges, `${lang}: ${i.badges.length} badges for ${i.expectedBadges} coming-soon or sold-out products`);
    await p.screenshot({ path: `${out}/${lang}-filled.png`, fullPage: true });
    await p.close();
  }

  // 4. Double-click from disk (file://), as on a Windows PC.
  const p = await mk(1280, 800);
  await p.goto('file://' + dir + '/index.html');
  await p.waitForTimeout(600);
  ok(await p.evaluate(() => document.querySelectorAll('.card').length) === SHOWN, 'file:// — products render without a web server');
  await p.goto('file://' + dir + '/ar/index.html');
  await p.waitForTimeout(600);
  ok(await p.evaluate(() => document.querySelectorAll('.card').length) === SHOWN, 'file:// — Arabic page renders too');
  await p.goto('file://' + dir + '/fr/index.html');
  await p.waitForTimeout(600);
  ok(await p.evaluate(() => document.querySelectorAll('.card').length) === SHOWN, 'file:// — French page renders too');
  await p.close();

  // 5. JavaScript disabled: nothing may stay invisible.
  { const ctx = await b.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 800 } });
    const q = await ctx.newPage();
    for (const [lang, url] of [['en', BASE + '/'], ['ar', BASE + '/ar/'], ['fr', BASE + '/fr/']]) {
      await q.goto(url);
      const n = await q.locator('.reveal').evaluateAll(els => els.filter(e => getComputedStyle(e).opacity !== '1').length);
      const text = (await q.locator('main').innerText()).length;
      ok(n === 0 && text > 400, `JS off (${lang}): all sections readable (${n} hidden, ${text} characters of content)`);
    }
    await ctx.close(); }

  // 6. Reduced motion: no animation, everything visible immediately.
  { const ctx = await b.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 800 } });
    const q = await ctx.newPage(); await q.goto(BASE + '/ar/', { waitUntil: 'networkidle' });
    const n = await q.evaluate(() => [...document.querySelectorAll('.reveal')].filter(e => getComputedStyle(e).opacity !== '1').length);
    const anim = await q.evaluate(() => getComputedStyle(document.querySelector('.hero'), '::before').animationName);
    ok(n === 0 && anim === 'none', `reduced motion: all visible without scrolling, drift off (${n} hidden, animation ${anim})`);
    await ctx.close(); }

  ok(errors.length === 0, 'no JavaScript errors' + (errors.length ? ': ' + errors.join(' / ') : ''));
  await b.close();
  server.close();
  console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASSED');
  process.exit(fails.length ? 1 : 0);
})();
