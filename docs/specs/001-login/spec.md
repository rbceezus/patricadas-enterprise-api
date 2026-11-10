# 001 — Login

Fonte: docs/PRD.md §"O que precisa existir na primeira versão" item 1.

## O que faz

Autentica uma pessoa (Colaborador ou Operações) e garante que cada uma só
enxerga os próprios empréstimos depois de autenticada.

## Regras de negócio

- Autenticação por e-mail e senha.
- Existem dois papéis: Colaborador e Operações. O papel vem do cadastro da
  pessoa, não é escolhido na tela de login.
- Depois de autenticado, todo dado de empréstimo retornado para um
  Colaborador é filtrado pelo próprio usuário. Colaborador nunca recebe
  empréstimo de outra pessoa.
- Operações enxerga os empréstimos de todas as pessoas (ver spec
  005-painel-operacoes).
- Sem sessão válida, nenhuma rota de domínio (catálogo, empréstimo,
  devolução, painel) responde.

## Fora do escopo

- Cadastro de novo usuário por autoatendimento (cadastro é responsabilidade
  de Operações, mecanismo a definir fora desta spec).
- Recuperação de senha.
- Login social / SSO.

## Critérios de aceite (API)

Acrescentados na prática de subagentes (2026-11-10), para o professor
conseguir entrar em produção (spec 006).

- **CA-01** `GET /v1/me` sem token responde 401.
- **CA-02** Token com assinatura inválida, de outro emissor ou expirado
  responde 401. A assinatura é conferida contra o JWKS do Supabase.
- **CA-03** Token válido de uma pessoa com vínculo no tenant responde 200
  com `id`, `email`, `name` e `role` (`COLABORADOR` ou `OPERACOES`). O papel
  vem do vínculo, não do token nem do corpo.
- **CA-04** Token válido de uma pessoa sem vínculo no tenant responde 403.

## Perguntas respondidas

- Provedor: Supabase Auth, e-mail e senha (ADR-001 §Autenticação).
- Papel: vem de `memberships`. A conta do professor é criada como
  Colaborador pelo script da spec 006; cadastro de Operações continua fora
  do escopo.
- Tenant: o token do Supabase não traz claim de tenant. Enquanto houver um
  tenant só (`suporte_ti`), a API resolve o tenant pelo vínculo da pessoa.
  Diverge do ADR-001 ("tenant vem de claim do JWT"); registrado no
  ENTREGA.md. Volta a ser decisão quando existir o segundo tenant.
- Validação do token: `crypto` nativo do Node (ES256 com a chave do JWKS),
  sem biblioteca nova.
