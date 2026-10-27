/* Maison d'Mist — security release checks.
   Proves the rules in docs/TECHNICAL-REPORT.md ("Security: threat model")
   still hold, so a later edit cannot quietly undo them:

   A. Code      no script turns text into HTML or code (innerHTML, eval, ...),
                and no regular expression is built at run time.
   B. Pages     every page carries a strict Content-Security-Policy that comes
                first, allows only this site, hashes its one inline script and
                enforces Trusted Types; no inline handlers, styles or frames.
   C. Files     no server-side code exists to attack; every image, film, font
                and icon is what its name says, with no script inside an SVG.
   D. Data      data/*.js holds plain data only, in the expected shape.
   E. Browser   pages load with no policy violation and nothing from another
                site; the browser refuses innerHTML and eval; and with every
                text in the data files replaced by attack strings, nothing
                runs, no handler appears, and the attacks show as plain text.

   Run from the repository root:   node tools/check-security.cjs
   Needs Node 18+ and Playwright. Exit code 0 = all passed. */

const http = require('http');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');
const ROOT = path.resolve(__dirname, '..');
const SKIP = new Set(['.git', 'tools', 'docs', 'node_modules']);

const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); console.log((cond ? 'PASS ' : 'FAIL ') + msg); };

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name);
    if (fs.statSync(file).isDirectory()) { if (!SKIP.has(name)) walk(file, out); }
    else out.push(file);
  }
  return out;
}
const rel = file => path.relative(ROOT, file).split(path.sep).join('/');
const FILES = walk(ROOT);
const read = file => fs.readFileSync(file, 'utf8');
const byExt = (...exts) => FILES.filter(f => exts.includes(path.extname(f).toLowerCase()));

/* ---------- A. Code ---------- */

