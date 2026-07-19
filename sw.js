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
    gate de confirmação sem checar persistência))
   (v105 14/07 — wizard endr*: breadcrumb uniforme Local › Área › Setor › Posição › Nível em todas
    as telas da cadeia (Área/Setor/Posição/Nível/Tipo/Nome/Capacidade), substituindo os títulos
    compostos e as linhas "📍 ..." ad hoc; segmento atual vira pill que atualiza ao vivo enquanto
    digita; rótulo "Módulo" renomeado pra "Posição" (fonte única ENDR_NIVEL_LABEL usada por título/
    botão/breadcrumb); botão "+ Novo endereço" na lista do Local vira "+ Novo Setor" (só no modo
    cadastro, consulta mantém o texto antigo); desenhado com o agente Fable)
   (v106 14/07 — wizard endr* (cadastro): tela "lista" pulada ao escolher o Local — ela ficava
    sempre vazia no 1º endereço (nada criado ainda), só servia de trampolim pro botão "+ Novo
    Setor". Agora clicar no Local já cai direto na Área/Tipo; "lista" continua existindo pro modo
    consulta e pro botão "Ver lista do local" no Detalhe pós-criação, onde já tem conteúdo real.
    Botões "‹ Voltar" ajustados pra não apontar mais pra uma tela "lista" nunca carregada)
   (v107 14/07 — wizard endr*, tela Área: só as áreas com Setor obrigatório (Almoxarifado,
    Produção, Administração) ficam com cadastro habilitado por enquanto — vêm primeiro na lista,
    destacadas em azul-marca. As outras 7 (sem Setor) ficam cinza/inativas, sem toque, até decisão
    de liberar depois)
   (v108 14/07 — wizard endr*, tela Local: mesmo tratamento cinza/inativo dos veículos (Cleidson
    Martins, Dayvson Villela, Marcos Sinésio) — bloqueio de verdade, sem cadastro por ora, igual
    padrão das Áreas do v107. Escopo só cadastro (!endrSt.consulta): consulta de endereço de
    veículo já existente e o fluxo recp* (Entradas Pendentes) continuam livres, sem alteração —
    estoqLocaisAgrupados() ganhou um 4º parâmetro opcional desabilitarVeiculos)
   (v109 14/07 — ajuste no v108: Galpão Penha (única opção clicável na tela Local quando veículos
    estão bloqueados) ganha o mesmo destaque azul-marca das Áreas habilitadas, em vez de ficar
    neutro — reforça visualmente qual é a opção ativa, pedido do Raphael)
   (v110 14/07 — pré-cadastro real de Setor/Posição/Nível (SetorEstoque__c/PosicaoEstoque__c/
    NivelEstoque__c, ver DECISAO_pre-cadastro-setor-posicao-nivel.md): wizard endr* troca os 3
    campos de texto livre por listas de toque-seleciona-e-avança; tela nova "⚙️ Gerenciar
    estrutura" (gest*) restrita a Gerente+ pra cadastrar Área/Setor/Posição/Nível direto no app,
    sem depender de script Apex. Bin/Espaço Delimitado SEM gate novo — Estoquista+ continua
    criando endereço normalmente em qualquer fluxo, inclusive na recepção) */
const CACHE = 'exaustech-os-v146'; // v146 18/07: botão "Imprimir etiquetas (envio + retorno)" troca height fixo por min-height — mesmo bug do "Confirmar separação" (v142), texto de 2 linhas vazava pra fora do botão
// v145 18/07: botão "Registrar separação" pendente fica LARANJA (#C25E0A, mesma cor do "falta separar" no sepRow) em vez de azul esmaecido — chama mais atenção pra pendência (pedido do Raphael)
// v144 18/07: botão final da tela de separação vira "Registrar separação" e fica verde quando todos os itens já foram separados (era sempre azul, texto "Confirmar separação concluída")
// v143 18/07: etiquetas de envio/retorno ganham ORIGEM/DESTINO explícitos — DESTINO em faixa preta/texto branco pra dar destaque (pedido do Raphael); envio ORIGEM=Estoque Exaustech→DESTINO=cliente, retorno invertido; nº da separação (SEP-xxxx) e QR continuam os mesmos nas duas
// v142 18/07: fix real (achado testando ao vivo) — PDF de etiquetas envio+retorno vira 1 download só (Safari iOS bloqueava o 2º download automático, sumindo com a de envio); botão "Confirmar separação concluída" troca height fixo por min-height (texto que quebra em 2 linhas não vaza mais pra fora do botão)
// v141 18/07: FAB "Atualizar" global vira bolinha só com ícone (era pill com texto) — parava de cobrir/cortar botões de ação no rodapé de páginas como estoqueSepPage (Opção B do Fable, aprovada pelo Raphael)
// v140 17/07: Enviar+Receber mesclados em split 50/50 + ícones de linha (box/truck/send/receive/warehouse) no lugar de emoji nas tiles/botões do Estoque
// v139 17/07: remove o carrossel de dia da home do Estoque (pedido do Raphael)
// v138 17/07: home do Estoque reestruturada — pendências + Enviar/Receber/Armazém (Versão A aprovada pelo Raphael)
// v137 17/07: fluxo completo separação/retorno Fase 1 — 4 status
  // novos, 5 checkpoints de bipagem novos, etiqueta de retorno, captura de quantidade retornada
