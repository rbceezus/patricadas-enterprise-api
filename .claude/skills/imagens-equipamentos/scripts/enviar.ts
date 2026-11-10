// ENVIO PARA O SUPABASE STORAGE — rodado por uma PESSOA, nunca pelo agente.
//
// Barreiras (contrato: Produção):
// 1. Não lê .env: as credenciais precisam estar no ambiente do terminal de quem roda.
// 2. Exige terminal interativo e que a pessoa digite o host do projeto.
//    O terminal do agente não é interativo, então o script para aí.
// 3. .claude/settings.json nega ao agente o comando que roda este arquivo.
//
// Uso: ver references/contrato.md §Envio.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline/promises";
import sharp from "sharp";
import { ALTURA, BUCKET, LARGURA, PASTA_SAIDA, exigirPastaApi, exigirSemRepeticao, lerManifesto, sha256 } from "./lib";

async function confirmarHumano(host: string): Promise<void> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error("Envio exige terminal interativo de uma pessoa. O agente não envia imagens para o Supabase.");
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const digitado = await rl.question(`Enviar 12 imagens para ${host}, bucket "${BUCKET}". Digite o host para confirmar: `);
  rl.close();
  if (digitado.trim() !== host) throw new Error("Host não confere. Nada foi enviado.");
}

async function main() {
  exigirPastaApi();
  const url = process.env.SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) throw new Error("Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY só neste terminal (não no .env).");
  const base = url.replace(/\/+$/, "");
  const host = new URL(base).host;

  // Tudo conferido ANTES de tocar no Storage.
  const itens = lerManifesto();
  exigirSemRepeticao(itens);
  const arquivos = itens.map((item) => {
    if (item.revisao.status !== "aprovada" || !item.arquivo) {
      throw new Error(`${item.patrimonio} não está aprovado e preparado. Rode preparar.ts antes.`);
    }
    const dados = readFileSync(join(PASTA_SAIDA, item.arquivo.caminho));
    if (sha256(dados) !== item.arquivo.sha256) throw new Error(`${item.patrimonio}: arquivo local difere do manifesto.`);
    return { caminho: item.arquivo.caminho, dados };
  });
  for (const a of arquivos) {
    const meta = await sharp(a.dados).metadata();
    if (meta.width !== LARGURA || meta.height !== ALTURA) throw new Error(`${a.caminho}: não é ${LARGURA}×${ALTURA}.`);
  }

  await confirmarHumano(host);
  const cab = { Authorization: `Bearer ${chave}`, apikey: chave };

  // Bucket público, criado uma vez só.
  const bucket = await fetch(`${base}/storage/v1/bucket/${BUCKET}`, { headers: cab });
  if (bucket.ok) {
    const info = (await bucket.json()) as { public?: boolean };
    if (!info.public) {
      const r = await fetch(`${base}/storage/v1/bucket/${BUCKET}`, {
        method: "PUT",
        headers: { ...cab, "Content-Type": "application/json" },
        body: JSON.stringify({ id: BUCKET, public: true }),
      });
      if (!r.ok) throw new Error(`Não consegui tornar o bucket público (${r.status}).`);
    }
  } else {
    const r = await fetch(`${base}/storage/v1/bucket`, {
      method: "POST",
      headers: { ...cab, "Content-Type": "application/json" },
      body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
    });
    if (!r.ok) throw new Error(`Não consegui criar o bucket (${r.status}): ${await r.text()}`);
    console.log(`Bucket "${BUCKET}" criado como público.`);
  }

  // Caminho fixo por patrimônio + upsert: repetir substitui, não duplica.
  for (const a of arquivos) {
    const r = await fetch(`${base}/storage/v1/object/${BUCKET}/${a.caminho}`, {
      method: "POST",
      headers: { ...cab, "Content-Type": "image/jpeg", "x-upsert": "true", "cache-control": "3600" },
      body: new Uint8Array(a.dados),
    });
    if (!r.ok) throw new Error(`${a.caminho}: envio falhou (${r.status}): ${await r.text()}`);
    console.log(`enviado ${a.caminho}`);
  }

  // Nada além dos 12 no bucket.
  const lista = await fetch(`${base}/storage/v1/object/list/${BUCKET}`, {
    method: "POST",
    headers: { ...cab, "Content-Type": "application/json" },
    body: JSON.stringify({ prefix: "", limit: 1000 }),
  });
  if (lista.ok) {
    const nomes = ((await lista.json()) as { name: string }[]).map((o) => o.name);
    const extras = nomes.filter((n) => !arquivos.some((a) => a.caminho === n));
    console.log(`\nObjetos no bucket: ${nomes.length}${extras.length ? ` · fora do manifesto: ${extras.join(", ")}` : ""}`);
  }
  console.log(`\nURL pública: ${base}/storage/v1/object/public/${BUCKET}/`);
  console.log("Agora o agente pode rodar conferir.ts com essa URL (só leitura).");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
