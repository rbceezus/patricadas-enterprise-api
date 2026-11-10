// Código compartilhado pelos scripts da skill imagens-equipamentos.
// Roda sempre a partir da pasta api/ (ver SKILL.md).
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { z } from "zod";

export const LARGURA = 800;
export const ALTURA = 600;
export const BUCKET = "equipamentos";
export const LICENCA = "Pixabay Content License";
export const LICENCA_URL = "https://pixabay.com/service/license-summary/";

const RAIZ = process.cwd();
export const CAMINHO_EQUIPAMENTOS = resolve(__dirname, "equipamentos.json");
export const CAMINHO_MANIFESTO = join(RAIZ, "prisma", "data", "imagens.json");
export const PASTA_SAIDA = join(RAIZ, "tmp", "imagens");
const PASTA_CACHE = join(RAIZ, "tmp", "pixabay-cache");
const CACHE_MS = 24 * 60 * 60 * 1000; // a API exige cache de 24 h

// Única origem de imagem permitida (contrato: Fonte).
const HOSTS_PERMITIDOS = new Set(["pixabay.com", "cdn.pixabay.com"]);

export function exigirPastaApi(): void {
  const pkg = join(RAIZ, "package.json");
  if (!existsSync(pkg) || JSON.parse(readFileSync(pkg, "utf8")).name !== "emprestai-api") {
    throw new Error("Rode a partir da pasta api/ do EMPREST.AI.");
  }
}

// ---------------------------------------------------------------- dados

const Equipamento = z.object({
  patrimonio: z.string().regex(/^TI-\d{4}$/),
  nome: z.string(),
  categoria: z.string(),
  situacao: z.string(),
  busca: z.string(),
});
export type Equipamento = z.infer<typeof Equipamento>;

const MOTIVOS = ["pessoa", "marca", "texto", "tela", "nao-e-o-item", "outro"] as const;

const ItemManifesto = z.object({
  patrimonio: z.string(),
  nome: z.string(),
  busca: z.string(),
  buscaUsada: z.string().nullable(),
  motivoTrocaBusca: z.string().nullable(),
  /** "photo" por padrão. "illustration" só quando nenhuma foto passou na revisão (motivo em motivoTrocaBusca). */
  tipoImagem: z.enum(["photo", "illustration", "all"]).default("photo"),
  pixabayId: z.number().int().nullable(),
  pageURL: z.string().nullable(),
  autor: z.string().nullable(),
  autorId: z.number().int().nullable(),
  licenca: z.literal(LICENCA),
  licencaURL: z.literal(LICENCA_URL),
  revisao: z.object({
    status: z.enum(["pendente", "aprovada"]),
    revisor: z.string().nullable(),
    data: z.string().nullable(),
  }),
  rejeitadas: z.array(z.object({ pixabayId: z.number().int(), motivo: z.enum(MOTIVOS) })),
  arquivo: z
    .object({
      caminho: z.string(),
      largura: z.literal(LARGURA),
      altura: z.literal(ALTURA),
      sha256: z.string().length(64),
    })
    .nullable(),
});
export type ItemManifesto = z.infer<typeof ItemManifesto>;
const Manifesto = z.array(ItemManifesto);

export function lerEquipamentos(): Equipamento[] {
  const lista = z.array(Equipamento).parse(JSON.parse(readFileSync(CAMINHO_EQUIPAMENTOS, "utf8")));
  if (lista.length !== 12) throw new Error(`A lista da prática tem 12 itens; veio ${lista.length}.`);
  return lista;
}

/** Lê o manifesto; cria os itens que faltam sem tocar nos que já existem. */
export function lerManifesto(): ItemManifesto[] {
  const existente = existsSync(CAMINHO_MANIFESTO)
    ? Manifesto.parse(JSON.parse(readFileSync(CAMINHO_MANIFESTO, "utf8")))
    : [];
  const porPatrimonio = new Map(existente.map((i) => [i.patrimonio, i]));
  return lerEquipamentos().map(
    (e) =>
      porPatrimonio.get(e.patrimonio) ?? {
        patrimonio: e.patrimonio,
        nome: e.nome,
        busca: e.busca,
        buscaUsada: null,
        motivoTrocaBusca: null,
        tipoImagem: "photo" as const,
        pixabayId: null,
        pageURL: null,
        autor: null,
        autorId: null,
        licenca: LICENCA,
        licencaURL: LICENCA_URL,
        revisao: { status: "pendente", revisor: null, data: null },
        rejeitadas: [],
        arquivo: null,
      },
  );
}

