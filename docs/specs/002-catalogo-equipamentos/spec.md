# 002 — Catálogo de equipamentos

Fonte: docs/PRD.md §"O que precisa existir na primeira versão" item 2.

## O que faz

Lista os equipamentos cadastrados (notebooks, monitores, cabos, câmeras) com
a situação atual de cada um, para que qualquer pessoa autenticada saiba o
que existe e o que está disponível.

## Regras de negócio

- Todo equipamento tem exatamente uma situação a qualquer momento:
  **Disponível**, **Emprestado** ou **Em manutenção**.
- Equipamento em manutenção não aparece como disponível para empréstimo
  (PRD, "Regras que Operações já decidiu"). Ele continua visível no
  catálogo, só não pode ser solicitado.
- Equipamento emprestado mostra, no mínimo, que está indisponível. Quem
  está com ele é informação de Operações (spec 005), não do catálogo do
  Colaborador.
- A listagem é visível para qualquer pessoa autenticada, independente do
  papel.

## Fora do escopo

- Busca/filtro avançado (fica a critério do frontend como spec de UI
  própria).
- Edição ou exclusão de equipamento por aqui — cadastro de equipamento é
  tarefa de Operações e não está detalhado nesta versão do PRD além da
  necessidade de existir.
- Categorias ou atributos além do necessário para listar e mostrar situação.

## Perguntas em aberto

- Quais campos mínimos um equipamento tem (nome, categoria, patrimônio —
  "patrimônio" aparece em docs/layout.md como dado exibido, mas o PRD não
  define o cadastro)? Precisa confirmar com Operações antes de desenhar o
  schema.
