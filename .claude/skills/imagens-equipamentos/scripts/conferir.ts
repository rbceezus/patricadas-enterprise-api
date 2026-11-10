// Confere, pela URL pública e sem login, que as 12 imagens estão no Storage,
// em 800×600 e iguais ao manifesto. Só leitura: pode ser rodado pelo agente.
// Uso: npx ts-node .claude/skills/imagens-equipamentos/scripts/conferir.ts https://<projeto>.supabase.co/storage/v1/object/public/equipamentos
import sharp from "sharp";
import { ALTURA, LARGURA, exigirPastaApi, lerManifesto, sha256 } from "./lib";

async function main() {
  exigirPastaApi();
  const base = process.argv[2]?.replace(/\/+$/, "");
  if (!base || !base.includes("/storage/v1/object/public/")) {
    throw new Error("Passe a URL pública do bucket: https://<projeto>.supabase.co/storage/v1/object/public/equipamentos");
  }
  let falhas = 0;
  for (const item of lerManifesto()) {
    if (!item.arquivo) { console.log(`${item.patrimonio}: FALHA · não preparado`); falhas++; continue; }
    const r = await fetch(`${base}/${item.arquivo.caminho}`); // sem cabeçalho de autenticação, de propósito
    if (!r.ok) { console.log(`${item.patrimonio}: FALHA · HTTP ${r.status}`); falhas++; continue; }
    const dados = Buffer.from(await r.arrayBuffer());
    const meta = await sharp(dados).metadata();
    const tamanhoOk = meta.width === LARGURA && meta.height === ALTURA;
    const hashOk = sha256(dados) === item.arquivo.sha256;
    if (!tamanhoOk || !hashOk) falhas++;
    console.log(`${item.patrimonio}: ${tamanhoOk && hashOk ? "ok" : "FALHA"} · ${meta.width}×${meta.height} · hash ${hashOk ? "confere" : "difere"}`);
  }
  console.log(falhas ? `\n${falhas} falha(s).` : "\n12 de 12 públicas, 800×600 e iguais ao manifesto.");
  if (falhas) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
