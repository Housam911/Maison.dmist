# Maison d'Mist — technical report

**Version 0.31** · 25 October 2026

| | |
|---|---|
| Live (`main`) | **0.31**, published 25 October 2026: full-length films, version in the footer, readable Dark Luxury footer, on top of 0.30 (real products, eight soaps coming soon, French, themes, installable app, WhatsApp ordering). 127 of 127 checks pass |
| Previously live | 0.30, then before it 0.10. 0.20 was never published on its own |
| Where to see it | the footer of every page shows the version; so does `https://maisondmist.com/VERSION` |

This is the single technical file for the project. It records what exists,
how it is built, how it goes live, what was verified, and what is still
outstanding. Every release updates it and adds a section to
[`CHANGELOG.md`](../CHANGELOG.md); the number lives in [`VERSION`](../VERSION).

---

## 1. What this is

The brand site for **Maison d'Mist** (*Scent Soft Skin*), botanical body care.
It shows the brand and its products, explains ingredients, plays each product's
film, and tells people how to order. It is not a shop: no cart, no payments.

Deliberately plain: hand-written HTML, two stylesheets, small single-purpose
scripts, no framework, no build step, no package to install. It opens by
double-clicking a file and is served as-is by GitHub Pages.

| | |
|---|---|
| Domain | `maisondmist.com`, registered at Cloudflare |
| Hosting | GitHub Pages, `main` branch of `Housam911/Maison.dmist` (public) |
| Languages | English `/`, Arabic `/ar/` (right-to-left), French `/fr/` |
| Products | Fresh Mist Lotion 250 ml · Soft Bloom Butter Cream 250 g (available) · eight laurel soaps, 100 g each (coming soon) |
| Contact | phone/WhatsApp `03 496 329` (`+961 3 496 329`) · Instagram `@maison.dmist`, as on the labels; temporary, to be replaced |
| Prices | not shown, by choice: customers ask on WhatsApp |
| What is live | `https://maisondmist.com/VERSION` |
| Weight | about 4.1 MB in all; 2.2 MB of it is the four film files, loaded only when played |

---

## 2. How work reaches the website

```
feature branch ──► checks pass ──► screenshots ──► Housam approves ──► "deploy"
                                                                           │
                         git push origin <branch>:main  (never forced) ◄───┘
                                         │
                         GitHub Pages republishes maisondmist.com (~1 minute)
```

- `main` is the live site. All work happens on branches and reaches `main` only
  after Housam explicitly says to publish.
- Before publishing: raise `VERSION`, set the same number in `sw.js`, add the
  `CHANGELOG.md` section, update this report, and run
  `node tools/check-site.cjs`. Every check must pass.
- After publishing: open `https://maisondmist.com/VERSION` and confirm it shows
  the new number. Installed copies then show the update prompt (section 7).
- Work must always be pushed to a branch on GitHub, never left only on one
  computer. 0.20 was nearly stranded on a PC because of that.

A private "studio" repository for drafts was proposed in 0.11 and prepared,
but never created. Until it exists, branches in this repository are the
workshop. They're public, so prices or products that must stay secret until
launch don't belong on a branch here.

---

## 3. File map

```
index.html · ar/index.html · fr/index.html   the three language pages
404.html                                     trilingual "not found" page
offline.html                                 trilingual offline page (served by sw.js)
sw.js                                        service worker: caches, offline, updates
site.webmanifest                             app name, colours, icons (incl. maskable)
CNAME · .nojekyll · robots.txt · sitemap.xml · favicon.ico
assets/css/site.css                          base design, layout, right-to-left
assets/css/experience.css                    themes, language menu, films, ingredients, update banner
assets/js/site.js                            products, contact, menu, reveals
assets/js/languages.js                       the language menu
assets/js/theme.js                           System / Original Light / Dark Luxury
assets/js/media.js                           film playback and fallbacks
assets/js/pwa.js                             registers sw.js, shows the update prompt
assets/img/                                  logo cut-out, original artwork, icons, share card
assets/img/products/                         product photos (also the film posters)
assets/video/                                product films, WebM + MP4
data/site.js                                 ← contact details
data/products.js                             ← products, ingredients, photos, films
tools/check-site.cjs                         the 120 release checks
docs/TECHNICAL-REPORT.md                     this file
docs/superpowers/                            the 0.20 design spec and implementation plan
```

The original supplied images and videos are not in the repository. The site
uses optimised copies of them.

---

## 4. Brand and appearance

| Token | Original Light | Dark Luxury | Use |
|---|---|---|---|
| `--cream` | `#fefdf9` | `#15170f` | page background |
| `--cream-warm` | `#f6f3e8` | `#1c1e16` | alternating sections |
| `--olive` | `#656430` | `#b3a05f` | buttons, links (antique gold in dark) |
| `--olive-deep` | `#41411c` | `#f1ecdf` | headings |
| `--sage` | `#8f8d60` | `#b6a06a` | small caps, accents |
| `--ink` | `#33321f` | `#eee9dc` | body text |

Light colours are sampled from the logo artwork. Type: Cormorant Garamond with
Jost (English, French); Amiri with Tajawal (Arabic).

