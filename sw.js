/* Maison d'Mist — 0.50: retires the service worker.
   While the site shows "Coming soon", nothing is saved for offline use. Phones
   that installed an earlier release fetch this file, which deletes the saved
   copies, unregisters itself and reloads open pages, so no one keeps seeing
   the old site. The Coming soon pages register no worker. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('mdm-')).map(key => caches.delete(key)));
    await self.registration.unregister();
    const pages = await self.clients.matchAll({ type: 'window' });
    pages.forEach(page => page.navigate(page.url));
  })());
});