// v136 17/07: novo tile "Concluídas" (status Encerrada) na home
  // do Estoque — pedido do Raphael, não existia NENHUMA forma de ver separação concluída no app
// v135 17/07: carrossel de dia/rótulo do Estoque só na home —
  // some em toda página interna (sep/pend/list/enderecos/recebimentos/estrutura/acompanhamento)
// v134 17/07: fix "Separar sem bipar" exige justificativa (achado ao vivo — deixava fechar a
  // separação sem nenhuma unidade bipada); ver emenda em DECISAO_rastreio-selecao-unidade-serializada.md
// v133 17/07: Fase 1 do rastreio por unidade serializada
  // (PROPOSTA_rastreio-selecao-unidade-serializada.md) — UnidadeSerializada__c criada no confirmar
  // do recebimento (Apex, mesma transação) e marcada Estornada no estorno; rotas GET/POST
  // /estoque/unidades*; sep* troca o toggle por N slots bipáveis quando o produto é rastreável e
  // tem unidade Disponível cadastrada (com "onde pegar" e "Separar sem bipar" — 1 toque, sem
  // trava), fallback por quantidade 100% intocado pro resto; busca avulsa do módulo Estoque acha
  // "cadê a série X?" quando não bate com nenhuma separação; script de backfill p/ recebimentos
  // já confirmados antes deste deploy
