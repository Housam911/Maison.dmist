# Maison d'Mist immersive PWA — production design

**Date:** 2026-10-25  
**Status:** awaiting written-spec approval  
**Working tree:** local only; no commit, push, deployment, or live-repository edit is authorized by this document

## 1. Outcome

Turn the existing static Maison d'Mist site into a polished, installable body-care experience that works on phones and PCs, supports English, Arabic, and French, presents the real Fresh Mist Lotion and Soft Bloom Butter Cream, and lets each visitor choose the original light appearance or Dark Luxury.

Success means a visitor can install the site with a Maison d'Mist app icon, open previously visited content offline, switch languages and themes without losing the preference, view the supplied product animations on demand, inspect ingredients accessibly, and contact the brand without encountering sample products or guessed contact links.

## 2. Existing constraints

- Keep GitHub Pages hosting and the existing `main` / root setup.
- Keep the plain HTML, CSS, and JavaScript runtime. No framework, bundler, package dependency, account system, cart, checkout, payment, or backend is added.
- Preserve the current editable-data model: `data/products.js` and `data/site.js` remain the places a non-programmer edits products and contact details.
- Preserve double-click `file://` readability. The service worker is a progressive enhancement over HTTP(S), not a requirement for opening the HTML from disk.
- Preserve English LTR and Arabic RTL support. French is LTR.
- Do not overwrite or delete the user's supplied images. Production uses optimized derivatives.
- Do not publish unconfirmed prices, stock claims, ingredient certifications, medical claims, or an international WhatsApp number that has not been supplied.
- The user's animation work replaces the earlier CSS assembly prototypes. No CSS bottle/jar assembly system will be carried into production.

## 3. Release scope

### Included

1. Installable PWA with branded phone/PC icons and offline behavior.
2. English `/`, Arabic `/ar/`, and new French `/fr/` pages.
3. Original Light, Dark Luxury, and System appearance choices with persistence.
4. Fresh Mist Lotion and Soft Bloom Butter Cream as the two launch products.
5. User-supplied lotion and butter animation videos with accessible playback and ingredient details.
6. Responsive, keyboard-accessible navigation, language selector, product controls, and video controls.
7. Updated documentation and the existing Chromium release-check script.
8. Local verification only in this stage. Publishing is a separate, explicit decision.

### Not included in this release

- Additional soaps or other products whose names, availability, and prices have not been confirmed.
- E-commerce, customer accounts, analytics, stock management, or a new hosting platform.
- Automatic translation at runtime. Each language has reviewed static content.
- Autoplaying product videos or forcing motion on visitors who prefer reduced motion.

## 4. Content and languages

### Shared brand direction

The copy moves from fragrance-mist-only language to botanical body care while retaining **Scent Soft Skin**. The existing olive/cream identity remains the light appearance. Dark Luxury uses near-black olive, ivory, and muted antique gold rather than bright yellow gold.

### French

Create a complete French page, not a partial overlay:

- `lang="fr"`, `dir="ltr"`, `data-root=".."`.
- French navigation, hero, collection, ritual, house, contact, footer, ingredient descriptions, video controls, theme controls, validation text, and offline message.
- French product names and descriptions in `data/products.js`; `location_fr` and `hours_fr` in `data/site.js`.
- `og:locale=fr`, appropriate alternate locales, canonical `/fr/`, and `hreflang` links among `en`, `ar`, `fr`, and `x-default` on every language page.
- French added to `sitemap.xml` and to the bilingual 404 page, making that page trilingual.

### Language selector

Use one restrained dropdown showing the current language code and full language names: **English**, **Français**, **العربية**. It links to the corresponding static page rather than translating in place. It supports Tab, arrow keys, Enter, Escape, outside-click dismissal, visible focus, and the current-page state. It must not look like three generic pill buttons.

## 5. Appearance system

Define semantic color tokens for both appearances in an additive stylesheet without replacing the existing base rules; only small integration fixes belong in `assets/css/site.css`.

- **System:** follow the OS when no explicit choice is stored. This is the default.
- **Original Light:** pin the existing cream/olive presentation.
- **Dark Luxury:** pin near-black olive, ivory, and antique gold.

Implementation follows the `color-scheme` / `light-dark()` guidance with fallbacks:

