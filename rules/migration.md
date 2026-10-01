---
description: Como mudar o schema do banco neste repositório
globs: []
alwaysApply: true
---

# Migration
> leitor: agente

## Dono do schema
Prisma Migrate é o único dono do schema (ADR-001, seção Dados e
persistência). Nunca altere o banco por outro caminho: nada de SQL rodado
à mão, nada de alteração pelo painel do Supabase, nada de Supabase CLI
gerenciando schema. Dois donos de schema divergem sem ninguém perceber.

## Objetos que o Prisma não modela
RLS, policies e triggers não têm representação no `schema.prisma`. Eles
entram como SQL bruto dentro de uma migration do Prisma mesmo assim (via
migration vazia + SQL manual), nunca como script solto aplicado fora da
linha do tempo versionada.

## Onde cada migration roda
- **Local, durante o desenvolvimento**: `prisma migrate dev`, contra
  `DIRECT_URL` (porta 5432, conexão direta — o pooler de transação não
  suporta os comandos que migration usa).
- **Produção**: `prisma migrate deploy`, rodado por um job do GitHub
  Actions antes do deploy. Você nunca roda isso contra o banco remoto, nem
  a partir da sua máquina nem do boot da aplicação — instâncias serverless
  sobem em paralelo e tentariam migrar ao mesmo tempo.

## Procedimento ao mudar o schema
1. Edite `schema.prisma`.
2. Gere a migration localmente (`prisma migrate dev --name <nome>`).
3. Se a tarefa envolveu RLS, policy ou trigger, confirme que o SQL entrou
   na mesma migration — não em arquivo separado.
4. Rode `prisma migrate reset` contra o banco local e confirme que ele
   sobe do zero aplicando todas as migrations sem passo manual (ver
   `rules/checks.md`).
5. Se a tabela nova é de domínio, confirme que ela tem a coluna
   `tenant_id` (ADR-001, seção Multi-tenancy) — tabela sem essa coluna não
   pode ser protegida por policy.

## Seed
`prisma/seed.ts` precisa continuar idempotente: rodar mais de uma vez não
pode duplicar dado nem falhar. Ele cria o tenant `suporte_ti`.

## Estado atual do projeto
Ainda não há `schema.prisma` nem migration aplicada (andar zero pendente).
Esta regra passa a ser executável assim que o schema inicial existir.
