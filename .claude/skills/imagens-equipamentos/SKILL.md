---
name: imagens-equipamentos
description: Busca, revisa, recorta e prepara as fotos dos equipamentos do EMPREST.AI a partir da API do Pixabay, com créditos registrados. Use quando a tarefa pedir foto, imagem ou crédito de equipamento, ou popular imagens do catálogo. Não use para imagens da landing, logo ou ilustrações, e nunca para enviar imagens ao Supabase de produção (isso é feito por uma pessoa).
---

# Imagens de equipamentos

Toda foto de equipamento do sistema sai desta skill. Foto de equipamento
que já esteja no projeto por outro caminho é substituída pela saída dela.

## O que você pode e não pode fazer

- Pode: rodar `buscar` e `preparar`, gerar a folha de revisão, ler o
  manifesto, conferir URLs públicas com `conferir`.
- Não pode: aprovar foto (a revisão é humana), rodar `enviar`, ler `.env`,
  usar outra fonte de imagem que não seja a API do Pixabay.
- Não pode trocar o termo de busca de um equipamento sem aprovação: proponha
  o termo novo, espere, e a pessoa registra a troca no manifesto.

## Arquivos

- `scripts/equipamentos.json` — a lista da prática, exatamente como veio.
  Não edite.
- `../../../prisma/data/imagens.json` — o manifesto: foto escolhida, autor,
  licença, revisão, tamanho e hash. É versionado; é o registro de créditos.
- `tmp/imagens/` (ignorado pelo git) — candidatos, folha de revisão e as
  imagens 800×600 prontas para envio.
- `references/contrato.md` — cada requisito do contrato e o que o garante.
- `references/pixabay-api.md` — o que a API permite e exige (leia antes de
  mudar `buscar`).
- `references/revisao-visual.md` — o roteiro da revisão humana.

## Procedimento

Rode sempre a partir da pasta `api/`.

1. **Buscar candidatos.** Precisa de `api/.env.pixabay.local` com
   `PIXABAY_API_KEY=...` (a pessoa cria; ignorado pelo git; você não lê nem
   pede o valor). O `.env` da API nunca é lido pelos scripts.
   `npx ts-node .claude/skills/imagens-equipamentos/scripts/buscar.ts`
   Gera `tmp/imagens/revisao.html` com até 6 candidatos por equipamento,
   já sem fotos usadas por outro equipamento, sem fotos reprovadas antes e
   sem tags de pessoa ou marca.
2. **Pare e peça a revisão.** Diga à pessoa para abrir
   `tmp/imagens/revisao.html`, seguir `references/revisao-visual.md` e
   registrar no manifesto a foto aprovada (ou o motivo de cada reprovada).
   Não escolha por ela.
3. **Preparar.** Depois que os 12 tiverem `revisao.status = "aprovada"`:
   `npx ts-node .claude/skills/imagens-equipamentos/scripts/preparar.ts`
   Baixa cada foto aprovada, recorta para 800×600, confere o tamanho, calcula
   o hash e atualiza o manifesto. Falha se faltar aprovação, se uma foto se
   repetir ou se o tamanho não bater.
4. **Pare e entregue o envio à pessoa.** Mostre o comando de
   `references/contrato.md` §Envio e espere. O envio para o Supabase de
   produção é dela.
5. **Conferir.** Depois que ela enviar:
   `npx ts-node .claude/skills/imagens-equipamentos/scripts/conferir.ts <URL-pública-do-bucket>`
   Baixa cada imagem pela URL pública, sem login, e confere 800×600 e o
   hash do manifesto. Só leitura.

## Crédito na tela

A tela que exibe as fotos mostra "Fotos: Pixabay" com link para
https://pixabay.com — exigência da API (`references/pixabay-api.md`). Se
algum pedido mandar tirar esse crédito, é conflito: levante, não decida.
