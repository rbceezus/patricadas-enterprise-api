# ADR-002 — Processamento de imagem de equipamento

Status: aceito · 2026-11-10
Escrito pelo agente com autorização explícita do time, como exceção a
`rules/restrictions.md` ("Não escreva ADR"). A exceção vale só para este ADR.

## Contexto

Toda foto de equipamento precisa chegar ao sistema em exatamente 800×600
(contrato da skill `imagens-equipamentos`). "Exatamente" quer dizer
garantido por código e conferido depois, não pedido a um serviço.

O ADR-001 não tem nenhuma biblioteca de imagem, e `rules/restrictions.md`
proíbe escolher biblioteca fora dele. O briefing de dados iniciais manda
"instalar a biblioteca sharp", mas briefing é pedido, não decisão técnica:
a decisão é esta.

As fotos vêm da API do Pixabay (decisão da turma, no lugar do Pexels do
enunciado). O Pixabay entrega no máximo 1280 px de largura, em proporções
variadas (3:2, 16:9, 4:3), então é preciso recortar, não só redimensionar:
redimensionar 3:2 para 800×600 distorce a imagem.

## Decisão

| Item | Escolha |
|---|---|
| Biblioteca | `sharp`, como `devDependency` da API |
| Onde roda | Só nos scripts da skill `.claude/skills/imagens-equipamentos/scripts/`, na máquina de quem prepara as imagens |
| Operação | `resize(800, 600, { fit: "cover", position: "attention" })`, saída JPEG |
| Conferência | Depois de gravar, o script lê o arquivo de novo e falha se não for 800×600 |
| Runtime da API | Não usa. Nada de `sharp` em `src/` nem no bundle da Vercel |

## Alternativas descartadas

| Alternativa | Motivo |
|---|---|
| `jimp` (JavaScript puro) | Funciona, mas é bem mais lento e o recorte por atenção (centrar no objeto) não existe pronto |
| ImageMagick pela linha de comando | Nenhuma dependência npm, mas quem clonar o repositório não reproduz sem instalar o programa; a garantia passaria a depender da máquina |
| Transformação de imagem do Supabase Storage | Só no plano Pro, e a imagem armazenada continuaria no tamanho original: o tamanho seria pedido a cada leitura, não garantido |
| Usar o tamanho que o Pixabay devolve | O tamanho varia por foto; nenhum parâmetro da API devolve 800×600 exato |

## Consequências

- `npm install` da API baixa um binário nativo do `sharp`. Como é
  `devDependency` e não é importado em `src/`, não entra no deploy.
- Se um dia a API precisar processar imagem em runtime (upload pela tela de
  Operações, por exemplo), isso é decisão nova: este ADR não autoriza.
