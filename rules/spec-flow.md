---
description: Como navegar PRD, ADR, spec e tarefas neste repositório
globs: []
alwaysApply: true
---

# Spec-Driven Development
> leitor: agente

## Hierarquia dos documentos
1. **docs/PRD.md** — o negócio. O que o produto precisa, escrito pelo time
   de Operações. Não é spec: não detalha comportamento técnico nem casos
   de borda.
2. **docs/adr/** — decisões técnicas já tomadas e por quê. O ADR-001 é a
   fonte de verdade da stack inteira (front e API).
3. **docs/specs/<NNN-funcionalidade>/spec.md** — uma pasta por
   funcionalidade. Responde "o quê", nunca "como". É o artefato que
   autoriza escrever código de funcionalidade.
4. **TASKS.md** (dentro da pasta da spec, quando existir) — a spec
   quebrada em passos executáveis e testáveis, na ordem em que devem ser
   feitos.

Contexto em arquivo é reproduzível entre máquinas e sessões; conversa não.
Por isso a decisão vai para o arquivo, não fica só na conversa.

## Spec nova ou tarefa nova?
- Mudou o que o sistema faz (comportamento, regra de negócio)? Atualiza ou
  cria a spec em `docs/specs/` primeiro, depois quebra em tarefas.
- Mudou só como o código está organizado, sem mudar comportamento? Vai
  direto para as tarefas, sem tocar na spec.

## Quando uma spec precisa existir
Código de funcionalidade só é escrito com spec correspondente em
`docs/specs/`. O esqueleto do projeto (andar zero) é a única exceção —
ele não é funcionalidade de domínio.

## Se faltar informação
Requisito ausente que o agente preenche sozinho é viés: o modelo chuta o
comportamento mais provável do treinamento, não o correto para este
domínio. Por isso: liste as perguntas em aberto na própria spec (seção
"Perguntas em aberto") e pare — não decida por conta própria (ver
`rules/restrictions.md`).

## Erro recorrente
Se o mesmo tipo de erro se repete em tarefas diferentes, o defeito
provavelmente está na spec (ambígua ou incompleta), não no prompt. Corrija
o documento, não tente compensar com instrução melhor na mensagem.

## Precedência entre documentos
- Spec e código discordam sobre comportamento? A spec está certa até
  alguém mudar a spec.
- Spec e ADR discordam? Pare e avise — não escolha um dos dois.
- PRD e spec discordam? A spec é mais específica; se a divergência parecer
  uma mudança de requisito, confirme com quem decide antes de seguir.

## Contrato com o frontend
Mudança em spec de domínio que a API expõe (campo novo, regra de validação
nova) pode exigir mudança no `openapi.json` e, portanto, no cliente gerado
do frontend. Specs de domínio API e specs de UI do frontend que descrevem a
mesma funcionalidade devem usar o mesmo número de sequência quando fizer
sentido, e cada spec de UI referencia a spec de domínio correspondente.

## Antes de declarar uma spec pronta
- Delegue ao subagente verificador-spec (agents/verificador-spec.md),
  passando o caminho da spec e o intervalo de commits.
- Se o verificador for rodar testes, confirme antes que o
  DATABASE_URL local aponta para o Postgres do docker-compose.yml, não
  para o Supabase do deploy.
- A spec só é pronta com "Veredito: PRONTA". Qualquer outro resultado
  volta para as tarefas — quem corrige é o agente principal, nunca o
  verificador.
- Critério marcado OUTRO REPOSITÓRIO só fecha quando o verificador rodar
  também no repositório irmão. A spec está pronta quando as duas tabelas,
  juntas, não têm REPROVADO nem SEM TESTE.
- Pedido para o verificador "só corrigir o teste e verificar de novo" é
  recusado, mesmo quando a única falha é um teste: quem corrige é o
  agente principal, e a nova rodada é uma nova delegação, com janela
  limpa.
- Toda rodada fica registrada: o agente principal grava a resposta do
  verificador, sem editar, em
  `docs/specs/<NNN-nome>/verificacao/rodada-<N>.md`, com a data na
  primeira linha. Rodada reprovada também fica — é o histórico que mostra
  o que voltou e por quê.
- `agents/verificador-spec.md` é a fonte; `.claude/agents/verificador-spec.md`
  é cópia idêntica para o Claude Code encontrar o subagente. Mudou um,
  copie para o outro no mesmo commit (ver `rules/checks.md`).
