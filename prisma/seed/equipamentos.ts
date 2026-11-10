// Spec 006 — equipamentos iniciais (CA-01, CA-02, CA-03, CA-06, CA-07).
// Fonte dos dados: a lista da prática (skill imagens-equipamentos) e o
// manifesto de imagens prisma/data/imagens.json. Nada é digitado de novo aqui.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { EquipmentCategory, EquipmentStatus, PrismaClient } from '@prisma/client';

const RAIZ = join(__dirname, '..', '..');
const CAMINHO_LISTA = join(RAIZ, '.claude', 'skills', 'imagens-equipamentos', 'scripts', 'equipamentos.json');
const CAMINHO_MANIFESTO = join(RAIZ, 'prisma', 'data', 'imagens.json');

interface ItemLista {
  patrimonio: string;
  nome: string;
  categoria: string;
  situacao: string;
}

interface ItemManifesto {
  patrimonio: string;
  autor: string | null;
  pageURL: string | null;
  licenca: string;
  arquivo: { caminho: string } | null;
}

export interface EquipamentoInicial {
  assetTag: string;
  name: string;
  category: EquipmentCategory;
  /** Usada só na criação: reexecutar nunca muda a situação (CA-06). */
  statusInicial: EquipmentStatus;
  imageUrl: string;
  imageAuthor: string;
  imageSourceUrl: string;
  imageLicense: string;
}

const CATEGORIAS: Record<string, EquipmentCategory> = {
  notebook: EquipmentCategory.NOTEBOOK,
  monitor: EquipmentCategory.MONITOR,
  cabo: EquipmentCategory.CABO,
  camera: EquipmentCategory.CAMERA,
};

const SITUACOES: Record<string, EquipmentStatus> = {
  disponivel: EquipmentStatus.DISPONIVEL,
  manutencao: EquipmentStatus.EM_MANUTENCAO,
};

/** Junta lista + manifesto. Falha se faltar imagem, categoria ou situação conhecida. */
export function montarEquipamentos(baseImagens: string): EquipamentoInicial[] {
  const lista: ItemLista[] = JSON.parse(readFileSync(CAMINHO_LISTA, 'utf8'));
  const manifesto: ItemManifesto[] = JSON.parse(readFileSync(CAMINHO_MANIFESTO, 'utf8'));
  const base = baseImagens.replace(/\/+$/, '');

  return lista.map((item) => {
    const imagem = manifesto.find((m) => m.patrimonio === item.patrimonio);
    if (!imagem?.arquivo || !imagem.autor || !imagem.pageURL) {
      throw new Error(`${item.patrimonio}: sem imagem preparada no manifesto (rode a skill imagens-equipamentos).`);
    }
    const category = CATEGORIAS[item.categoria];
    const statusInicial = SITUACOES[item.situacao];
    if (!category || !statusInicial) throw new Error(`${item.patrimonio}: categoria ou situação desconhecida.`);
    return {
      assetTag: item.patrimonio,
      name: item.nome,
      category,
      statusInicial,
      imageUrl: `${base}/${imagem.arquivo.caminho}`,
      imageAuthor: imagem.autor,
      imageSourceUrl: imagem.pageURL,
      imageLicense: imagem.licenca,
    };
  });
}

/**
 * Cria o que falta e atualiza nome, categoria e imagem do que já existe.
 * Nunca toca na situação de um equipamento existente nem cria empréstimo.
 */
export async function semearEquipamentos(prisma: PrismaClient, tenantId: string, baseImagens: string): Promise<number> {
  const equipamentos = montarEquipamentos(baseImagens);
  for (const { statusInicial, ...dados } of equipamentos) {
    const { assetTag, name, category, imageUrl, imageAuthor, imageSourceUrl, imageLicense } = dados;
    await prisma.equipment.upsert({
      where: { tenantId_assetTag: { tenantId, assetTag } },
      update: { name, category, imageUrl, imageAuthor, imageSourceUrl, imageLicense },
      create: { tenantId, status: statusInicial, ...dados },
    });
  }
  return equipamentos.length;
}
