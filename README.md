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
2. `node tools/check-site.cjs` and `node tools/check-security.cjs` must
   pass. That's 136 browser checks, in all three languages and at every phone
   width, plus 141 security checks.
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

## Security

Every page runs under a strict security policy, and scripts add content only
through `assets/js/safe-dom.js`, never `innerHTML` or `eval`. The threat
model and the rules for later changes are in section 11 of the technical
report.

## Everything else

One file holds the full technical record: what is built, how it is
deployed, the DNS settings, what was verified and what is still outstanding.

**[docs/TECHNICAL-REPORT.md](docs/TECHNICAL-REPORT.md)**

## Preview on your own PC

Double-click `index.html`, `ar/index.html` or `fr/index.html`. They open in
Edge, Chrome or Firefox on Windows 10 and 11 and work as they do online. The
app install and offline features need the real website (`https://`), not a
file opened from disk.
