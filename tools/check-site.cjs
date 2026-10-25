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
fs.mkdirSync(OUT, { recursive: true });
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript',
  '.webp': 'image/webp', '.png': 'image/png', '.ico': 'image/x-icon', '.xml': 'application/xml',
  '.txt': 'text/plain', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.join(ROOT, path.normalize(rel));
  if (!file.startsWith(ROOT) || !fs.existsSync(file)) { res.writeHead(404); return res.end(); }
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

  // 2. Mobile menu open/close.
  for (const url of [BASE + '/', BASE + '/ar/']) {
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

  // 3. Contact details filled + one product available.
  for (const [lang, url] of [['en', BASE + '/'], ['ar', BASE + '/ar/']]) {
    const p = await mk(1440, 900);
    await p.route('**/data/site.js', r => r.fulfill({ contentType: 'application/javascript', body: FILLED_SITE }));
    await p.addInitScript(() => {
      Object.defineProperty(window, 'MDM_PRODUCTS', { configurable: true, set(v) {
        v[0].status = 'available'; v[0].price = '45,000 SYP'; v[1].status = 'sold-out'; v[3].status = 'hidden';
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
      badges: [...document.querySelectorAll('.badge')].map(b => b.textContent)
    }));
    ok(i.cards === 3, `${lang}: hidden product removed (${i.cards} cards)`);
    ok(i.orderBtns.length === 1 && i.orderBtns[0].startsWith('https://wa.me/963912345678?text='), `${lang}: one WhatsApp order button, number normalised (${i.orderBtns[0]})`);
    console.log('     prefilled message:', decodeURIComponent((i.orderBtns[0] || '').split('text=')[1] || ''));
    ok(i.hero && i.hero.startsWith('https://wa.me/963912345678'), `${lang}: hero order button appears`);
    ok(i.socials.join(',') === 'WhatsApp,Instagram,TikTok,Email', `${lang}: footer icons ${i.socials.join(',')}`);
    ok(i.contact.length === 3, `${lang}: contact cards ${i.contact.join(' | ')}`);
    ok(i.price === '45,000 SYP', `${lang}: price shown`);
    ok(i.badges.length === 2, `${lang}: badges ${i.badges.join(', ')}`);
    await p.screenshot({ path: `${out}/${lang}-filled.png`, fullPage: true });
    await p.close();
  }

  // 4. Double-click from disk (file://), as on a Windows PC.
  const p = await mk(1280, 800);
  await p.goto('file://' + dir + '/index.html');
  await p.waitForTimeout(600);
  ok(await p.evaluate(() => document.querySelectorAll('.card').length) === 4, 'file:// — products render without a web server');
  await p.goto('file://' + dir + '/ar/index.html');
  await p.waitForTimeout(600);
  ok(await p.evaluate(() => document.querySelectorAll('.card').length) === 4, 'file:// — Arabic page renders too');
  await p.close();

  // 5. JavaScript disabled: nothing may stay invisible.
  { const ctx = await b.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 800 } });
    const q = await ctx.newPage(); await q.goto(BASE + '/');
    const n = await q.locator('.reveal').evaluateAll(els => els.filter(e => getComputedStyle(e).opacity !== '1').length);
    ok(n === 0, `JS off: all sections still readable (${n} hidden)`);
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
