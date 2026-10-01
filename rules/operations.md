---
description: Como rodar, depurar e operar este projeto no dia a dia
globs: []
alwaysApply: true
---

# Operação
> leitor: agente

## Ambiente local
1. Copie `.env.example` para `.env` e preencha com valores reais (nunca
   peça para o agente preencher — isso é humano, ver `rules/secrets.md`).
2. `DATABASE_URL` aponta para o pooler de transação (Supavisor, porta
   6543, `pgbouncer=true&connection_limit=1`); `DIRECT_URL` aponta para a
   conexão direta (porta 5432), usada só por migration.
3. `FRONTEND_ORIGIN` precisa bater com a origem real do frontend rodando
   localmente (`http://localhost:5173` por padrão) — é a allowlist de
   CORS.

## Rodando a aplicação
`<COMANDO-DEV>` ainda não existe — não há código nem script no
`package.json` (andar zero pendente, ver `docs/aulas/aula8-greenfield-ordem.html`).
Esta seção será substituída pelo comando real assim que o andar zero
existir.

## Logs
Produção usa pino em formato JSON, com `request_id` e `tenant_id` em cada
linha (ADR-001, seção Hospedagem e operação). Ao investigar um erro
relatado, peça ou procure por esses dois campos antes de qualquer outra
coisa — sem eles, correlacionar log com usuário/tenant é adivinhação.

## Rastreamento de erro
Exceção não tratada vai para o Sentry (`SENTRY_DSN`). Se a variável estiver
vazia no `.env` local, o app deve continuar funcionando sem o Sentry — a
ausência da chave não pode derrubar o boot.

## Deploy
- Hospedagem: Vercel, projeto próprio desta API (ADR-001).
- Migration roda em job do GitHub Actions (`prisma migrate deploy`) antes
  do deploy — nunca a partir da sua máquina ou do boot da função (ver
  `rules/migration.md`).
- Você não roda deploy manual nem altera configuração do projeto na Vercel
  (ver `rules/restrictions.md`). Deploy acontece via CI, a partir de PR
  aprovado e mergeado.

## Se algo quebrar em produção
Reúna o `request_id` e o `tenant_id` do log, e o link do evento no Sentry
se existir. Não tente corrigir direto em produção (sem hotfix em branch
`main` fora do fluxo de PR) — ver `rules/restrictions.md`.

## Estado atual do projeto
Nada disto é executável ainda: não há deploy, não há instância rodando, não
há log real. Esta página passa a valer fato a fato conforme o andar zero
avança.
