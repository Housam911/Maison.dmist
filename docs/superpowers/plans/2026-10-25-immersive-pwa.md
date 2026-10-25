# Maison d'Mist Immersive PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship and publish a verified trilingual body-care site with real launch products, persistent appearance choices, supplied product videos, and an installable offline-capable PWA.

**Architecture:** Keep the existing no-build GitHub Pages site and editable JavaScript data files. Add small single-purpose browser scripts for languages, themes, media, and PWA registration, plus an additive stylesheet and a root service worker. Generate optimized assets without altering source files, then run the existing Chromium release checks before committing and pushing `main`.

**Tech Stack:** HTML, CSS, vanilla JavaScript, GitHub Pages, Web App Manifest, Service Worker, Playwright/Chromium, Python/Pillow for asset derivatives, FFmpeg for supplied-video derivatives.

**Spec:** `docs/superpowers/specs/2026-10-25-immersive-pwa-design.md`

## Global Constraints

- Plain HTML/CSS/JS only; no framework, bundler, backend, or production package dependency.
- English `/`, Arabic `/ar/` with RTL, French `/fr/`; both other languages are LTR.
- Preserve `file://` readability and JavaScript-off content; enhancements must fail gracefully.
- Replace all sample products with Fresh Mist Lotion 250 ml and Soft Bloom Butter Cream 250 g; no guessed prices or international WhatsApp number.
- Use only `03 496 329` and `maison.dm` from supplied labels; no invented country code.
- Use the exact user-supplied videos; never substitute the discarded CSS assembly prototypes.
- Do not alter source images/videos, `CNAME`, DNS, the Claude GitHub app, or any other repository.
- The user has authorized commits and publication to `Housam911/Maison.dmist` for this finished, verified release only.

## Review Focus

- Offline/cache misses and partial media responses: serve a localized page or poster, never a blank area or fabricated complete video; Tasks 4 and 5 test complete `200` responses, rejected `206` responses, and unavailable media.
- Storage blocked, quota exceeded, or service-worker registration rejected: the ordinary page and theme controls still work without unhandled rejections; Tasks 3 and 5 assert graceful fallback.
- OS theme changes, explicit overrides, and multiple tabs: System follows the OS while explicit Light/Dark persists correctly; Task 3 pins the expected meta value and storage behavior.
- Long French strings, Arabic RTL, and 320–414 px screens: no horizontal overflow, clipped controls, or two-line CTA labels; Tasks 2, 4, and 6 assert these layouts.
- Missing local video sources or unsupported decoding: keep real posters and localized HTML ingredient details, with no unhandled playback promise; Task 4 asserts the failure path and blocks final publication if production video sources remain unavailable.

---

### Task 1: Real product data and contact rendering

**Files:**
- Modify: `data/products.js`, `data/site.js`, `assets/js/site.js`
- Create: `assets/img/products/fresh-mist-lotion.webp`, `assets/img/products/soft-bloom-butter.webp`
- Test: `tools/check-site.cjs`

**Interfaces:**
- Consumes: existing `window.MDM_PRODUCTS`, `window.MDM_SITE`, and `productCard(p)` / `renderContact()` behavior.
- Produces: each product exposes `{ id, status, image, size, price, en, ar, fr, ingredients, poster, video }`; `ingredients` contains exact English/Arabic/French name/detail objects. `renderContact()` emits a local `tel:03496329` link and `https://instagram.com/maison.dm`, with no WhatsApp link while `whatsapp` is empty.

- [ ] **Step 1: Add failing release assertions**

In the browser-data section of `tools/check-site.cjs`, collect `names`, `ingredients`, `phoneHref`, and `instagramHref`, then assert:

```js
ok(i.names.join('|') === 'Fresh Mist Lotion|Soft Bloom Butter Cream', 'real products replace all samples');
ok(i.ingredients.lotion.join('|') === 'Rose Water|Shea Butter|Rose Oil|Coconut Oil|Sweet Almond Oil|Glycerin|Panthenol', 'exact lotion ingredients');
ok(i.ingredients.butter.join('|') === 'Beeswax|Coconut Oil|Shea Butter|Cocoa Butter', 'exact butter ingredients');
ok(i.phoneHref === 'tel:03496329' && i.instagramHref === 'https://instagram.com/maison.dm', 'label contact details without guessed WhatsApp');
```

