---
description: Como registrar onde a sessão parou
globs: ["handoff.md"]
alwaysApply: true
---

# Handoff
> leitor: agente

`handoff.md` (na raiz) é a memória entre sessões. Não é fonte de verdade:
PRD, ADR e specs vencem.

## Quando
- Ao começar a sessão: leia `handoff.md` antes de tudo.
- Ao terminar uma tarefa ou encerrar a sessão: sobrescreva-o.

## Formato (curto, no máximo ~20 linhas)
```
# Handoff
## Último estado
- Spec/tarefa: NNN / T-xx — concluída | em andamento | bloqueada
- O que mudou: arquivos principais
- Checks: resultado (última linha dos testes / build)
## Bloqueios e perguntas
- ...
## Próximo passo
- uma tarefa, a próxima de tasks.md
```

## Não faça
- Não escreva segredo, token ou conteúdo do .env.
- Não use como diário: substitua, não acumule histórico (o histórico é o git).
- Não registre decisão aqui; decisão vai para spec ou ADR.
