# Maison d'Mist — technical report

**Version 0.11** · 25 October 2026

| | |
|---|---|
| Live | **0.10**, on GitHub Pages since 25 October 2026 (Cloudflare DNS and HTTPS: confirm in a browser) |
| In the studio | **0.11**, the two-repository split; the website itself is unchanged. Waiting for approval to deploy |

This is the single technical file for the project. It records what
exists, how it is put together, how work reaches the website, and what is
still outstanding. Every release updates this file and adds a section to
[`CHANGELOG.md`](../CHANGELOG.md); the number lives in
[`VERSION`](../VERSION).

---

## 1. What this is

A static brand site for **Maison d'Mist** (*Scent Soft Skin*), a
fragrance-mist house. It shows the brand, the collection, and how to
order; it is not a shop and takes no payments. Orders arrive by WhatsApp
or Instagram message.

Deliberately plain: hand-written HTML, one stylesheet, one script. No
framework, no bundler, no npm install, no build step. Anything that
changes often, like products and contact details, lives in two data
files.

| | |
|---|---|
| Domain | `maisondmist.com`, registered at Cloudflare |
| Hosting | GitHub Pages, from `main` of the live repository |
| Studio (source) | `Housam911/Maison.dmist-studio`, **private** |
| Live (published) | `Housam911/Maison.dmist`, public (free GitHub Pages requires it) |
| English | `https://maisondmist.com/` |
| Arabic | `https://maisondmist.com/ar/` |
| What is live | `https://maisondmist.com/VERSION` |

---

## 2. How work reaches the website

There are two repositories, and only one of them is the website.

```
   Maison.dmist-studio  (private)                    Maison.dmist  (public)
   ──────────────────────────────                    ──────────────────────
   branch ─► pull request ─► review ─► merge          GitHub Pages serves this
   (Claude, Kimi, anyone)     (Housam)   into main      at maisondmist.com
                                            │
                                            │  "deploy"
                                            └──► node tools/deploy.mjs --push ──► Release x.yz, tagged vx.yz
```

1. **Work** on a branch in the studio and open a pull request. Attach
   screenshots of what changed.
2. **Review.** Look at the screenshots, or preview locally: download the
   branch and double-click `site/index.html`. That works on Windows 10
   and 11 with nothing installed, because the data files are plain `.js`
   (section 5).
3. **Approve** by merging the pull request into `main`, or by telling
   Claude "approved".
4. **Deploy.** Only when Housam says so. `tools/deploy.mjs` (section 7)
   copies `site/` to the live repository as one tagged release.

Why two repositories rather than two branches: free GitHub Pages only
serves public repositories. With one repository, every draft, unreleased
product, price and internal note would be public. The studio keeps them
private, and the live repository holds only what customers may see.

---

## 3. File map (studio)

```
Maison.dmist-studio/
├── site/                     ← exactly what goes live, nothing else
│   ├── index.html            English page (LTR)
│   ├── ar/index.html         Arabic page (RTL)
│   ├── 404.html              bilingual "not found" page
│   ├── CNAME                 maisondmist.com, tells GitHub Pages the domain
│   ├── .nojekyll             serve the files as-is, no Jekyll processing
│   ├── README.md             the live repository's front page: "do not edit here"
│   ├── favicon.ico · robots.txt · sitemap.xml · site.webmanifest
│   ├── assets/
│   │   ├── css/site.css      the whole stylesheet
│   │   ├── js/site.js        the whole script
│   │   └── img/              logo cut-out, original artwork, icons, share card,
│   │                         products/ for product photos
│   └── data/
│       ├── site.js           ← contact details and social accounts
│       └── products.js       ← the collection
├── tools/
│   ├── check-site.cjs        release checks (45), served from site/
│   └── deploy.mjs            sends approved work live
├── docs/
│   └── TECHNICAL-REPORT.md   this file
├── CHANGELOG.md · VERSION · README.md
```

The live repository receives the contents of `site/` plus a `VERSION`
file, and nothing else: no docs, no tools, no drafts.

---

## 4. Brand

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
Google Fonts with `display=swap`, with system fallbacks.

No vector original was supplied. The pages use a cut-out of the supplied
artwork: cropped to the lettering and leaf, with the paper background
removed so the logo sits cleanly on every section tint. The ink was
normalised against the logo's own olive so the script stays fully solid;
the leaf keeps its watercolour texture. The footer turns the same file
cream with a CSS filter. The untouched original is kept as
`logo-maison-dmist.webp`. **An SVG or PDF of the logo, if the designer
has one, would make it sharper on large screens.**

