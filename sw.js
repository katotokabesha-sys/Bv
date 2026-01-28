// LB-K SMART - Service Worker
const CACHE_NAME = 'lbk-smart-v1.0';
const OFFLINE_URL = '/offline.html';

// Ressources à mettre en cache immédiatement
const PRECACHE_RESOURCES = [
  '/',
  '/index.html',
  '/style.css',
  '/CORE/admin-core.js',
  '/CORE/security.js',
  '/CORE/config-manager.js',
  '/CORE/terminal.js',
  '/UTILS/logger.js',
  '/ASSETS/icons/icon-192x192.png'
];

// Installation
self.addEventListener('install', event => {
  console.log('[Service Worker] Installation en cours...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(cache => {
      console.log('[Service Worker] Mise en cache des ressources principales');
      return cache.addAll(PRECACHE_RESOURCES);
    })
    .then(() => {
      console.log('[Service Worker] Installation terminée');
      return self.skipWaiting();
    })
  );
});

// Activation
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activation en cours...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Activation terminée');
      return self.clients.claim();
    })
  );
});

// Stratégie: Cache First, Network Fallback
self.addEventListener('fetch', event => {
  // Ignorer les requêtes non-GET et certaines URLs
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('chrome-extension')) return;
  
  event.respondWith(
    caches.match(event.request)
    .then(cachedResponse => {
      // Retourner du cache si disponible
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Sinon, aller sur le réseau
      return fetch(event.request)
        .then(response => {
          // Ne pas mettre en cache si pas OK (sauf pour la page d'accueil)
          if (!response.ok && event.request.url !== self.location.origin) {
            return response;
          }
          
          // Mettre en cache pour la prochaine fois
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        })
        .catch(() => {
          // En cas d'échec réseau, retourner la page hors-ligne
          if (event.request.destination === 'document') {
            return caches.match(OFFLINE_URL);
          }
          return new Response('Réseau indisponible', {
            status: 408,
            statusText: 'Hors ligne'
          });
        });
    })
  );
});

// Communication avec l'application
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});