---
description: Como lidar com credenciais e segredos neste repositório
globs: []
alwaysApply: true
---

# Segredos
> leitor: agente

## O que nunca fazer
- Nunca leia, exiba, edite ou commite o arquivo `.env`.
- Nunca invente valor de credencial, nem como placeholder "parecido com
  real" (ex.: uma chave com formato plausível). Se precisar de um valor
  para exemplificar, use `SEU-PROJETO`, `USER`, `PASSWORD` — como já está
  em `.env.example`.
- Nunca escreva segredo (chave, senha, token, connection string com
  credencial) em spec, PRD, ADR, AGENTS.md, handoff.md, commit, PR ou
  nesta conversa.
- Nunca crie, revogue ou gire chave do Supabase (`anon` ou
  `service_role`). Isso é feito por uma pessoa, no painel do Supabase.

## O que entra no repositório
- Só `.env.example`, sem valor real — ver o arquivo já existente nesta
  pasta para o formato esperado de cada variável.
- Variável nova precisa entrar em `.env.example` no mesmo PR que passa a
  exigi-la, com comentário dizendo de onde vem o valor.

## Regra específica desta API
- A chave `SUPABASE_SERVICE_ROLE_KEY` só pode existir aqui. Ela ignora RLS
  (ADR-001, seção Segurança) — se ela aparecer em qualquer código ou
  configuração do repositório do frontend, é incidente de segurança, não
  bug.
- Segredo de produção vive em variável de ambiente da Vercel, nunca em
  arquivo versionado (ADR-001, seção Hospedagem e operação).

## Se encontrar um segredo exposto
Pare a tarefa atual e avise. Não tente "limpar" o histórico do git nem
decidir sozinho se o valor precisa ser revogado — isso é decisão humana.