---

## 5. How the pages work

Both pages are complete, hand-written HTML sharing one stylesheet and
one script. The script fills in only the parts that change:

- `#collection-grid`: the product cards, from `data/products.js`
- `#contact-grid`, `[data-socials]`, `[data-order-btn]`: contact cards,
  footer icons and order buttons, from `data/site.js`

**Right-to-left.** The Arabic page sets `dir="rtl"`. Every directional
rule uses logical properties (`inset-inline-start`, `margin-inline`,
`padding-block`), so the layout mirrors itself; there is no second
stylesheet to keep in step. Sizes and prices use `unicode-bidi: plaintext`
so "100 ml" never reads "ml 100" inside Arabic text.

**The data files are `.js`, not `.json`, on purpose.** Browsers refuse to
fetch `.json` from `file://`, so the page would break when double-clicked
on a PC. A `.js` file loads from anywhere and still reads like data.

**Empty means hidden.** A blank contact field removes its button, icon or
card instead of linking to nothing; with all of them blank the ordering
section shows one line saying the accounts are being set up.

**Robust by default.** Sections fade in on scroll only after the script
has started, so the page is fully readable with JavaScript off or if a
data file has a typo. Under `prefers-reduced-motion` nothing moves.

---

## 6. Editing the content

All edits are made in the **studio**, then deployed. Never edit the live
repository: the next release overwrites it, and `deploy.mjs` refuses to
run until such an edit is dealt with.

### A product

In `site/data/products.js`, copy a block, paste it, change the values:

```js
{
  id: "rose-musk",
  status: "available",                         // available | coming-soon | sold-out | hidden
  image: "assets/img/products/rose-musk.webp", // "" draws a placeholder bottle
  size: "100 ml",
  price: "45,000 SYP",                         // "" hides the price
  en: { name: "Rose Musk", notes: "Rose · Musk · Amber",
        description: "One or two sentences." },
  ar: { name: "ورد ومسك", notes: "ورد · مسك · عنبر",
        description: "جملة أو جملتان." }
}
```

Keep the comma between blocks; fill both `en` and `ar`. If the collection
suddenly shows "being prepared", the file has a typo, usually a missing
comma or quote.

**Photos** go in `site/assets/img/products/`. Use portrait 4:5 (about
1000 × 1250 px), WebP or JPEG, under about 300 KB each.

### Phone number and social accounts

In `site/data/site.js`:

```js
whatsapp:  "963912345678",   // DIGITS ONLY: no +, no spaces, no 00
phone:     "+963 912 345 678",
email:     "hello@maisondmist.com",
instagram: "maisondmist",    // without the @
tiktok: "", facebook: "", telegram: ""
```

Filling `whatsapp` turns on, all at once: the order button on every
available product, the hero order button, the WhatsApp contact card and
the footer icon. Each order button opens WhatsApp with the message
already written in the language of the page.

---

## 7. Releasing: `tools/deploy.mjs`

```
node tools/deploy.mjs            dry run: what would change, nothing pushed
node tools/deploy.mjs --push     release
```

It needs Node 18+ and Git (both run on Windows 10/11, macOS and Linux) and,
for the release checks, Playwright. In order, it:

1. refuses unless the studio is on `main`, with nothing uncommitted, and
   identical to GitHub's `main`, so only approved, merged work goes live;
2. reads `VERSION` (format `x.yz`) and refuses unless `CHANGELOG.md` has a
   `## x.yz` section, and unless `vx.yz` is not already live;
3. runs `tools/check-site.cjs`, and refuses if anything fails;
4. clones the live repository fresh and refuses if anyone committed to it
   directly since the last release tag (`--force` overrides; those edits are
   then overwritten);
5. replaces its contents with `site/` plus `VERSION`, and prints the change summary;
6. with `--push`: commits **"Release x.yz"** with the changelog section as
   the message, tags `vx.yz`, pushes, then tags the studio `vx.yz` too, so
   every live version points back to its exact source.

GitHub Pages republishes within about a minute; `maisondmist.com/VERSION`
then shows the new number. To roll back, release the earlier source again
under a new version number. Releases only ever move forward.

`--skip-checks` releases without the browser checks, for a machine
without Playwright. Use it rarely and say so in the hand-over.

---

## 8. Rules for every AI working here (Claude, Kimi, others)

1. **Work only in the studio**, on a branch, through a pull request. Never
   commit to `main` directly, and never push to `Housam911/Maison.dmist`.
2. **Never deploy without Housam's explicit go-ahead** in the conversation
   ("deploy", "send it live"). Approval of a design is not approval to deploy.
