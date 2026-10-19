---
description: Como registrar onde a sessão parou ao fim de cada tarefa
globs: []
alwaysApply: false
---

# Handoff
> leitor: agente
> gatilho: fim de tarefa

Ao terminar uma tarefa, sobrescreva `handoff.md` na raiz com:

1. **Onde parei** — a tarefa e o ponto exato em que ficou.
2. **Commitado** — o que já está no git (branch e hash).
3. **Aplicado no banco** — migrations rodadas e em qual ambiente.
4. **Publicado** — o que foi para o remoto ou para produção.
5. **Próximo passo** — uma única ação.

`handoff.md` é registro efêmero, não fonte de verdade. Nunca escreva
segredo nele (ver `rules/secrets.md`).
