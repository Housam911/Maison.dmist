# Maison d'Mist — technical report

**Version 0.50** · 26 October 2026 (prepared on branch `prep/coming-soon`; not live until the handover from Kimi)

### Sites (from 0.50)

| Address | Repository | Shows |
|---|---|---|
| `maisondmist.com` | `Housam911/Maison.dmist` | **Coming soon** in three languages; retires saved copies of the old site |
| `v1.maisondmist.com` | `Housam911/maisondmist-v1` | the full site (0.43: Kimi's 0.42 search release plus the security work), for testing |
| `v2.maisondmist.com` | `Housam911/maisondmist-v2` | Kimi's version, after the handover |
| `v3.maisondmist.com` | `Housam911/maisondmist-v3` | the iOS edition |

Each test site is its own GitHub Pages site with its own `CNAME`, carries
`noindex` and a `robots.txt` that disallows everything, and shows its own
version in the footer. They are public to anyone who has the address.
Launching means copying the chosen version into this repository.

**Security (0.43 and 0.50).** The Coming soon pages carry a security policy
that allows no script at all, only this site's own style sheet, images and
fonts (no Google request). The test sites carry the full 0.43 protection.
The threat model is section 11; `node tools/check-security.cjs` runs in
every repository: 75 checks pass for Coming soon.

Every test site needs, once: the repository, GitHub Pages switched on from
`main` with its custom domain, and a Cloudflare DNS record `CNAME vN →
housam911.github.io` (grey cloud). Then "Enforce HTTPS" once the DNS check
passes.

---

The sections below describe the full site (0.43), which now lives in the
`v1` repository.

**Version 0.43** · 27 October 2026

| | |
|---|---|
| Live (`main`) | **0.42**, published 26 October 2026: localized search titles/descriptions, complete social-sharing metadata, organization/site/page structured data and a catalog ItemList in English, Arabic and French. 153 of 153 checks pass; all three live pages return 200 and their rendered metadata was verified |
| Prepared, not live | **0.43**, 27 October 2026: security hardening after a threat model of the October 2026 PHP and GitLab attacks (section 11). Each page now runs with a strict security policy, all page content is built safely, fonts come from this site, and a new security check suite (154 checks) runs alongside the 153 site checks. Built on top of the live 0.42. Goes live only on Housam's "deploy" |
| Previously live | 0.41, 0.40, 0.31, 0.30, then 0.10. 0.20 was never published on its own |
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
| Products | 12 cards in four categories. Body Lotion: Fresh Mist Lotion 250 ml, plus a test copy carrying the second lotion film. Body Butter: Soft Bloom Butter Cream 250 g (both lines available). Ghar Soap: eight soaps, 100 g, coming soon. Donut Soap: one card, coming soon |
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
  the new number. Installed copies then refresh into the new release (section 7).
- Work must always be pushed to a branch on GitHub, never left only on one
  computer. 0.20 was nearly stranded on a PC because of that.

GitHub safeguards, enabled 26 October 2026: secret scanning and push protection
(already on), Dependabot vulnerability alerts and security updates, and CodeQL
for JavaScript/TypeScript. The initial CodeQL setup scan completed successfully.
`main` cannot be deleted or force-pushed. Ordinary approved branch-to-main
pushes remain available; mandatory pull-request reviews and status checks are
not enabled while there is no CI test workflow.

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
assets/css/fonts.css                         the fonts, served from this site (0.43)
assets/css/site.css                          base design, layout, right-to-left, 404 and offline pages
assets/css/experience.css                    themes, language menu, films, ingredients, update banner
assets/js/safe-dom.js                        the only way scripts add content: text as text, checked links (0.43)
assets/js/site.js                            products, contact, menu, reveals
assets/js/languages.js                       the language menu
assets/js/theme.js                           System / Original Light / Dark Luxury
assets/js/media.js                           film playback and fallbacks
assets/js/pwa.js                             registers sw.js (through the one Trusted Types policy), automatic updates
assets/fonts/                                Cormorant Garamond, Jost, Amiri, Tajawal (woff2, SIL Open Font License)
assets/img/                                  logo cut-out, original artwork, icons, share card
assets/img/products/                         product photos (also the film posters)
assets/video/                                product films, WebM + MP4
data/site.js                                 ← contact details
data/products.js                             ← products, ingredients, photos, films
tools/check-site.cjs                         the 153 site checks
tools/check-security.cjs                     the 154 security checks (0.43)
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

Each language has a collection-aware search title/description, full Open Graph
and Twitter metadata with image alt text, and Organization, Brand, WebSite and
WebPage JSON-LD. `assets/js/site.js` gives every catalog card a stable anchor
and renders a localized product ItemList from `data/products.js`; it adds no
invented prices, offers, ratings or business address. `robots.txt` allows
crawling and points to the sitemap, whose release dates match the changelog.

Arabic copy avoids gendered commands (it uses noun phrases). French copy has
not yet been reviewed by a native speaker (section 12).

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

**Categories.** `MDM_CATEGORIES` in `data/products.js` lists the four lines
in filter order with their names in English, Arabic and French; each product
names its `category`. The filter shows All plus each category that has
products, with counts. Filtering hides cards without removing them.

**Animations** (products without a film). A product with `animation:
"bubbles"` or `"petals"` gets a pure-CSS animation: nine bubbles rise (or
petals fall) across the photo, the photo zooms slowly, and a light passes
across the sticker. It runs once (6.5 s) and behaves like a film: hover,
tap, click or the Play button start it; leaving, scrolling away or hiding
the tab stop it; under reduced motion only an explicit tap or Play runs it.

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
| Pages, styles, scripts, `data/*.js` | network first, revalidated past the browser's HTTP cache (an unchanged file costs a 304), so they are never a release behind; offline: the saved copy, and for a page with no saved copy the trilingual `offline.html`. A page is never replaced by another language's |
| Photos and icons | cache first; every release downloads them fresh when it installs |
| Films | cached only after a complete `200` download; partial `206` responses are never stored |
| Other sites (WhatsApp, Instagram, phone, email) | never intercepted |

On install, the three pages, the offline page, styles, scripts, data, icons and
product photos are downloaded fresh (bypassing GitHub Pages' ten-minute HTTP
cache) and saved; films are not.

**Updates arrive by themselves** (since 0.41). Caches are named after the
release (`mdm-0.41-shell`, `-runtime`, `-media`). A new release changes
`sw.js`; browsers notice on the next visit (`updateViaCache: "none"`: they ask
GitHub, not their HTTP cache), and an app left open checks again when brought
back to the front. The new version takes over as soon as it has downloaded and
deletes only the previous `mdm-` caches. A page that was already open then
refreshes itself once, into the new release: immediately if nothing is
playing; while a film plays it shows "Updating to the new version…" in its
language and waits for the film to stop; in a background tab it waits until
the tab is shown.

Until 0.41 a release waited for a tap on a "Reload" bar. Phones that never
tapped it showed the new page (with the new version number) over the
previous release's scripts, products and films. That is how 0.40's categories
and Donut Soap went unseen after they were published.

**The rule that keeps this working:** `VERSION` and `const VERSION` in `sw.js`
must be raised together for every release. Photos and films are served cache
first, so a release that left `sw.js` unchanged would never refresh them on
installed phones. `tools/check-site.cjs` fails the release if the two differ.

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
locally and drives it in a real browser. **153 checks, all passing for 0.43.**
`node tools/check-security.cjs` adds **154 security checks** (section 11); a
release needs both.
Expected counts and contact links are read from `data/products.js` and
`data/site.js`, so editing products or contact details needs no test edit.

| Area | Checked |
|---|---|
| Layout | en, ar and fr at 320, 375, 390, 414, 768 and 1440 px: no sideways scroll, no control cut off at the screen edge, no button label on two lines, products centred, all cards one size; one `<h1>`; every section visible |
| Languages | direction per language; canonical, `hreflang`, Open Graph locale; sitemap and 404; language menu by mouse and keyboard |
| Search | localized titles/descriptions, reciprocal canonical language links, social image alt text, valid JSON-LD for the organization/site/page and real product ItemList, stable anchors, robots and sitemap release dates; no invented commerce claims |
| Content | real products only, in data order; every product in three languages with a 4:5 photo under 300 KB that is kept offline; exact ingredient lists; label contact details; no WhatsApp link without a number; ordering when contact details are filled |
| Appearance | System, Light and Dark; footer text at 4.5:1 or better in each; stored override; `theme-color`; cross-tab sync; blocked storage; no flash on load |
| Categories | four, named in three languages, each with products, every product in one; the filter in every language by click and keyboard |
| Animations | one on every product without a film; hover plays, leaving stops, keyboard plays, ends after one run; phone tap plays and stops; reduced motion never starts one on hover |
| Films | poster first, no control bar, no dead tab stop; hover, keyboard and touch-tap play and pause; off-screen pause; reset at end; reduced motion; a missing film keeps the poster and explains, with no errors |
| App | manifest and maskable icon; registration; cached pages, offline in all three languages; complete films cached, partial ones not; a new release takes over and the page refreshes itself, with no tap; it waits, saying so in the page's language, while a film plays; a returning visitor sees changed products on the first load; only old Maison d'Mist caches removed; `sw.js` version equals `VERSION`; site usable if registration fails |
| Robustness | double-click `file://` in all three languages; readable with JavaScript off in all three; reduced motion; no script errors or unhandled rejections |

Live verification on 26 October 2026: `/`, `/ar/` and `/fr/` return 200;
`/VERSION` returns `0.42`; `robots.txt` and `sitemap.xml` are live; and a real
browser verified each page's localized metadata, organization schema and all
12 product anchors/ItemList entries. The branch review was an author self-review,
not an independent review.

Search Console: the existing `https://maisondmist.com/` URL-prefix property was
verified with the Google-supplied HTML file at the site root; no duplicate
property or DNS change was made. The sitemap reports **Success** with three
discovered pages. The English homepage was already indexed and a fresh crawl
was requested for 0.42. `/ar/` and `/fr/` were not indexed at inspection; both
were added to Google's priority crawl queue. Queueing does not guarantee when
or whether Google will index a page, and no ranking is promised.

---

## 11. Security: threat model (0.43)

Written 27 October 2026, at Housam's request, as an application-security
review before any new feature: which attacks from the October 2026 PHP and
GitLab vulnerabilities (and similar ones) could reach this site, and how the
code is built so they cannot.

### 11.1 The October 2026 attacks

| | What happened | Bug class | Fixed in |
|---|---|---|---|
| **PHP2Shell**, CVE-2026-109618 | PHP corrupts its own memory while it builds `$_POST` from a request with very long, nested form-field names. This happens before any application code runs, with no login needed. Exploited in the wild; CISA added it to its Known Exploited list on 26 October | memory corruption in a request parser | PHP 8.5.12, 8.4.27, 8.3.36, 8.2.35 (21 October) |
| **PHP2Shell**, CVE-2026-109619 | Stale per-worker state from an earlier request is reused (use-after-free), for example through session upload progress, which is on by default | use-after-free across requests | same releases |
| **GitLab**, CVE-2026-97229 (12 Oct) and CVE-2026-110264 (21 Oct), both CVSS 10.0 | A crafted regular expression overflows an integer while GitLab compiles it (reported as coming through CI/CD configuration), giving code execution on self-managed servers without a login. GitLab has not published the full path | integer overflow in a regex compiler | 19.5.1, 19.4.3, 19.3.6, 19.2.9, 19.1.9, 19.0.10, 18.11.13 |
| GitLab, CVE-2026-15723 | Account takeover when an admin enabled both SAML and LDAP auto-linking | broken authentication | same release |
| Related: cloudflared | Cloudflare's tunnel client must be 2026.10.2 or later after the eMudhra certificate distrust | trust chain | task 1 on the list, on Housam's PC |

The common thread: **native code parsing input an attacker controls** (a
request body, a regular expression), on a server the attacker can reach.
Patching is the only complete fix for those products. Here the question is
whether anything of that shape exists.

### 11.2 Where Maison d'Mist stands

The site is static files on GitHub Pages: no PHP, no GitLab, no server code,
no database, no login, no forms, no uploads, no cookies. GitHub runs the
servers and patches them. What remains is what our own files do in a
visitor's browser, and the accounts that control the files.

| Attack class | Shape here | Why it cannot work | Enforced by |
|---|---|---|---|
| Request-parser memory corruption (PHP2Shell) | none: nothing of ours receives a request | no server-side code is published; pages have no `<form>`; the policy sets `form-action 'none'` | security checks C and B |
| Regex compiled from attacker input (GitLab) | the scripts have a handful of fixed patterns (digits, a leading `@`, `https://`) | no regular expression is built at run time, and no visitor input reaches any of them | check A refuses `RegExp(` |
| CI/CD configuration injection (GitLab) | none | no workflow files exist; GitHub Pages copies the files as they are (`.nojekyll`, so no template engine runs) | check C |
| HTML or script injection (XSS) | product and contact text from `data/*.js` | every element is made by `assets/js/safe-dom.js`: text goes in as text, attributes through `setAttribute`, never `innerHTML`; the page policy enforces **Trusted Types**, so the browser itself refuses `innerHTML`, `eval` and injected scripts | checks A, B, E |
| Address injection (`javascript:`, `data:`, another site) | photo, film and social addresses | links must be `https:`, `mailto:`, `tel:` or this site; files the page loads must be on this site; the browser's URL parser decides, so `java\tscript:` and `//other.site` are caught; the policy allows files only from `'self'` | check E |
| Email header injection | the email address | it is encoded, so `?cc=`/`?body=` cannot be added. **This was a real gap in 0.41 and 0.42** | checks D, E |
| Memory bugs in the browser's own decoders (images, fonts, films), the same class as PHP2Shell's | every photo, font and film | the browser maker patches the decoders; we make sure a page can only ever load our own files (so even an injected address cannot feed it a hostile file), that each file is the format it claims, and that no SVG carries a script. **0.41 and 0.42 accepted a photo address on another site** | checks B, C, E |
| Third-party code or styles (supply chain) | Google Fonts until 0.42 | fonts now come from this site; pages make **no** request to any other site; nothing from npm is published | checks B, E |
| Prototype tricks (`__proto__`, `constructor` as a name) | icon lookup by ingredient name | lookups check the object's own keys only | check E |
| Service-worker abuse | `sw.js` | the page policy allows two Trusted Types policies and no others: `mdm-sw` can produce exactly one address, `/sw.js`; the worker only handles this site's GET requests and only stores complete answers | check E, site checks |
| Search-engine data used as a way in | the product list for search engines (0.42), built from `data/products.js` | the other policy, `mdm-jsonld`, gives a script element only text that parses as JSON, which can't call anything; the element is a data block that never runs, and its text is never parsed as HTML, so a product name holding `</script><script>` stays a string | check E |
| Reverse tabnabbing / clickjacking | links that open a new tab | every new-tab link has `rel="noopener"`; there is no login or form to trick anyone into. `frame-ancestors` can't be set from a `<meta>` tag, only from a header (see 11.3) | check B |

How the security checks prove it: `node tools/check-security.cjs`, **154
checks, all passing on 0.43**. The browser part replaces every text in the
data files with attack strings (`<img onerror>`, `<script>`, `<svg onload>`,
`javascript:`, `java\tscript:`, `data:`, `//evil.example`, attribute
breakouts, template payloads, `?cc=` in the email, `__proto__` as a name),
then hovers and clicks every card and button in all three languages. Nothing
runs, no element gains a handler, nothing loads from another site, and the
attacks show as plain text. A unit test also tries the builder directly
with scripts, frames, handlers and bad addresses. The same checks run against
the live 0.42 fail in 19 places: no policy, HTML built from strings, Google
Fonts, eval allowed, and the email `cc` gap.

Browsers: the policy works in every current browser on Windows 10 and 11.
Trusted Types are enforced by Chromium browsers (Edge and Chrome, the
defaults there). Where a browser doesn't enforce them, nothing changes,
because the code never makes those calls in the first place.

### 11.3 Outside the code: what Housam controls

The code can't protect the accounts that publish it. In order of value:

| # | Where | Action | Why |
|---|---|---|---|
| 1 | GitHub | passkey or two-factor login | whoever controls the account controls the site |
| 2 | GitHub → Settings → Pages → **Verified domains** | verify `maisondmist.com` (one TXT record at Cloudflare) | stops anyone else's GitHub Pages from claiming the domain or a subdomain (`v1.`, `v3.`) |
| 3 | GitHub repository → Settings → Pages | keep **Enforce HTTPS** ticked | no plain-HTTP copy of the site |
| 4 | GitHub → Applications | limit the Claude app (now "All repositories") and any token given to Kimi to the repositories they need | a leaked token then reaches one repository, not all |
| 5 | Cloudflare | two-factor login; turn on **DNSSEC**; no wildcard (`*`) records; delete records for subdomains not in use; a CAA record for `letsencrypt.org` (the authority GitHub Pages uses) | protects the domain itself |
| 6 | Cloudflare tunnels | cloudflared 2026.10.2 or later on every PC (task 1) | the certificate change |
| 7 | Other projects | if anything behind your tunnels runs **PHP or a self-managed GitLab**, upgrade it to the fixed versions above today | PHP2Shell is being exploited now |
| 8 | Optional, later | switch the Cloudflare proxy on (SSL **Full (strict)**) and add response headers: `Strict-Transport-Security`, `Content-Security-Policy: frame-ancestors 'none'`, `X-Content-Type-Options: nosniff` | the only protections that need a header; check GitHub Pages still renews its certificate |

### 11.4 Rules for every later change

1. Content goes into a page only through `MDM_DOM.el`, `MDM_DOM.fill` and
   `MDM_DOM.draw`. Never `innerHTML`, `outerHTML`, `insertAdjacentHTML`,
   `document.write`, `eval`, `new Function`, string timers or `RegExp(...)`.
2. A new page copies the security `<meta>` tag as its first line after
   `charset`. A changed inline script needs its new hash; the security checks
   print which page is wrong.
3. Any outside service (analytics, chat, payments, a font, a map) needs a
   threat-model update first, because it means loosening the policy.
4. Both check suites pass before every release.

Sources: [CISA alert](https://www.cisa.gov/news-events/alerts/2026/10/21/critical-vulnerabilities-php-require-immediate-patching) ·
[Datadog Security Labs on PHP2Shell](https://securitylabs.datadoghq.com/articles/php2shell-critical-vulnerabilities-in-php/) ·
[Unit 42 threat brief](https://unit42.paloaltonetworks.com/cve-2026-109618-cve-2026-109619/) ·
[Help Net Security](https://www.helpnetsecurity.com/2026/10/21/php2shell-php-vulnerabilities-patched-cve-2026-109618-cve-2026-109619/) ·
[GitLab CVE-2026-110264 (The Hacker News)](https://thehackernews.com/2026/10/critical-gitlab-flaw-cvss-100-could.html) ·
[GitLab CVE-2026-97229 (Kudelski Security)](https://kudelskisecurity.com/research/gitlab-unauthenticated-remote-code-execution).
GitLab's details come from secondary reports; GitLab's own advisory gives
the authoritative version list.

---

## 12. Not verified, and still outstanding

**Not verified yet.** These need a real device:

| | How to verify |
|---|---|
| Installing on a phone (Android, iPhone) | open maisondmist.com → Add to Home Screen → the Maison d'Mist icon appears and opens full-screen |
| Installing in desktop Chrome/Edge | the install icon in the address bar → the app opens in its own window with the right icon |
| The security policy on the live site (0.43) | open the site in Edge, press F12 → Console: no red "Content-Security-Policy" or "Trusted Types" messages; fonts look as before |
| Trusted Types in Firefox and Safari | tested in Chromium only; check the site works in both (it should, the code doesn't depend on them) |

**Outstanding, needing information or action from Housam:**

| # | Item |
|---|---|
| 1 | The final phone/WhatsApp number and Instagram handle, replacing the temporary ones in `data/site.js`. Confirm the country: WhatsApp currently assumes Lebanon (+961) |
| 2 | The soaps: real photos, ingredients, and when each goes from "Coming soon" to available |
| 2b | Corrected product films without the AI label mistakes |
| 2c | The real second lotion, to replace the test copy that carries the second film |
| 2d | A Donut Soap photo with its sticker, its name and size |
| 3 | French copy review by a native speaker |
| 4 | Whether to create the private studio repository for drafts (section 2) |
| 5 | A vector (SVG/PDF) logo, if one exists |
| 6 | Analytics, if wanted (Cloudflare Web Analytics is free and cookie-free) |

---

## 13. Version history

| Version | Date | Live? | What |
|---|---|---|---|
| 0.50 | 2026-10-26 | prepared | Coming soon on maisondmist.com; saved copies retired; the full site moves to test subdomains v1, v2, v3 |
| 0.43 | 2026-10-27 | not yet | Security hardening after the October 2026 threat model: strict policy with Trusted Types on every page, safe page building, self-hosted fonts, email and photo-address gaps closed; 136 site + 141 security checks |
| 0.42 | 2026-10-26 | **yes** | Localized search/social metadata, organization/site/page schema and real product ItemList; GitHub safeguards; 153 checks |
| 0.41 | 2026-10-25 | until 0.42 | Updates reach phones by themselves; pages, scripts and data always fresh online; 136 checks |
| 0.40 | 2026-10-25 | until 0.41 | Categories and filter, product animations, one film per lotion card, Donut Soap, 135 checks |
| 0.31 | 2026-10-25 | until 0.40 | Full-length films (lotion: both films joined), version shown in the footer, Dark Luxury footer readable, 127 checks |
| 0.30 | 2026-10-25 | until 0.31 | Eight laurel soaps (coming soon), WhatsApp ordering, equal-size cards, product and contact data checks, 123 checks |
| 0.20 | 2026-10-25 | via 0.30 | Real products and ingredients, French, Light/Dark/System, product films, installable offline app with safe updates, 120 checks |
| 0.11 | 2026-10-25 | never | Private studio + deploy tool, prepared but not adopted; parked on branch `studio` |
| 0.10 | 2026-10-25 | until 0.30 | First bilingual build with sample products |