3. **Every change that will be released raises `VERSION`** (`0.11` → `0.12`)
   and adds its `## x.yz` section to `CHANGELOG.md`, saying what changed
   in plain words.
4. **Update this report** in the same pull request: the version line, any
   section the change affects, and the history table.
5. **Run `node tools/check-site.cjs`** before asking for review; all checks
   must pass. Attach before/after screenshots to the pull request
   (`tools/shots/` has them).
6. **No invented claims.** The site says nothing about ingredients, origin,
   testing or certification until Housam supplies them. Those claims are
   regulated.
7. **Keep it static.** No framework, build step or tracking script without
   Housam agreeing first; the double-click preview must keep working.
8. **Both languages, always.** Any visible text goes in English and Arabic.
   Arabic copy uses neutral forms (noun phrases, not gendered imperatives).

---

## 9. Hosting and the domain

### 9.1 GitHub Pages: on

Pages is enabled on the live repository (`main`, `/ (root)`), with the custom
domain `maisondmist.com` from the `CNAME` file. The first deployment ran
successfully on 25 October 2026 at 10:08 UTC.

### 9.2 Cloudflare DNS

Cloudflare → **maisondmist.com** → **DNS** → **Records**. Remove any
parking `A`, `AAAA` or `CNAME` records for `@` and `www` (leave `MX` and
`TXT` alone; they are for email), then:

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

These are GitHub's published Pages addresses; confirm them at
<https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site>.

**Grey cloud first.** With the proxy off, GitHub issues its certificate
directly. With the orange cloud on, issuance often stalls and the site
shows SSL errors for hours.

### 9.3 HTTPS

When **Settings → Pages** shows *DNS check successful*, tick **Enforce
HTTPS**. `www.maisondmist.com` then redirects to `maisondmist.com`.

### 9.4 Optional: the Cloudflare proxy

Only once HTTPS works: switch the records to the orange cloud and set
**SSL/TLS → Full (strict)**. Anything less loops. This adds caching and
analytics; the site does not need it.

---

## 10. Release checks

`node tools/check-site.cjs` drives both pages in Chromium. **45 of 45
pass for 0.11** (unchanged from 0.10; the site's files are the same).

| Area | What is checked |
|---|---|
| Layout | one `<h1>` per page; no sideways scroll at 1440 px or 390 px; every section visible after scrolling |
| Direction | English LTR, Arabic RTL; sizes and prices keep their own direction |
| Links | no empty or dead link while the contact fields are blank |
| Mobile menu | hidden when closed, covers the screen when open, closes on Escape |
| Ordering | with a number filled in: WhatsApp button on available products only, number cleaned to digits, message pre-written in the page's language, hidden products removed, badges correct |
| Footer | icons only for filled accounts |
| Robustness | renders from `file://`; readable with JavaScript off; still under reduced motion; no script errors |

Colour contrast: olive on cream ≈ 7.3:1, cream on the footer olive ≈ 12:1,
both above WCAG AA. Browsers: Edge, Chrome, Firefox and Opera on Windows 10
and 11; Safari on macOS and iOS; Chrome on Android.

---

## 11. Still outstanding

| # | Item | Needed from Housam |
|---|---|---|
| 1 | Confirm Cloudflare DNS and HTTPS | open https://maisondmist.com and check for the padlock |
| 2 | Phone number and social accounts | WhatsApp number, Instagram handle, any others |
| 3 | The real collection | names, notes, sizes, prices, photos; the four sample entries must go before the site is announced |
| 4 | The house story | the two "The house" paragraphs are placeholder brand copy |
| 5 | Product photography | none yet; a placeholder bottle is drawn |
| 6 | Claims | none are made; add only what can be stood behind |
| 7 | A vector logo | SVG or PDF, if one exists |
| 8 | Analytics | none; Cloudflare Web Analytics is free and cookie-free |
| 9 | Preview links (optional) | Cloudflare Pages can give each pull request its own preview URL from the private studio, so review needs no download |

Not planned: cart, checkout, payments, stock, customer accounts. Outgrowing
WhatsApp ordering means a hosted store (for example Shopify), not an
extension of this site.

---

## 12. Version history

| Version | Date | Live? | What |
|---|---|---|---|
| 0.11 | 2026-10-25 | not yet | Two repositories: private studio and public live site; `tools/deploy.mjs`; AI working rules; version stamp on the live site |
| 0.10 | 2026-10-25 | yes | First build: bilingual static site, brand system, product and contact data files, release checks, GitHub Pages and Cloudflare setup |
