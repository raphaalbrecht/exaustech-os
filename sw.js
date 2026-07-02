/* Exaustech Field Service — Service Worker
   Estratégia: HTML = network-first (atualiza na hora quando online, cai no cache offline);
   demais arquivos = cache-first. Suba o número da versão a cada mudança para forçar atualização. */
const CACHE = 'exaustech-os-v45';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './logo-exaustech.png',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // Só cuida de arquivos do próprio app; chamadas a outros domínios (API do Salesforce, Google) passam direto, sem cache
  if (new URL(req.url).origin !== self.location.origin) return;
  const accept = req.headers.get('accept') || '';
  const isHTML = req.mode === 'navigate' || accept.includes('text/html');

  if (isHTML) {
    // network-first: pega a versão fresca; se offline, serve o cache
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
  } else {
    // cache-first para estáticos
    e.respondWith(
      caches.match(req).then((r) =>
        r || fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        }).catch(() => r)
      )
    );
  }
});
