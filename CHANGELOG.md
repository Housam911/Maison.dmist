# Changelog

Release numbers are `x.yz`, recorded in [`VERSION`](VERSION).

## 0.11 — 2026-10-25

The studio and the live site become two repositories. **The website itself
does not change**: same pages, same look.

- **Studio (private), `Housam911/Maison.dmist-studio`.** The source, docs,
  tools and drafts. All work by Claude, Kimi or anyone else happens here, on
  branches with pull requests. Drafts, unreleased products and prices stay
  private. Before this, everything sat in the public repository GitHub Pages
  needs.
- **Live (public), `Housam911/Maison.dmist`.** Only the published files. From
  this release on it changes only through a release.
- **`tools/deploy.mjs`** sends approved work live: it copies `site/` across,
  commits "Release x.yz" with this changelog's notes, tags both repositories
  `vx.yz`, and pushes. It refuses unless the studio is on a clean `main` in step
  with GitHub, `VERSION` was raised with a matching changelog section, the
  release checks pass, and nobody edited the live repository directly since the
  last release. Without `--push` it is a dry run. Node only, so it runs the same
  on Windows 10/11, macOS and Linux.
- **Version stamp:** the live site carries `VERSION`, so
  `https://maisondmist.com/VERSION` shows what is live.
- **Layout:** the site's files moved into `site/`; `tools/check-site.cjs` now
  serves `site/`. The live repository keeps its own short README saying it is
  not edited by hand.
- **Rules for AI contributors** are in the technical report, section 8.

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