**System** follows the device's light or dark setting and stores nothing.
**Original Light** and **Dark Luxury** are remembered, applied by a tiny script
in `<head>` before the page paints (no flash), and synchronised across open
tabs. If the browser blocks storage, the choice still works for that visit.
Without JavaScript, the page follows the device setting.

---

## 5. Languages

Three complete, hand-written pages: English (LTR), Arabic (RTL) and French
(LTR). The stylesheets use logical properties, so Arabic mirrors itself.
Every page links all three through a language menu (arrow keys, Enter, Escape
and outside click all work) and declares `canonical`, `hreflang` for en/ar/fr
plus `x-default`, and its Open Graph locale. The sitemap lists all three, and
the 404 and offline pages are trilingual.

Arabic copy avoids gendered commands (it uses noun phrases). French copy has
not yet been reviewed by a native speaker (section 11).

---

## 6. Products, ingredients and films

Everything about a product lives in `data/products.js`, in all three languages:
name, description, size, an optional price (hidden while empty), the photo, the
film (WebM and MP4) and the ingredient list, each ingredient with a one-line
explanation.

| Product | Ingredients (from the label) |
|---|---|
| Fresh Mist Lotion, 250 ml | Rose Water, Shea Butter, Rose Oil, Coconut Oil, Sweet Almond Oil, Glycerin, Panthenol |
| Soft Bloom Butter Cream, 250 g | Beeswax, Coconut Oil, Shea Butter, Cocoa Butter |

**Soaps, coming soon** (100 g each, names as printed on the labels):

| Line | Scents | Photo source |
|---|---|---|
| Ghar Soap | Laymoun, Remmen, Misk Fodda, Misk Tahara | label mock-ups; Laymoun and Remmen are close-ups cropped from a board |
| Laurel Soap | Floral Petals, Rose Petal, Ocean Mist, Lavender Blossom | label mock-ups, cropped to 4:5 |

Only photos showing the product with its sticker are used, never label-only
artwork or bare products. The soaps list no ingredients and no prices until
Housam supplies them.

Ingredient explanations open on hover, keyboard focus or tap. They describe
what an ingredient is, not what it does for health. The site makes no medical,
certification or origin claims.

**Films** are the supplied AI-generated films at full length, ingredients
flying over the product. The lotion plays its two films back to back with a
half-second crossfade (9.5 s); the butter plays its film (7.9 s). The white
lead-in frames of each original are cut. Known issue, accepted for testing:
the films' ingredient labels contain AI mistakes ("Panythehin", a coconut
labelled "Shea Butter"); corrected films will replace them. They show the
product photo as a poster until played, with no browser
control bar over it. They play on mouse hover, on a tap or click on the picture
or the round Play button, and from the keyboard (Enter/Space on the Play
button). They pause when scrolled off-screen, when the tab is hidden or when
the mouse leaves (never when a finger lifts), return to the
opening frame when they end, and never move under reduced motion. If a film
fails to load or decode, the poster stays and a short explanation appears in
the page's language. No blank boxes, no console errors.

---

## 7. App install, offline and updates

**Install.** `site.webmanifest` gives the app its name, colours and icons,
including maskable icons so phones crop the logo correctly. Browsers offer
"Install" / "Add to Home Screen" on the real `https://` site.

**What `sw.js` caches, and how:**

| Request | Strategy |
|---|---|
| Pages | network first; offline: the cached copy of that same page, else the trilingual `offline.html`. A page is never replaced by another language's |
| `data/*.js` | stale-while-revalidate: instant, refreshed in the background |
| Films | cached only after a complete `200` download; partial `206` responses are never stored |
| Styles, scripts, images | cache first, refreshed by the next release |
| Other sites (WhatsApp, Instagram, phone, email) | never intercepted |

On install, the three pages, the offline page, styles, scripts, data, icons and
product photos are cached in advance; films are not.

**Updates.** Caches are named after the release (`mdm-0.20-shell`, `-runtime`,
`-media`). A new release changes `sw.js`, browsers notice within one visit
(`updateViaCache: "none"` means they always ask GitHub, not their HTTP cache),
and open copies show "A new version is ready · Reload" in their own language.
Reload waits until any playing film is paused, then activates the new version,
which deletes only the previous `mdm-` caches.

**The rule that keeps this working:** `VERSION` and `const VERSION` in `sw.js`
must be raised together for every release. Styles and scripts are served cache
first, so a release that left `sw.js` unchanged would never reach installed
phones. `tools/check-site.cjs` fails the release if the two differ.

If registration fails or the browser has no service-worker support, the site
works exactly as an ordinary website.

---

## 8. Editing the content

On a branch, then published as in section 2.

**Contact details** are in `data/site.js`. An empty field hides its button or
icon. WhatsApp needs the number in international form, digits only (for
example `9613496329` if the line is Lebanese; confirm the country first).
Filling it adds an order button to every available product, with the message
pre-written in the page's language.

