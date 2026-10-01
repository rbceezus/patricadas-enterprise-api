# 004 — Devolver item

Fonte: docs/PRD.md §"O que precisa existir na primeira versão" item 4.

## O que faz

Permite que um Colaborador devolva um item que está em seu nome, e permite
que Operações registre a devolução no balcão (PRD, item 5).

## Regras de negócio

- Só é possível devolver um empréstimo que esteja aberto (ainda não
  devolvido) e pertencente à própria pessoa, quando a ação é feita pelo
  Colaborador.
- Operações pode registrar a devolução de qualquer empréstimo em aberto, de
  qualquer pessoa (balcão).
- Ao devolver, o empréstimo é marcado como encerrado com a data/hora da
  devolução, e a situação do equipamento volta para **Disponível**
  imediatamente — exceto se Operações marcar o equipamento como indo para
  manutenção nesse mesmo fluxo (ver pergunta em aberto).
- Devolver um item em atraso remove esse item da contagem de atraso da
  pessoa; se não houver outro item em atraso, o bloqueio de novo empréstimo
  (spec 003) é liberado.

## Fora do escopo

- Avaliação de estado do equipamento na devolução (ex.: "devolvido com
  dano").
- Qualquer notificação.

## Perguntas em aberto

- Quando Operações registra devolução, existe a opção de já marcar o
  equipamento como **Em manutenção** em vez de **Disponível**? O PRD não
  diz; o fluxo mais simples (volta sempre para Disponível) é o assumido até
  alguém confirmar o contrário.
