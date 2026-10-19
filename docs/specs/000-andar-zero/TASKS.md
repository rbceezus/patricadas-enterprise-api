# Andar zero — API (AZ-01..AZ-04)

Esqueleto do projeto: exceção à regra de spec (ver `rules/spec-flow.md`).
Objetivo: provar que a stack do ADR-001 sobe junta numa máquina limpa.
Status: **plano aguardando aprovação** — nenhum código escrito ainda.

Branch: `feat/andar-zero`, a partir de `chore/estrutura-aula10`.
Cada tarefa termina com os checks de `rules/checks.md` e para.

## Perguntas em aberto (decidir antes de AZ-01)
1. **Banco local.** `rules/migration.md` manda rodar `prisma migrate dev`
   localmente, mas o `DIRECT_URL` do `.env.example` aponta para o Supabase
   remoto, que `rules/restrictions.md` proíbe tocar. Proposta: Postgres 16
   em `docker-compose.yml` só para desenvolvimento. **Decidido: aprovado
   pelo time (Postgres local via Docker Compose).** Docker Compose ainda não
   está no ADR-001 — registrar lá é decisão do time.
2. **Gerenciador de pacotes.** ADR-001 não fixa. Proposta: npm (já
   instalado, gera `package-lock.json`).

## Tarefas

### AZ-01 · um comando sobe Postgres local e a aplicação
- `docker-compose.yml` com Postgres 16 (porta 5432, volume nomeado).
- `package.json` com os pacotes do ADR-001: `@nestjs/core`, `@nestjs/common`,
  `@nestjs/platform-express`, `@nestjs/config`, `nestjs-zod`, `zod`,
  `prisma`, `@prisma/client`, `jest`, `ts-jest`, `supertest`.
- Arquivos criados à mão (sem `nest new`): `tsconfig.json`,
  `tsconfig.build.json`, `nest-cli.json`, `src/main.ts`, `src/app.module.ts`.
- Scripts: `start:dev`, `build`, `test`, `db:up`.
- **Check:** `npm run build` passa; `npm run start:dev` responde na `PORT`.

### AZ-02 · conexão por variável de ambiente, erro claro sem banco
- `src/prisma/prisma.service.ts` (único lugar que instancia o client).
- Validação do env com Zod no boot: falta `DATABASE_URL` → erro nomeando a
  variável, não stack trace genérico.
- **Check:** subir sem banco falha com mensagem clara; com banco, sobe.

### AZ-03 · primeira migration versionada
- `prisma migrate dev --name init` contra o Postgres **local**.
- Mostrar o DDL gerado e parar para revisão antes de commitar
  (`rules/migration.md`). RLS/policies ficam para uma migration posterior.
- Rodar `prisma/seed.ts` duas vezes (idempotência).
- **Check:** `prisma migrate reset` sobe do zero sem passo manual.

### AZ-04 · `GET /health` com status do banco
- Controller → service; `SELECT 1` via `PrismaService`.
- 200 com `{ status: "ok", db: "up" }`; 503 com `db: "down"`.
- Teste com supertest sobre a app Nest.
- **Check:** `npm test` verde; `curl localhost:3000/health` → 200.

## Fora deste plano
Adapter serverless da Vercel, OpenAPI/`openapi.json`, auth por JWKS,
Testcontainers e CI ficam para as tarefas seguintes do andar zero
(AZ-05..AZ-08), com plano próprio.
