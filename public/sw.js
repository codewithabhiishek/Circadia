// Sleep Tracker Service Worker with Network-First strategy for instant auto-updates
const CACHE_NAME = 'sleep-tracker-v2';

// Essential static offline shell
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
];

self.addEventListener('install', (event) => {
  // Activate immediately without waiting for old tabs to close
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  // Claim clients immediately so the new service worker takes over right away
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-First for HTML/navigation and API requests; Stale-While-Revalidate with fast update for assets
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // For HTML documents and main navigation: ALWAYS NETWORK FIRST
  // This guarantees when you push code to GitHub and open/switch to the app, you get the latest build immediately!
  if (event.request.mode === 'navigate' || event.request.destination === 'document' || url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' })
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request) || caches.match('/index.html'))
    );
    return;
  }

  // For hashed static assets (Vite generates unique chunk hashes like index-C9y71bNp.js):
  // Try network first with fast fallback to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Listen for message from app to immediately skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