**Products** are in `data/products.js`. Copy a block and change the values in
all three languages. `status` is `available`, `coming-soon`, `sold-out` or
`hidden`. Photos: portrait 4:5, WebP, about 1000 × 1250 px, under 300 KB.
Films: WebM plus MP4, short and silent, ideally under 1.5 MB each. Add every
new product photo to the `PRECACHE` list in `sw.js`; the checks refuse a
product whose photo is missing from it, is over 300 KB, or is not 4:5.
Layout needs no change: cards run 3 across, 2 on tablets, 1 on phones.

---

## 9. Hosting and the domain

GitHub Pages serves `main` at `maisondmist.com` (custom domain from `CNAME`).
The first deployment ran successfully on 25 October 2026.

Cloudflare DNS for `maisondmist.com`, every record set to **DNS only (grey cloud)**:

| Type | Name | Content |
|---|---|---|
| A | `@` | `185.199.108.153` · `185.199.109.153` · `185.199.110.153` · `185.199.111.153` (four records) |
| AAAA | `@` | `2606:50c0:8000::153` · `8001::153` · `8002::153` · `8003::153` (four records) |
| CNAME | `www` | `housam911.github.io` |

Leave MX and TXT records alone. Once Settings → Pages shows "DNS check
successful", tick **Enforce HTTPS**. Turning on the Cloudflare proxy later
requires SSL/TLS **Full (strict)**. A service worker needs `https://`, so the
app install and offline features only work once HTTPS is on.

---

## 10. Release checks

`node tools/check-site.cjs` (Node 18+, Playwright with Chromium) serves the site
locally and drives it in a real browser. **127 checks, all passing for 0.31.**
Expected counts and contact links are read from `data/products.js` and
`data/site.js`, so editing products or contact details needs no test edit.

| Area | Checked |
|---|---|
| Layout | en, ar and fr at 320, 375, 390, 414, 768 and 1440 px: no sideways scroll, no control cut off at the screen edge, no button label on two lines, products centred, all cards one size; one `<h1>`; every section visible |
| Languages | direction per language; canonical, `hreflang`, Open Graph locale; sitemap and 404; language menu by mouse and keyboard |
| Content | real products only, in data order; every product in three languages with a 4:5 photo under 300 KB that is kept offline; exact ingredient lists; label contact details; no WhatsApp link without a number; ordering when contact details are filled |
| Appearance | System, Light and Dark; footer text at 4.5:1 or better in each; stored override; `theme-color`; cross-tab sync; blocked storage; no flash on load |
| Films | poster first, no control bar, no dead tab stop; hover, keyboard and touch-tap play and pause; off-screen pause; reset at end; reduced motion; a missing film keeps the poster and explains, with no errors |
| App | manifest and maskable icon; registration; cached pages, offline in all three languages; complete films cached, partial ones not; update prompt in the page's language; reload waits for a playing film; only old Maison d'Mist caches removed; `sw.js` version equals `VERSION`; site usable if registration fails |
| Robustness | double-click `file://` in all three languages; readable with JavaScript off in all three; reduced motion; no script errors or unhandled rejections |

---

## 11. Not verified, and still outstanding

**Not verified yet.** These need a real device or the live site:

| | How to verify |
|---|---|
| Installing on a phone (Android, iPhone) | open maisondmist.com → Add to Home Screen → the Maison d'Mist icon appears and opens full-screen |
| Installing in desktop Chrome/Edge | the install icon in the address bar → the app opens in its own window with the right icon |
| The live site after publishing | `/VERSION` shows `0.20`; `/`, `/ar/`, `/fr/` load; films play; theme choice sticks; a second visit works with Wi-Fi off |
| Cloudflare DNS and HTTPS | padlock on `https://maisondmist.com` |

**Outstanding, needing information from Housam:**

| # | Item |
|---|---|
| 1 | The final phone/WhatsApp number and Instagram handle, replacing the temporary ones in `data/site.js`. Confirm the country: WhatsApp currently assumes Lebanon (+961) |
| 2 | The soaps: real photos, ingredients, and when each goes from "Coming soon" to available |
| 2b | Corrected product films without the AI label mistakes |
| 3 | French copy review by a native speaker |
| 4 | Whether to create the private studio repository for drafts (section 2) |
| 5 | A vector (SVG/PDF) logo, if one exists |
| 6 | Analytics, if wanted (Cloudflare Web Analytics is free and cookie-free) |

---

## 12. Version history

| Version | Date | Live? | What |
|---|---|---|---|
| 0.31 | 2026-10-25 | **yes** | Full-length films (lotion: both films joined), version shown in the footer, Dark Luxury footer readable, 127 checks |
| 0.30 | 2026-10-25 | until 0.31 | Eight laurel soaps (coming soon), WhatsApp ordering, equal-size cards, product and contact data checks, 123 checks |
| 0.20 | 2026-10-25 | via 0.30 | Real products and ingredients, French, Light/Dark/System, product films, installable offline app with safe updates, 120 checks |
| 0.11 | 2026-10-25 | never | Private studio + deploy tool, prepared but not adopted; parked on branch `studio` |
| 0.10 | 2026-10-25 | until 0.30 | First bilingual build with sample products |