const FORBIDDEN = [
  [/\.(innerHTML|outerHTML)\s*=|insertAdjacentHTML\s*\(|document\.write(ln)?\s*\(/, 'builds HTML from text'],
  [/createContextualFragment|DOMParser|parseFromString|\.srcdoc\s*=/, 'parses HTML from text'],
  [/\beval\s*\(|\bFunction\s*\(|set(Timeout|Interval)\s*\(\s*["'`]/, 'runs text as code'],
  [/\bRegExp\s*\(/, 'compiles a regular expression at run time'],
  [/["'`]\s*javascript:/i, 'contains a javascript: address'],
  [/setAttribute\(\s*["'](on|style)/i, 'sets an event-handler or style attribute'],
  [/__proto__|\bimportScripts\s*\(|\bimport\s*\(/, 'touches __proto__ or loads code dynamically'],
  [/fetch\s*\(\s*["'`](https?:)?\/\//, 'fetches from another site']
];
for (const file of byExt('.js', '.mjs')) {
  const src = read(file);
  const hits = FORBIDDEN.filter(([re]) => re.test(src)).map(([, why]) => why);
  ok(hits.length === 0, `code: ${rel(file)} ${hits.length ? hits.join(', ') : 'has no HTML, code or regex built from text'}`);
}

/* ---------- B. Pages ---------- */

const TAG = /<([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
const ATTR = /([^\s"'=<>\/]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?/g;
function tags(html) {
  const out = [];
  for (const m of html.matchAll(TAG)) {
    const attrs = {};
    for (const a of m[2].matchAll(ATTR)) attrs[a[1].toLowerCase()] = a[2] ? a[2].replace(/^["']|["']$/g, '') : '';
    out.push({ tag: m[1].toLowerCase(), attrs, index: m.index });
  }
  return out;
}
const isLocal = url => !/^[a-z][a-z0-9+.-]*:/i.test(url) && !url.startsWith('//');
const sha = text => "'sha256-" + crypto.createHash('sha256').update(text, 'utf8').digest('base64') + "'";
// Google Search Console's ownership file is one line of text, not a page.
const VERIFY = byExt('.html').filter(f => /^google[0-9a-f]+\.html$/.test(path.basename(f)));
for (const file of VERIFY) {
  ok(/^google-site-verification: google[0-9a-f]+\.html\s*$/.test(read(file)), `${rel(file)}: holds only the Search Console verification line`);
}
const PAGES = byExt('.html').filter(f => !VERIFY.includes(f));
const SCRIPTED = new Set(), JSONLD = new Set();

for (const file of PAGES) {
  const name = rel(file);
  const html = read(file);
  const list = tags(html);
  const meta = list.find(t => t.tag === 'meta' && (t.attrs['http-equiv'] || '').toLowerCase() === 'content-security-policy');
  ok(!!meta, `${name}: has a Content-Security-Policy`);
  if (!meta) continue;
  const first = list.find(t => ['script', 'link', 'style', 'img', 'base'].includes(t.tag));
  ok(!first || meta.index < first.index, `${name}: the policy comes before anything it governs`);

  const csp = {};
  meta.attrs.content.split(';').map(s => s.trim()).filter(Boolean).forEach(d => {
    const [key, ...vals] = d.split(/\s+/); csp[key] = vals;
  });
  const sources = Object.entries(csp).filter(([k]) => /-src$/.test(k)).flatMap(([, v]) => v);
  const loose = sources.filter(s => !/^'(self|none|sha256-[A-Za-z0-9+/=]+)'$/.test(s));
  ok(loose.length === 0, `${name}: the policy allows only this site (${loose.join(' ') || "'self' and hashes"})`);
  ok((csp['default-src'] || []).join() === "'none'", `${name}: default-src 'none' (anything not listed is refused)`);
  ok((csp['base-uri'] || []).join() === "'none'" && (csp['form-action'] || []).join() === "'none'",
    `${name}: base-uri and form-action are 'none'`);

  // Executable scripts: no type, or a JavaScript type. JSON-LD is data and never runs.
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter(m => !/type\s*=\s*["']?application\/ld\+json/i.test(m[1]));
  const inline = scripts.filter(m => !/\bsrc\s*=/.test(m[1]));
  const hashes = (csp['script-src'] || []).filter(s => s.startsWith("'sha256-"));
  if (scripts.length) {
    SCRIPTED.add('/' + name.replace(/index\.html$/, ''));
    ok((csp['require-trusted-types-for'] || []).join() === "'script'", `${name}: Trusted Types are enforced`);
    const policies = csp['trusted-types'] || [];
    if (policies.includes('mdm-jsonld')) JSONLD.add('/' + name.replace(/index\.html$/, ''));
    ok(policies.length > 0 && policies.every(p => p === 'mdm-sw' || p === 'mdm-jsonld' || p === "'none'"),
      `${name}: no Trusted Types policies but the two narrow ones: /sw.js only, and JSON only (${policies.join(' ')})`);
    const wanted = inline.map(m => sha(m[2]));
    ok(wanted.every(h => hashes.includes(h)) && hashes.every(h => wanted.includes(h)),
      `${name}: the policy hashes exactly the page's ${inline.length} inline script(s)`);
    ok(!(csp['script-src'] || []).some(s => /unsafe|strict-dynamic/.test(s)), `${name}: no unsafe-inline or unsafe-eval`);
  } else {
    ok(!csp['script-src'] || csp['script-src'].join() === "'none'", `${name}: no scripts, and the policy allows none`);
  }

  const handlers = list.filter(t => Object.keys(t.attrs).some(a => /^on/.test(a)));
  ok(handlers.length === 0, `${name}: no inline event handlers`);
  ok(!list.some(t => 'style' in t.attrs || t.tag === 'style'), `${name}: no inline styles`);
  const banned = list.filter(t => ['base', 'iframe', 'frame', 'object', 'embed', 'form', 'applet'].includes(t.tag)).map(t => t.tag);
  ok(banned.length === 0, `${name}: no base, frame, object, embed or form elements${banned.length ? ' (' + banned.join(',') + ')' : ''}`);
  const loads = [];
  list.forEach(t => {
    if (['script', 'img', 'source', 'video', 'audio', 'track'].includes(t.tag)) ['src', 'poster'].forEach(a => t.attrs[a] && loads.push(t.attrs[a]));
    if (t.tag === 'link' && /stylesheet|icon|manifest|preload|modulepreload|prefetch|preconnect/.test(t.attrs.rel || '')) loads.push(t.attrs.href || '');
  });
  const remote = loads.filter(u => !isLocal(u));
  ok(remote.length === 0, `${name}: every file it loads comes from this site${remote.length ? ' (' + remote.join(' ') + ')' : ''}`);
  const blank = list.filter(t => t.tag === 'a' && t.attrs.target === '_blank' && !/noopener/.test(t.attrs.rel || ''));
  ok(blank.length === 0, `${name}: new-tab links cannot reach back into this page (rel=noopener)`);
}

for (const file of byExt('.css')) {
  const css = read(file);
  const urls = [...css.matchAll(/url\(\s*["']?([^"')]+)/g)].map(m => m[1]).filter(u => !isLocal(u));
  ok(urls.length === 0 && !/@import|expression\s*\(|javascript:/i.test(css), `${rel(file)}: loads nothing from another site`);
}

/* ---------- C. Files ---------- */

const SERVER = FILES.filter(f => /\.(php\d?|phtml|phar|inc|cgi|pl|py|rb|asp|aspx|jsp|sh|exe|dll)$/i.test(f) || /^\.(htaccess|user\.ini)$/.test(path.basename(f)));
ok(SERVER.length === 0, `no server-side code is published (${SERVER.map(rel).join(' ') || 'static files only'})`);
ok(fs.existsSync(path.join(ROOT, '.nojekyll')), '.nojekyll: GitHub Pages copies files as they are (no template engine runs on them)');
ok(!fs.existsSync(path.join(ROOT, '.github', 'workflows')), 'no CI workflow exists that a pull request could inject into (add one only after a security review)');
if (fs.existsSync(path.join(ROOT, 'CNAME'))) {
  const cname = read(path.join(ROOT, 'CNAME')).trim();
  ok(/^[a-z0-9.-]+\.[a-z]{2,}$/.test(cname) && !cname.includes('*'), `CNAME names one host (${cname})`);
}

const MAGIC = {
  '.webp': b => b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WEBP',
  '.png': b => b.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  '.jpg': b => b[0] === 0xff && b[1] === 0xd8, '.jpeg': b => b[0] === 0xff && b[1] === 0xd8,
  '.ico': b => b.readUInt32BE(0) === 0x00000100,
  '.webm': b => b.readUInt32BE(0) === 0x1a45dfa3,
  '.mp4': b => b.toString('latin1', 4, 8) === 'ftyp',
  '.woff2': b => b.toString('latin1', 0, 4) === 'wOF2'
};
const LIMIT = { '.webm': 40, '.mp4': 40, '.woff2': 0.5 };
const bad = [], big = [];
for (const file of FILES) {
  const ext = path.extname(file).toLowerCase();
  if (!MAGIC[ext]) continue;
  const bytes = fs.readFileSync(file);
  if (!MAGIC[ext](bytes)) bad.push(rel(file));
  if (bytes.length > (LIMIT[ext] || 5) * 1024 * 1024) big.push(rel(file));
}
ok(bad.length === 0, `every image, film and font is the format its name says${bad.length ? ' (' + bad.join(' ') + ')' : ''}`);
ok(big.length === 0, `no file is unexpectedly large${big.length ? ' (' + big.join(' ') + ')' : ''}`);
for (const file of byExt('.svg')) {
  const svg = read(file);
  const refs = [...svg.matchAll(/(?:xlink:)?href\s*=\s*["']([^"']*)/gi)].map(m => m[1]).filter(h => !h.startsWith('#'));
  ok(!/<script|<foreignObject|\son[a-z]+\s*=|javascript:/i.test(svg) && refs.length === 0,
    `${rel(file)}: no script, handler or outside link inside the SVG`);
}

/* ---------- D. Data ---------- */

function loadData(file) {
  const window = {};
  vm.runInNewContext(read(file), Object.freeze({ window }), { timeout: 1000 });
  return window;
}
function plain(value, where, out) {
  if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) return out;
  if (typeof value !== 'object') { out.push(where); return out; }
  for (const [k, v] of Object.entries(value)) plain(v, where + '.' + k, out);
  return out;
}
const dataDir = path.join(ROOT, 'data');
const hasData = fs.existsSync(path.join(dataDir, 'products.js'));
if (hasData) {
  const D = Object.assign(loadData(path.join(dataDir, 'site.js')), loadData(path.join(dataDir, 'products.js')));
  ok(Object.keys(D).every(k => /^MDM_[A-Z]+$/.test(k)), `data files only set MDM_ values (${Object.keys(D).join(', ')})`);
  const code = plain(D, 'data', []);
  ok(code.length === 0, `data files hold plain data, no functions${code.length ? ' (' + code.join(' ') + ')' : ''}`);
  const cats = new Set((D.MDM_CATEGORIES || []).map(c => c.id));
  const FILE = /^assets\/[a-z0-9/_.-]+\.(webp|png|jpe?g|svg|webm|mp4)$/;
  const problems = [];
  (D.MDM_PRODUCTS || []).forEach(p => {
    if (!/^[a-z0-9-]+$/.test(p.id || '')) problems.push(`${p.id}: id`);
    if (!cats.has(p.category)) problems.push(`${p.id}: category`);
    if (!['available', 'coming-soon', 'sold-out', 'hidden'].includes(p.status)) problems.push(`${p.id}: status`);
    if (p.animation && !/^[a-z-]+$/.test(p.animation)) problems.push(`${p.id}: animation`);
    [p.image, p.poster, p.video && p.video.webm, p.video && p.video.mp4].filter(Boolean).forEach(f => {
      if (!FILE.test(f) || f.includes('..') || !fs.existsSync(path.join(ROOT, f))) problems.push(`${p.id}: ${f}`);
    });
  });
  ok(problems.length === 0, `every product has a safe id, a known category and status, and real files on this site${problems.length ? ' (' + problems.join('; ') + ')' : ''}`);
  const S = D.MDM_SITE || {};
  const siteProblems = [];
  if (S.whatsapp && !/^[0-9]{6,15}$/.test(S.whatsapp)) siteProblems.push('whatsapp');
  ['instagram', 'tiktok', 'facebook', 'telegram'].forEach(k => { if (S[k] && !/^(@?[A-Za-z0-9._-]+|https:\/\/[^\s"'<>]+)$/.test(S[k])) siteProblems.push(k); });
  if (S.email && !/^[^\s@?&#<>"']+@[^\s@?&#<>"']+\.[a-z]{2,}$/i.test(S.email)) siteProblems.push('email');
  ok(siteProblems.length === 0, `contact details have the expected shape${siteProblems.length ? ' (' + siteProblems.join(', ') + ')' : ''}`);
}

/* ---------- E. Browser ---------- */

const ATTACKS = [
  '"><img src=x onerror="window.__pwned=\'img\'">',
  "'><svg onload=\"window.__pwned='svg'\">",
  '</h3><script>window.__pwned="script"</script>',
  '<a href="javascript:window.__pwned=\'a\'">x</a>',
  '" onmouseover="window.__pwned=\'attr\'" x="',
  '<iframe srcdoc="<script>parent.__pwned=1</script>"></iframe>',
  '{{constructor.constructor("window.__pwned=1")()}}'
];
const URL_ATTACKS = [
  'javascript:window.__pwned="url"', 'java\tscript:window.__pwned="tab"', ' JaVaScRiPt:window.__pwned="case"',
  'data:text/html,<script>window.__pwned=1</script>', '//evil.example/x.webp', 'https://evil.example/x.webp'
];
const pick = (list, s) => list[[...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % list.length];
function poison(value, key) {
  if (Array.isArray(value)) return value.map(v => poison(v, key));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = k === 'status' ? v : poison(v, k);
    return out;
  }
  if (['image', 'poster', 'webm', 'mp4'].includes(key)) return pick(URL_ATTACKS, value);
  if (typeof value === 'number') return value + '" onload="window.__pwned=\'num\'';
  if (typeof value === 'string') return value + pick(ATTACKS, value);
  return value;
}
function hostileData() {
  const D = loadData(path.join(dataDir, 'products.js'));
  const products = poison(D.MDM_PRODUCTS);
  products[0].status = 'available';
  // Ingredient names are also used to look up icons: try the object's own built-in keys.
  const withIngredients = products.find(p => p.ingredients && p.ingredients.length);
  if (withIngredients) { withIngredients.ingredients[0].en.name = '__proto__'; if (withIngredients.ingredients[1]) withIngredients.ingredients[1].en.name = 'constructor'; }
  const site = {
    whatsapp: '9613496329"><img src=x onerror="window.__pwned=\'wa\'">',
    phone: '<img src=x onerror="window.__pwned=\'phone\'">',
    instagram: 'javascript:window.__pwned="ig"',
    tiktok: 'java\tscript:window.__pwned="tt"',
    facebook: 'https://evil.example/" onmouseover="window.__pwned=\'fb\'',
    telegram: 'data:text/html,<script>window.__pwned=1</script>',
    email: 'x@evil.example?cc=victim@evil.example&body=<script>window.__pwned=1</script>',
    location_en: ATTACKS[0], location_ar: ATTACKS[1], location_fr: ATTACKS[2],
    hours_en: ATTACKS[3], hours_ar: ATTACKS[4], hours_fr: ATTACKS[5]
  };
  return {
    products: `window.MDM_CATEGORIES = ${JSON.stringify(poison(D.MDM_CATEGORIES))};\nwindow.MDM_PRODUCTS = ${JSON.stringify(products)};\n`,
    site: `window.MDM_SITE = ${JSON.stringify(site)};\n`
  };
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript',
  '.webp': 'image/webp', '.png': 'image/png', '.ico': 'image/x-icon', '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.webm': 'video/webm', '.mp4': 'video/mp4' };
const server = http.createServer((req, res) => {
  let name = decodeURIComponent(req.url.split('?')[0]);
  if (name.endsWith('/')) name += 'index.html';
  const file = path.join(ROOT, path.normalize(name));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    return fs.existsSync(path.join(ROOT, '404.html')) ? res.end(read(path.join(ROOT, '404.html'))) : res.end();
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

const WATCH = () => {
  window.__csp = [];
  document.addEventListener('securitypolicyviolation', e => window.__csp.push(e.violatedDirective + ' ' + (e.blockedURI || '')));
};
const POKE = async page => page.evaluate(async () => {
  const targets = [...document.querySelectorAll('main button, main [role="button"], main [data-product-id], main .pcard, main .card')]
    .filter(el => el.offsetParent !== null).slice(0, 80);
  for (const el of targets) {
    for (const type of ['pointerover', 'pointerenter', 'mouseover', 'mouseenter', 'focus', 'click']) {
      el.dispatchEvent(new (type.startsWith('pointer') ? PointerEvent : MouseEvent)(type, { bubbles: true }));
    }
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  }
  await new Promise(r => setTimeout(r, 400));
});
const INSPECT = page => page.evaluate(() => {
  const data = [...document.querySelectorAll('script[type="application/ld+json"]')];
  const json = data.map(s => { try { JSON.parse(s.textContent); return true; } catch (e) { return false; } });
  const all = [...document.querySelectorAll('*')];
  const handlers = all.filter(el => [...el.attributes].some(a => /^on/i.test(a.name))).map(el => el.tagName);
  const resolve = v => { try { return new URL(v, location.href); } catch (e) { return { href: v, origin: 'invalid', protocol: 'invalid' }; } };
  const hrefs = [...document.querySelectorAll('[href]')].map(el => resolve(el.getAttribute('href')));
  const unsafe = hrefs.filter(u => !(u.origin === location.origin || ['https:', 'mailto:', 'tel:'].includes(u.protocol))).map(u => u.href);
  const files = [...document.querySelectorAll('[src], [poster]')].flatMap(el => ['src', 'poster'].map(a => el.getAttribute(a)).filter(Boolean)).map(resolve);
  return {
    pwned: window.__pwned, csp: window.__csp, handlers, unsafe,
    foreignFiles: files.filter(u => u.origin !== location.origin).map(u => u.href),
    scripts: document.querySelectorAll('script:not([type="application/ld+json"])').length,
    dataBlocks: json.length, dataValid: json.every(Boolean),
    products: document.querySelectorAll('[data-product-id], .pcard').length,
    frames: document.querySelectorAll('iframe, object, embed').length,
    mailtoHeaders: hrefs.filter(u => u.protocol === 'mailto:' && /[?&]/.test(u.href)).map(u => u.href),
    shownAsText: document.body.textContent.includes('onerror=')
  };
});

const { chromium } = require('playwright');
(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const BASE = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch();
  const pagePaths = PAGES.map(f => '/' + rel(f).replace(/index\.html$/, ''));

  async function open(url, { hostile = false, workers = 'block' } = {}) {
    const ctx = await browser.newContext({ serviceWorkers: workers });
    const page = await ctx.newPage();
    const errors = [], foreign = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('request', r => { if (!r.url().startsWith(BASE) && !/^(data|blob):/.test(r.url())) foreign.push(r.url()); });
    await page.addInitScript(WATCH);
    if (hostile) {
      const H = hostileData();
      await page.route('**/data/products.js', r => r.fulfill({ contentType: 'application/javascript', body: H.products }));
      await page.route('**/data/site.js', r => r.fulfill({ contentType: 'application/javascript', body: H.site }));
    }
    await page.goto(url, { waitUntil: 'networkidle' });
    return { ctx, page, errors, foreign };
  }

  // 1. Every page, as published: no violation, no error, nothing from elsewhere.
  for (const p of pagePaths) {
    const { ctx, page, errors, foreign } = await open(BASE + p, { workers: p === '/' ? 'allow' : 'block' });
    if (p === '/') await page.waitForTimeout(1500);
    const i = await INSPECT(page);
    ok(i.csp.length === 0, `${p}: loads with no policy violation${i.csp.length ? ' (' + i.csp.join(' | ') + ')' : ''}`);
    ok(i.dataValid, `${p}: its search-engine data (${i.dataBlocks} JSON-LD blocks) is valid JSON`);
    ok(errors.length === 0, `${p}: no script errors${errors.length ? ' (' + errors.join(' | ') + ')' : ''}`);
    ok(foreign.length === 0, `${p}: nothing is requested from another site${foreign.length ? ' (' + foreign.slice(0, 3).join(' ') + ')' : ''}`);
    const pageFile = PAGES.find(f => '/' + rel(f).replace(/index\.html$/, '') === p);
    if (/^\/(ar\/|fr\/)?$/.test(p) && /fonts\.css/.test(read(pageFile))) {
      const fonts = await page.evaluate(async () => { await document.fonts.ready; return [...new Set([...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/["']/g, '')))]; });
      const want = p === '/ar/' ? ['Amiri', 'Tajawal'] : ['Cormorant Garamond', 'Jost'];
      ok(want.every(f => fonts.includes(f)), `${p}: the site's own fonts load (${fonts.join(', ') || 'none'})`);
    }
    if (p === '/') {
      const scripted = SCRIPTED.has(p);
      const sw = await page.evaluate(async () => !!(navigator.serviceWorker && await navigator.serviceWorker.getRegistration()));
      const hasWorker = fs.existsSync(path.join(ROOT, 'sw.js')) && byExt('.js').some(f => /serviceWorker\.register\(/.test(read(f)));
      if (scripted && hasWorker) ok(sw, '/: the site worker still registers under Trusted Types');
      const refused = await page.evaluate(async () => {
        const r = {};
        try { document.body.innerHTML = '<b>x</b>'; r.html = false; } catch (e) { r.html = true; }
        // DevTools lets code it evaluates use eval, so try it from a normal task.
        await new Promise(done => setTimeout(() => {
          try { r.evalRan = eval('1 + 1') === 2; } catch (e) { r.evalRan = false; }
          try { r.fnRan = new Function('return 1')() === 1; } catch (e) { r.fnRan = false; }
          done();
        }, 0));
        try { window.trustedTypes.createPolicy('attacker', { createHTML: s => s }); r.policy = true; } catch (e) { r.policy = false; }
        try { await navigator.serviceWorker.register('/sw.js?attacker=1'); r.worker = true; } catch (e) { r.worker = false; }
        const s = document.createElement('script');
        s.appendChild(document.createTextNode('window.__inline = 1'));
        document.head.appendChild(s);
        r.inline = window.__inline === 1;
        return r;
      });
      if (scripted) {
        ok(refused.html, '/: the browser refuses innerHTML (Trusted Types)');
        ok(!refused.policy, '/: no other Trusted Types policy can be created');
        ok(!refused.worker, '/: no other file can be registered as a worker');
      }
      ok(!refused.evalRan && !refused.fnRan, '/: the browser refuses eval and new Function');
      ok(!refused.inline, '/: an injected inline script does not run');
      if (scripted) {
        const builder = await page.evaluate(withJson => {
          const D = window.MDM_DOM, r = {};
          const throws = f => { try { f(); return false; } catch (e) { return true; } };
          r.script = throws(() => D.el('script', { src: '/x.js' })) && throws(() => D.el('script', { type: 'application/ld+json' }, 'alert(1)'));
          r.frames = ['iframe', 'object', 'embed', 'base'].every(t => throws(() => D.el(t)));
          r.handlers = throws(() => D.el('a', { onclick: 'x' })) && throws(() => D.el('a', { OnMouseOver: 'x' })) && throws(() => D.el('div', { style: 'x' }));
          r.links = ['javascript:alert(1)', 'java\tscript:alert(1)', ' JAVASCRIPT:alert(1)', 'data:text/html,x', 'vbscript:x'].every(u => !D.el('a', { href: u }).hasAttribute('href'));
          r.files = ['https://evil.example/x.webp', '//evil.example/x.webp'].every(u => !D.el('img', { src: u }).hasAttribute('src'));
          r.text = D.el('p', null, '<b>x</b>').innerHTML === '&lt;b&gt;x&lt;/b&gt;';
          if (withJson) {
            const block = D.jsonLd('t', { a: '</script><script>window.__pwned=1</script>' });
            document.head.appendChild(block);
            r.json = block.type === 'application/ld+json' && JSON.parse(block.textContent).a.includes('</script>') && window.__pwned === undefined;
            block.remove();
          } else {
            r.json = throws(() => D.jsonLd('t', {})); // no JSON policy on this page: the browser refuses it
          }
          return r;
        }, JSONLD.has(p));
        ok(builder.script && builder.frames, '/: the page builder refuses scripts and frames (JSON-LD data has its own JSON-only path)');
        ok(builder.handlers, '/: the page builder refuses event-handler and style attributes');
        ok(builder.links && builder.files, '/: the page builder drops javascript:, data:, vbscript: links and outside files');
        ok(builder.text && builder.json, '/: the page builder puts text in as text, even inside JSON-LD');
      }
    }
    await ctx.close();
  }

  // 2. Every text in the data files replaced with attack strings.
  if (hasData) {
    const scriptedFiles = PAGES.filter(f => /data\/products\.js/.test(read(f)));
    const scripted = scriptedFiles.map(f => '/' + rel(f).replace(/index\.html$/, ''));
    const expectedScripts = Object.fromEntries(scriptedFiles.map((f, n) => [scripted[n],
      (read(f).match(/<script\b(?![^>]*application\/ld\+json)/g) || []).length]));
    for (const p of scripted) {
      const { ctx, page, errors, foreign } = await open(BASE + p, { hostile: true });
      await POKE(page);
      const i = await INSPECT(page);
      ok(i.products > 0, `${p} hostile data: the products still render (${i.products}), so the attacks were really tried`);
      ok(i.pwned === undefined, `${p} hostile data: no attack ran (${i.pwned === undefined ? 'none' : i.pwned})`);
      ok(i.handlers.length === 0, `${p} hostile data: no element gained an event handler${i.handlers.length ? ' (' + i.handlers.join(',') + ')' : ''}`);
      ok(i.scripts === expectedScripts[p] && i.frames === 0, `${p} hostile data: no script, frame or object was added (${i.scripts} scripts, as in the page)`);
      ok(i.dataValid, `${p} hostile data: the search-engine data (${i.dataBlocks} JSON-LD blocks) is still valid JSON, the attacks inside it plain strings`);
      ok(i.unsafe.length === 0, `${p} hostile data: every link is https, mailto, tel or this site${i.unsafe.length ? ' (' + i.unsafe.join(' ') + ')' : ''}`);
      ok(i.foreignFiles.length === 0 && foreign.length === 0, `${p} hostile data: no file is loaded from another site${foreign.length ? ' (' + foreign.join(' ') + ')' : ''}`);
      ok(i.mailtoHeaders.length === 0, `${p} hostile data: the email link cannot add cc, bcc or body`);
      ok(i.csp.length === 0, `${p} hostile data: nothing even reached the browser's policy${i.csp.length ? ' (' + i.csp.join(' | ') + ')' : ''}`);
      ok(i.shownAsText, `${p} hostile data: attack strings appear as plain text`);
      ok(errors.length === 0, `${p} hostile data: no script errors${errors.length ? ' (' + errors.slice(0, 2).join(' | ') + ')' : ''}`);
      await ctx.close();
    }
  }

  await browser.close();
  server.close();
  console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL SECURITY CHECKS PASSED');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
