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
1. Rode `<COMANDO-TESTES>`. Cole a última linha da saída na resposta.
2. Se a tarefa tocou em migration, rode `prisma migrate reset` contra o banco
   local (`DIRECT_URL`) e confirme que ele sobe do zero, aplicando todas as
   migrations sem passo manual.
3. Rode `<COMANDO-BUILD>` antes de qualquer push. Build que quebra na Vercel é
   o feedback mais lento e mais caro deste projeto.
4. Rode `git status --short`. Só podem aparecer arquivos do escopo da tarefa.
5. Diga qual critério de aceitação (CA-xx) esta tarefa atende.

## Verificação
Pronto = os quatro comandos terminaram sem falha E o `git status` não trouxe
surpresa. As duas coisas, não uma.

## Não faça
- Não relate sucesso parcial. Teste vermelho é tarefa não terminada, mesmo que
  o código "esteja certo".
- Não tente consertar a mesma falha duas vezes seguidas sem me mostrar a saída
  do erro.
- Não rode teste nem `prisma migrate deploy` contra o banco remoto — isso é
  papel do CI (ver rules/restrictions.md).

## Estado atual do projeto
`<COMANDO-TESTES>` e `<COMANDO-BUILD>` ainda não existem: não há código,
suíte de testes nem script de build (andar zero pendente — ver
docs/aulas/aula8-greenfield-ordem.html). Esta seção passa a valer assim que
esses comandos existirem de fato; até lá, os passos 1 e 3 não são
executáveis.
