// Service worker per Scanner Codici CSV — abilita l'installazione come PWA
// e un funzionamento offline di base (l'unica cosa che richiede rete è la
// libreria ZXing caricata da CDN al primo avvio).

const CACHE_NAME = 'scanner-codici-csv-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png',
  './favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Solo richieste GET vengono gestite dalla cache.
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((res) => {
          // Mette in cache anche le risorse esterne (es. la libreria ZXing da CDN)
          // così dopo il primo avvio online l'app funziona anche offline.
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => {
            try { cache.put(req, resClone); } catch (e) { /* risposta non cacheable, ignora */ }
          });
          return res;
        })
        .catch(() => {
          // Offline e nessuna cache disponibile: per la navigazione mostra
          // almeno la shell dell'app già scaricata in precedenza.
          if (req.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return undefined;
        });
    })
  );
});
