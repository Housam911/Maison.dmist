# Maison d'Mist — technical report

**Version 0.10** · 25 October 2026 · status: built, not yet published

This is the single technical file for the site. It records what exists,
how it is put together, how it goes live, and what is still outstanding.
Every later release updates this file and adds a line to
[`CHANGELOG.md`](../CHANGELOG.md); the number also lives in
[`VERSION`](../VERSION).

---

## 1. What this is

A static brand site for **Maison d'Mist** (*Scent Soft Skin*) — a
fragrance-mist house. It shows the brand, the collection, and how to
order; it is not a shop and takes no payments. Orders are placed by
WhatsApp or Instagram message.

Deliberately plain: hand-written HTML, one stylesheet, one script.
No framework, no bundler, no npm install, no build step. The whole site
is 13 text files and 9 images. Anything that changes often — products,
contact details — lives in two data files a non-programmer can edit on
github.com.

| | |
|---|---|
| Domain | `maisondmist.com` (registered at Cloudflare) |
| Hosting | GitHub Pages, served from `main` |
| Repository | `Housam911/Maison.dmist` (public — required for free GitHub Pages) |
| English | `https://maisondmist.com/` |
| Arabic | `https://maisondmist.com/ar/` |
| Total size | about 780 KB, nearly all of it images |

---

## 2. File map

```
maisondmist/
├── index.html              English page (LTR)
├── ar/index.html           Arabic page (RTL)
├── 404.html                bilingual "not found" page
├── CNAME                   maisondmist.com  — tells GitHub Pages the domain
├── .nojekyll               serve the files as-is, no Jekyll processing
├── favicon.ico             16/32/48 px
├── robots.txt              allows everything, points at the sitemap
├── sitemap.xml             both pages, cross-linked by language
├── site.webmanifest        name, colours and icons for "add to home screen"
├── VERSION                 0.10
├── README.md               short front page
├── CHANGELOG.md            release history
├── assets/
│   ├── css/site.css        the whole stylesheet (~400 lines)
│   ├── js/site.js          the whole script (~290 lines)
│   └── img/
│       ├── logo-maison-dmist.webp          original artwork, untouched
│       ├── logo-maison-dmist-trimmed.webp  cropped, used on the pages
│       ├── logo-maison-dmist.png           PNG copy for anything that
│       │                                   cannot read WebP
│       ├── og-image.png                    1200×630 social share card
│       ├── apple-touch-icon.png            180 px
│       ├── icon-192.png · icon-512.png     PWA / Android icons
│       ├── favicon-32.png · favicon-16.png
│       └── products/                       put product photos here
├── data/
│   ├── site.js             ← contact details and social accounts
│   └── products.js         ← the collection
├── tools/
│   └── check-site.cjs      release checks (45), run before every version
└── docs/
    └── TECHNICAL-REPORT.md this file
```

---

## 3. Brand

Colours were sampled from the supplied logo artwork, not guessed.

| Token | Value | Use |
|---|---|---|
| `--cream` | `#fefdf9` | page background, the logo's own cream |
| `--cream-warm` | `#f6f3e8` | alternating sections |
| `--olive` | `#656430` | the script in the logo; buttons, links |
| `--olive-deep` | `#41411c` | headings, footer background |
| `--sage` | `#8f8d60` | the leaf; small caps, rules, accents |
| `--sage-pale` | `#c3c1a3` | hairlines, step numbers |
| `--ink` | `#33321f` | body text |

Type: **Cormorant Garamond** (display) with **Jost** (body) for English;
**Amiri** (display) with **Tajawal** (body) for Arabic. Served from
Google Fonts with `display=swap`, with system fallbacks if the fonts are
blocked or slow.

No vector original was supplied. The pages use a cut-out of the supplied
artwork: cropped to the lettering and leaf, with the paper background
removed so the logo sits cleanly on every section tint. The ink was
normalised against the logo's own olive so the script stays fully solid;
the leaf keeps its watercolour texture. The footer turns the same file
cream with a CSS filter. The untouched original is kept as
`logo-maison-dmist.webp`.
**If you ever get the logo as SVG or PDF, send it — the site will look
sharper on large screens.**

---

## 4. How the pages work

