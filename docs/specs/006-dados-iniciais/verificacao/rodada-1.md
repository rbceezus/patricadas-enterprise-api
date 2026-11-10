2026-11-10 · rodada 1 · verificador-spec (subagente Explore, sem ferramentas de edição) · resposta sem edição

Spec: docs/specs/006-dados-iniciais/spec.md · Repositório: api · IDs: da spec
Rodada: HEAD 334d332 · intervalo verificado: 2190fdf..65c5f8c (feat/006-dados-iniciais). O HEAD tem um commit a mais, 334d332 (feat(001) login), que fica fora do intervalo e não foi verificado.

| critério | lado | evidência (arquivo:linha do teste) | status | observação |
|---|---|---|---|---|
| CA-01 12 equipamentos TI-0001…TI-0012 no tenant, com todos os campos; patrimônio único no tenant | [back] | prisma/seed/equipamentos.spec.ts:30, :43 | ATENDIDO | O teste roda num tenant de teste, não no `suporte_ti`. O seed.ts faz o upsert do `suporte_ti` e chama a mesma `semearEquipamentos`. A unicidade vem do `@@unique([tenantId, assetTag])` no schema.prisma. |
| CA-02 TI-0004, TI-0007 e TI-0010 em manutenção; os outros 9 disponíveis | [back] | prisma/seed/equipamentos.spec.ts:49 | ATENDIDO | |
| CA-03 imagem `<patrimonio>.jpg` no bucket e crédito (autor, Pixabay, licença), vindos do manifesto | [back] | prisma/seed/equipamentos.spec.ts:56 | ATENDIDO | Os dados são lidos de prisma/data/imagens.json (prisma/seed/equipamentos.ts, `montarEquipamentos`). |
| CA-04 conta marcelo.grilo no Supabase Auth, usuário espelho em `users` e vínculo Colaborador no `suporte_ti` | [back] | prisma/seed/conta-professor.spec.ts:119 | ATENDIDO | A lógica foi provada com um Auth falso. A conta real só passa a existir quando uma pessoa rodar prisma/criar-conta-professor.ts, e isso não é verificável aqui. O cliente HTTP `authAdminSupabase` não tem teste. |
| CA-05 a senha não aparece em arquivo nem no histórico do git; o script lê a senha de uma variável de ambiente | [back] | prisma/seed/conta-professor.spec.ts:129 | SEM TESTE | O teste prova só a leitura de `PROFESSOR_SENHA`. Nenhum teste ou check prova que a senha não está nos arquivos nem no histórico do git. |
| CA-06 reexecutar não duplica equipamento, usuário nem vínculo, e não altera a situação | [back] | prisma/seed/equipamentos.spec.ts:65, :70; prisma/seed/conta-professor.spec.ts:134 | ATENDIDO | |
| CA-07 nenhum empréstimo criado; o professor fica com zero empréstimos | [back] | prisma/seed/equipamentos.spec.ts:80; prisma/seed/conta-professor.spec.ts:144 | ATENDIDO | |

Checks:
npm test (DATABASE_URL e DIRECT_URL em localhost:5432 definidos no próprio comando) → passou ("Tests: 25 passed, 25 total", 5 suítes)
prisma migrate reset (passo 2, a tarefa tocou em migration) → NÃO RODADO (o verificador-spec proíbe migrate e reset de banco; a migration 20261110123515_init não foi conferida subindo do zero)
npm run build → passou
npm run typecheck → passou
git status --short → NÃO RODADO (comando não está entre os permitidos ao verificador)
git diff --no-index agents/verificador-spec.md .claude/agents/verificador-spec.md → NÃO RODADO (o intervalo não mexe no verificador)

Fora de escopo: no 65c5f8c, .claude/settings.json ganhou a permissão "Bash(npx ts-node prisma/criar-conta-professor.ts:*)", que libera o agente para rodar o script de produção. Isso contraria o cabeçalho do próprio script ("nunca pelo agente"). O script se protege com a exigência de TTY e com a confirmação do host digitado. Fora isso, nada encontrado.

Veredito: NÃO PRONTA — CA-05 está SEM TESTE: nada prova que a senha não está nos arquivos nem no histórico do git, e o reset do passo 2 do checks.md, obrigatório com migration nova, não foi rodado.

---
Nota do agente principal (fora da resposta do verificador):
- CA-05: procede; corrigido na rodada seguinte com teste que varre os arquivos versionados.
- "Fora de escopo" está errado: a regra foi acrescentada à lista `permissions.deny` de .claude/settings.json, ou seja, NEGA o comando ao agente. O verificador leu como permissão. Registrado como erro do verificador (ENTREGA.md §6).
- `prisma migrate reset`: o Prisma recusa esse comando quando invocado por agente de IA; fica para o usuário rodar no banco local.
