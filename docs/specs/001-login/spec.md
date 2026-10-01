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

## Perguntas em aberto

- Qual provedor faz a autenticação (Supabase Auth é a suposição, a confirmar
  no ADR correspondente)? Esta spec não decide — só descreve o
  comportamento esperado.
- Como o papel (Colaborador/Operações) é atribuído a uma conta? Quem
  cadastra Operações?
