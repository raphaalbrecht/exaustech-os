/* Service worker SÓ do /beta/ (escopo ./). Network-first pra HTML: online sempre pega a versão nova
   (mata o cache de 10 min do GitHub Pages); offline cai na última cópia guardada. Usa cache próprio
   (exaustech-beta-*) e NÃO deleta o cache do app da raiz. Bump BETA_SW_VERSION pra forçar atualização
   do próprio SW. Adicionado 27/07/2026 por pedido do Raphael (revertendo o "beta sem SW"). */
const BETA_SW_VERSION = '2026-10-14-06'; // 14/10: v49 bolinha do topo vira indicador real de internet e fila. Antes: 14/10: v48 ficha abre na hora com Carregando e mostra erro dentro dela. Antes: 14/10: v47 sem faixa de veredito quando a leitura esta OK ou e consulta pelo codigo. Antes: 14/10: numero de versao sequencial (v46) no chip do perfil. Antes: 14/10: Sobre este app (toque no chip do perfil mostra a versao). Antes: 14/10: cada pilula de problema marcada vira uma pendencia separada. Antes: 13/10: resultado do scan da TAG sucinto (proposta 2): cartao curto, so pendencias em aberto sem filtros, so Ver ficha, linha fina da leitura. Antes: 13/10: ultimos 5 consultados na home do Consultar TAG. Antes: 13/10: ficha do ativo com fontes do estudo B (compacto). Antes: 13/10: ficha do ativo 'Resumo primeiro' (proposta 3): apelido em destaque, Onde / Como esta (pendencias, etiqueta, preventiva, criticidade, motor), O que fazer por papel, secoes recolhidas com resumo (dados tecnicos em 2 colunas, componentes navegaveis, fotos com miniaturas, etiqueta, historico); menu '...'; GET /ativos/:id ganha bloco resumo. Antes: 13/10: Plano > Pendencias agrupado por equipamento (proposta 3): faixa por cliente/local, cabecalho por equipamento com apelido/tipo, linhas compactas que abrem no lugar com trilha Status e proximo passo, chips com contagem, Agrupar lembrado, seletor de local vai para Filtros, caixa 'todas que podem' na cesta. Antes: 13/10: grupo de sugestoes Exaustor axial desligado (nenhum cliente tem). Antes: 13/10: chips de filtro das pendencias 25% mais baixos. Antes: 13/10: sugestoes do exaustor refeitas (centrifugo, transmissao indireta: polias, correias, rolamentos, mancais). Antes: 12/10: flash tambem na gravacao de video da pendencia. Antes: 12/10: QR x NFC passa a ser a ultima opcao do Consultar TAG. Antes: 12/10: Registrar problema sugere problemas comuns por tipo de ativo (pilulas clicaveis, gravidade sugerida). Antes: 12/10: RECUSADAS com chip proprio; codigo ATV em 6 caixas. Antes: 12/10: secao fixa 'Pendencias deste equipamento' na leitura da TAG (A2): Registrar problema + lista com chips, ordenacao e filtros, para todos os papeis (GET /pendencias/equipamento/:id). Antes: 12/10: resultado da TAG no layout B2 (apelido grande, no em chip, pilula CLIENTE, Local/Sistema empilhados, pilula N PENDENCIAS, acoes em lista, Sobre esta leitura recolhido). Antes: 12/10: Consultar TAG ganha 4a opcao: codigo ATV- + Buscar. Antes: 12/10: leitura da TAG mostra Local e Sistema com valor em destaque. Antes: 12/10: botao Flash (lanterna) nos 4 leitores de QR. Antes: 12/10: cesta de pendencias -> Montar proposta (Oportunidade + Cotacao + linhas), Coordenador+. Antes: 12/10: aviso na TAG sem nome do contrato, titulo Avisos. Antes: sem botoes Trocar contrato/cliente na gestao de avisos. Antes: faixa NENHUM AVISO EM VIGOR na gestao de avisos de contrato. Antes: 12/10 (noite): avisos de contrato com data de inicio/fim, checkbox Ativo (Desativado), chip 'mostrar desativados', novo aviso substitui os antigos. Antes: 12/10 (noite): gestao de avisos de contrato por cliente (busca nome/CNPJ) e contrato de servico; agenda vira atalho. Antes: 12/10 (noite): QR x NFC: refaz o scan NFC de verdade no toque e ao fechar a camera, par aceita o cartao lido ha < 4 s, passo 2 mostra o estado do leitor + diagnostico. Antes: 12/10: NFC: volta do portal decidida no navegador (cookie nao chega ao Cloud Run via Firebase) + modo de instalacao no diagnostico do leitor. Antes: 11/10: aviso fixo de 2a etiqueta nao lida + hora da leitura + botao Ler outra etiqueta. Antes: 11/10: menu Consultar TAG (QR ou NFC). Antes: 11/10: resultado do teste trava novas leituras ate 'Testar outra vez'. Antes: 11/10: volta do portal (?etiqueta=) para testar a etiqueta no app. Antes: 11/10: tela de sucesso do cadastro (numero do ativo, o que falta, cadastrar outro no mesmo sistema, retomar ja cadastrados). Antes: 11/10: conferencia do motor x ficha Berliner (QR). Antes: 11/10: leitor NFC fica ligado apos gravar (teste no app, portal so por escolha). Antes: 11/10: testar etiqueta NFC + ver como o cliente ve. Antes: 11/10: tela cheia em tablet (sem moldura de celular). Antes: 10/10: marca d'agua sem equipamento. Antes: 10/10: marca d'agua opcao 3 nas fotos. Antes: 10/10: contador sem 0 fantasma + rodape falta responder. Antes: 10/10: botao Voltar a visita no fim do checklist. Antes: 09/10: assinatura do lider ao concluir a visita. Antes: 09/10: equipamento so nasce no Salvar. Antes: 09/10: UV e bomba pedem a coifa-mae. Antes: 09/10: dados gerais do equipamento (plaqueta, criticidade, acesso, ano). Antes: cadastro de ativo: sistema com tipo (cozinha, ambiente, insuflacao, pressurizacao)
/* 14/10/2026 — Raphael: "quero ver o número da versão dentro do chip; não seria um número tipo 52, 53, 54?". Número
   sequencial, sobe 1 a cada publicação, junto com BETA_SW_VERSION. O MESMO número mora em index.html (APP_NUM) — os dois
   têm que andar juntos (CLAUDE.md, regra 6). Começou em 46 = 45 versões já registradas no histórico acima + esta. */
const BETA_NUM = 49;
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

/* 14/10/2026 — Raphael: "poderia ter um local do app mostrando a versão atual". O app pergunta ao service worker ativo qual é a
   versão dele (mensagem 'versao'); a tela "Sobre este app" compara com a publicada no site (sw-beta.js baixado na hora). */
self.addEventListener('message', function(e){
  if(e.data === 'versao' && e.ports && e.ports[0]) e.ports[0].postMessage(BETA_SW_VERSION);
});
