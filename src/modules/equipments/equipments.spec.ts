// Spec 002 (API) — GET /v1/equipments. Roda contra o Postgres local com chaves
// ES256 geradas no teste no lugar do JWKS do Supabase (mesmo padrão do me.spec).
import { generateKeyPairSync, sign, KeyObject } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../app.module';
import { configureApp } from '../../app.setup';
import { PrismaService } from '../../prisma/prisma.service';
import { CHAVES_JWKS, EMISSOR_JWT } from '../auth/auth.guard';

const EMISSOR = 'https://teste.supabase.co/auth/v1';
const KID = 'kid-teste';
const TENANT = 'teste_spec_002';
const OUTRO_TENANT = 'teste_spec_002_outro';
const COLAB = '33333333-3333-4333-8333-333333333333';
const OPS = '44444444-4444-4444-8444-444444444444';
const SEM_VINCULO = '55555555-5555-4555-8555-555555555555';
const IDS = [COLAB, OPS, SEM_VINCULO];

function token(chave: KeyObject, payload: Record<string, unknown>): string {
  const h = Buffer.from(JSON.stringify({ alg: 'ES256', kid: KID, typ: 'JWT' })).toString('base64url');
  const p = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const s = sign('sha256', Buffer.from(`${h}.${p}`), { key: chave, dsaEncoding: 'ieee-p1363' }).toString('base64url');
  return `${h}.${p}.${s}`;
}

describe('spec 002 — GET /v1/equipments', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const de = (sub: string) => token(privateKey, { sub, iss: EMISSOR, exp: Math.floor(Date.now() / 1000) + 600 });
  const get = (sub?: string) => {
    const r = request(app.getHttpServer()).get('/v1/equipments');
    return sub ? r.set('Authorization', `Bearer ${de(sub)}`) : r;
  };

  beforeAll(async () => {
    if (!/@(localhost|127\.0\.0\.1)[:/]/.test(process.env.DATABASE_URL ?? '')) {
      throw new Error('Teste da spec 002 só roda contra o Postgres local.');
    }
    process.env.SUPABASE_URL ??= 'https://teste.supabase.co';
    const jwk = { ...publicKey.export({ format: 'jwk' }), kid: KID };
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(CHAVES_JWKS).useValue({ chave: async (kid: string) => (kid === KID ? jwk : null) })
      .overrideProvider(EMISSOR_JWT).useValue(EMISSOR)
      .compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    prisma = moduleRef.get(PrismaService);

    await limpar();
    const t = await prisma.tenant.create({ data: { slug: TENANT, name: 'Teste 002' } });
    const outro = await prisma.tenant.create({ data: { slug: OUTRO_TENANT, name: 'Outro 002' } });
    for (const [id, email] of [[COLAB, 'c@t002.local'], [OPS, 'o@t002.local'], [SEM_VINCULO, 's@t002.local']]) {
      await prisma.user.create({ data: { id, email, name: email } });
    }
    await prisma.membership.create({ data: { userId: COLAB, tenantId: t.id, role: 'COLABORADOR' } });
    await prisma.membership.create({ data: { userId: OPS, tenantId: t.id, role: 'OPERACOES' } });
    await prisma.equipment.createMany({
      data: [
        { tenantId: t.id, name: 'Notebook A', category: 'NOTEBOOK', assetTag: 'TI-1', status: 'DISPONIVEL',
          imageUrl: 'https://img/a.jpg', imageAuthor: 'Autor', imageLicense: 'CC BY' },
        { tenantId: t.id, name: 'Monitor B', category: 'MONITOR', status: 'EMPRESTADO' },
        { tenantId: t.id, name: 'Cabo C', category: 'CABO', status: 'EM_MANUTENCAO', notes: 'Conector solto' },
        { tenantId: outro.id, name: 'De outro tenant', category: 'CAMERA' },
      ],
    });
  });

  async function limpar() {
    const tenants = await prisma.tenant.findMany({ where: { slug: { in: [TENANT, OUTRO_TENANT] } } });
    await prisma.equipment.deleteMany({ where: { tenantId: { in: tenants.map((t) => t.id) } } });
    await prisma.user.deleteMany({ where: { id: { in: IDS } } });
    await prisma.tenant.deleteMany({ where: { slug: { in: [TENANT, OUTRO_TENANT] } } });
  }

  afterAll(async () => {
    await limpar();
    await app.close();
  });

  it('sem sessão responde 401', () => get().expect(401));

  it('conta sem vínculo responde 403', () => get(SEM_VINCULO).expect(403));

  it('lista os equipamentos do tenant com as três situações, sem os de outro tenant', async () => {
    const r = await get(COLAB).expect(200);
    expect(r.body.map((e: { name: string }) => e.name).sort()).toEqual(['Cabo C', 'Monitor B', 'Notebook A']);
    const porNome = Object.fromEntries(r.body.map((e: { name: string }) => [e.name, e]));
    expect(porNome['Notebook A'].status).toBe('DISPONIVEL');
    expect(porNome['Monitor B'].status).toBe('EMPRESTADO');
    expect(porNome['Cabo C']).toMatchObject({ status: 'EM_MANUTENCAO', notes: 'Conector solto' });
  });

  it('devolve a imagem com crédito, ou null quando não há imagem', async () => {
    const r = await get(COLAB).expect(200);
    const porNome = Object.fromEntries(r.body.map((e: { name: string }) => [e.name, e]));
    expect(porNome['Notebook A'].image).toEqual({ url: 'https://img/a.jpg', author: 'Autor', sourceUrl: null, license: 'CC BY' });
    expect(porNome['Monitor B'].image).toBeNull();
  });

  it('não expõe quem está com o equipamento', async () => {
    const r = await get(COLAB).expect(200);
    for (const e of r.body) expect(Object.keys(e).sort()).toEqual(['assetTag', 'category', 'id', 'image', 'name', 'notes', 'status']);
  });

  it('é visível para qualquer papel', () => get(OPS).expect(200));
});