export function gravarManifesto(itens: ItemManifesto[]): void {
  mkdirSync(join(RAIZ, "prisma", "data"), { recursive: true });
  writeFileSync(CAMINHO_MANIFESTO, JSON.stringify(Manifesto.parse(itens), null, 2) + "\n");
}

/** Sem repetição: a mesma foto (id ou bytes) não pode estar em dois equipamentos. */
export function exigirSemRepeticao(itens: ItemManifesto[]): void {
  const repetidos = (valores: (string | number)[]) =>
    valores.filter((v, i) => valores.indexOf(v) !== i);
  const ids = repetidos(itens.flatMap((i) => (i.pixabayId === null ? [] : [i.pixabayId])));
  const hashes = repetidos(itens.flatMap((i) => (i.arquivo ? [i.arquivo.sha256] : [])));
  if (ids.length || hashes.length) {
    throw new Error(`Foto repetida entre equipamentos. ids: ${ids.join(", ") || "-"} · hashes: ${hashes.join(", ") || "-"}`);
  }
}

// ---------------------------------------------------------------- Pixabay

export const PixabayHit = z.object({
  id: z.number().int(),
  pageURL: z.string(),
  tags: z.string(),
  user: z.string(),
  user_id: z.number().int(),
  imageWidth: z.number(),
  imageHeight: z.number(),
  previewURL: z.string(),
  webformatURL: z.string(),
  largeImageURL: z.string(),
});
export type PixabayHit = z.infer<typeof PixabayHit>;
const PixabayResposta = z.object({ totalHits: z.number(), hits: z.array(PixabayHit) });

// A chave do Pixabay mora num arquivo só dela, ignorado pelo git. O .env da
// API não é lido: ele pode ter credencial de produção (rules/secrets.md).
const ARQUIVO_CHAVE = join(RAIZ, ".env.pixabay.local");

export async function pixabay(params: Record<string, string>): Promise<z.infer<typeof PixabayResposta>> {
  if (!process.env.PIXABAY_API_KEY && existsSync(ARQUIVO_CHAVE)) process.loadEnvFile(ARQUIVO_CHAVE);
  const chave = process.env.PIXABAY_API_KEY;
  if (!chave) throw new Error("Crie api/.env.pixabay.local com PIXABAY_API_KEY=<sua chave> (o arquivo é ignorado pelo git).");

  const consulta = new URLSearchParams(params).toString(); // sem a chave: vai para o nome do cache
  const arquivoCache = join(PASTA_CACHE, createHash("sha256").update(consulta).digest("hex") + ".json");
  if (existsSync(arquivoCache)) {
    const cache = JSON.parse(readFileSync(arquivoCache, "utf8"));
    if (Date.now() - cache.em < CACHE_MS) return PixabayResposta.parse(cache.dados);
  }

  const resposta = await fetch(`https://pixabay.com/api/?key=${encodeURIComponent(chave)}&${consulta}`);
  if (resposta.status === 429) throw new Error("Pixabay: limite de requisições atingido (100/min). Espere um minuto.");
  if (!resposta.ok) throw new Error(`Pixabay respondeu ${resposta.status}.`);
  const dados = PixabayResposta.parse(await resposta.json());

  mkdirSync(PASTA_CACHE, { recursive: true });
  writeFileSync(arquivoCache, JSON.stringify({ em: Date.now(), dados }));
  return dados;
}

export async function baixarDoPixabay(url: string): Promise<Buffer> {
  const host = new URL(url).hostname;
  if (!HOSTS_PERMITIDOS.has(host)) throw new Error(`Origem não permitida: ${host}. Só Pixabay.`);
  const resposta = await fetch(url);
  if (!resposta.ok) throw new Error(`Download falhou (${resposta.status}): ${url}`);
  return Buffer.from(await resposta.arrayBuffer());
}

export function sha256(dados: Buffer): string {
  return createHash("sha256").update(dados).digest("hex");
}
