// Baixa cada foto APROVADA, recorta para 800×600 e confere o resultado.
// Uso: npx ts-node .claude/skills/imagens-equipamentos/scripts/preparar.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import {
  ALTURA,
  LARGURA,
  PASTA_SAIDA,
  baixarDoPixabay,
  exigirPastaApi,
  exigirSemRepeticao,
  gravarManifesto,
  lerManifesto,
  pixabay,
  sha256,
} from "./lib";

async function main() {
  exigirPastaApi();
  const itens = lerManifesto();
  exigirSemRepeticao(itens); // antes de baixar: dois itens com o mesmo id aprovado
  mkdirSync(PASTA_SAIDA, { recursive: true });
  const pendentes: string[] = [];

  for (const item of itens) {
    if (item.revisao.status !== "aprovada" || item.pixabayId === null || !item.revisao.revisor) {
      pendentes.push(item.patrimonio);
      continue;
    }
    if (item.rejeitadas.some((r) => r.pixabayId === item.pixabayId)) {
      throw new Error(`${item.patrimonio}: a foto ${item.pixabayId} está aprovada e reprovada ao mesmo tempo.`);
    }

    const { hits } = await pixabay({ id: String(item.pixabayId) });
    const hit = hits[0];
    if (!hit) throw new Error(`${item.patrimonio}: foto ${item.pixabayId} não existe mais no Pixabay.`);

    const original = await baixarDoPixabay(hit.largeImageURL);
    const jpeg = await sharp(original)
      .rotate()
      .resize(LARGURA, ALTURA, { fit: "cover", position: "attention" })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();

    // Garantido, não pedido: confere o arquivo gerado.
    const meta = await sharp(jpeg).metadata();
    if (meta.width !== LARGURA || meta.height !== ALTURA) {
      throw new Error(`${item.patrimonio}: saiu ${meta.width}×${meta.height}, esperado ${LARGURA}×${ALTURA}.`);
    }

    const caminho = `${item.patrimonio}.jpg`;
    writeFileSync(join(PASTA_SAIDA, caminho), jpeg);
    item.pageURL = hit.pageURL;
    item.autor = hit.user;
    item.autorId = hit.user_id;
    item.arquivo = { caminho, largura: LARGURA, altura: ALTURA, sha256: sha256(jpeg) };
    console.log(`${item.patrimonio}: ok · Pixabay ${hit.id} · ${hit.user}`);
  }

  exigirSemRepeticao(itens); // depois: mesma imagem com ids diferentes
  gravarManifesto(itens);

  if (pendentes.length) {
    console.error(`\nSem revisão aprovada (com revisor): ${pendentes.join(", ")}.`);
    process.exitCode = 1;
  } else {
    console.log(`\n12 imagens 800×600 em ${PASTA_SAIDA}. O envio para o Storage é feito por uma pessoa (SKILL.md, passo 4).`);
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
