// Service worker per Scanner Codici CSV — abilita l'installazione come PWA
// e un funzionamento offline di base (l'unica cosa che richiede rete è la
// libreria ZXing caricata da CDN al primo avvio).

const CACHE_NAME = 'scanner-codici-csv-v2';
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

  // Le richieste di navigazione (apertura/aggiornamento della pagina) usano
  // una strategia "network-first": si prova sempre a scaricare la versione
  // più recente dal server, così un deploy su GitHub Pages arriva subito
  // anche a chi ha già installato la PWA, senza restare bloccati su una
  // copia vecchia in cache. Si usa la cache solo se la rete non è disponibile.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => {
            try { cache.put(req, resClone); } catch (e) { /* ignora */ }
          });
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  // Tutte le altre risorse (icone, manifest, librerie da CDN) restano
  // "cache-first" per un avvio rapido e il funzionamento offline.
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
        .catch(() => undefined);
    })
  );
});