Both pages are complete, hand-written HTML. They share one stylesheet
and one script. The script fills in only the two parts that change:

- `#collection-grid` — the product cards, built from `data/products.js`
- `#contact-grid`, `[data-socials]`, `[data-order-btn]` — the contact
  cards, footer icons and order buttons, built from `data/site.js`

**Right-to-left.** The Arabic page sets `dir="rtl"`. Every directional
rule in the stylesheet uses logical properties (`inset-inline-start`,
`margin-inline`, `padding-block`), so the layout mirrors itself and
there is no second Arabic stylesheet to keep in step.

**The data files are `.js`, not `.json`, on purpose.** A `.json` file has
to be fetched, and browsers refuse to fetch files from `file://` for
security reasons — the page would look broken when you double-click
`index.html` on your own PC. A `.js` file loads from anywhere. The
contents still read like plain data.

**Empty means hidden.** Every contact field is blank in this release.
The script removes the button, icon or card rather than linking to
nothing, and the ordering section shows one short line saying the
accounts are being set up. There is not a single dead link on the site.

---

## 5. Editing the site

### Add or change a product

Open `data/products.js` on github.com, press the pencil, edit, then
**Commit changes**. The live site updates in about a minute.

```js
{
  id: "rose-musk",
  status: "available",                         // available | coming-soon | sold-out | hidden
  image: "assets/img/products/rose-musk.webp", // "" draws a placeholder
  size: "100 ml",
  price: "45,000 SYP",                         // "" hides the price
  en: { name: "Rose Musk", notes: "Rose · Musk · Amber",
        description: "One or two sentences." },
  ar: { name: "ورد ومسك", notes: "ورد · مسك · عنبر",
        description: "جملة أو جملتان." }
}
```

Keep the comma between blocks. Both `en` and `ar` are needed — the
Arabic page shows the Arabic text, the English page the English.

**Product photos:** upload to `assets/img/products/`. Portrait shape,
4:5, around 1000 × 1250 px. WebP or JPEG. Keep each one under about
300 KB so the page stays fast.

### Publish the phone number and social accounts

Open `data/site.js` and fill in what you have:

```js
whatsapp:  "963912345678",   // DIGITS ONLY — no +, no spaces, no 00
phone:     "+963 912 345 678",
email:     "hello@maisondmist.com",
instagram: "maisondmist",    // handle without the @
tiktok:    "",
facebook:  "",
telegram:  ""
```

The WhatsApp number is the important one: filling it turns on the order
button on every available product, the order button in the hero, the
WhatsApp card in the ordering section, and the WhatsApp icon in the
footer — all at once. Each order button opens WhatsApp with the message
already written, in the language of the page the visitor was reading.

---

## 6. Going live

### 6.1 Turn on GitHub Pages

1. Open `https://github.com/Housam911/Maison.dmist` → **Settings** → **Pages**.
2. **Source:** *Deploy from a branch*.
3. **Branch:** `main`, folder `/ (root)` → **Save**.
4. **Custom domain:** type `maisondmist.com` → **Save**.
   (The `CNAME` file in the repository already says this, so the field
   may be filled in for you.)
5. Leave **Enforce HTTPS** alone for now — it stays greyed out until the
   DNS below is in place and GitHub has issued the certificate.

### 6.2 Point the domain at it, in Cloudflare

Cloudflare dashboard → **maisondmist.com** → **DNS** → **Records**.

Delete any existing `A`, `AAAA` or `CNAME` record for `@` or `www`
(Cloudflare adds parking records on a new domain), then add:

| Type | Name | Content | Proxy status |
|---|---|---|---|
| A | `@` | `185.199.108.153` | **DNS only** (grey cloud) |
| A | `@` | `185.199.109.153` | **DNS only** |
| A | `@` | `185.199.110.153` | **DNS only** |
| A | `@` | `185.199.111.153` | **DNS only** |
| AAAA | `@` | `2606:50c0:8000::153` | **DNS only** |
| AAAA | `@` | `2606:50c0:8001::153` | **DNS only** |
| AAAA | `@` | `2606:50c0:8002::153` | **DNS only** |
| AAAA | `@` | `2606:50c0:8003::153` | **DNS only** |
| CNAME | `www` | `housam911.github.io` | **DNS only** |

