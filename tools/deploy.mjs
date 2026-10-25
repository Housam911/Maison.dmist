#!/usr/bin/env node
/* Maison d'Mist — send the approved site live.

   Copies site/ from this studio repository into the public repository
   that GitHub Pages serves (Housam911/Maison.dmist), commits it as
   "Release x.yz", tags both repositories vx.yz, and pushes. GitHub Pages
   republishes maisondmist.com about a minute later.

   It refuses to release unless:
     - the studio is on main, with nothing uncommitted, in step with GitHub
       (only approved, merged work goes live);
     - VERSION was raised and CHANGELOG.md has a "## x.yz" section for it;
     - the release checks pass (tools/check-site.cjs);
     - nobody edited the public repository directly since the last release.

   Run from anywhere — Windows 10/11, macOS or Linux, Node 18+ and Git:
     node tools/deploy.mjs            dry run: shows what would change, pushes nothing
     node tools/deploy.mjs --push     release for real

   Options:
     --skip-checks       release without the browser checks (only on a machine
                         without Playwright; say so when you hand over)
     --force             release even though the public repository was edited
                         directly (those edits are overwritten)
     --public-url <url>  release to another repository (for testing) */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const STUDIO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = path.join(STUDIO, 'site');

const args = process.argv.slice(2);
const PUSH = args.includes('--push');
const SKIP_CHECKS = args.includes('--skip-checks');
const FORCE = args.includes('--force');
const urlAt = args.indexOf('--public-url');
const PUBLIC_URL = urlAt >= 0 ? args[urlAt + 1] : 'https://github.com/Housam911/Maison.dmist.git';

const git = (cwd, ...a) =>
  execFileSync('git', a, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const tryGit = (cwd, ...a) => { try { return git(cwd, ...a); } catch { return ''; } };
const step = (msg) => console.log('• ' + msg);
const fail = (msg) => { console.error('\n✗ ' + msg + '\n\nNothing was released.\n'); process.exit(1); };

// 1. Only approved work: on main, committed, and the same as GitHub's main.
const branch = git(STUDIO, 'rev-parse', '--abbrev-ref', 'HEAD');
if (branch !== 'main') fail(`Releases go out from main only; this is "${branch}". Merge the approved work into main first.`);
if (git(STUDIO, 'status', '--porcelain')) fail('The studio has uncommitted changes. Commit or discard them first.');
step('Checking the studio is in step with GitHub…');
git(STUDIO, 'fetch', '-q', 'origin', 'main');
const studioHead = git(STUDIO, 'rev-parse', 'HEAD');
if (studioHead !== git(STUDIO, 'rev-parse', 'origin/main')) {
  fail('Studio main differs from GitHub. Pull or push first, so what goes live is exactly what was approved.');
}

// 2. A new version with release notes.
const version = fs.readFileSync(path.join(STUDIO, 'VERSION'), 'utf8').trim();
if (!/^\d+\.\d{2}$/.test(version)) fail(`VERSION should look like 0.11; it says "${version}".`);
const section = fs.readFileSync(path.join(STUDIO, 'CHANGELOG.md'), 'utf8')
  .split(/^## /m).slice(1)
  .find((s) => s.split(/\s/)[0] === version);
if (!section) fail(`CHANGELOG.md has no "## ${version}" section. Write down what this release changes first.`);
const notes = '## ' + section.trim();

// 3. Release checks.
if (SKIP_CHECKS) {
  step('Skipping the browser checks (--skip-checks).');
} else {
  step('Running the release checks…');
  try {
    execFileSync(process.execPath, [path.join(STUDIO, 'tools', 'check-site.cjs')], { cwd: STUDIO, stdio: 'inherit' });
  } catch {
    fail('The release checks did not pass.');
  }
}

// 4. The public repository, fresh.
const PUB = fs.mkdtempSync(path.join(os.tmpdir(), 'maison-dmist-live-'));
step(`Fetching ${PUBLIC_URL}…`);
git(PUB, 'clone', '-q', PUBLIC_URL, '.');
if (git(PUB, 'ls-remote', '--tags', 'origin', `refs/tags/v${version}`)) {
  fail(`v${version} is already live. Raise VERSION and add its CHANGELOG section for a new release.`);
}
const lastRelease = tryGit(PUB, 'describe', '--tags', '--abbrev=0', '--match', 'v*');
if (lastRelease) {
  const direct = git(PUB, 'log', '--format=  %h %an: %s', `${lastRelease}..HEAD`);
  if (direct && !FORCE) {
    fail(`The public repository was edited directly since ${lastRelease}:\n${direct}\n` +
      'Releasing would overwrite these. Bring them into the studio first, or re-run with --force.');
  }
}

// 5. Replace everything with site/, plus the version stamp.
for (const name of fs.readdirSync(PUB)) {
  if (name !== '.git') fs.rmSync(path.join(PUB, name), { recursive: true, force: true });
}
fs.cpSync(SITE, PUB, { recursive: true });
fs.writeFileSync(path.join(PUB, 'VERSION'), version + '\n');
git(PUB, 'add', '-A');
const summary = git(PUB, 'diff', '--cached', '--stat');
if (!summary) fail('Nothing differs from what is already live.');
console.log('\nChanges going live as ' + version + ':\n' + summary + '\n');

if (!PUSH) {
  console.log(`Dry run — nothing pushed. Run again with --push to release ${version}.\n`);
  fs.rmSync(PUB, { recursive: true, force: true });
  process.exit(0);
}

// 6. Commit, tag and push — the public repository first, then tag the studio
//    so every live version points back to the source it came from.
let who;
try {
  who = ['-c', `user.name=${git(STUDIO, 'config', 'user.name')}`, '-c', `user.email=${git(STUDIO, 'config', 'user.email')}`];
} catch {
  fail('Git does not know your name and email yet. Run: git config --global user.name "Your Name" and git config --global user.email "you@example.com".');
}
const message = `Release ${version}\n\n${notes}\n\nFrom studio ${studioHead.slice(0, 7)}.`;
git(PUB, ...who, 'commit', '-q', '-m', message);
git(PUB, ...who, 'tag', '-a', `v${version}`, '-m', `Release ${version}`);
step('Pushing to the public repository…');
git(PUB, 'push', '-q', 'origin', 'main', `refs/tags/v${version}`);
git(STUDIO, ...who, 'tag', '-a', `v${version}`, '-m', `Released ${version}`);
git(STUDIO, 'push', '-q', 'origin', `refs/tags/v${version}`);
fs.rmSync(PUB, { recursive: true, force: true });

console.log(`\n✓ ${version} released. maisondmist.com updates in about a minute;` +
  `\n  https://maisondmist.com/VERSION shows ${version} once it has.\n`);
