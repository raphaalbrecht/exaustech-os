/* Service worker SÓ do /beta/ (escopo ./). Network-first pra HTML: online sempre pega a versão nova
   (mata o cache de 10 min do GitHub Pages); offline cai na última cópia guardada. Usa cache próprio
   (exaustech-beta-*) e NÃO deleta o cache do app da raiz. Bump BETA_SW_VERSION pra forçar atualização
   do próprio SW. Adicionado 27/07/2026 por pedido do Raphael (revertendo o "beta sem SW"). */
const BETA_SW_VERSION = '2026-10-12-45'; // 12/10: Consultar TAG ganha 4a opcao: codigo ATV- + Buscar. Antes: 12/10: leitura da TAG mostra Local e Sistema com valor em destaque. Antes: 12/10: botao Flash (lanterna) nos 4 leitores de QR. Antes: 12/10: cesta de pendencias -> Montar proposta (Oportunidade + Cotacao + linhas), Coordenador+. Antes: 12/10: aviso na TAG sem nome do contrato, titulo Avisos. Antes: sem botoes Trocar contrato/cliente na gestao de avisos. Antes: faixa NENHUM AVISO EM VIGOR na gestao de avisos de contrato. Antes: 12/10 (noite): avisos de contrato com data de inicio/fim, checkbox Ativo (Desativado), chip 'mostrar desativados', novo aviso substitui os antigos. Antes: 12/10 (noite): gestao de avisos de contrato por cliente (busca nome/CNPJ) e contrato de servico; agenda vira atalho. Antes: 12/10 (noite): QR x NFC: refaz o scan NFC de verdade no toque e ao fechar a camera, par aceita o cartao lido ha < 4 s, passo 2 mostra o estado do leitor + diagnostico. Antes: 12/10: NFC: volta do portal decidida no navegador (cookie nao chega ao Cloud Run via Firebase) + modo de instalacao no diagnostico do leitor. Antes: 11/10: aviso fixo de 2a etiqueta nao lida + hora da leitura + botao Ler outra etiqueta. Antes: 11/10: menu Consultar TAG (QR ou NFC). Antes: 11/10: resultado do teste trava novas leituras ate 'Testar outra vez'. Antes: 11/10: volta do portal (?etiqueta=) para testar a etiqueta no app. Antes: 11/10: tela de sucesso do cadastro (numero do ativo, o que falta, cadastrar outro no mesmo sistema, retomar ja cadastrados). Antes: 11/10: conferencia do motor x ficha Berliner (QR). Antes: 11/10: leitor NFC fica ligado apos gravar (teste no app, portal so por escolha). Antes: 11/10: testar etiqueta NFC + ver como o cliente ve. Antes: 11/10: tela cheia em tablet (sem moldura de celular). Antes: 10/10: marca d'agua sem equipamento. Antes: 10/10: marca d'agua opcao 3 nas fotos. Antes: 10/10: contador sem 0 fantasma + rodape falta responder. Antes: 10/10: botao Voltar a visita no fim do checklist. Antes: 09/10: assinatura do lider ao concluir a visita. Antes: 09/10: equipamento so nasce no Salvar. Antes: 09/10: UV e bomba pedem a coifa-mae. Antes: 09/10: dados gerais do equipamento (plaqueta, criticidade, acesso, ano). Antes: cadastro de ativo: sistema com tipo (cozinha, ambiente, insuflacao, pressurizacao)
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
