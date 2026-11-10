// Busca candidatos no Pixabay e gera a folha de revisão humana.
// Não aprova nada: só propõe. Uso: npx ts-node .claude/skills/imagens-equipamentos/scripts/buscar.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  ALTURA,
  LARGURA,
  PASTA_SAIDA,
  PixabayHit,
  exigirPastaApi,
  gravarManifesto,
  lerManifesto,
  pixabay,
} from "./lib";

const CANDIDATOS_POR_ITEM = 6;
const MAX_PAGINAS = 3;

// Primeiro filtro de direito de imagem, pelas tags do Pixabay. Não substitui
// a revisão visual: tag ausente não prova que a foto está limpa.
const TAGS_PROIBIDAS = [
  "person", "people", "man", "woman", "girl", "boy", "child", "kid", "human",
  "hand", "hands", "finger", "face", "portrait", "model", "selfie", "business",
  "businessman", "businesswoman", "meeting", "video call", "conference",
  "logo", "brand", "apple", "macbook", "imac", "iphone", "samsung", "dell",
  "lenovo", "asus", "acer", "hp", "microsoft", "windows", "canon", "nikon",
  "sony", "fujifilm", "logitech", "text", "writing", "letter", "sign",
  "website", "code", "coding", "programming", "social media", "facebook",
];

function tagsProibidas(hit: PixabayHit): string[] {
  const tags = hit.tags.toLowerCase().split(",").map((t) => t.trim());
  return TAGS_PROIBIDAS.filter((p) => tags.some((t) => t === p || t.split(" ").includes(p)));
}

function escapar(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}

async function main() {
  exigirPastaApi();
  const itens = lerManifesto();
  const aprovadas = new Set(itens.flatMap((i) => (i.revisao.status === "aprovada" && i.pixabayId ? [i.pixabayId] : [])));
  const secoes: string[] = [];

  for (const item of itens) {
    if (item.revisao.status === "aprovada") {
      secoes.push(`<section><h2>${item.patrimonio} · ${escapar(item.nome)}</h2><p class="ok">Aprovada: Pixabay ${item.pixabayId}</p></section>`);
      continue;
    }
    const termo = item.buscaUsada ?? item.busca;
    const rejeitadas = new Set(item.rejeitadas.map((r) => r.pixabayId));
    const candidatos: PixabayHit[] = [];
    let filtradasPorTag = 0;

    for (let pagina = 1; pagina <= MAX_PAGINAS && candidatos.length < CANDIDATOS_POR_ITEM; pagina++) {
      const { hits } = await pixabay({
        q: termo,
        lang: "en",
        image_type: "photo",
        orientation: "horizontal",
        min_width: String(LARGURA),
        min_height: String(ALTURA),
        safesearch: "true",
        per_page: "30",
        page: String(pagina),
      });
      for (const hit of hits) {
        if (candidatos.length >= CANDIDATOS_POR_ITEM) break;
        if (rejeitadas.has(hit.id) || aprovadas.has(hit.id) || candidatos.some((c) => c.id === hit.id)) continue;
        if (tagsProibidas(hit).length) { filtradasPorTag++; continue; }
        candidatos.push(hit);
      }
      if (hits.length < 30) break;
    }

    const cards = candidatos
      .map(
        (c) => `<figure><a href="${escapar(c.webformatURL)}" target="_blank"><img src="${escapar(c.webformatURL)}" alt=""></a>
<figcaption><b>id ${c.id}</b> · ${c.imageWidth}×${c.imageHeight} · por ${escapar(c.user)}<br><small>${escapar(c.tags)}</small><br><a href="${escapar(c.pageURL)}" target="_blank">página no Pixabay</a></figcaption></figure>`,
      )
      .join("\n");
    const aviso = candidatos.length
      ? ""
      : `<p class="falta">Nenhum candidato sobrou para "${escapar(termo)}". Peça ao agente um termo novo.</p>`;
    secoes.push(`<section><h2>${item.patrimonio} · ${escapar(item.nome)}</h2>
<p>termo: <code>${escapar(termo)}</code> · ${item.rejeitadas.length} reprovada(s) antes · ${filtradasPorTag} descartada(s) por tag</p>
${aviso}<div class="grade">${cards}</div></section>`);
    console.log(`${item.patrimonio}: ${candidatos.length} candidato(s) para "${termo}"`);
  }

  mkdirSync(PASTA_SAIDA, { recursive: true });
  writeFileSync(
    join(PASTA_SAIDA, "revisao.html"),
    `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Revisão de fotos</title>
<style>body{font-family:system-ui,sans-serif;margin:24px;background:#111;color:#eee}section{margin-bottom:32px}
.grade{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px}figure{margin:0;background:#1c1c1c;padding:8px;border-radius:8px}
img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:4px}a{color:#7cd}small{color:#999}.ok{color:#6d6}.falta{color:#f96}code{color:#7cd}</style></head>
<body><h1>Revisão de fotos — siga references/revisao-visual.md</h1>
<p>A miniatura já mostra o recorte 4:3 que vai para o sistema. As imagens aqui são exibição temporária do Pixabay (URLs válidas por 24 h).</p>
${secoes.join("\n")}<p>Fotos: <a href="https://pixabay.com">Pixabay</a></p></body></html>`,
  );
  gravarManifesto(itens);
  console.log(`\nAbra ${join(PASTA_SAIDA, "revisao.html")} e registre a revisão em prisma/data/imagens.json.`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
