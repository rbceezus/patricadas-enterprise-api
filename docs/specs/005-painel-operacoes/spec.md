# 005 — Painel de Operações

Fonte: docs/PRD.md §"O que precisa existir na primeira versão" item 5 e
§"Quem usa" (Operações).

## O que faz

Dá a Operações uma visão de todos os empréstimos em aberto no sistema, de
qualquer pessoa, para controle e para registrar devolução no balcão (spec
004).

## Regras de negócio

- Só o papel Operações acessa este painel (ver spec 001 — Login).
- O painel lista todo empréstimo cujo status seja "em aberto" (ainda não
  devolvido), com, no mínimo: pessoa, equipamento, data do empréstimo, data
  limite e se está em atraso.
- A partir da listagem, Operações pode acionar a devolução de qualquer
  empréstimo (spec 004).
- Também é o ponto de onde Operações cadastra equipamento novo (PRD, "Quem
  usa" — Operações cadastra equipamentos), mas o cadastro de equipamento em
  si não está detalhado nesta spec (ver pergunta em aberto da spec 002).

## Fora do escopo

- Relatórios, exportação ou histórico de empréstimos já devolvidos.
- Edição de dados da pessoa (usuário).

## Perguntas em aberto

- O cadastro de equipamento (criar, editar situação) é parte deste painel
  ou uma spec própria? Tratando como parte deste painel até alguém separar.
