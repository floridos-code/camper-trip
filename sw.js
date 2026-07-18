/* =========================================================
   Service Worker – Camper Trip
   Ziel: möglichst wenig mobiles Datenvolumen + volle Offline-Nutzung.
   Bei jeder inhaltlichen Änderung an App-Dateien einfach VERSION erhöhen,
   dann räumt "activate" die alten Caches automatisch auf.
========================================================= */
const VERSION = 'v1';
const SHELL_CACHE = `camper-shell-${VERSION}`;
const CDN_CACHE   = `camper-cdn-${VERSION}`;
const TILE_CACHE  = `camper-tiles-${VERSION}`;
const GEO_CACHE   = `camper-geo-${VERSION}`;
const ROUTE_CACHE = `camper-route-${VERSION}`;

const SHELL_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Kartenkacheln sind viele kleine Dateien – Anzahl begrenzen, damit der
// Cache nicht unbegrenzt wächst (grober LRU-Ersatz über Einfügereihenfolge).
const TILE_LIMIT = 700;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const keep = [SHELL_CACHE, CDN_CACHE, TILE_CACHE, GEO_CACHE, ROUTE_CACHE];
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((n) => !keep.includes(n)).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// App-Shell: sofort aus dem Cache antworten (kein Warten, kein Datenverbrauch),
// im Hintergrund eine frische Version nachladen, falls online.
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((res) => {
      if (res && res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => cached);
  return cached || network;
}

// Kacheln/Geocoding/Routing: einmal geladen, danach nie wieder – identische
// Anfragen (gleiche Adresse, gleiche Kachel, gleiche Route) liefern immer
// dasselbe Ergebnis, ein erneuter Download bringt nichts.
async function cacheFirst(request, cacheName, trimLimit) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    if (res && res.ok) {
      await cache.put(request, res.clone());
      if (trimLimit) trimCache(cacheName, trimLimit);
    }
    return res;
  } catch (e) {
    return cached || new Response('', { status: 504, statusText: 'Offline' });
  }
}

async function trimCache(cacheName, limit) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > limit) {
    await cache.delete(keys[0]);
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // OpenStreetMap-Kartenkacheln
  if (url.hostname.endsWith('tile.openstreetmap.org')) {
    event.respondWith(cacheFirst(request, TILE_CACHE, TILE_LIMIT));
    return;
  }
  // Nominatim-Geocoding
  if (url.hostname === 'nominatim.openstreetmap.org') {
    event.respondWith(cacheFirst(request, GEO_CACHE));
    return;
  }
  // OSRM-Routenberechnung
  if (url.hostname === 'router.project-osrm.org') {
    event.respondWith(cacheFirst(request, ROUTE_CACHE));
    return;
  }
  // Leaflet (unpkg) & Firebase-SDK (gstatic) – versioniert & unveränderlich
  if (url.hostname === 'unpkg.com' || url.hostname === 'www.gstatic.com') {
    event.respondWith(cacheFirst(request, CDN_CACHE));
    return;
  }
  // Firestore selbst NICHT abfangen – die SDK verwaltet ihre eigene
  // Offline-Persistenz (IndexedDB) und Sync, ein SW-Cache würde nur stören.
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('firebaseio.com')) {
    return;
  }
  // Eigene App-Dateien
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request, SHELL_CACHE));
  }
});
