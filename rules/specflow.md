---
description: Fluxo PRD → spec → plano → tarefas → código
globs: []
alwaysApply: true
---

# Fluxo de spec (SDD)
> leitor: agente

## Ordem obrigatória
1. **PRD** (`docs/PRD.md`) — o negócio. Você lê, não escreve.
2. **Spec** (`docs/specs/NNN-nome/spec.md`) — O QUÊ: atores, regras (RN-xx),
   critérios de aceite (CA-xx), fora do escopo, perguntas em aberto.
   Sem decisão técnica além do contrato da API.
3. **Plano** (`docs/specs/NNN-nome/plan.md`) — COMO: módulos, endpoints,
   migrations, testes. Respeita o ADR-001.
4. **Tarefas** (`docs/specs/NNN-nome/tasks.md`) — lista numerada (T-01…), cada
   uma pequena, testável e ligada a um CA.
5. **Código** — uma tarefa por vez.

## Portões
- Cada etapa só começa com a anterior **aprovada** pelo time
  (`Status: aprovada` no topo do arquivo).
- Spec com "Perguntas em aberto" não respondidas não vira plano.
- Ao terminar uma tarefa: rode `rules/checks.md`, marque `[x]` em tasks.md,
  atualize `handoff.md` e PARE.

## Mudança no meio do caminho
- Descobriu que a spec está errada ou incompleta? Pare, proponha a alteração
  na spec, espere aprovação. Não "corrija" no código.
- Mudou o contrato (rota, schema Zod)? Registre na spec e avise que o frontend
  precisa regenerar o cliente.

## Numeração
Pastas `NNN-nome-curto`, sequenciais, nunca reaproveitadas.
