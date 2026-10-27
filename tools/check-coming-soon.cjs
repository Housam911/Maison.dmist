/* Maison d'Mist — checks for the "Coming soon" site (main, from 0.50).
   Run from the repository root: node tools/check-coming-soon.cjs  (Node 18+, Playwright, git) */
const http = require('http'), fs = require('fs'), os = require('os'), path = require('path'), { execFileSync } = require('child_process');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..');
const VERSION = fs.readFileSync(path.join(ROOT, 'VERSION'), 'utf8').trim();
// The live full release (0.42), to play a returning visitor who has it saved.
const OLD = fs.mkdtempSync(path.join(os.tmpdir(), 'mdm-041-'));
let haveOld = true;
try { execFileSync('sh', ['-c', `git -C "${ROOT}" archive 5da54b9 | tar -x -C "${OLD}"`]); } catch { haveOld = false; }
let serveOld = false;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webm': 'video/webm', '.mp4': 'video/mp4', '.webmanifest': 'application/manifest+json', '.xml': 'application/xml', '.txt': 'text/plain', '.woff2': 'font/woff2' };
const server = http.createServer((q, r) => { const base = serveOld ? OLD : ROOT; let f = decodeURIComponent(q.url.split('?')[0]); if (f.endsWith('/')) f += 'index.html'; f = path.join(base, path.normalize(f));
  if (!f.startsWith(base) || !fs.existsSync(f)) { r.writeHead(404); return r.end(); }
  const h = { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }; if (f.endsWith('sw.js')) h['Cache-Control'] = 'no-store';
  r.writeHead(200, h); fs.createReadStream(f).pipe(r); });
const fails = []; const ok = (c, m) => { if (!c) fails.push(m); console.log((c ? 'PASS ' : 'FAIL ') + m); };

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r)); const B = 'http://127.0.0.1:' + server.address().port;
  const b = await chromium.launch(); const errors = [];
  for (const [lang, url, dir, word] of [['en', '/', 'ltr', 'Coming soon'], ['ar', '/ar/', 'rtl', 'قريبًا'], ['fr', '/fr/', 'ltr', 'Bientôt']]) {
    for (const w of [320, 390, 1440]) {
      const ctx = await b.newContext({ viewport: { width: w, height: 800 } }); const p = await ctx.newPage(); p.on('pageerror', e => errors.push(e.message));
      await p.goto(B + url, { waitUntil: 'networkidle' });
      const r = await p.evaluate(async () => ({ lang: document.documentElement.lang, dir: document.documentElement.dir, h1: document.querySelector('h1').textContent,
        over: document.documentElement.scrollWidth - document.documentElement.clientWidth, version: (document.querySelector('[data-version]') || {}).textContent || '',
        wa: (document.querySelector('a[href^="https://wa.me/"]') || {}).href || '', ig: (document.querySelector('a[href*="instagram.com"]') || {}).href || '',
        sw: !!(await navigator.serviceWorker.getRegistration()) }));
      ok(r.lang === lang && r.dir === dir && r.h1 === word && r.over === 0 && r.version.endsWith(VERSION) && r.wa.startsWith('https://wa.me/9613496329') && r.ig.endsWith('maison.dmist') && !r.sw,
        `${lang} @ ${w}px: "${word}", ${dir}, no sideways scroll, WhatsApp and Instagram, footer ${VERSION}, no service worker` + (r.over || !r.wa ? ' ' + JSON.stringify(r) : ''));
      await ctx.close();
    }
  }
  if (haveOld) {
    const ctx = await b.newContext(); const p = await ctx.newPage();
    serveOld = true;
    await p.goto(B + '/', { waitUntil: 'networkidle' });
    await p.evaluate(() => navigator.serviceWorker.ready); await p.reload({ waitUntil: 'networkidle' });
    const before = await p.evaluate(async () => ({ controlled: !!navigator.serviceWorker.controller, caches: (await caches.keys()).filter(k => k.startsWith('mdm-')).length, cards: document.querySelectorAll('.card').length }));
    serveOld = false;
    const swapped = p.waitForFunction(() => document.querySelector('h1') && document.querySelector('h1').textContent === 'Coming soon', null, { timeout: 20000 }).then(() => true, () => false);
    await p.reload({ waitUntil: 'networkidle' }).catch(() => {});
    const shown = await swapped;
    // The browser looks for a new sw.js after the navigation; give it time.
    let after = {}; const t0 = Date.now();
    do {
      await p.waitForTimeout(500);
      after = await p.evaluate(async () => ({ sw: !!(await navigator.serviceWorker.getRegistration()), caches: (await caches.keys()).filter(k => k.startsWith('mdm-')).length,
        h1: (document.querySelector('h1') || {}).textContent })).catch(() => ({ sw: true, caches: -1 }));
    } while ((after.sw || after.caches !== 0) && Date.now() - t0 < 20000);
    console.log(`     cleared after ${((Date.now() - t0) / 1000).toFixed(1)} s`);
    ok(before.controlled && before.caches > 0 && before.cards > 0 && shown && !after.sw && after.caches === 0,
      `a visitor with the old site saved lands on Coming soon, with the saved copy and worker gone (before: ${before.cards} products, ${before.caches} caches; after: ${after.caches} caches, worker ${after.sw ? 'still there' : 'gone'})`);
    await ctx.close();
  } else console.log('SKIP returning-visitor check (git history unavailable)');
  ok(errors.length === 0, 'no JavaScript errors' + (errors.length ? ': ' + errors.join(' / ') : ''));
  await b.close(); server.close(); fs.rmSync(OLD, { recursive: true, force: true });
  console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASSED'); process.exit(fails.length ? 1 : 0);
})();