- [ ] **Step 2: Run the checks and confirm the new assertions fail**

Run: `node tools/check-site.cjs`
Expected: FAIL on sample products and blank contact data. If Playwright/Chromium is missing, install the documented test-only prerequisites (`npm install --global playwright` and `npx playwright install chromium`), then rerun; do not add a production manifest or dependency.

- [ ] **Step 3: Implement product/contact data and rendering**

Replace all sample entries with the two exact products, empty `price`, localized `en`/`ar`/`fr` content, and exact ingredient lists. Add `location_fr` and `hours_fr`. Extend language detection to `fr`, add French UI/contact labels, and make local phone links use `tel:` plus digits without forcing `+`. Generate optimized WebP derivatives from `UP1.png` and `UP2.png`, preserving the originals.

- [ ] **Step 4: Rerun checks and commit**

Run: `node tools/check-site.cjs`
Expected: new product/contact assertions PASS; existing checks remain green.

```bash
git add data/products.js data/site.js assets/js/site.js assets/img/products tools/check-site.cjs
git commit -m "feat: add real launch products and contact details"
```

### Task 2: French page and language navigation

**Files:**
- Create: `fr/index.html`, `assets/js/languages.js`, `assets/css/experience.css`
- Modify: `index.html`, `ar/index.html`, `404.html`, `sitemap.xml`, `tools/check-site.cjs`

**Interfaces:**
- Consumes: Task 1's `fr` product/contact data.
- Produces: `window.MDM_Languages.start()` initializes one accessible dropdown per page; each option links to `/`, `/ar/`, or `/fr/`. All three pages expose matching `en`, `ar`, `fr`, and `x-default` alternate links.

- [ ] **Step 1: Add failing French and selector assertions**

Assert `/fr/` has `lang="fr"`, `dir="ltr"`, canonical `/fr/`, all four alternates, and French navigation; every language page links to all three languages; sitemap contains `/fr/`; the 404 contains French. Exercise Tab, arrows, Enter, Escape, outside click, and focus restoration:

```js
ok(i.lang === 'fr' && i.dir === 'ltr' && i.canonical === 'https://maisondmist.com/fr/', 'French document metadata');
ok(i.alternates === 'en|ar|fr|x-default', 'complete language alternates');
ok(i.menuEscapeClosed && i.menuFocusRestored, 'language menu keyboard behavior');
```

- [ ] **Step 2: Run checks and confirm failure**

Run: `node tools/check-site.cjs`
Expected: FAIL because `/fr/` and the refined dropdown do not exist.

- [ ] **Step 3: Implement static French content and `window.MDM_Languages.start()`**

Create the complete French page and trilingual 404. Update English/Arabic metadata and sitemap. Implement full-name English/Français/العربية dropdown options with Escape/outside dismissal and focus restoration. Put its styling in the new additive stylesheet without replacing base rules.

- [ ] **Step 4: Rerun checks and commit**

Run: `node tools/check-site.cjs`
Expected: French and selector assertions PASS.

```bash
git add fr/index.html assets/js/languages.js assets/css/experience.css index.html ar/index.html 404.html sitemap.xml tools/check-site.cjs
git commit -m "feat: add French site and refined language navigation"
```

### Task 3: System, Original Light, and Dark Luxury preferences

**Files:**
- Create: `assets/js/theme.js`
- Modify: `assets/css/experience.css`, `index.html`, `ar/index.html`, `fr/index.html`, `tools/check-site.cjs`

**Interfaces:**
- Consumes: the language pages and stylesheet from Task 2.
- Produces: `window.MDM_Theme.start()` synchronizes `<meta name="color-scheme">`, `theme-color`, root theme tokens, accessible control state, and the optional `localStorage` key `mdm-theme` (`light` or `dark`; System has no stored key).

- [ ] **Step 1: Add failing theme assertions**

Cover System with OS light/dark, explicit Light/Dark, reload persistence, cross-tab `storage`, blocked storage, and first-paint application:

```js
ok(i.systemDarkMeta === 'light dark', 'System follows OS without a stored override');
ok(i.darkMeta === 'dark' && i.darkStored === 'dark', 'Dark Luxury override persists');
ok(i.systemAfterResetStorage === null, 'System removes the explicit override');
ok(i.blockedStoragePageUsable && i.noUnhandledRejections, 'blocked storage degrades safely');
```

