# Changelog

Release numbers are `x.yz`, recorded in [`VERSION`](VERSION).

## 0.43 — 2026-10-27

Security hardening after a threat model of the October 2026 PHP (PHP2Shell)
and GitLab attacks. Prepared, not live: goes live only on Housam's "deploy".
The full analysis is in the technical report, section 11.

- **Those attacks can't reach this site.** It has no PHP, no GitLab, no
  server code, no forms and no CI pipeline. The security checks now prove
  that on every release.
- **Content is built safely.** A new `assets/js/safe-dom.js` is the only way
  the scripts add content. Text always goes in as text, never as HTML.
  Links must be https, mailto, tel or this site, and photos, films and fonts
  must be on this site. Icons are drawn from fixed descriptions. No script
  uses `innerHTML`, `eval` or run-time regular expressions any more.
- **A strict security policy on every page.** A `Content-Security-Policy`
  allows only this site's own files, the one inline theme script (by hash)
  and nothing else. It enforces Trusted Types, so the browser itself refuses
  `innerHTML`, `eval` and injected scripts. Only two narrow policies may
  exist: one can register only `/sw.js`, the other accepts only valid JSON,
  for the product data that 0.42 gives search engines.
- **Fonts come from this site.** Cormorant Garamond, Jost, Amiri and Tajawal
  are now in `assets/fonts/`, so pages make no request to Google or any
  other site. They look the same and work offline.
- **Two real gaps closed.** In 0.41 and 0.42 an email address in `data/site.js` could
  carry `?cc=` or `?body=` into the email link, and a photo address could
  point at another website. Both are blocked now.
- Icon lookups ignore built-in object names such as `__proto__`. The 404 and
  offline pages' inline styles moved into `site.css`. Muted films stay muted
  now that the script builds them.
- **Built on the live 0.42.** Kimi's search release (titles, sharing
  cards, structured data, the product list for search engines, the Search
  Console file) is kept unchanged in behaviour. The product list is now made
  through the safe builder, and the sitemap carries this release's date.
- **Checks.** All 153 site checks pass, plus 154 new security checks in
  `tools/check-security.cjs`. The security checks cover code, pages, files
  and data, and run a hostile-data browser test in which every text is
  replaced by attack strings. Run against the live 0.42, the same checks
  fail in 19 places.

## 0.42 — 2026-10-26

Search visibility and social sharing in all three languages.

- Natural, collection-aware titles and descriptions name the real body-care
  collection in English, Arabic and French.
- Open Graph locales use full locale codes. Open Graph and Twitter cards now
  carry matching localized text, image URLs and descriptive image alt text.
- Organization, Brand, WebSite and WebPage structured data identifies the
  site without inventing an address, prices, ratings or other unknown facts.
- A localized product ItemList is rendered from `data/products.js`, with
  stable product anchors and no unsupported offers, reviews or ratings.
- The sitemap keeps the same three canonical pages and records this release's
  actual date. `robots.txt` continues to allow crawling and reference it.
- **Checks: 153.** New coverage checks all localized search/social metadata,
  structured data, catalog anchors, canonical language links and sitemap data.

## 0.41 — 2026-10-25

Updates reach phones by themselves. Published 25 October 2026.

- **Why 0.40 seemed missing.** A phone that had visited before loaded the
  new page (footer "Version 0.40") but kept the previous release's scripts,
  products and films until someone tapped a small "Reload" bar at the
  bottom. Without that tap, the categories, the Donut Soap and the new
  films never appeared.
- **Now:** a new release takes over as soon as it has downloaded, and an
  open page refreshes itself once into it. It never interrupts a film: it
  says "Updating to the new version…" in the page's language and waits for
  the film to stop, or for a background tab to come back. No tap needed.
