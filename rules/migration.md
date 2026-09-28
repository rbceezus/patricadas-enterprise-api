---
description: Como mudar o schema do banco
globs: ["prisma/**"]
alwaysApply: false
---

# Migrations
> leitor: agente

## Fonte única
- O Prisma Migrate é o único dono do schema (ADR-001). Nada de Supabase CLI,
  SQL no painel ou alteração manual no banco.
- RLS, policies, triggers e funções entram como SQL bruto DENTRO de uma
  migration do Prisma (`prisma migrate dev --create-only` e editar o `.sql`).

## Procedimento
1. Só crie migration se a spec da tarefa exigir mudança de modelo.
2. Altere `prisma/schema.prisma`.
3. Rode `prisma migrate dev --name <verbo_objeto>` contra o banco LOCAL
   (`DIRECT_URL`). Nome descreve a mudança: `add_emprestimos`, não `update`.
4. Toda tabela de domínio nova tem `tenant_id`, índice nele e RLS habilitado
   com deny by default.
5. Rode `prisma migrate reset` e confirme que o banco sobe do zero com todas as
   migrations e o seed, sem passo manual.
6. Atualize o seed (`prisma/seed.ts`) se precisar; ele continua idempotente.

## Não faça
- Não edite migration já commitada. Mudou de ideia? Crie outra migration.
- Não rode `prisma migrate deploy` nem `db push` contra o remoto — isso é do CI.
- Não apague dado em migration sem a spec dizer explicitamente.
- Não junte mudança de schema e refactor no mesmo commit.

## Verificação
Migration pronta = `migrate reset` limpo + testes de integração
(Testcontainers) verdes + teste de isolamento de tenant cobrindo a tabela nova.
