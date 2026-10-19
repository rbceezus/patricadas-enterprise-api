# Handoff

Registro efêmero de onde a sessão parou. Não é fonte de verdade de nada — pode
ser sobrescrito à vontade.

## Onde parei
Andar zero da API (docs/specs/000-andar-zero/TASKS.md): AZ-01, AZ-02, AZ-04 e
entrada da Vercel prontas. `GET /health` responde 200 com `db: up` localmente
e pelo handler serverless.

## Commitado
Branch `feat/andar-zero`, mergeado em `main`.

## Aplicado no banco
Nada. Não existe `prisma/migrations/` — o Supabase e o Postgres local não
receberam migration desta linha do tempo.

## Publicado
Push em `main`. Deploy na Vercel depende do projeto configurado por uma pessoa
(variáveis de ambiente do Supabase).

## Próximo passo
AZ-03: `prisma migrate dev --name init` contra o Postgres local, mostrar o DDL
e esperar revisão.
