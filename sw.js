// Gör att Sleep fungerar utan nät: allt sparas i mobilen första gången appen öppnas.
// Sidan hämtas från nätet om det går (så att uppdateringar kommer fram), annars från det sparade.
// Musik och ikoner tas direkt från det sparade.
// Byt VERSION när musiken eller ikonerna byts ut, så hämtas de på nytt.
const VERSION = 'sleep-v2';
const FILES = ['/', '/manifest.webmanifest', '/sleepy-evening.mp3',
  '/icon-192.png', '/icon-512.png', '/icon-maskable-512.png', '/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  if (req.mode === 'navigate' && new URL(req.url).pathname === '/') {
    e.respondWith(
      fetch(req)
        .then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put('/', copy)); return res; })
        .catch(() => caches.match('/'))
    );
    return;
  }

  if (new URL(req.url).pathname.startsWith('/api/')) return; // kalenderfilen hämtas alltid från nätet
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req)));
});
