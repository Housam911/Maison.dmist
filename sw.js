/* Maison d'Mist — offline application shell and resilient media cache. */
const SHELL = 'mdm-v0.20.11-shell';
const RUNTIME = 'mdm-v0.20.11-runtime';
const MEDIA = 'mdm-v0.20.11-media';
const CURRENT = new Set([SHELL, RUNTIME, MEDIA]);
const PRECACHE = [
  '/', '/ar/', '/fr/', '/offline.html', '/site.webmanifest',
  '/assets/css/site.css', '/assets/css/experience.css',
  '/assets/js/site.js', '/assets/js/languages.js', '/assets/js/theme.js', '/assets/js/media.js', '/assets/js/pwa.js',
  '/data/site.js', '/data/products.js',
  '/assets/img/logo-maison-dmist-trimmed.webp', '/assets/img/icon-192.png', '/assets/img/icon-512.png',
  '/assets/img/icon-maskable-192.png', '/assets/img/icon-maskable-512.png',
  '/assets/img/products/fresh-mist-lotion.webp', '/assets/img/products/soft-bloom-butter.webp'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(SHELL).then(cache => cache.addAll(PRECACHE)));
});

self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('mdm-') && !CURRENT.has(key)).map(key => caches.delete(key)))),
    self.clients.claim()
  ]));
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

async function put(cacheName, request, response) {
  try {
    const cache = await caches.open(cacheName);
    await cache.put(request, response);
  } catch (error) {}
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) await put(SHELL, request, response.clone());
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    return cached || caches.match('/offline.html');
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const network = fetch(request).then(async response => {
    if (response.ok) await put(RUNTIME, request, response.clone());
    return response;
  });
  return cached || network;
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await put(RUNTIME, request, response.clone());
  return response;
}

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

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
  } else if (url.pathname.startsWith('/data/')) {
    event.respondWith(staleWhileRevalidate(request));
  } else if (/\.(webm|mp4)$/.test(url.pathname)) {
    event.respondWith(videoFirst(request));
  } else {
    event.respondWith(cacheFirst(request));
  }
});