// virou "Gerar etiquetas automáticas (pra quem não tem série de fábrica)" (recp*), mais evidente
// pro estoquista do que o botão faz. Zero mudança de lógica.
// v131 16/07: recp* — etiqueta de identificação de produto
// pós-confirmação. Ao confirmar o recebimento, vai direto pra tela de impressão quando pelo menos
// 1 item é Product2.Rastreavel_Serie__c=true (ferramenta/equipamento) E teve série(s) gravada(s)
// na conferência; matéria-prima a granel (chapa/cantoneira) nunca aparece, porque o checkbox fica
// desmarcado nesses produtos. ACHADO CRÍTICO no desenho (subagente Fable, verificado): já existia
// uma validation rule ATIVA (Serie_Obrigatoria em MovimentacaoEstoque__c) cobrando NumeroSerie__c
// quando Rastreavel_Serie__c=true, e o Apex já lia ItemRecebimento__c.NumerosSerie__c — mas
// NENHUMA tela gravava esse campo. Era uma mina terrestre latente: no dia em que alguém marcasse
// Rastreavel_Serie__c=true num produto, a confirmação do recebimento quebraria (rollback). Esta
// feature também destrava esse campo pela 1ª vez. Captura de série acontece na conferência do item
// (recpRenderItem, N campos = quantidade boa, bipar via câmera ou gerar automática); impressão
// reusa zebraAchar/zebraEnviar/desenharQR já existentes (sep*/endr*) — só template novo (ZPL+PDF
// 100x50mm, QR=a própria série em texto puro, sem objeto/token novo). Zero schema/Apex novo — só
// 2 pontos no backend (query+rota) e o front. Ver DECISAO_etiqueta-produto-rastreavel.md.
// v130 16/07: recp* — divisão MANUAL entre endereços no
// armazenamento do recebimento. Antes só nascia uma 2ª linha de alocação quando o sistema
// DETECTAVA estouro de capacidade (hint/modal); se o endereço não tinha CapacidadeMaxima__c nem
// volume cadastrado, a régua ficava "infinita" e nunca estourava — sem NENHUM jeito de dividir por
// vontade própria. Fix: link "＋ dividir com outro endereço" sempre visível (recpSt.dividindo)
// que reaproveita a lista "outros endereços" já existente, empurrando nova linha em vez de
// substituir a linha 0. Zero schema/Apex/backend — só front (Map<Id,List<Alocacao>> já suportava).
// v129 16/07: hotfix recp* "Confirmados há pouco" — botão
// Desfazer/Estornar sobrepondo o nome do fornecedor (herança de .btn{width:100%} dentro de row
// flex, competindo com o irmão flex:1) + innerHTML+= matando onclick do toggle Sócio quando a
// lista de pendentes está vazia. Fix cirúrgico: width:auto;flex-shrink:0 nos 2 botões (linhas
// ~5306/5325) + insertAdjacentHTML no lugar de innerHTML+= (linhas ~5288-5290). Zero schema/Apex.
// v128 16/07: endr* — Fase 3 (auto-incremento+validação em tempo
// real do código, gerador de lote com prévia obrigatória "letra A-J"/"número 01-10", editar nome/
// capacidade depois + "Desfazer" 30s (single e lote inteiro) — ver DECISAO_fase3_lote_desfazer.md.
// Zero schema/Apex novo (reusa CustomFields já existentes); backend+front só.
// (v127 16/07: recp* — Estorno de Recebimento Confirmado (ver
// DECISAO_estorno-recebimento-confirmado.md): Estoquista desfaz sozinho até 30min depois de
// confirmar ("Confirmados há pouco" na lista + toast "Confirmei errado — desfazer" na tela de
// sucesso); depois só Sócio (toggle "Ver recebimentos confirmados", busca por NF/fornecedor).
// Estorno nunca deleta o lançamento original — gera MovimentacaoEstoque__c compensatória e
// bloqueia (nunca saldo negativo) se o estoque já foi consumido por outra movimentação.
// (v126 15/07: recp* — item 2 do roadmap de recebimento
// (avaria parcial + reason codes + contagem semi-cega + tolerância soft de over-receipt, ver
// DECISAO_item2-avaria-tolerancia-recebimento.md): quantidade recebida nasce em branco (força
// contagem de verdade); Avariado pergunta quanto (default=todas, nunca vira saldo disponível);
// motivo obrigatório em Divergente/Avariado; banner de tolerância nunca bloqueia.
// v125 15/07: acmp* — Acompanhamento de Pedido de Compra
// (extensão de proposta-recebimento-conferencia-armazenamento.md, ver DECISAO_acompanhamento-
// pedido-compra.md): tela de acompanhamento de prazo de entrega (Supervisor+), 2 critérios de
// alerta independentes (sem atualização há N dias / previsão a M dias ou menos, incluindo
// vencida) integrados ao sino/badge existente; e-mail diário fica no Apex (batch agendável).
// v124 15/07: recp* — vincular produto manual (item 1 do
// roadmap de proposta-recebimento-conferencia-armazenamento.md) quando o matching automático
// não achou o item; busca em Product2 (GET /estoque/produtos) + POST vincular-produto (Apex
// aprende o DePara pra próxima vez).
// v123 15/07: gaveta de Área (hub endr*) fixa "Almoxarifado"
// como 1ª opção da lista, à frente da ordem alfabética — é a área mais usada no dia a dia, pedido
// do Raphael. Só na cascata de Área; Rua/Módulo/Nível continuam 100% alfabéticos.
// v122 15/07: badges de medida ao vivo (Modelo de Caixa BIN)
// com fonte dobrada (20px) + badge da Largura deslocado pra direita (ancorado por `right`, não
// `left`) pra não sobrepor o texto fixo "LARGURA" da imagem.
// v121 15/07: form "+ Novo modelo" (Modelo de Caixa BIN) ganha
// medida ao vivo sobreposta ao desenho de referência — badge junto de cada legenda
// (ALTURA/PROFUNDIDADE/LARGURA) mostra o valor digitado em cm, atualiza no oninput junto do
// preview de volume; placeholder do campo volta a "Profundidade (cm)".
// v120 15/07: rótulo do campo "Comprimento" no form de Modelo
// de Caixa BIN trocado pra "Profundidade" — alinha com a legenda do diagrama de referência
// (ALTURA/PROFUNDIDADE/LARGURA), que já usa esse nome; campo interno (comprimentoCm) intocado.
// v119 15/07: HOTFIX — campo "Altura (cm)" vazava pra fora da
// tela no form "+ Novo modelo" (Modelos de caixa BIN). Causa: `flex:1` sozinho não encolhe abaixo
// do tamanho do CONTEÚDO (placeholder longo "Comprimento (cm)"), pois item flex tem min-width:auto
// por padrão. Trocado o row de 3 inputs por CSS grid de 3 colunas iguais + min-width:0 + placeholders
// encurtados (Compr./Larg./Alt.).
// v118 15/07: HOTFIX — "clicar em Modelos de caixa BIN não
// fazia nada". Causa: várias funções gest*/endr* faziam elemento.innerHTML+= LOGO DEPOIS de
// appendChild(filhoComOnclick) no mesmo elemento — innerHTML+= serializa e reparseia TODO o
// conteúdo atual, recriando os nós já anexados e destruindo os handlers JS deles (handler não
// sobrevive a serialização HTML). Corrigido em gestRenderLocal (o card "📦 Modelos de caixa BIN"
// nascia com onclick morto), endrHubRenderSecaoEndereco (o <select> de modelo no hub nascia com
// onchange morto — Bin ficava impossível de criar), gestRenderModeloBin e
// gestRenderArea/Setor/Posicao/Nivel (botão "‹ Voltar" morto durante loading/lista vazia). Trocado
// por createElement+appendChild ou insertAdjacentHTML (que não recria nós existentes).
// v117 15/07: Modelo de Caixa BIN + volume no Produto
// (DECISAO_modelo_caixa_bin.md, doc original + Revisão 15/07 R1-R10) — catálogo ModeloCaixaBin__c
// (gest*), select obrigatório de modelo no hub/handoff recp (endr*), e cálculo volumétrico no
// recebimento (recp*): régua de volume (min de peças×volume) ao lado da de peças, hint proativo
// de fracionar com caixas fechadas (QuantidadePadraoEmbalagem__c), modal de excedente bilíngue.
// v116 15/07: botão "Renomear" em Área/Setor/Posição/Nível (tela
// Gerenciar estrutura) — corrige grafia sem precisar desativar+recriar. Só muda o registro em si
// (Name), endereços/etiquetas NFC já criados sob ele ficam com o texto congelado de sempre.
// v115 15/07: HOTFIX — v114 não carregava em aparelho nenhum ("não consigo carregar no cel"):
// ENDR_CADEIA (const nova da Fase 2) lia ENDR_NIVEL_LABEL.area na carga do script, mas a const
// ENDR_NIVEL_LABEL só era declarada ~370 linhas depois (temporal dead zone) → ReferenceError no
// boot matava o <script> principal inteiro. Declaração movida pra antes de ENDR_CADEIA.
// (v114 15/07: Fase 2 do plano de correções — hub "Novo endereço" + gaveta
// (bottom-sheet) substitui as 8 telas cheias do fluxo de criação (área→rua→modulo→nivel→tipo→nome→
// capacidade→revisao) por 1 tela única + gaveta por nível. Toda área/setor/posição preenchida vira
// linha tocável pra trocar; opcional (Posição/Nível quando o pai aceita armazenamento) ganha atalho
// de pular explicado ("Não preciso de X — criar direto em..."); contador de filhos nos cards
// (backend ?comContagem=1) e defaults herdados do último irmão (tipo/capacidade). Ver
// DECISAO_fase2_hub_gaveta.md. As telas antigas endrRenderArea/Rua/Modulo/Nivel ficam no código,
// mortas — só o handoff do recp* (Entradas Pendentes) ainda usa nome/capacidade/revisao/tipo.
// (v113 15/07 — Fase 1: mecanismo AceitaArmazenamento em AreaEstoque__c/LocalEstoque__c/
// SetorEstoque__c/PosicaoEstoque__c: toda Área ativa fica clicável no wizard endr* — corrige bug
// #8/#4 do audit; "✓ Cadastrar aqui" em Posição/Nível passa a ser controlado pelo flag do Setor/
// Posição escolhido; tela gest* troca o toggle "Setor: obrigatório" por "Cadastro direto"/"Exige
// Setor".)
// (análise Fable, pedido do Raphael — proposta-wizard-estoque §16). Setor e Módulo ganham 2
// botões ("Adicionar <próximo> ›" / "✓ Cadastrar aqui") em vez de só "Continuar" — dá pra parar
// em qualquer nível, não só ir até o fim. Nível continua de passo único (é o degrau mais fundo).
// Preview "Código até aqui" ao vivo (endrCodigoPreview) em Setor/Módulo/Nível. Botão Voltar do
// Tipo usa endrSt.paradaEm pra retornar à tela onde o usuário realmente parou (não mais fixo em
// 'nivel'). Grade de Tipo ganha grupo "Sugeridos" no topo conforme a profundidade (Setor→Espaço
// Delimitado/Armário; Módulo→Prateleira/Armário; Nível→Bin/Caixa/Prateleira) — nunca restringe,
// só reordena. Revisão ganha aviso quando o endereço parou antes do Nível. Zero mudança de
// backend (sugerirCodigo já tolera módulo/nível vazios desde o v103).
// v103 13/07: nomenclatura Setor-Módulo-Nível-Bin no wizard
// endr* (revisão via agente Fable, pedido do Raphael — proposta-wizard-estoque §15). Sem campo
// novo no Salesforce: Rua__c passa a representar SETOR (rótulo mudou, campo é o mesmo); Módulo e
// Nível são 2 passos novos do wizard, só vivem dentro do Codigo__c composto pelo backend
// ([Área-]Setor-Módulo-Nível). Bin (4º segmento opcional) não ganhou campo/passo próprio: é só a
// consequência de Tipo==='Bin' sempre ganhar sequencial no final do código (ex. F2-07-B-03) — os
// demais tipos tentam o código "limpo" primeiro (ex. PF-03-B) e só caem pro sequencial se colidir.
// backend: estoqueRoutes.js sugerirCodigo()/codigoEmUso()/proximoSequencial() reescritos; GET
// sugestao-codigo e POST /estoque/enderecos aceitam modulo/nivel novos (query/body). Nenhum
// endereço tinha sido cadastrado de verdade ainda (confirmado pelo Raphael) — sem migração pendente.
// v102 13/07: wizard endr* separa "cadastrar" de "consultar" —
// lista de endereços já existentes dentro do cadastro (mode 'enderecos') virou só-leitura (sem
// toque, sem seta); nova entrada "🔎 Consultar endereços" na home do Estoque (endrSt.consulta=true)
// reusa o mesmo wizard só pra navegar até o detalhe/etiqueta de um endereço existente. Pedido do
// Raphael 13/07/2026, depois de reportar que misturar as duas ações na mesma lista confundia.
// v101 13/07: spinner animado (.ld-spin, CSS puro) substitui todos
// os "Carregando…" estáticos do app (endr*/recp*/aprovações/avisos/cadastro/galeria de mídia) — só
// cosmético, dá a sensação de progresso acontecendo entre uma tela e outra (pedido do Raphael).
// v100 13/07: wizard endr* — análise de UX (agente Fable) sobre o
// passo "lista" do cadastro de endereço: "+ Novo endereço" sobe pra logo abaixo do título (não fica
// mais escondido embaixo da lista de existentes, que virou secundária com contador); tela de
// sucesso ganha "+ Criar outro <tipo> aqui" herdando área/rua/tipo do endereço recém-criado
// (endrNovoEnderecoAqui), poupando toques repetidos no mapeamento de um local inteiro em sequência;
// "Criar em outro local/área" continua disponível pro reset completo.
// v99 13/07: Agenda perde o toggle manual "Minhas OS/Todas" —
// técnico continua vendo só as próprias OS, Coordenador+ continua vendo todas, mas sem botão pra
// trocar (ocupava espaço à toa, pedido do Raphael); Líder de Equipe já não tinha essa opção mesmo.
// v98 12/07: mesmo tratamento do v97 (esconder cabeçalho "Estoque"+
// carrossel de dia) estendido pro fluxo de Entradas Pendentes (recp*) — lista/detalhe/item também
// são tela cheia própria, sem sentido por dia; achado pelo Raphael no teste físico (ainda aparecia lá).
// v97 12/07: wizard endr* — esconde cabeçalho "Estoque"+carrossel
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
