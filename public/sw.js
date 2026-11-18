// Francielle Progressive Web App Service Worker - Version 6 (Zero-Cache Live Catalog)
const CACHE_NAME = 'francielle-pwa-v6';
const STATIC_ASSETS = [
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/assets/images/logo.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purging stale cache bucket:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. NEVER intercept external origins (Supabase API, external images, WhatsApp)
  if (url.origin !== self.location.origin) return;

  // 2. Navigation requests (HTML documents like /, /admin, /order) must ALWAYS be 100% network live
  if (
    event.request.mode === 'navigate' ||
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/order') ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('/_next/webpack-hmr')
  ) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Fallback to cache ONLY if completely offline
        return caches.match(event.request);
      })
    );
    return;
  }

  // 3. Static icons & manifest: Stale while revalidate or network first
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
