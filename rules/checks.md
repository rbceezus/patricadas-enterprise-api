---
description: O que precisa passar antes de declarar uma tarefa pronta
globs: []
alwaysApply: true
---

# Verificação de fim de tarefa
> leitor: agente

## Quando
Sempre que você for dizer "pronto", "implementado" ou "funcionando".

## Procedimento
1. Rode `npm test` (Jest + supertest; exige `npm run db:up` e o
   `DATABASE_URL` do `.env` apontando para o Postgres local). Cole a
   última linha da saída na resposta.
2. Se a tarefa tocou em migration, rode `prisma migrate reset` contra o banco
   local (`DIRECT_URL`) e confirme que ele sobe do zero, aplicando todas as
   migrations sem passo manual.
3. Rode `npm run build` e `npm run typecheck` antes de qualquer push.
   Build que quebra na Vercel é o feedback mais lento e mais caro deste
   projeto.
4. Rode `git status --short`. Só podem aparecer arquivos do escopo da tarefa.
5. Diga qual critério de aceitação (CA-xx) esta tarefa atende.
6. Se a tarefa mexeu no verificador, confirme que a cópia do harness é
   idêntica à fonte:
   `git diff --no-index --exit-code agents/verificador-spec.md .claude/agents/verificador-spec.md`

## Verificação
Pronto = os comandos acima terminaram sem falha E o `git status` não trouxe
surpresa. As duas coisas, não uma.

## Não faça
- Não relate sucesso parcial. Teste vermelho é tarefa não terminada, mesmo que
  o código "esteja certo".
- Não tente consertar a mesma falha duas vezes seguidas sem me mostrar a saída
  do erro.
- Não rode teste nem `prisma migrate deploy` contra o banco remoto — isso é
  papel do CI (ver rules/restrictions.md).

## Estado atual do projeto
Os comandos dos passos 1 e 3 existem (`package.json`). Ainda não existe
`prisma/migrations/` (AZ-03 pendente), então o passo 2 só passa a valer
depois da primeira migration.