- [ ] **Step 2: Run checks and confirm failure**

Run: `node tools/check-site.cjs`
Expected: FAIL because no synchronized theme control exists.

- [ ] **Step 3: Implement theme tokens and `window.MDM_Theme.start()`**

Add early `color-scheme` metadata and a minimal guarded override script. Keep the non-JavaScript baseline `light dark`; use `light-dark()` with `@media (prefers-color-scheme: dark)` and `@supports` fallbacks. Implement System, Original Light, and Dark Luxury with ivory/muted antique gold, cross-tab synchronization, and no forced reload.

- [ ] **Step 4: Rerun checks and commit**

Run: `node tools/check-site.cjs`
Expected: all theme assertions PASS.

```bash
git add assets/js/theme.js assets/css/experience.css index.html ar/index.html fr/index.html tools/check-site.cjs
git commit -m "feat: add persistent light and dark luxury themes"
```

### Task 4: Supplied video playback and accessible ingredients

**Files:**
- Create: `assets/js/media.js`, `assets/video/fresh-mist-lotion.webm`, `assets/video/fresh-mist-lotion.mp4`, `assets/video/soft-bloom-butter.webm`, `assets/video/soft-bloom-butter.mp4`
- Modify: `assets/css/experience.css`, `data/products.js`, `assets/js/site.js`, `tools/check-site.cjs`

**Interfaces:**
- Consumes: Task 1's product `ingredients`, `poster`, and `video` fields; the source videos supplied by the user.
- Produces: `window.MDM_Media.start()` exposes localized HTML ingredient details and accessible video play/pause; videos remain paused initially, use real posters, and never autoplay under reduced motion.

- [ ] **Step 1: Confirm source assets, then write failing media assertions**

Obtain the user's local video paths; if unavailable, record this task as blocked and do not publish a substituted animation. Generate fixture videos only for automated tests, clearly outside the production asset list. Assert initial paused state, hover/tap/keyboard operation, offscreen pause, reduced motion, localized ingredient details, and decode/missing-file fallback:

```js
ok(i.initialPaused && i.posterVisible, 'video starts as a real poster');
ok(i.keyboardPlayback && i.offscreenPaused, 'accessible and offscreen playback');
ok(i.endedResetsToStart, 'completed video resets to its opening frame');
ok(i.reducedMotionPaused && i.ingredientPanelTranslated, 'reduced motion and localized HTML ingredients');
ok(i.missingVideoKeepsPoster && i.noUnhandledRejections, 'media failure is graceful');
```

- [ ] **Step 2: Run checks and confirm failure**

Run: `node tools/check-site.cjs`
Expected: FAIL because playback and accessible ingredient panels are not implemented.

- [ ] **Step 3: Implement optimized videos and `window.MDM_Media.start()`**

Create WebM/MP4 derivatives without altering sources. Use `muted`, `playsinline`, explicit dimensions, `preload="none"` below the fold, native controls, real posters, and an intentional near-black stage. Implement hover play/pause, touch/keyboard toggles, offscreen pause, reset to the opening frame after completion, reduced-motion behavior, and localized HTML ingredient details. Do not rely on native media lazy loading.

- [ ] **Step 4: Rerun checks and commit**

Run: `node tools/check-site.cjs`
Expected: media and ingredient assertions PASS.

```bash
git add assets/js/media.js assets/css/experience.css assets/video data/products.js assets/js/site.js tools/check-site.cjs
git commit -m "feat: add accessible supplied product animations"
```

### Task 5: Installable PWA and resilient offline cache

**Files:**
- Create: `sw.js`, `assets/js/pwa.js`, `offline.html`, `assets/img/icon-maskable-192.png`, `assets/img/icon-maskable-512.png`
- Modify: `site.webmanifest`, `index.html`, `ar/index.html`, `fr/index.html`, `tools/check-site.cjs`

**Interfaces:**
- Consumes: all final pages, data, styles, scripts, icons, posters, and video responses from Tasks 1–4.
- Produces: `window.MDM_PWA.start()` registers the root service worker when supported and exposes a localized update prompt. `sw.js` uses versioned `mdm-*` caches and network-first navigation with `/offline.html` fallback.

