2026-11-10 · rodada 1 · verificador-spec (subagente Explore, sem ferramentas de edição) · resposta sem edição

Spec: docs/specs/001-login/spec.md · Repositório: api · IDs: da spec
Rodada: HEAD 334d332 · intervalo verificado: commit 334d332 (branch feat/006-dados-iniciais)

| critério | lado | evidência (arquivo:linha do teste) | status | observação |
|---|---|---|---|---|
| CA-01 GET /v1/me sem token responde 401 | [back] | src/modules/auth/me.spec.ts:62 | ATENDIDO | AuthGuard lança 401 sem Bearer (auth.guard.ts) |
| CA-02 assinatura inválida, outro emissor ou expirado responde 401; conferida contra o JWKS | [back] | src/modules/auth/me.spec.ts:64, :70, :73 | ATENDIDO | os três casos são testados. O JWKS remoto (jwksRemoto em jwt.ts) é trocado por um stub no teste, então a busca real no Supabase não tem teste |
| CA-03 token válido com vínculo responde 200 com id, email, name e role; o papel vem do vínculo | [back] | src/modules/auth/me.spec.ts:79 | ATENDIDO | o token traz role 'service_role' e a resposta devolve COLABORADOR, que vem da membership |
| CA-04 token válido sem vínculo responde 403 | [back] | src/modules/auth/me.spec.ts:87 | ATENDIDO | ForbiddenException em me.controller.ts |

Checks: npm test (com DATABASE_URL e DIRECT_URL locais definidos no comando) → passou (Tests: 25 passed, 25 total)
Checks: prisma migrate reset → NÃO RODADO (é proibido ao verificador e altera o banco)
Checks: npm run build → passou
Checks: npm run typecheck → passou
Checks: git status --short → ` M .env.example` (está modificado na árvore de trabalho e fora do commit 334d332; não é surpresa do commit verificado, mas está pendente)
Fora de escopo: nada encontrado (o commit não tem cadastro, recuperação de senha nem SSO)
Veredito: PRONTA — os critérios CA-01 a CA-04 têm teste nomeado pelo ID, e testes, build e typecheck passaram.
