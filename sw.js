const CACHE_NAME = 'offline-scanner-dynamic';

// Install the service worker and immediately take over
self.addEventListener('install', event => {
  self.skipWaiting(); 
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

// Network-First Strategy
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // If the network request succeeds, save a fresh copy to the cache
        // so it's ready for the next time the user goes offline.
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse; // Return the fresh live code
      })
      .catch(() => {
        // If the network fails (the user is offline), serve the cached version
        return caches.match(event.request);
      })
  );
});
