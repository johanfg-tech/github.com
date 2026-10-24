// Finanzas en pareja: funciona sin internet. Sube el número de versión al publicar cambios.
const CACHE = 'finanzas-v2';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
const keep = (req, res) => { if (res && res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return res; };
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.origin === location.origin) {
    if (req.mode === 'navigate') {
      // Primero internet (para recibir actualizaciones), si no hay, la copia guardada.
      e.respondWith(fetch(req).then(res => keep('./index.html', res)).catch(() => caches.match('./index.html')));
    } else {
      e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => keep(req, res))));
    }
  } else if (u.hostname.endsWith('fonts.googleapis.com') || u.hostname.endsWith('fonts.gstatic.com')) {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => keep(req, res))));
  }
  // Google Sheets (script.google.com) va siempre directo a internet.
});