- **Always fresh online.** Pages, styles, scripts and product data check
  with the server on every load (an unchanged file costs a tiny "not
  modified" reply) and use the saved copy only offline. Before, product
  data was served from the saved copy first and refreshed one visit late.
- **Fresh install.** Each release downloads its files past GitHub Pages'
  ten-minute browser cache, so it never saves a file from the release
  before.
- An app left open checks for a release when it comes back to the front.
- **Checks: 136.** Rewritten for the new behaviour: a release takes over
  and the page refreshes with no tap; it waits, saying so, while a film
  plays; with nothing playing it refreshes at once; and, new, a returning
  visitor sees changed products on the very first load.

## 0.40 — 2026-10-25

Categories, animation for every product without a film, and one film per
lotion card. Published 25 October 2026.

- **Categories with a filter.** Four product lines: Body Lotion, Body
  Butter (Arabic: كريم الزبدة, as on the label), Ghar Soap (the Ghar and
  Laurel soaps) and Donut Soap. A row of
  buttons above the products (All plus one per category, each with its
  count) shows one line at a time, in all three languages, by mouse, touch
  or keyboard. Filtering only hides cards; every product stays in the page.
  Categories live in `data/products.js` (`MDM_CATEGORIES`), and every
  product names its `category`.
- **Product animations.** Every product without a film now has a short
  animation that behaves like a film: mouse hover, a tap or click, or the
  Play button starts it; it ends by itself after 6.5 s, or when the mouse
  leaves, it scrolls away or the tab is hidden. Bubbles rise over the Ghar
  soaps, Ocean Mist, Lavender Blossom and the Donut Soap; petals drift over
  Floral Petals and Rose Petal; each also zooms gently and passes a light
  across the sticker. Under reduced motion, hovering never starts one.
- **One film per lotion card.** The two supplied lotion films now each have
  their own card instead of being joined. The second card is a **test
  entry**: a copy of Fresh Mist Lotion carrying the second film, to be
  replaced by the real second lotion.
- **Donut Soap.** Its category has one "Coming soon" card with a drawn
  illustration (`donut-soap.svg`), because the only photo shows the soap
  without its sticker.
- **Checks: 135.** New: four categories named in three languages, each with
  products, every product in one; the filter in every language; an
  animation on every product without a film; hover, leave, keyboard, end of
  run, phone tap and reduced motion for the animations. Ingredient, order
  button and film counts now come from the data.

## 0.31 — 2026-10-25

Full product films, the version in the footer, and a readable footer in
Dark Luxury. Published 25 October 2026.

- **Full-length films, all three.** The films play in full again, with the
  ingredients flying over the product (0.20 had cut them short). The lotion
  card plays both of its films back to back with a half-second crossfade
  (9.5 s); the butter cream plays its whole film (7.9 s). The one-to-three
  white frames each original started with are cut, so a film no longer
  flashes white as it starts. Encoded from the originals, silent, 2.2 MB for
  all four files.
- **Known issue, accepted for testing:** the AI-made films carry spelling
  and labelling mistakes ("Panythehin" for Panthenol, a coconut labelled
  "Shea Butter", and similar). Corrected films will replace them.
- **Version in the footer.** Every page shows "Version 0.31" (Arabic
  "الإصدار 0.31") at full strength in an outlined pill; the rest of the fine
  print stays dimmed. The checks hold it equal to `VERSION`.
- **Dark Luxury footer was unreadable.** Its text, links and icons were dark
  on dark since 0.20, because the colour they used also turns dark in that
  appearance. They now use the light ink: 9:1 contrast.
- **Checks: 127.** New: the footer shows the release number on every page;
  footer text meets 4.5:1 contrast in light, System dark and Dark Luxury.

## 0.30 — 2026-10-25

The soap collection, and ordering by WhatsApp. Published 25 October 2026;
it includes 0.20, which was never published on its own.

- **Ordering is on.** Phone/WhatsApp `03 496 329` (WhatsApp as
  `+961 3 496 329`, read as a Lebanese mobile) and Instagram `@maison.dmist`,
  as printed on the labels. Both are temporary and will be replaced. The
  lotion and butter cream get an "Order on WhatsApp" button with the
  message pre-written in the page's language; the soaps, coming soon, do
  not. No prices are shown by choice: customers ask on WhatsApp.

- **Ghar Soap** (100 g): Laymoun, Remmen, Misk Fodda, Misk Tahara.
  **Laurel Soap** (100 g): Floral Petals, Rose Petal, Ocean Mist, Lavender
  Blossom. Names exactly as printed on the labels, in all three languages;
  descriptions say only what the label and photo show (laurel soap, 100 g,
  the scent name, petals where visible). No ingredients or prices yet.
- **Photos.** Only pictures of the product with its sticker on it: no
  label-only artwork and no bare products. The sources are label mock-ups;
  each was cropped to the site's 4:5 portrait. Laymoun and Remmen come from
  a mock-up board, so they are close-ups, and Remmen is the softest image.
  Replace them with real photos when available.
- **Equal cards.** Products sit 3 across on larger screens, 2 on tablets and
  1 on phones, every card the same size, a short last row centred.
- **Offline.** All eight photos are cached when the app installs, so a soap
  never shows a broken image without a connection.
- **French at 320 px:** "Commander sur WhatsApp" broke onto two lines in
  the product cards; order buttons tighten their spacing on narrow phones.
- **Checks: 123.** Expected counts now come from `data/products.js` and
  `data/site.js`, so changing products or contact details needs no test edit.
  New: every product has all three languages, a 4:5 photo under 300 KB, and
  is kept for offline use; all cards are one size at every width; contact
  links match `data/site.js`; order buttons only on available products.

## 0.20 — 2026-10-25

The real launch: real products, a third language, light and dark
appearances, the supplied product films, and an installable app that works
offline.

- **Real products replace the samples.** Fresh Mist Lotion (250 ml) and
  Soft Bloom Butter Cream (250 g), with their exact ingredient lists from the
  labels. Each ingredient opens a short explanation (hover, focus or tap) in
  the page's language. No prices yet; they stay hidden until supplied.
- **No contact links yet.** The phone number and Instagram printed on the
  labels are placeholders, so the site links to neither and shows "being set
  up" until the real ones are in `data/site.js`. The contact cards, WhatsApp
  order buttons and footer icons appear by themselves once they are.
- **French.** A complete French page at `/fr/`. A language menu on every page
  links all three (keyboard, Escape and outside click work). Canonical,
  `hreflang`, Open Graph locale, the sitemap and the 404 page cover all three.
- **Appearance.** System (follows the device), Original Light and Dark Luxury
  (deep olive-black with ivory and antique gold). The choice is remembered,
  applied before the page paints, synchronised across open tabs, and harmless
  when the browser blocks storage.
- **Product films.** The supplied videos (WebM with MP4 fallback, 0.9 MB in
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
- **Placeholder contact details were linked.** The site called
  `03 496 329` and linked `instagram.com/maison.dm`. Both are placeholders,
  and could belong to strangers. Removed until the real ones arrive.
- **The films showed AI text mistakes.** The lotion film labelled an
  ingredient "Panythehin" (Panthenol) and put "Sweet Almond Oil" on a
  coconut; the butter film labelled a coconut "Shea Butter". Both films now
  end before any label appears: the lotion's pour (2.0 s) and the butter's
  lid lifting with its ingredients, unlabelled (3.4 s). Their last frames
  were checked brightened for faint labels. They are also 2.5 MB → 0.9 MB.
- Debug logging removed from the site and from the checks.
- **English and Arabic still sold "fragrance mists".** The French page had
  been rewritten for the real products, but English and Arabic still said
  "Our mists" and told people to spray from 20 cm, which is wrong for a lotion
  and a butter cream. Both now carry the French meaning: botanical body care,
  smoothed in or melted between the palms. The logo line "Scent Soft Skin"
  stays.

Checks: **120**, all passing. New: every language at 320,
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
