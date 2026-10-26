/* Maison d'Mist v3 (iOS edition) — release checks.
   Run from the repository root: node tools/check-v3.cjs   (Node 18+, Playwright) */
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..');
const DATA = (() => { const window = {}; for (const f of ['site.js', 'products.js']) new Function('window', fs.readFileSync(path.join(ROOT, 'data', f), 'utf8'))(window); return window; })();
const PRODUCTS = DATA.MDM_PRODUCTS.filter(p => p.status !== 'hidden'), CATS = DATA.MDM_CATEGORIES, SITE = DATA.MDM_SITE;
const VERSION = fs.readFileSync(path.join(ROOT, 'VERSION'), 'utf8').trim();
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.webm': 'video/webm', '.mp4': 'video/mp4', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon', '.txt': 'text/plain' };
const server = http.createServer((q, r) => { let f = decodeURIComponent(q.url.split('?')[0]); if (f.endsWith('/')) f += 'index.html'; f = path.join(ROOT, path.normalize(f));
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
const fails = []; const ok = (c, m) => { if (!c) fails.push(m); console.log((c ? 'PASS ' : 'FAIL ') + m); };

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r)); const B = 'http://127.0.0.1:' + server.address().port;
  const b = await chromium.launch(); const errors = [];
  const page = async (opts = {}) => { const ctx = await b.newContext({ viewport: { width: 393, height: 852 }, ...opts }); const p = await ctx.newPage(); p.on('pageerror', e => errors.push(e.message)); return p; };

  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  ok(/name="robots" content="noindex, nofollow"/.test(html) && /Disallow: \//.test(fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8')), 'test edition stays out of search engines (noindex + robots.txt)');
  ok(fs.readFileSync(path.join(ROOT, 'CNAME'), 'utf8').trim() === 'v3.maisondmist.com', 'CNAME is v3.maisondmist.com');

  for (const [lang, dir] of [['en', 'ltr'], ['ar', 'rtl'], ['fr', 'ltr']]) {
    for (const w of [320, 393, 768, 1440]) {
      const p = await page({ viewport: { width: w, height: 900 } });
      await p.goto(`${B}/?lang=${lang}`, { waitUntil: 'networkidle' });
      const r = await p.evaluate(() => ({ dir: document.documentElement.dir, lang: document.documentElement.lang, over: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        cards: document.querySelectorAll('.pcard').length, version: document.getElementById('version').textContent }));
      ok(r.dir === dir && r.lang === lang && r.over === 0 && r.cards === PRODUCTS.length && r.version.endsWith(VERSION),
        `${lang} @ ${w}px: ${dir}, no sideways scroll, ${PRODUCTS.length} products, footer shows ${VERSION}` + (r.over || r.cards !== PRODUCTS.length ? ' ' + JSON.stringify(r) : ''));
      await p.context().close();
    }
  }

  { const p = await page(); await p.goto(B + '/?lang=en', { waitUntil: 'networkidle' });
    let good = true;
    for (const c of CATS) {
      await p.locator(`.segment[data-filter="${c.id}"]`).click();
      const shown = await p.locator('.pcard:not([hidden])').evaluateAll(cs => cs.map(x => x.dataset.category));
      if (shown.length !== PRODUCTS.filter(x => x.category === c.id).length || shown.some(x => x !== c.id)) good = false;
    }
    await p.locator('.segment[aria-selected="true"]').press('ArrowRight');
    const wrapped = await p.locator('.segment[aria-selected="true"]').getAttribute('data-filter');
    ok(good && wrapped === 'all', 'segmented filter shows each category; arrow keys move the selection');
    await p.waitForTimeout(600); // the thumb slides for 0.4 s
    const thumb = await p.evaluate(() => { const on = document.querySelector('.segment[aria-selected="true"]').getBoundingClientRect(), th = document.querySelector('.segmented__thumb').getBoundingClientRect();
      return Math.abs(th.width - on.width) < 2 && Math.abs(th.left - on.left) < 2; });
    ok(thumb, 'segmented thumb sits under the selected segment');

    const avail = PRODUCTS.filter(x => x.status === 'available').length;
    const orders = await p.locator('.pcard a.get').evaluateAll(as => as.map(a => a.href));
    const wa = String(SITE.whatsapp || '').replace(/\D/g, '');
    ok(wa ? orders.length === avail && orders.every(h => h.startsWith(`https://wa.me/${wa}?text=`)) : orders.length === 0, `Order button on each available product only (${orders.length} of ${avail})`);

    const opener = p.locator('[data-open="0"]'); await opener.click();
    await p.waitForSelector('#sheet.is-open');
    const title = await p.locator('#sheet-title').textContent();
    ok(title === PRODUCTS[0].en.name && await p.locator('#sheet-done').evaluate(el => el === document.activeElement), 'card opens its sheet with focus on Done');
    await p.keyboard.press('Escape'); await p.waitForTimeout(600);
    ok(await p.locator('#sheet').isHidden() && await opener.evaluate(el => el === document.activeElement), 'Escape closes the sheet and returns focus to the card');
    await p.locator('[data-open="1"]').click(); await p.waitForSelector('#sheet.is-open'); await p.waitForTimeout(500);
    await p.mouse.click(10, 10); await p.waitForTimeout(600);
    ok(await p.locator('#sheet').isHidden(), 'tapping outside closes the sheet');
    await p.locator('[data-open="2"]').click(); await p.waitForSelector('#sheet.is-open'); await p.waitForTimeout(600);
    const box = await p.locator('#sheet-handle').boundingBox();
    await p.mouse.move(box.x + 40, box.y + 20); await p.mouse.down(); await p.mouse.move(box.x + 40, box.y + 260, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(600);
    ok(await p.locator('#sheet').isHidden(), 'dragging the handle down dismisses the sheet');
    const tab = p.locator('#sheet-done'); await p.locator('[data-open="0"]').click(); await p.waitForSelector('#sheet.is-open');
    for (let n = 0; n < 12; n++) await p.keyboard.press('Tab');
    ok(await p.evaluate(() => document.getElementById('sheet').contains(document.activeElement)), 'keyboard focus stays inside the open sheet');
    await p.keyboard.press('Escape');

    const rows = await p.locator('#contact-list a.row').evaluateAll(as => as.map(a => a.href));
    const want = [SITE.whatsapp && 'wa.me', SITE.phone && 'tel:', SITE.instagram && 'instagram.com'].filter(Boolean);
    ok(rows.length === want.length && want.every((w, n) => rows[n].includes(w)), `contact rows match data/site.js (${rows.length})`);

    await p.locator('#lang-btn').click(); await p.locator('[data-lang="ar"]').click();
    const rtl = await p.evaluate(() => ({ dir: document.documentElement.dir, url: location.search, saved: localStorage.getItem('mdm-v3-lang') }));
    ok(rtl.dir === 'rtl' && rtl.url === '?lang=ar' && rtl.saved === 'ar', 'language menu switches to Arabic, right to left, remembered');
    await p.context().close(); }

  { const p = await page({ reducedMotion: 'reduce' }); await p.goto(B + '/', { waitUntil: 'networkidle' });
    const soap = PRODUCTS.findIndex(x => x.animation); await p.locator(`[data-open="${soap}"]`).click(); await p.waitForTimeout(150);
    const r = await p.evaluate(() => ({ open: document.getElementById('sheet').classList.contains('is-open'), animating: !!document.querySelector('.is-animating'), playing: [...document.querySelectorAll('video')].some(v => !v.paused) }));
    ok(r.open && !r.animating && !r.playing, 'reduced motion: the sheet opens at once and nothing plays by itself');
    await p.context().close(); }

  ok(errors.length === 0, 'no JavaScript errors' + (errors.length ? ': ' + errors.join(' / ') : ''));
  await b.close(); server.close();
  console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASSED'); process.exit(fails.length ? 1 : 0);
})();
