# Maison d'Mist — maisondmist.com

**From 0.50 this repository serves "Coming soon"** while the full site is
built and tested on its own addresses:

| Address | Repository | Shows |
|---|---|---|
| maisondmist.com | `Housam911/Maison.dmist` (this one) | Coming soon, in English, Arabic and French |
| v1.maisondmist.com | `Housam911/maisondmist-v1` | the full site as of 0.41 |
| v2.maisondmist.com | `Housam911/maisondmist-v2` | Kimi's version |
| v3.maisondmist.com | `Housam911/maisondmist-v3` | the iOS edition |

Checks for this site: `node tools/check-coming-soon.cjs`.

The single technical record for the whole project, every site and every
version: **[docs/TECHNICAL-REPORT.md](docs/TECHNICAL-REPORT.md)**. History:
[CHANGELOG.md](CHANGELOG.md). Current version: [VERSION](VERSION).

---

# Maison d'Mist — maisondmist.com

The brand site for **Maison d'Mist** — *Scent Soft Skin*. Version in
[`VERSION`](VERSION).

A static site: plain HTML, CSS and JavaScript, with no build step and no
dependencies. GitHub Pages serves the `main` branch of this repository, and
the domain is registered at Cloudflare. It installs as an app on phones and
PCs, and pages already visited open offline.

- **English:** https://maisondmist.com/
- **Arabic:** https://maisondmist.com/ar/
- **French:** https://maisondmist.com/fr/
- **What is live:** https://maisondmist.com/VERSION

## How changes go live

`main` **is** the live website. Nobody works on it directly.

1. Work happens on a branch (for example `feature/immersive-pwa`).
2. `node tools/check-site.cjs` must pass. That's 136 browser checks, in all
   three languages, at every phone width.
3. Housam reviews the screenshots and approves.
4. Only after an explicit "deploy", the approved branch goes to `main`
   (`git push origin <branch>:main`, never forced). GitHub Pages republishes in
   about a minute, and phones that already have the site refresh into the new
version by themselves.

**Every release raises `VERSION` and the `VERSION` constant in `sw.js` to the
same number.** The checks refuse a release where they differ. Without that,
phones that installed the site would keep the old styles and scripts.

## The two files that change most

| What you want to change | File |
|---|---|
| Phone, WhatsApp, Instagram, TikTok, Facebook, Telegram, email | `data/site.js` |
| The products, their categories, ingredients, photos, films and animations | `data/products.js` |

## Everything else

One file holds the full technical record: what is built, how it is
deployed, the DNS settings, what was verified and what is still outstanding.

**[docs/TECHNICAL-REPORT.md](docs/TECHNICAL-REPORT.md)**

## Preview on your own PC

Double-click `index.html`, `ar/index.html` or `fr/index.html`. They open in
Edge, Chrome or Firefox on Windows 10 and 11 and work as they do online. The
app install and offline features need the real website (`https://`), not a
file opened from disk.