- [ ] **Step 1: Add failing manifest/offline/update assertions**

Use fresh and populated browser contexts to assert install icons, registration, all three offline pages, data revalidation, fully downloaded video reuse, rejected partial `206` caching, cache cleanup, update prompting, blocked registration, and storage/quota failures:

```js
ok(i.manifestIcons.includes('icon-maskable-512.png'), 'dedicated maskable app icon');
ok(i.offlineFrench && i.offlineArabic && i.offlineEnglish, 'offline navigation in every language');
ok(i.completeVideoCached && !i.partialVideoCached, 'only complete 200 video responses are reusable');
ok(i.registrationFailureUsable && i.noUnhandledRejections, 'PWA failure leaves site usable');
```

- [ ] **Step 2: Run checks and confirm failure**

Run: `node tools/check-site.cjs`
Expected: FAIL because no service worker or complete manifest exists.

- [ ] **Step 3: Implement manifest, `sw.js`, and `window.MDM_PWA.start()`**

Precache all three pages, `/offline.html`, code, data, brand icons, and posters. Use network-first HTML, stale-while-revalidate data, cache-first versioned assets, and complete-`200`-only video caching. Never intercept external destinations or fabricate range responses. Clean only `mdm-*` caches and offer a reload prompt without interrupting playback. Registration failures remain nonfatal.

- [ ] **Step 4: Rerun checks and commit**

Run: `node tools/check-site.cjs`
Expected: PWA and offline assertions PASS.

```bash
git add sw.js assets/js/pwa.js offline.html assets/img/icon-maskable-192.png assets/img/icon-maskable-512.png site.webmanifest index.html ar/index.html fr/index.html tools/check-site.cjs
git commit -m "feat: make Maison d'Mist an installable offline PWA"
```

### Task 6: Documentation, full verification, and publication

**Files:**
- Modify: `.gitignore`, `README.md`, `CHANGELOG.md`, `VERSION`, `docs/TECHNICAL-REPORT.md`, `tools/check-site.cjs`

**Interfaces:**
- Consumes: every preceding task's public interface and test result.
- Produces: version `0.20`, honest verification documentation, and the verified `main` publication requested by the user.

- [ ] **Step 1: Complete the final test matrix and documentation**

Add required 320/375/390/414/768/1440 layout checks, JavaScript-off and `file://` coverage, and update release documentation to describe exactly what was delivered and verified. Add `.superpowers/` to `.gitignore`; do not add preview artifacts or unused source-library images to the commit. Set `VERSION` to `0.20`.

- [ ] **Step 2: Run the complete release check**

Run: `node tools/check-site.cjs`
Expected: exit `0`, `ALL PASSED`, no skipped French/theme/media/PWA checks. Then manually verify offline reload and an actual Chrome/Edge PC install with the Maison d'Mist icon. Record phone-install verification as unverified if no device is available.

- [ ] **Step 3: Review the deliverable and commit**

Run: `git status --short`, `git diff --check`, and `git diff --stat`.
Expected: no whitespace errors, `.superpowers/` absent, source assets preserved, and only intended release files included. If Task 4's production videos are still missing, STOP before this commit and report the blocker.

```bash
git add .gitignore README.md CHANGELOG.md VERSION docs/TECHNICAL-REPORT.md docs/superpowers/specs/2026-10-25-immersive-pwa-design.md docs/superpowers/plans/2026-10-25-immersive-pwa.md tools/check-site.cjs
git commit -m "release: Maison d'Mist 0.20 immersive PWA"
```

- [ ] **Step 4: Publish only after every check passes**

Confirm `git remote -v` points only to `Housam911/Maison.dmist`, then:

```bash
git push origin main
```

Wait for GitHub Pages and verify the deployed result, not merely the push:

```powershell
curl.exe -sI https://maisondmist.com
curl.exe -sI https://maisondmist.com/ar/
curl.exe -sI https://maisondmist.com/fr/
curl.exe -s https://maisondmist.com/VERSION
```

Expected: all three pages return `HTTP/1.1 200 OK` and `VERSION` is `0.20`. Also verify the live French page, theme choice, service worker, and supplied videos in the real browser; report any phone-only check that remains unverified.
