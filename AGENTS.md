# EMPREST.AI — API

API REST do sistema interno de empréstimo de equipamentos de TI (EMPREST.AI).
Repositório separado do frontend (patricadas-enterprise-web), conforme
docs/adr/001-stack.md. Negócio em docs/PRD.md.

## Onde olhar
- docs/PRD.md — o que o negócio precisa. Não é spec.
- docs/adr/ — decisões técnicas já tomadas e o motivo delas. O ADR-001 é a
  fonte de verdade da stack.
- rules/restrictions.md — leia sempre, antes de qualquer tarefa.
- docs/specs/<NNN-funcionalidade>/ — uma pasta por funcionalidade, com spec,
  plano e tarefas. Ainda vazio.
- docs/layout.md — especificação visual do produto (referência; a implementação
  da UI é do frontend).
- docs/aulas/ — material de aula (SDD e greenfield). Referência, não é código.

## Precedência
Se dois artefatos discordarem sobre comportamento, a spec vence o código.
Se algo não estiver em lugar nenhum, pergunte — não decida.

## Processo
- Leia docs/adr/ antes de propor qualquer coisa estrutural.
- Antes de implementar, liste os requisitos ambíguos que encontrar.
- Decisão estrutural nova precisa de ADR antes do código. Você não escreve o
  ADR: descreve a decisão e as alternativas, e para.
- Código de funcionalidade só com spec em docs/specs/.
- Uma tarefa por vez.

## Contrato com o frontend
- O frontend é um repositório separado (patricadas-enterprise-web); não há
  pacote compartilhado de tipos.
- A API gera OpenAPI a partir de schemas Zod; o openapi.json é publicado pelo CI.
- O frontend gera o cliente HTTP com Orval a partir desse OpenAPI. Mudança de
  contrato exige coordenação entre os dois repositórios.

## Comandos
- `npm run db:up` / `npm run db:down` — Postgres 16 local (docker-compose.yml).
- `npm run start:dev` — API em http://localhost:3000 com reload.
- `npm run build` — compila para `dist/`.
- `npm test` — Jest + supertest; exige o banco local no ar.
- `npm run typecheck` — tsc sem emitir, inclui `api/` (entrada da Vercel).

## Mapa de diretórios
- `src/main.ts` — servidor local. `src/serverless.ts` + `api/index.ts` — Vercel.
- `src/app.setup.ts` — prefixo `/v1` e CORS, compartilhado pelos dois.
- `src/config/env.ts` — validação do env com Zod; variável nova entra aqui.
- `src/prisma/` — único lugar que instancia o PrismaClient.
- `src/health/` — `GET /health` (fora do prefixo `/v1`).
- `prisma/` — schema e seed. Ainda sem `migrations/` (AZ-03 pendente).

## Estado atual do projeto
Andar zero em andamento — ver docs/specs/000-andar-zero/TASKS.md.
