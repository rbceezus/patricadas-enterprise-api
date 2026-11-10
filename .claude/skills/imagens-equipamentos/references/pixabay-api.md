# API do Pixabay — o que importa para esta skill

Fonte: https://pixabay.com/api/docs/ (lida em 2026-11-10). Se for mudar
`buscar.ts`, releia a página: o que está aqui é resumo.

## Busca

`GET https://pixabay.com/api/?key=...&q=...`

Parâmetros usados pela skill:

| parâmetro | valor | por quê |
|---|---|---|
| `image_type` | `photo` | ilustração e vetor não são foto do equipamento |
| `orientation` | `horizontal` | 800×600 é paisagem; foto vertical perderia metade no recorte |
| `min_width` / `min_height` | `800` / `600` | nunca ampliar uma foto menor que o destino |
| `safesearch` | `true` | primeiro filtro contra conteúdo impróprio (não substitui a revisão) |
| `per_page` | `30` | sobra para descartar sem nova requisição |
| `lang` | `en` | os termos da lista estão em inglês |

`id=<n>` busca uma foto específica — é assim que `preparar` pega de novo a
foto aprovada.

## Campos usados de cada resultado

`id`, `pageURL` (página da foto, vai para o crédito), `tags`, `user`
(autor), `user_id`, `imageWidth`, `imageHeight`, `previewURL` (só para a
folha de revisão), `largeImageURL` (até 1280 px, é a que é baixada).

## Regras da API

- Limite: 100 requisições por 60 s, por chave. Acima disso, HTTP 429.
- Resultado de busca precisa ficar em cache por 24 h: `buscar` guarda em
  `tmp/pixabay-cache/` e reaproveita.
- As URLs de imagem valem 24 h e não podem ser usadas como hotlink
  permanente: a imagem é baixada e passa a ser servida pelo nosso Storage.
- Download sistemático em massa não é permitido: a skill só baixa a foto
  aprovada de cada equipamento.
- Ao mostrar as imagens, mostrar de onde vêm: "Fotos: Pixabay" com link.

## Licença

Todas as fotos estão sob a Pixabay Content License
(https://pixabay.com/service/license-summary/). O manifesto registra essa
licença em cada item. A licença não cobre direitos de pessoas, marcas e
obras que aparecem na foto — por isso existe a revisão visual.
