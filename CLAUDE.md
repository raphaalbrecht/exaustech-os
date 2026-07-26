# CLAUDE.md — instruções permanentes deste projeto

Leia este arquivo inteiro antes da primeira ação. Ele vale para toda sessão, sem
precisar ser pedido.

---

## Com quem você está falando

Raphael, dono da Exaustech. **Não é programador.** Ele decide o que o sistema deve
fazer, testa o comportamento clicando, e autoriza o que vai para produção. Ele não
revisa código — revisa comportamento.

Isso significa que **você é responsável por protegê-lo de erros que ele não tem como
enxergar.** Não transfira para ele decisões técnicas disfarçadas de pergunta.

---

## Regras inegociáveis

1. **Produção é intocável.** Desenvolvimento e deploy acontecem em ambiente de teste.
   Quem promove para produção é o Raphael, depois de testar. Se você achar que algo
   precisa ir para produção, escreva o motivo e pare.

2. **Adicionar sim, apagar não.** Você pode criar campos, objetos, classes e arquivos.
   Não apague campo, não remova valor de picklist, não delete arquivo, não remova
   registro — nem em ambiente de teste. Se a solução exigir remover algo, pare, explique
   por quê, e espere autorização escrita.

3. **Leia antes de escrever.** Antes de propor qualquer mudança, leia o código atual da
   área afetada e diga o que já existe. Metade dos erros deste projeto nasceu de proposta
   feita sem leitura.

4. **Commit antes de começar.** Sempre. Branch separada quando a mudança for maior que um
   ajuste pontual. Nunca `--force`.

5. **Uma coisa por vez.** Entregas pequenas e testáveis. Cinco que funcionam valem mais
   que uma grande que ninguém consegue validar.

6. **Toda entrega vem com três coisas**, em português e sem jargão: o que mudou em uma
   frase; como testar clicando, passo a passo; o que quebra se estiver errado.

7. **Não invente requisito.** Ambiguidade vira pergunta, não escolha sua. Não "melhore"
   regra de negócio já decidida.

8. **Diga quando não souber.** "Não testei" é resposta melhor que "está pronto".

9. **Nenhuma sessão de decisão termina sem documento.** Se a conversa fechou uma decisão
   de arquitetura, de regra de negócio ou de comportamento, gere um arquivo de decisão
   no formato abaixo antes de encerrar. Não espere ser pedido. **Já houve perda: existe
   um documento neste projeto que começa admitindo que o desenho original se perdeu numa
   conversa e teve que ser reconstruído por adivinhação.**

---

## Formato do documento de decisão

Salvar no repositório `exaustech-docs`, nome `DECISAO_assunto-em-kebab-case.md`.

```markdown
# DECISÃO — [assunto]
**Data:** __/__/____ · **Status:** válida | superada por [documento]

## O problema
## A decisão
## Por quê          ← a parte mais importante: sem o motivo, alguém desfaz achando que é bug
## O que foi descartado e por quê
## Impacto técnico  ← objetos, campos, funções, endpoints
## Em aberto
```

---

## Arquitetura em uma tela

```
App (PWA, arquivo único)  →  Backend (Cloud Run)  →  Salesforce
campo.exaustech.com.br        exaustech-os-backend     dados e Apex
GitHub: exaustech-os          projeto magnetic-rite-500918
```

**O app nunca fala com o Salesforce direto.** Sempre passa pelo backend.

Entrada de notas fiscais: Focus NFe → webhook → Apex no Salesforce. Quando o caminhão
chega, a nota já está lá com itens, fornecedor identificado e pedido amarrado.

### Como achar uma tela no `index.html`

Arquivo único, ~11.500 linhas, funções agrupadas por **prefixo de nome**:

| Prefixo | Assunto | Prefixo | Assunto |
|---|---|---|---|
| `recp*` | Recebimento / conferência | `mot*` | Execução da OT |
| `endr*` | Endereços e etiquetas | `sig*` | Assinatura + OTP |
| `estoq*` | Hub do Estoque | `as*` | Autorização de Serviço |
| `sep*` | Separação / picking | `pln*` | Aba Plano (retaguarda) |
| `bipar*` | Bipagem contínua por câmera | `exp*` | Programa EXP |
| `cad*` | Cadastros | `acmp*` | Acompanhamento e alertas |
| `off*` | Fila offline (IndexedDB) | `be*` | Chamadas ao backend |

**O código é comentado com o *porquê*, com data.** Mantenha esse padrão — é o que
permite entender o sistema meses depois. Comentário que só repete o que o código faz
não serve; escreva o motivo.

---

## Armadilhas conhecidas — leia antes de mexer

Cada uma destas já enganou alguém. Todas parecem melhorias óbvias e não são.

### Conferência de recebimento (`recp*`)

- **A quantidade nasce em branco de propósito.** É contagem semi-cega: o operador
  precisa contar de verdade, não confirmar o valor esperado. **Nunca pré-preencha o campo
  com a quantidade da NF, e nunca crie um botão "= NF".**
- **`c.quantidade` só sincroniza no clique de "Confirmar item".** O input `#recpQtd` é
  não controlado. Qualquer controle novo de quantidade deve operar sobre o input, nunca
  sobre `c.quantidade` — e sem chamar `renderEstoque()`, que re-renderiza a tela inteira.
- **Embalagem é atalho de digitação, não unidade de medida.** `QuantidadePadraoEmbalagem__c`
  soma na unidade base. O estoque nunca guarda "3 caixas". Não crie conversão de unidade.
- **Divergência não interrompe a conferência.** Marca e segue; o bloqueio é no fecho.
- **Não mexa** em: avaria parcial (`quantidadeAvariada`), tolerância soft de recebimento a
  maior, sinônimos de unidade (`RECP_UNI_SINONIMOS`), capacidade de endereço com
  fracionamento, estorno com janela de 30 minutos.

### Service Worker / cache

- O cache do navegador é **compartilhado por origem, não por pasta**. Qualquer cópia do
  app (ex.: `/beta/`) precisa de nome de cache próprio, e a limpeza no evento `activate`
  só pode apagar caches do próprio prefixo. Sem isso, versões diferentes se destroem
  mutuamente e um operador pode receber a versão errada.
- Suba o número da versão em `sw.js` a cada mudança publicada.

### Offline

- A fila offline (`off*`) cobre escritas de campo. **Fluxos de coordenação — alocação de
  endereço, confirmação de recebimento — exigem conexão por decisão consciente.** Não
  "conserte" isso.

---

## O que não fazer sem autorização explícita

| Não faça | Por quê |
|---|---|
| Separar o `index.html` em vários arquivos | Hoje o arquivo único é vantagem: sem build, sem dependências. Só separe quando houver dois agentes trabalhando em paralelo. |
| Conectar o Cloud Run ao repositório | Mexe na forma de implantar, que funciona. Decisão adiada de propósito. |
| Trocar de plataforma ou introduzir framework/bundler | A ausência de build é uma escolha, não um descuido. |
| Subir qualquer segredo ao repositório | Chaves, tokens, certificados, `.env`. Se encontrar algum no código, **pare e avise**. |
