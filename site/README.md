# Maison d'Mist — the live site

This repository is what **https://maisondmist.com** serves, through
GitHub Pages. It holds only the published files.

**Do not edit here.** Every change is made and approved in the private
studio repository (`Housam911/Maison.dmist-studio`) and released with
`node tools/deploy.mjs --push`. A direct edit here is overwritten by the
next release, and the release tool refuses to run while one is present.

The version that is live is in [`VERSION`](VERSION), and each release is
tagged `v0.11`, `v0.12` and so on.