> These are GitHub's published Pages addresses and have been stable for
> years, but confirm them against
> <https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site>
> before you type them in. The AAAA records are optional; add them so the
> site works for visitors on IPv6-only mobile networks.

**The grey cloud matters.** With the proxy off, Cloudflare only answers
DNS and GitHub serves the site directly, so GitHub can issue its free
certificate straight away. With the orange cloud on, certificate
issuance often stalls and the site can show an SSL error for hours.
Get it working grey first.

### 6.3 Finish

1. Back in **Settings → Pages**, wait for the green *DNS check successful*
   (usually a few minutes, up to 24 hours).
2. Tick **Enforce HTTPS**.
3. Open `https://maisondmist.com` — the site should be live, and
   `www.maisondmist.com` should redirect to it automatically.

### 6.4 Optional, later: turn the Cloudflare proxy on

Only once HTTPS works. Switch the records to the orange cloud, then set
Cloudflare **SSL/TLS → Overview → Full (strict)**. Anything less than
Full will put the site into a redirect loop. This buys caching and
Cloudflare's analytics; it is not needed for the site to work.

---

## 7. Checks run before release

`node tools/check-site.cjs` drives both pages in Chromium. **45 of 45
passed for 0.10.**

| Area | What is checked |
|---|---|
| Layout | one `<h1>` per page; no sideways scroll at 1440 px or 390 px; every section visible after scrolling |
| Direction | English is LTR, Arabic is RTL; sizes and prices keep their own direction inside Arabic text |
| Links | no empty or dead link anywhere while the contact fields are blank |
| Mobile menu | hidden when closed, covers the screen when open, closes on Escape |
| Ordering | with a number filled in: WhatsApp button on available products only, number cleaned to digits, message pre-written in the page's language, hidden products removed, sold-out and coming-soon badges |
| Footer | icons appear only for filled accounts |
| Robustness | renders from `file://` (double-click on Windows); fully readable with JavaScript off; no animation under reduced motion; no script errors |

Fixed during this release's checks: the logo showed as a pale box on the
tinted sections and a white box in the footer (now cut out); the mobile
menu spilled under the header because the header's blur made it the
menu's containing block (blur moved to a pseudo-element); the page had no
`<h1>` (the hero logo is now the heading); sections would have stayed
invisible if the script failed (they are now hidden only once it runs).

Colour contrast: olive `#656430` on cream ≈ 7.3:1; cream on the footer
olive ≈ 12:1 — both above WCAG AA.

Browsers: Edge, Chrome, Firefox and Opera on **Windows 10 and 11**,
Safari on macOS and iOS, Chrome on Android. The site uses WebP, CSS
logical properties, `color-mix()` and `IntersectionObserver` — all
supported since 2023. On an older browser the layout still reads
correctly; it loses the backdrop blur and the scroll animations.

---

## 8. Still outstanding

Carried into the next release.

| # | Item | Needed from you |
|---|---|---|
| 1 | **Phone number and social accounts** | the WhatsApp number, Instagram handle, and any others — `data/site.js` |
| 2 | **The real collection** | names, scent notes, sizes, prices and photos — the four sample entries must go before the site is announced |
| 3 | **The house story** | the two paragraphs under "The house" are placeholder brand copy; replace with your own story |
| 4 | **Product photography** | nothing exists yet; the site draws a placeholder bottle until photos arrive |
| 5 | **Claims to confirm** | the site deliberately makes **no** claim about ingredients, origin, testing or certification. Add only what you can stand behind — those claims are regulated in most markets |
| 6 | **A vector logo** | SVG or PDF, if the designer has one |
| 7 | **Analytics** | none installed. Cloudflare Web Analytics is free and needs no cookie banner, if you want visitor numbers |

Not planned, and worth saying out loud: there is no cart, no checkout,
no payment, no stock tracking and no customer accounts. If the brand
outgrows WhatsApp ordering, that is a different kind of project —
Shopify or a hosted store — not an extension of this one.

---

## 9. Version history

| Version | Date | What |
|---|---|---|
| 0.10 | 2026-10-25 | First build: bilingual static site, brand system, product and contact data files, release checks, GitHub Pages and Cloudflare setup documented |