- Add `<meta name="color-scheme" content="light dark">` before CSS.
- Keep `:root { color-scheme: light dark; }` as the non-JavaScript baseline.
- A small inline head script applies only a stored explicit override before first paint, with `try/catch` around storage access.
- The full control updates the meta value, root tokens, `theme-color`, accessible label, and stored preference.
- A `storage` listener synchronizes multiple tabs. Returning to System removes the override rather than pinning it.
- Native scrollbars, controls, text, borders, and imagery remain legible in both appearances and in forced-color modes where practical.

The product-video stage is intentionally near-black in both appearances, with a deliberate border and lighting. Do not use blend-mode tricks that erase dark label text or pretend the supplied video background is transparent.

## 6. Launch products and contact data

Replace every sample product in `data/products.js` with:

| Product | Size | Image | Ingredients shown in the accessible detail view |
|---|---:|---|---|
| Fresh Mist Lotion | 250 ml | optimized derivative of `UP1.png` | Rose Water, Shea Butter, Rose Oil, Coconut Oil, Sweet Almond Oil, Glycerin, Panthenol |
| Soft Bloom Butter Cream | 250 g | optimized derivative of `UP2.png` | Beeswax, Coconut Oil, Shea Butter, Cocoa Butter |

Each product has English, Arabic, and French names/descriptions, a poster image, video sources, and translated ingredient names/details. Prices remain hidden until supplied. Do not display the former sample cards.

Use only contact details visible on the supplied product labels:

- Phone display: `03 496 329`; generate a local telephone link without adding a country code or an unnecessary leading `+`.
- Instagram: `maison.dm`.
- WhatsApp ordering stays disabled until the international WhatsApp number is supplied. Never guess the country code.

Other supplied image files remain untouched in the asset library and are not automatically published as products.

## 7. Supplied animation videos

Use the exact user-supplied lotion and butter videos. Do not substitute the earlier prototype animations. The attached videos are not currently files in the workspace, so integration requires the user to place the source files in the project or supply their local paths. Other PWA, language, content, and theme work does not depend on that step.

Produce optimized web sources and posters without changing the originals:

- `assets/video/fresh-mist-lotion.webm` and `.mp4`
- `assets/video/soft-bloom-butter.webm` and `.mp4`
- `assets/img/products/fresh-mist-lotion.webp` and `soft-bloom-butter.webp`

Behavior:

- No autoplay on initial page load.
- Hover on a fine pointer plays the full supplied sequence from its current position; leaving pauses it. A completed sequence resets to the opening frame for the next visit.
- Tap or keyboard activation toggles play/pause. Native controls remain available as a fallback.
- `muted`, `playsinline`, explicit `width`/`height`, and a real poster prevent layout shift and mobile surprises.
- Offscreen videos pause through `IntersectionObserver`. Below-the-fold videos use `preload="none"`; native `loading="lazy"` is progressive enhancement, not a dependency.
- `prefers-reduced-motion` starts videos paused and keeps the poster until deliberate activation.
- Ingredient names and details are real HTML, not text baked only into the video. Hover, focus, or tap reveals the translated detail panel, with a click/tap state usable on touch devices.

## 8. PWA and offline design

The existing manifest already provides the app name and branded icons. Complete it with an explicit `id`, launch scope, description, categories, `prefer_related_applications: false`, and maskable icon variants. Keep the Maison d'Mist icon distinct from the favicon.

Add a root `sw.js` and a small `assets/js/pwa.js` registration script:

- **Precache on install:** `/`, `/ar/`, `/fr/`, `/offline.html`, the manifest, CSS, JavaScript, product/contact data, brand icons, and optimized launch-product posters.
- **HTML navigations:** network first, then the matching cached page, then the trilingual `/offline.html`; never substitute a different language's content as an offline fallback.
- **Product/contact data:** stale-while-revalidate so a revisit works offline while a later online visit refreshes it.
- **Versioned static assets:** cache first, then network with cache fill.
- **Videos:** no bulk precache. Cache only complete, successful `200` responses after the video is requested; do not synthesize or store partial `206` range responses as complete files. A fully downloaded animation is then available offline. If it is unavailable offline, keep the poster and show a concise localized explanation.
- **External destinations:** WhatsApp, Instagram, telephone, email, analytics, and arbitrary third-party requests are never intercepted or rewritten.
- **Updates:** version cache names, clean only caches owned by this site, keep the current page usable during update, and offer a localized reload prompt when a new worker is ready. Do not force a reload during video playback.
- **Failure behavior:** registration failure leaves the ordinary website fully usable. Missing caches, video decode errors, offline transitions, and quota errors must not produce blank product areas or unhandled promise rejections.

