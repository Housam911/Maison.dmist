# Maison d'Mist — studio

The private workshop for **maisondmist.com**. All work happens here:
Claude, Kimi and anyone else who helps. Nothing here is public, and
nothing reaches the website until it is approved and released.

| Repository | Visibility | What it is |
|---|---|---|
| `Housam911/Maison.dmist-studio` | **private** | this one: the site's source, docs, tools, drafts |
| `Housam911/Maison.dmist` | public | the live site only. GitHub Pages serves it. Never edited by hand |

## How a change goes live

1. **Work.** Every change is made on its own branch here, opened as a pull request.
2. **Review.** Look at the screenshots in the pull request, or preview it yourself:
   download the branch and double-click `site/index.html`. It works on Windows 10
   and 11 with no setup.
3. **Approve.** Merge the pull request, or tell Claude "approved".
4. **Deploy.** Tell Claude "deploy", or run `node tools/deploy.mjs --push` yourself.
   maisondmist.com updates about a minute later.

`tools/deploy.mjs` will not release unmerged work, uncommitted work, a version
without release notes, a build that fails its checks, or over someone's direct
edit to the live repository.

## The two files that change most

| Change | File |
|---|---|
| Phone, WhatsApp, Instagram, TikTok, Facebook, Telegram, email | `site/data/site.js` |
| The products | `site/data/products.js` |

## Everything else

**[docs/TECHNICAL-REPORT.md](docs/TECHNICAL-REPORT.md)**, the single technical
record: version, file map, how releases work, DNS, rules for every AI working
here, and what is outstanding. Current version: see [`VERSION`](VERSION).
