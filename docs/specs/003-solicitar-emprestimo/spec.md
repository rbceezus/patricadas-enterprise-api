# 003 — Solicitar empréstimo

Fonte: docs/PRD.md §"O que precisa existir na primeira versão" item 3 e
§"Regras que Operações já decidiu".

## O que faz

Permite que um Colaborador pegue emprestado um item que está disponível no
catálogo (spec 002).

## Regras de negócio

- Só é possível solicitar um item cuja situação seja **Disponível**.
- Limite: cada pessoa pode estar com no máximo **3 itens** emprestados ao
  mesmo tempo. Na tentativa do 4º item, o pedido é recusado.
- Quem tem pelo menos um item **em atraso** não pode pegar outro item
  emprestado, mesmo que esteja abaixo do limite de 3. O bloqueio só é
  removido quando o(s) item(ns) em atraso forem devolvidos.
- Prazo padrão de devolução: **14 dias corridos** a partir da data do
  empréstimo. Não há escolha de prazo pelo Colaborador nesta versão.
- Ao confirmar o empréstimo, a situação do equipamento muda imediatamente
  para **Emprestado** e ele some da lista de disponíveis.
- Um empréstimo sempre pertence a uma pessoa e um equipamento — sem
  empréstimo compartilhado ou em nome de outra pessoa.

## Fora do escopo

- Reserva com data futura (PRD, "O que NÃO entra nesta versão").
- Notificação por e-mail ao solicitar ou ao se aproximar do prazo (PRD,
  idem).
- Renovação/extensão de prazo.

## Perguntas em aberto

- O limite de 3 itens e o bloqueio por atraso valem por pessoa
  independente do papel, ou só para Colaborador? O PRD fala em "pessoa",
  assumindo que vale para qualquer um que solicite — a confirmar.
