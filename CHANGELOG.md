# Changelog

Release numbers are `x.yz`, recorded in [`VERSION`](VERSION).

## 0.20 — 2026-10-25

The real launch: real products, a third language, light and dark
appearances, the supplied product films, and an installable app that works
offline.

- **Real products replace the samples.** Fresh Mist Lotion (250 ml) and
  Soft Bloom Butter Cream (250 g), with their exact ingredient lists from the
  labels. Each ingredient opens a short explanation (hover, focus or tap) in
  the page's language. No prices yet; they stay hidden until supplied.
- **Contact details from the labels:** phone `03 496 329` and Instagram
  `maison.dm`. No WhatsApp link until the full international number is
  supplied; no country code was guessed.
- **French.** A complete French page at `/fr/`. A language menu on every page
  links all three (keyboard, Escape and outside click work). Canonical,
  `hreflang`, Open Graph locale, the sitemap and the 404 page cover all three.
- **Appearance.** System (follows the device), Original Light and Dark Luxury
  (deep olive-black with ivory and antique gold). The choice is remembered,
  applied before the page paints, synchronised across open tabs, and harmless
  when the browser blocks storage.
- **Product films.** The supplied videos (WebM with MP4 fallback, 2.5 MB in
  all) play on hover, tap or keyboard, pause off-screen and in background tabs,
  return to the opening frame when they end, and stay still under reduced
  motion. If a film cannot load, the product photo stays and a short
  explanation appears in the page's language.
- **Installable app (PWA).** Install icons including maskable versions, and a
  service worker. Pages are network-first with an offline fallback in all three
  languages; product data is stale-while-revalidate; a film is kept for
  offline use only once fully downloaded (partial `206` responses are never
  stored). WhatsApp, Instagram, phone and email links are never intercepted.
- **Updates.** When a new release is published, open copies show "A new
  version is ready" in their own language. Reload waits for a playing film to
  stop. Only Maison d'Mist's old caches are cleared; other sites' are untouched.
- **Release discipline.** `sw.js` names its caches after the release number,
  and the checks refuse a release whose `sw.js` version differs from
  `VERSION`. A release that forgot this would leave installed phones on the
  old styles and scripts indefinitely, because those are served cache-first.

Fixed while finishing the release:

- **The update test never tested anything.** It tried to swap `sw.js` with
  Playwright's `page.route`, which cannot intercept a browser's own
  service-worker download. It passed or failed by accident, depending on the
  Chromium version. The test server now serves a changed `sw.js`, exactly as a
  real release does.
- **"Reload" during a film destroyed its own button.** The waiting message was
  written over the whole banner instead of onto its button.
- **Updates were found up to 10 minutes late.** The worker was registered with
  `updateViaCache: "all"`, so update checks read GitHub Pages' 10-minute HTTP
  cache. Now `"none"`. An update already installing when a page opened is now
  also noticed.
- **French at 320 px:** "Découvrir la collection" broke onto two lines on the
  narrowest phones. Buttons now tighten their spacing below 400 px.
- **On phones a film could never be stopped by tapping.** Lifting a finger
  fires "pointer left", which paused the film just before the tap played it
  again. Hover-to-pause now applies to a mouse only.
- **Films without the browser's control bar.** The bar covered the product
  label; the round Play button is the control, and tapping or clicking the
  picture also plays and pauses. The video no longer adds an empty tab stop.
- **Products centred.** Two cards now sit side by side in the middle instead
  of hugging the left edge; larger collections wrap three to a row with the
  last row centred.
- Debug logging removed from the site and from the checks.
- **English and Arabic still sold "fragrance mists".** The French page had
  been rewritten for the real products, but English and Arabic still said
  "Our mists" and told people to spray from 20 cm, which is wrong for a lotion
  and a butter cream. Both now carry the French meaning: botanical body care,
  smoothed in or melted between the palms. The logo line "Scent Soft Skin"
  stays.

Checks: **121**, all passing. New: every language at 320,
375, 390, 414, 768 and 1440 px (no sideways scroll, no control cut off at the
edge, no two-line button label); French in the menu, `file://` and
JavaScript-off checks; Arabic and French with JavaScript off; the playback-safe
update; `sw.js`/`VERSION` agreement; products centred at every width; no
control bar on films; tap to play and pause on a touch phone.

Not verified (no device in the cloud session): installing on a real phone or
in desktop Chrome/Edge, and the live site after publishing. See the technical
report, section 11.

## 0.10 — 2026-10-25

First release: the complete static brand site, ready to publish on
GitHub Pages at `maisondmist.com`.

- **Bilingual.** English at `/` and Arabic at `/ar/`, with a right-to-left
  layout for Arabic driven by CSS logical properties — one stylesheet,
  no mirrored rules. Each page declares `hreflang` for the other, and
  both are listed in `sitemap.xml`.
- **Brand.** Palette sampled from the supplied logo artwork: olive
  `#656430`, leaf sage `#8f8d60`, cream `#fefdf9`. Cormorant Garamond
  with Jost for English, Amiri with Tajawal for Arabic.
- **Sections.** Hero with the full logo lockup, a values strip, the
  collection grid, a three-step "ritual", the house story, and ordering.
- **Products come from one file.** `data/products.js` holds the whole
  collection in both languages, with `available` / `coming-soon` /
  `sold-out` / `hidden` states, optional price and size, and an optional
  photo — an engraved placeholder is drawn when no photo is set. Four
  sample entries ship so the page is not empty; they are marked
  "Coming soon" and must be replaced before the site is announced.
- **Contact comes from one file.** `data/site.js` holds the WhatsApp
  number, phone, email and social handles. Every field is empty in this
  release, so the ordering section shows a short "being set up" notice
  and **no dead links or broken buttons appear anywhere**. Filling a
  field makes its button and icon appear by itself.
- **Ordering by WhatsApp.** Once the number is filled, every available
  product gets an order button that opens WhatsApp with the message
  already written, in the language of the page.
- **Assets.** Favicon set, 180 px Apple touch icon, 192/512 px PWA icons,
  a 1200×630 social share card and a web manifest, all generated from
  the logo artwork.
- **Access and motion.** Skip link, visible focus rings, labelled
  controls, an Escape-closable mobile menu, and scroll reveals that stop
  entirely under `prefers-reduced-motion`.
- **Plumbing.** `CNAME` for the custom domain, `.nojekyll`, `robots.txt`,
  `sitemap.xml`, and a bilingual `404.html`.
