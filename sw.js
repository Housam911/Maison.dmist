/* Maison d'Mist — offline application shell and resilient media cache.
   VERSION must equal the repository's VERSION file (the release checks enforce
   it). Changing it is what makes installed copies fetch the new release and
   drop the previous release's caches. */
const VERSION = '0.41';
const SHELL = `mdm-${VERSION}-shell`;
const RUNTIME = `mdm-${VERSION}-runtime`;
const MEDIA = `mdm-${VERSION}-media`;
const CURRENT = new Set([SHELL, RUNTIME, MEDIA]);
const PRECACHE = [
  '/', '/ar/', '/fr/', '/offline.html', '/site.webmanifest',
  '/assets/css/site.css', '/assets/css/experience.css',
  '/assets/js/site.js', '/assets/js/languages.js', '/assets/js/theme.js', '/assets/js/media.js', '/assets/js/pwa.js',
  '/data/site.js', '/data/products.js',
  '/assets/img/logo-maison-dmist-trimmed.webp', '/assets/img/icon-192.png', '/assets/img/icon-512.png',
  '/assets/img/icon-maskable-192.png', '/assets/img/icon-maskable-512.png',
  '/assets/img/products/fresh-mist-lotion.webp', '/assets/img/products/soft-bloom-butter.webp',
  '/assets/img/products/ghar-laymoun.webp', '/assets/img/products/ghar-remmen.webp', '/assets/img/products/ghar-misk-fodda.webp', '/assets/img/products/ghar-misk-tahara.webp',
  '/assets/img/products/laurel-floral-petals.webp', '/assets/img/products/laurel-rose-petal.webp', '/assets/img/products/laurel-ocean-mist.webp', '/assets/img/products/laurel-lavender-blossom.webp',
  '/assets/img/products/donut-soap.svg'
];

// A new release takes over as soon as it has downloaded; pages then refresh
// themselves once (pwa.js), waiting while a film plays. Until 0.41 a release
// waited for a tap on a "Reload" bar, and phones kept showing the old scripts,
// products and films alongside the new page.
self.addEventListener('install', event => {
  // cache: 'reload' skips the browser's HTTP cache (GitHub Pages allows ten
  // minutes), so a fresh release never stores files from the one before.
  event.waitUntil(caches.open(SHELL)
    .then(cache => cache.addAll(PRECACHE.map(url => new Request(url, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('mdm-') && !CURRENT.has(key)).map(key => caches.delete(key)))),
    self.clients.claim()
  ]));
});

// Kept so pages still running pre-0.41 code can finish their own update.
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

async function put(cacheName, request, response) {
  try {
    const cache = await caches.open(cacheName);
    await cache.put(request, response);
  } catch (error) {}
}

// Ask the server first, revalidating past the HTTP cache (an unchanged file
// costs a 304), so pages, scripts, styles and product data are never a release
// behind. The saved copy is for when there is no connection.
async function networkFirst(request) {
  try {
    let response = await fetch(request.mode === 'navigate'
      ? new Request(request.url, { cache: 'no-cache', credentials: 'same-origin' })
      : new Request(request, { cache: 'no-cache' }));
    if (response.redirected) response = await fetch(request);
    if (response.ok) await put(SHELL, request, response.clone());
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return request.mode === 'navigate' ? caches.match('/offline.html') : Response.error();
  }
}

// Photos are fetched fresh when each release installs, so cache first is safe.
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await put(RUNTIME, request, response.clone());
  return response;
}

// Films: kept only once fully downloaded (never a partial 206 range).
async function videoFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.status === 200) await put(MEDIA, request, response.clone());
  return response;
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname === '/sw.js') return;

  if (/\.(webm|mp4)$/.test(url.pathname)) {
    event.respondWith(videoFirst(request));
  } else if (/\.(webp|png|jpe?g|svg|ico)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});
