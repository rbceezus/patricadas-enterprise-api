2026-11-10 · rodada 2 · verificador-spec (subagente Explore, sem ferramentas de edição) · resposta sem edição

Spec: docs/specs/006-dados-iniciais/spec.md · Repositório: api · IDs: da spec
Rodada: HEAD fcab266 · intervalo verificado: 2190fdf..HEAD (branch feat/006-dados-iniciais)

| critério | lado | evidência (arquivo:linha do teste) | status | observação |
|---|---|---|---|---|
| CA-01 12 equipamentos TI-0001..TI-0012 no tenant suporte_ti, com todos os campos; patrimônio único no tenant | [back] | prisma/seed/equipamentos.spec.ts:31 e :44 | ATENDIDO | O teste roda `semearEquipamentos` num tenant de teste (`teste_spec_006`), não no `suporte_ti`. O slug `suporte_ti` só aparece em prisma/seed.ts:20 e não tem teste. A unicidade vem de `@@unique` (tenantId, assetTag). |
| CA-02 TI-0004, TI-0007 e TI-0010 em manutenção; os outros 9 disponíveis | [back] | prisma/seed/equipamentos.spec.ts:50 | ATENDIDO | |
| CA-03 imagem `<patrimonio>.jpg` no bucket `equipamentos` + autor, origem Pixabay e licença, lidos de prisma/data/imagens.json | [back] | prisma/seed/equipamentos.spec.ts:57 | ATENDIDO | O teste usa uma URL base falsa. A leitura do manifesto está em prisma/seed/equipamentos.ts:54-55, e o arquivo está versionado. |
| CA-04 conta marcelo.grilo@institutojef.org.br no Supabase Auth + usuário espelho em users + vínculo Colaborador no suporte_ti | [back] | prisma/seed/conta-professor.spec.ts:36 | ATENDIDO | O teste usa um Auth falso e um tenant de teste. O cliente real `authAdminSupabase` e o script prisma/criar-conta-professor.ts não têm teste (o script é rodado por uma pessoa, contra produção). |
| CA-05 a senha não aparece em arquivo nem no histórico do git; o script lê a senha de variável de ambiente | [back] | prisma/seed/conta-professor.spec.ts:46; prisma/seed/sem-senha.spec.ts:25, :35, :40 | ATENDIDO | A varredura do teste cobre só os arquivos versionados atuais, não o histórico. Um `git log -p --all -G "PROFESSOR_SENHA\s*=\s*\S"` manual só achou o próprio regex do teste, nenhum valor de senha. Só a parte do histórico não tem teste automatizado. |
| CA-06 reexecutar não duplica equipamento, usuário nem vínculo, e não altera a situação de equipamento existente | [back] | prisma/seed/equipamentos.spec.ts:65 e :70; prisma/seed/conta-professor.spec.ts:51 | ATENDIDO | |
| CA-07 nenhum empréstimo criado; a conta do professor fica com zero empréstimos | [back] | prisma/seed/equipamentos.spec.ts:80; prisma/seed/conta-professor.spec.ts:61 | ATENDIDO | |

Checks: npm test (DATABASE_URL/DIRECT_URL = Postgres local, definidos no próprio comando) → passou (Tests: 28 passed, 28 total; 6 suites)
Checks: prisma migrate reset → NÃO RODADO (o verificador não pode rodar reset nem migration, mesmo com a branch tocando em migration)
Checks: npm run build → passou
Checks: npm run typecheck → passou
Checks: git status --short → falhou (` M .env.example` não commitado: troca FRONTEND_ORIGIN para a URL da Vercel e remove SENTRY_DSN; isso não é escopo da spec 006)
Fora de escopo: commit 334d332 "feat(001): login na API" (src/modules/auth/*, src/config/env.ts, src/app.module.ts, docs/specs/001-login/*) dentro do intervalo da 006, e a spec diz que login é a spec 001 · mudança não commitada em .env.example (FRONTEND_ORIGIN/SENTRY_DSN)
Veredito: NÃO PRONTA — os 7 critérios estão ATENDIDOS e testes, build e typecheck passaram, mas o `git status` mostra uma alteração fora do escopo em .env.example e o intervalo inclui trabalho da spec 001, o que reprova o critério de pronto de rules/checks.md.

---
Nota do agente principal: o intervalo com o commit da spec 001 foi erro do agente principal ao delegar (devia ter passado só os commits da 006). A mudança em .env.example é do usuário, anterior a esta prática; decisão pedida a ele.
