# 006 — Dados iniciais

Fonte: briefing "dados iniciais" da prática e a lista de 12 equipamentos da
prática (`.claude/skills/imagens-equipamentos/scripts/equipamentos.json`).
Status: aprovada pelo usuário em 2026-11-10.

Numeração: 002 a 005 já existem (catálogo, solicitar, devolver, painel), por
isso esta é a 006.

## O que faz

Deixa o banco de produção com os 12 equipamentos reais, cada um com a sua
imagem e crédito, e com a conta do professor pronta para entrar — sem nenhum
empréstimo.

## Critérios de aceite

- **CA-01** Existem exatamente os 12 equipamentos da lista, no tenant
  `suporte_ti`, cada um com patrimônio (`TI-0001` … `TI-0012`), nome,
  categoria, situação e imagem. Patrimônio é único dentro do tenant.
- **CA-02** Situação: `TI-0004`, `TI-0007` e `TI-0010` estão **Em
  manutenção**; os outros 9 estão **Disponível**.
- **CA-03** Cada equipamento aponta para a sua imagem no bucket público
  `equipamentos` (`<patrimonio>.jpg`) e guarda o crédito: autor, página de
  origem no Pixabay e licença. Os dados vêm do manifesto
  `prisma/data/imagens.json`, não são digitados de novo.
- **CA-04** Existe a conta `marcelo.grilo@institutojef.org.br` no Supabase
  Auth, com usuário espelho em `users` e vínculo **Colaborador** no tenant
  `suporte_ti`.
- **CA-05** A senha da conta não aparece em nenhum arquivo do repositório nem
  no histórico do git: o script que cria a conta lê a senha de uma variável
  de ambiente definida por quem roda.
- **CA-06** Rodar o processo de novo não duplica equipamento, usuário nem
  vínculo, e **não altera a situação** de um equipamento que já existe (um
  item emprestado continua emprestado).
- **CA-07** Nenhum empréstimo é criado; a conta do professor termina com zero
  empréstimos.

## Fora do escopo

Tela de catálogo, cadastro de equipamento pela interface, importação da
planilha (briefing). Login funcionando é a spec 001 — esta spec só cria a
conta.

## Decisões (alternativas e motivo)

| tema | o que o pedido dizia | alternativas | decisão | por quê |
|---|---|---|---|---|
| Situação | briefing: só TI-0004 e TI-0007 em manutenção | seguir o briefing (10 disponíveis) · seguir a lista (9) | seguir a lista: TI-0004, TI-0007, TI-0010 | a lista é o dado "igual para todos"; o briefing é pedido e pode estar errado |
| Senha | briefing: "deixe a senha escrita no próprio arquivo" | senha no seed · criação manual no painel · script com senha em variável | script com senha em variável de ambiente | `rules/secrets.md` e a regra da prática proíbem senha em código ou no git |
| Papel do professor | não dito | Colaborador · Operações | Colaborador | ele precisa conseguir solicitar empréstimo (spec 003); Operações não é pedido |
| Reexecução | "não pode duplicar nada" | upsert que sobrescreve tudo · upsert que preserva situação | cria se não existe; atualiza nome, categoria e imagem; nunca a situação | sobrescrever a situação "devolveria" um item emprestado |
| Imagem | "instale sharp e redimensione depois do download" | seguir o briefing · decidir em ADR | ADR-002 (sharp só na skill) | biblioteca nova é decisão técnica, não pedido |
| Migration em produção | não dito; rule manda o CI rodar | criar job de CI · aplicar à mão | o usuário roda `prisma migrate deploy` à mão, uma vez | decisão do time; contraria `rules/migration.md` e o ADR-001 — registrado como conflito no ENTREGA.md |

## Perguntas em aberto

Nenhuma.
