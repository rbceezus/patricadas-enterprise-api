# Contrato da skill — o que garante cada requisito

"Código" = o script falha se o requisito não for cumprido. "Instrução" =
depende de o agente seguir o SKILL.md. "Humano" = depende de uma pessoa.

| requisito | garantido por | onde |
|---|---|---|
| Fonte: só Pixabay (decisão da turma; o enunciado pedia Pexels) | código | `lib.ts` só busca em `pixabay.com/api` e só baixa de `pixabay.com` / `cdn.pixabay.com` |
| Direito de imagem: sem pessoa, marca, texto, tela com conteúdo | código (1º filtro) + revisão (decisão) | `safesearch` e tags proibidas em `buscar.ts`; aprovação na revisão visual, com revisor registrado; `preparar.ts` recusa item sem aprovação. Na primeira execução a revisão foi delegada ao agente pelo usuário (ver `revisao.revisor` no manifesto) |
| Mesmo tamanho 800×600 | código | `preparar.ts` recorta e relê o arquivo; `enviar.ts` e `conferir.ts` medem de novo |
| Sem repetição | código | `exigirSemRepeticao`: mesmo id do Pixabay ou mesmo hash em dois itens falha |
| Créditos (origem, autor, licença) | código | `prisma/data/imagens.json`, validado por schema Zod; `preparar.ts` preenche autor e página a partir da API |
| Armazenamento: bucket público, repetir não duplica | código | `enviar.ts`: bucket `equipamentos` público, caminho fixo `<patrimonio>.jpg` com upsert, lista objetos fora do manifesto |
| Produção: agente prepara, não envia | código + configuração | `enviar.ts` não lê `.env` e exige terminal interativo com o host digitado; `.claude/settings.json` nega o comando |
| Segredos e dependências | configuração + ADR | chaves só no ambiente; `sharp` autorizado pelo ADR-002; `fetch` nativo para Pixabay e Storage, sem `supabase-js` na API |
| Crédito na tela "Fotos: Pixabay" | instrução | SKILL.md §Crédito na tela; vira critério da spec que cria a tela |
| 24 h de cache e sem hotlink (regras da API) | código | `tmp/pixabay-cache/`; imagem servida pelo nosso Storage |

## Envio

Feito por uma pessoa, num terminal PowerShell aberto na pasta `api/`, depois
que `preparar.ts` terminar sem erro. As variáveis valem só nesse terminal:

```powershell
$env:SUPABASE_URL = "https://<projeto>.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "<cole a service_role aqui, sem salvar em arquivo>"
npx ts-node .claude/skills/imagens-equipamentos/scripts/enviar.ts
Remove-Item Env:SUPABASE_SERVICE_ROLE_KEY
```

Depois, o agente roda `conferir.ts` com a URL pública que o envio imprimiu.
