/* Exaustech Field Service — Service Worker
   Estratégia: HTML = network-first (atualiza na hora quando online, cai no cache offline);
   demais arquivos = cache-first. Suba o número da versão a cada mudança para forçar atualização.
   (v71 04/07 — EXP: ícone 📸 p/ CHECKLIST_100_FOTOS no extrato)
   (republicação: run #100 do Pages falhou no deploy, forçando novo run)
   (v72 05/07 — cadastro CNPJ: checagem SF antes da API externa, regra de economia)
   (v73 05/07 — Cadastrar nova conta: tela alarga em desktop (900px+) + botão vira pílula "Buscar dados")
   (republicação: run #103 do Pages falhou no deploy, forçando novo run)
   (v74 06/07 — Cadastrar nova conta: liga POST /contas de verdade — cria a Account no Salesforce)
   (republicação: run #105 do Pages falhou no deploy, forçando novo run)
   (republicação 2: run #106 ficou preso na fila, novo commit)
   (v75 06/07 — Assinatura do cliente: liga CPF (Direct Data, autofill de nome) + OTP WhatsApp (Huggy)
    antes de liberar "Assinar" — 3 campos novos em Assinatura_OS__c: Telefone__c/Verificado__c/Motivo_Sem_Verificacao__c)
   (v76 06/07 — identidade visual: --brand harmonizado com o azul real do logo #3E7EB0 (era #0B5CAB,
    aproximação antiga); aba EXP mantém o laranja --accent como está, por pedido do Raphael)
   (v77 06/07 — pill "HOJE" da Agenda/Estoque: mais respiro entre "SEG" e "HOJE" (letter-spacing + margem))
   (v78 06/07 — pílula "ao vivo": ponto pulsando suave (esmaece+cresce) nos badges Cancelada/Reprovada
    e no selo 🚨 URGENTE do Estoque — prepara o visual pro futuro flag de pendência pós-cancelamento) */
const CACHE = 'exaustech-os-v78';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './logo-exaustech.png',
  './fan-mark.png',
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
