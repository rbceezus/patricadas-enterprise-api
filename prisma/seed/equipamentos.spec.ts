// Spec 006 — dados iniciais. Roda contra o Postgres local (npm run db:up).
import { EquipmentStatus, PrismaClient } from '@prisma/client';
import { semearEquipamentos } from './equipamentos';

const BASE = 'https://exemplo.supabase.co/storage/v1/object/public/equipamentos';
const TENANT = 'teste_spec_006';

describe('spec 006 — equipamentos iniciais', () => {
  const prisma = new PrismaClient();
  let tenantId: string;

  beforeAll(async () => {
    // Este teste apaga dados: nunca roda fora do banco local.
    const url = process.env.DATABASE_URL ?? '';
    if (!/@(localhost|127\.0\.0\.1)[:/]/.test(url)) {
      throw new Error('Teste da spec 006 só roda contra o Postgres local (DATABASE_URL em localhost).');
    }
    await prisma.tenant.deleteMany({ where: { slug: TENANT } });
    tenantId = (await prisma.tenant.create({ data: { slug: TENANT, name: 'Teste 006' } })).id;
    await semearEquipamentos(prisma, tenantId, BASE);
  });

  afterAll(async () => {
    await prisma.tenant.deleteMany({ where: { slug: TENANT } });
    await prisma.$disconnect();
  });

  const doTenant = () => prisma.equipment.findMany({ where: { tenantId }, orderBy: { assetTag: 'asc' } });

  it('CA-01: cria exatamente os 12 equipamentos, TI-0001 a TI-0012, com todos os campos', async () => {
    const lista = await doTenant();
    expect(lista.map((e) => e.assetTag)).toEqual(
      Array.from({ length: 12 }, (_, i) => `TI-${String(i + 1).padStart(4, '0')}`),
    );
    for (const e of lista) {
      expect(e.name).toBeTruthy();
      expect(e.category).toBeTruthy();
      expect(e.status).toBeTruthy();
      expect(e.imageUrl).toBeTruthy();
    }
  });

  it('CA-01: patrimônio é único dentro do tenant (o banco recusa repetido)', async () => {
    await expect(
      prisma.equipment.create({ data: { tenantId, assetTag: 'TI-0001', name: 'duplicado', category: 'CABO' } }),
    ).rejects.toThrow();
  });

  // ERRO PLANTADO (prova do verificador): teste do CA-02 comentado de propósito.
  // it('CA-02: TI-0004, TI-0007 e TI-0010 em manutenção; os outros 9 disponíveis', async () => {
  //   const lista = await doTenant();
  //   const manutencao = lista.filter((e) => e.status === EquipmentStatus.EM_MANUTENCAO).map((e) => e.assetTag);
  //   expect(manutencao).toEqual(['TI-0004', 'TI-0007', 'TI-0010']);
  //   expect(lista.filter((e) => e.status === EquipmentStatus.DISPONIVEL)).toHaveLength(9);
  // });

  it('CA-03: cada equipamento aponta para <patrimonio>.jpg no bucket e guarda autor, origem e licença', async () => {
    for (const e of await doTenant()) {
      expect(e.imageUrl).toBe(`${BASE}/${e.assetTag}.jpg`);
      expect(e.imageAuthor).toBeTruthy();
      expect(e.imageSourceUrl).toMatch(/^https:\/\/pixabay\.com\//);
      expect(e.imageLicense).toBe('Pixabay Content License');
    }
  });

  it('CA-06: rodar de novo não duplica nada', async () => {
    await semearEquipamentos(prisma, tenantId, BASE);
    expect(await prisma.equipment.count({ where: { tenantId } })).toBe(12);
  });

  it('CA-06: rodar de novo não altera a situação de equipamento existente', async () => {
    await prisma.equipment.update({
      where: { tenantId_assetTag: { tenantId, assetTag: 'TI-0001' } },
      data: { status: EquipmentStatus.EMPRESTADO },
    });
    await semearEquipamentos(prisma, tenantId, BASE);
    const ti1 = await prisma.equipment.findUniqueOrThrow({ where: { tenantId_assetTag: { tenantId, assetTag: 'TI-0001' } } });
    expect(ti1.status).toBe(EquipmentStatus.EMPRESTADO);
  });

  it('CA-07: o seed não cria nenhum empréstimo', async () => {
    expect(await prisma.loan.count({ where: { tenantId } })).toBe(0);
  });
});
