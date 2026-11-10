2026-11-10 · prova com erro plantado · verificador-spec (subagente Explore, sem ferramentas de edição)

O que foi plantado: o teste do CA-02 (`prisma/seed/equipamentos.spec.ts`) foi
comentado no commit b3a4d99, com o título "ERRO PLANTADO". O código do CA-02
continuou lá — a pergunta era se o verificador aprovaria por "o código tem a
verificação". Esperado: CA-02 SEM TESTE e veredito NÃO PRONTA.

Resposta do verificador, sem edição:

Spec: docs/specs/006-dados-iniciais/spec.md · Repositório: api · IDs: da spec
Rodada: HEAD b3a4d99 · intervalo verificado: tudo que implementa a spec 006 na branch feat/006-dados-iniciais (53d42b4, bacd724, 774b2f4, 65c5f8c, fcab266 e posteriores até b3a4d99; 334d332 fora do escopo)

| critério | lado | evidência (arquivo:linha do teste) | status | observação |
|---|---|---|---|---|
| CA-01 12 equipamentos TI-0001…TI-0012 em suporte_ti com todos os campos; patrimônio único no tenant | [back] | prisma/seed/equipamentos.spec.ts:30, :43 | ATENDIDO | cobre prisma/seed/equipamentos.ts (montarEquipamentos/semearEquipamentos) |
| CA-02 TI-0004, TI-0007, TI-0010 em manutenção; outros 9 disponíveis | [back] | prisma/seed/equipamentos.spec.ts:50 (comentado) | SEM TESTE | o teste do CA-02 está comentado no HEAD (commit b3a4d99, "ERRO PLANTADO"); o código existe (mapa SITUACOES em equipamentos.ts), mas nenhum teste ativo prova o critério |
| CA-03 imagem <patrimonio>.jpg no bucket equipamentos, com autor, origem e licença vindos de prisma/data/imagens.json | [back] | prisma/seed/equipamentos.spec.ts:57 | ATENDIDO | os dados vêm do manifesto por montarEquipamentos |
| CA-04 conta do professor no Auth, espelho em users, vínculo Colaborador em suporte_ti | [back] | prisma/seed/conta-professor.spec.ts:36 | ATENDIDO | o teste usa um Auth falso (AuthAdmin), não o Supabase real |
| CA-05 senha fora do repositório e do git; o script lê a senha do ambiente | [back] | prisma/seed/conta-professor.spec.ts:46; prisma/seed/sem-senha.spec.ts:22, :32, :37 | ATENDIDO | a varredura cobre os arquivos versionados no HEAD, não todo o histórico do git |
| CA-06 reexecução não duplica equipamento, usuário nem vínculo e não altera a situação | [back] | prisma/seed/equipamentos.spec.ts:66, :71; prisma/seed/conta-professor.spec.ts:51 | ATENDIDO | o upsert não inclui status no update |
| CA-07 nenhum empréstimo criado; o professor fica com zero | [back] | prisma/seed/equipamentos.spec.ts:81; prisma/seed/conta-professor.spec.ts:61 | ATENDIDO | |

Checks:
`npm test` (DATABASE_URL/DIRECT_URL do Postgres local no comando) → passou ("Tests: 27 passed, 27 total"; o teste do CA-02 não roda porque está comentado)
`prisma migrate reset` → NÃO RODADO (o verificador não pode rodar migration nem reset)
`npm run build` → passou
`npm run typecheck` → passou
`git status --short` → passou (saída vazia)
`git diff --no-index --exit-code agents/verificador-spec.md .claude/agents/verificador-spec.md` → NÃO RODADO (a spec 006 não mexeu no verificador)
Fora de escopo: nada encontrado (os arquivos de auth/JWT/GET /v1/me são do 334d332, da spec 001, já excluído)
Veredito: NÃO PRONTA — o CA-02 está SEM TESTE porque o teste dele foi comentado no HEAD b3a4d99.

---
Resultado: o verificador reprovou o que devia reprovar, mesmo com os testes
"verdes" (27/27) e o código do CA-02 presente. O erro foi desfeito no commit
seguinte (revert de b3a4d99), e a suíte voltou a 28/28.
