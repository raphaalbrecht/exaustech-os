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
    e no selo 🚨 URGENTE do Estoque — prepara o visual pro futuro flag de pendência pós-cancelamento)
   (v79 07/07 — pílula "ao vivo" passa a usar o campo real Pendencia_Pos_Cancelamento__c, não mais
    proxy por status)
   (v80 07/07 — Frente B custódia: aba "Bipar" (Supervisor/Líder de Equipe) lê QR da etiqueta de
    separação pela câmera e confirma retirada/recebimento sozinho (backend decide pelo status);
    fallback de etiqueta em PDF (sem Zebra) agora desenha um QR de verdade, não só uma caixa vazia)
   (v81 07/07 — Produtos Necessários: rótulo à direita/quantidade à esquerda em Solicitado, Embarcado,
    Usado, Baixa e Retorno; "Embarcar (estoque)" desce um pouco e vira "Retornar (estoque)")
   (v82 07/07 — remove o emoji de sirene 🚨 do app inteiro (toasts, checkbox de urgência, tile e
    notificação de separação urgente))
   (v83 07/07 — cancelamento por etapa (Bipar): scan numa separação Cancelada/Reprovada agora
    oferece "seguir mesmo assim + justificar" (casos 3/4) em vez de só rejeitar, com carimbo de quem
    decidiu; card de alerta quando o material já tinha sido entregue (caso 5); novo tile
    "Pós-cancelamento" no painel do Estoquista fecha os casos 1/2/4/5 (ciência, devolução, baixa))
   (v84 07/07 — home do Estoque ganha campo de busca em destaque (OS/cliente/Name da separação),
    pensado pros coletores de dados Android (leitor de código de barras/QR embutido funciona como
    teclado): bate exato com 1 resultado abre direto, Enter abre o 1º resultado, senão lista até 8
    embaixo do campo)
   (v85 07/07 — correções de precisão no Bipar/cancelamento por etapa, achadas em revisão antes do
    teste físico: câmera parada em cima do QR por >4s não avança mais 2 checkpoints sozinha; toque
    duplo em "Confirmar mesmo assim" trava enquanto o POST anterior não volta; erro no confirmar não
    deixa mais a câmera escaneando por trás do modal aberto; backend recusa aplicar exceção se o
    checkpoint mudou entre abrir o modal e confirmar; ciência do líder (caso 5) não rebaixa mais uma
    pendência já resolvida pelo estoque; ciência do estoque (caso 1) agora carimba quem resolveu)
   (v86 07/07 — busca do Estoque ganha botão de câmera (scan one-shot, pra quem não tem coletor com
    leitor físico) e botão de NFC (Web NFC — só existe no Chrome Android; precisa 1 toque pra armar
    a leitura, some sozinho se o aparelho não suportar); campo agora foca sozinho ao entrar na aba
    de propósito, sem interferir no refresh silencioso de fundo)
   (v87 07/07 — 2 rodadas de revisão ampla (Fable) em cima do projeto inteiro + remediação: watermark
    quebrado (3 fotos), logout incompleto, fila offline descartava trabalho em erro 5xx passageiro
    (bePatch/bePost/beDelete/beGet/uploads), toque duplo vazava câmera (Bipar+busca) e travava NFC,
    câmera do Bipar ficava órfã ao reentrar na aba, aviso de fila pendente antes de sair, confirmação
    antes de status destrutivo da separação, corrida em sepEnviar()/reabrir(), modal órfão ao navegar,
    cancelar OS agora apaga as alocações de verdade no Salesforce, fila "trava pra sempre" num job
    ruim agora só pula ele (não bloqueia os outros), escape de aspas/XSS em vários pontos (busca,
    textos livres, atributos), backend: validação de resourceId ativo, mensagens de erro genéricas
    pro cliente, gate de Autorização de Serviço em /alocacoes, dono da OS checado antes de gravar/
    apagar (mídia/assinatura/apontamento/desfecho/alocação) e antes de baixar arquivo do Drive,
    esc() corrigido (contrabarra podia escapar da query SOQL), remoção de ~285 linhas de código
    morto (fluxo antigo de OAuth direto Salesforce+Google Drive do navegador, superado pelo backend)
   (v88 07/07 — troca do ícone do rank NOVATO (EXP + Trilhas): 🌱 dava impressão tímida/perdida →
    foguete gradiente (SVG próprio, ICON_NOVATO_FOGUETE) decolando, compartilhado entre EXP_RANKS.emo
    e RANKS.icon)
   (v89 08/07 — higiene do papel (ROLE/be_funcao): beLogout agora limpa be_funcao e reseta ROLE pro
    padrão; beDoLogin sempre grava o papel fresco da resposta (sem match = volta ao padrão, nunca
    herda o papel da sessão anterior). Obs.: causa raiz do "Sócio" fantasma era o DADO na MOB3
    (Funcao__c do recurso de teste), não o front — estas correções fecham o vetor de estado velho.)
   (v90 09/07 — Cadastro de Ativos: campo tipo Foto (upload real pro Drive via /midias-ativo) +
    Multi-Picklist (seleção múltipla, antes sobrescrevia) + provisionar etiqueta NFC ao final do
    cadastro (lê UID físico, grava App Link do Portal na tag, QR companion pra impressão))
   (republicação: run #127 do Pages ficou preso na fila, novo commit pra destravar)
   (v91 09/07 — Fase 3 do wizard de Endereço de Estoque: criação guiada (local→lista→tipo→
    nome→capacidade→revisão) + provisionamento de etiqueta NFC token+versão (EtiquetaEndereco__c,
    App Link /e/:token) + impressão Zebra/PDF 80×50mm; entry point "Endereços de estoque" na
    home do Estoquista)
   (v92 09/07 — fix: tile "Endereços de estoque" nunca chamava endrCarregarLocais() de verdade,
    ficava preso em "Carregando…" pra sempre; achado no teste físico)
   (v93 10/07 — Endereçamento: nível intermediário Área/Rua no wizard endr* — passo Área entra
    entre Local e Tipo (só aparece se o local tiver áreas cadastradas), passo Rua entra depois
    quando a área exige (RequerRua__c); código sugerido agora usa prefixo Área-Rua-Tipo-Seq;
    lista e detalhe do endereço mostram 📍 área/rua junto do código)
   (v94 10/07 — Fase 4: "Entradas pendentes" (recp*) — conferência item a item do recebimento,
    sugestão de endereço em destaque (habitual/última entrada/vago), alerta de excedente com 3
    saídas (dividir entre 2 endereços / criar ponto complementar via handoff pro wizard endr* com
    retorno automático / forçar acima da capacidade), scan-to-confirm NFC/QR na prateleira antes
    da confirmação final atômica; zero endpoint novo, backend já pronto desde a Fase 2. Desenhado
    com o agente Fable (proposta-fase4-entradas-pendentes.md); revisão de código encontrou e
    corrigiu 3 bugs reais antes de publicar (cancelar+forçar após handoff, remoção da linha-base,
    gate de confirmação sem checar persistência)) */
const CACHE = 'exaustech-os-v97'; // v97 12/07: wizard endr* — esconde cabeçalho "Estoque"+carrossel
// de dia na tela de Endereços (não faz sentido, endereço não é por dia); botão "+ Novo endereço"
// movido pra baixo da lista de endereços cadastrados (pedido do Raphael, ajuste cirúrgico de UX).
// v96 10/07: fix — recpCarregarLista() nunca limpava recpSt.erro;
// um erro de tela anterior (ex: abrir recebimento e falhar) ficava grudado na lista de Entradas
// Pendentes pra sempre, mesmo com a lista carregando certinho por baixo (achado pelo Raphael no
// teste físico). Corrigido: erro limpo no início de toda tentativa de recpCarregarLista(), e o
// "Voltar" de recpRenderLocal agora recarrega a lista em vez de só trocar o step.
// v95 10/07: Locais de estoque — Tipo__c ganha "Veículo"; picker
// agrupado (Galpão solto/🚐 Veículos com header) via estoqLocaisAgrupados, compartilhado por
// endr*/recp*; Trânsito filtrado do backend nesses 2 pickers; Endereco__c reaproveitado como
// legenda discreta (placa/modelo) sob o nome do veículo. Desenhado com o agente Fable
// (proposta-locais-veiculos-tecnicos.md).
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