The PWA install UI uses the browser's native install flow. If a custom install hint is shown, it appears only when `beforeinstallprompt` is available and can be dismissed permanently.

## 9. File plan

Modify:

- `index.html`, `ar/index.html`, `404.html`, `sitemap.xml`
- `assets/css/site.css` only for small integration fixes; primary new styling goes in `assets/css/experience.css`
- `assets/js/site.js` for French data rendering, local-phone handling, and product-detail rendering
- `data/products.js`, `data/site.js`
- `site.webmanifest`, `README.md`, `CHANGELOG.md`, `VERSION`, `docs/TECHNICAL-REPORT.md`
- `tools/check-site.cjs`
- `.gitignore` to exclude `.superpowers/` preview artifacts

Create:

- `fr/index.html`, `offline.html`
- `assets/css/experience.css`
- `assets/js/experience.js`, `assets/js/pwa.js`
- `sw.js`
- maskable app icons and optimized product/poster images under `assets/img/products/`
- optimized video derivatives under `assets/video/`

Do not change `CNAME`, GitHub Pages settings, DNS, the Claude GitHub app, or any other repository.

## 10. Accessibility, responsiveness, and performance

- Semantic landmarks and one `<h1>` per page; all controls work by keyboard.
- Visible focus, logical tab order, Escape behavior, accessible names, and polite announcements only for meaningful state changes.
- `dir="rtl"` for Arabic and logical CSS properties throughout; French and English remain LTR.
- No information exists only in color, animation, hover, or video.
- Check layouts at 320, 375, 390, 414, 768, and 1440 pixels: no horizontal scrolling, clipped ingredient controls, two-line CTA labels, or unreadable contrast.
- Optimize source images to responsive WebP derivatives. Only the launch assets are shipped; unused source-library images are not added to the release payload.
- Give the LCP image `fetchpriority="high"`; lazy-load ordinary below-the-fold images without combining that with high priority.
- Use transform/opacity for interface motion, provide a pause control for persistent ambience, and disable nonessential motion under reduced motion.
- Keep a readable page with JavaScript off and when opening from `file://`. Service-worker and video enhancements degrade gracefully.

## 11. Verification and acceptance

Repair the existing test tooling prerequisites without adding a production dependency, then update and run `node tools/check-site.cjs` in Chromium. Preserve the existing checks and add coverage for:

1. All three languages, both directions, canonical/hreflang/sitemap correctness, and French content.
2. Both launch products and zero sample products; exact ingredient lists and localized details.
3. Local phone and Instagram links; no invented WhatsApp link.
4. System/Light/Dark selection, reload persistence, cross-tab synchronization, and no incorrect first-paint theme.
5. Manifest validity, service-worker registration, install icons, offline navigation, fully downloaded video caching, and clean update behavior.
6. Video play/pause, keyboard operation, offscreen pause, reduced-motion behavior, and poster fallback.
7. Language dropdown, mobile menu, ingredient hover/focus/tap, Escape, and focus restoration.
8. `file://`, JavaScript off, no script errors, no unhandled rejections, and no blank content after failed media/cache operations.
9. Required viewport widths and existing desktop/mobile layout checks.

Acceptance requires the full updated release check to exit zero, a manual offline reload to succeed in Chromium, and an actual Chrome/Edge install check showing the Maison d'Mist icon on PC. A phone install is verified when a device is available; otherwise it is explicitly reported as unverified rather than claimed.

Update `VERSION`, `CHANGELOG.md`, `README.md`, and `docs/TECHNICAL-REPORT.md` to match the delivered result, including any verification that could not be performed.

## 12. Publication boundary

This design does not authorize committing, pushing, deploying, or editing the live repository. After local verification, present the changed files and results. Publishing to `Housam911/Maison.dmist` requires a separate explicit instruction from the user.
