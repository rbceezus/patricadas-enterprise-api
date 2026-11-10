2026-11-10 · rodada 3 · verificador-spec (subagente Explore, sem ferramentas de edição) · resposta sem edição

Spec: docs/specs/006-dados-iniciais/spec.md · Repositório: api · IDs: da spec
Rodada: HEAD 84bf844 · intervalo verificado: 53d42b4, bacd724, 774b2f4, 65c5f8c, fcab266 (+84bf844, só registro; 334d332 da spec 001 excluído)

| critério | lado | evidência (arquivo:linha do teste) | status | observação |
|---|---|---|---|---|
| CA-01 12 equipamentos TI-0001…TI-0012 no tenant suporte_ti, com todos os campos; patrimônio único no tenant | [back] | prisma/seed/equipamentos.spec.ts:30, :43 | ATENDIDO | O teste roda semearEquipamentos num tenant de teste. O slug suporte_ti vem de prisma/seed.ts:20-22, e nenhum teste cobre isso. |
| CA-02 TI-0004/0007/0010 em manutenção, outros 9 disponíveis | [back] | prisma/seed/equipamentos.spec.ts:49 | ATENDIDO | |
| CA-03 imagem `<patrimonio>.jpg` no bucket e crédito (autor, Pixabay, licença), vindos de prisma/data/imagens.json | [back] | prisma/seed/equipamentos.spec.ts:56 | ATENDIDO | O código lê o manifesto em prisma/seed/equipamentos.ts:198 e :242. |
| CA-04 conta no Supabase Auth, espelho em users, vínculo Colaborador em suporte_ti | [back] | prisma/seed/conta-professor.spec.ts:36 | ATENDIDO | O teste usa um Auth falso. O cliente real (authAdminSupabase) não tem teste e o script de produção não foi rodado, por ser de uso humano. |
| CA-05 senha fora do repositório e do git; só pela variável de ambiente | [back] | prisma/seed/sem-senha.spec.ts:22, :32, :37; prisma/seed/conta-professor.spec.ts:46 | ATENDIDO | A varredura cobre os arquivos versionados atuais (git ls-files). O histórico do git não é varrido por nenhum teste. |
| CA-06 reexecutar não duplica equipamento, usuário nem vínculo e não altera a situação | [back] | prisma/seed/equipamentos.spec.ts:65, :70; prisma/seed/conta-professor.spec.ts:51 | ATENDIDO | |
| CA-07 nenhum empréstimo; a conta termina com zero empréstimos | [back] | prisma/seed/equipamentos.spec.ts:80; prisma/seed/conta-professor.spec.ts:61 | ATENDIDO | |

Checks: npm test (DATABASE_URL/DIRECT_URL em localhost:5432 definidos no comando) → passou — "Test Suites: 6 passed, 6 total · Tests: 28 passed, 28 total"
Checks: prisma migrate reset → NÃO RODADO (o verificador é proibido de rodar migration/reset; a tarefa tocou migration em bacd724)
Checks: npm run build → passou
Checks: npm run typecheck → passou
Checks: git status --short → passou (saída vazia)
Fora de escopo: nada encontrado
Veredito: PRONTA — os 7 critérios estão atendidos com teste, e test, build, typecheck e git status passaram. O passo de migrate reset não foi rodado por proibição do verificador e fica para o agente principal.

---
Nota do agente principal: o `prisma migrate reset` também é recusado pelo Prisma quando invocado por agente de IA; fica com o usuário, no banco local.
