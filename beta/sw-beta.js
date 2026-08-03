/* Service worker SÓ do /beta/ (escopo ./). Network-first pra HTML: online sempre pega a versão nova
   (mata o cache de 10 min do GitHub Pages); offline cai na última cópia guardada. Usa cache próprio
   (exaustech-beta-*) e NÃO deleta o cache do app da raiz. Bump BETA_SW_VERSION pra forçar atualização
   do próprio SW. Adicionado 27/07/2026 por pedido do Raphael (revertendo o "beta sem SW"). */
const BETA_SW_VERSION = '2026-08-03-1';
const CACHE = 'exaustech-beta-' + BETA_SW_VERSION;

self.addEventListener('install', function(e){ self.skipWaiting(); });

self.addEventListener('activate', function(e){
  e.waitUntil((async function(){
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(function(k){ return k.indexOf('exaustech-beta-')===0 && k!==CACHE; })
      .map(function(k){ return caches.delete(k); }));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', function(e){
  const req = e.request;
  if(req.method !== 'GET') return;
  let url; try{ url = new URL(req.url); }catch(_){ return; }
  if(url.origin !== self.location.origin) return;            // Google/SSO/backend passam direto
  const isHTML = req.mode==='navigate' || (req.headers.get('accept')||'').indexOf('text/html')>=0;
  if(!isHTML) return;                                         // só cuida do HTML; o resto passa direto
  e.respondWith((async function(){
    try{
      const fresh = await fetch(req);
      try{ const c = await caches.open(CACHE); c.put(req, fresh.clone()); }catch(_){}
      return fresh;
    }catch(_){
      const cached = await caches.match(req);
      return cached || (await caches.match('index.html')) || Response.error();
    }
  })());
});
