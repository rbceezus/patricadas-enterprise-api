// Spec 003 (API) — POST /v1/loans e GET /v1/loans/me. Roda contra o Postgres
// local com chaves ES256 geradas no teste (mesmo padrão do me.spec).
import { generateKeyPairSync, sign } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../app.module';
import { configureApp } from '../../app.setup';
import { PrismaService } from '../../prisma/prisma.service';
import { CHAVES_JWKS, EMISSOR_JWT } from '../auth/auth.guard';

const EMISSOR = 'https://teste.supabase.co/auth/v1';
const KID = 'kid-teste';
const TENANT = 'teste_spec_003';
const ANA = '66666666-6666-4666-8666-666666666666';
const BIA = '77777777-7777-4777-8777-777777777777';
const DIA = 24 * 60 * 60 * 1000;

describe('spec 003 — solicitar empréstimo', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenantId: string;
  const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const tokenDe = (sub: string) => {
    const h = Buffer.from(JSON.stringify({ alg: 'ES256', kid: KID, typ: 'JWT' })).toString('base64url');
    const p = Buffer.from(JSON.stringify({ sub, iss: EMISSOR, exp: Math.floor(Date.now() / 1000) + 600 })).toString('base64url');
    const s = sign('sha256', Buffer.from(`${h}.${p}`), { key: privateKey, dsaEncoding: 'ieee-p1363' }).toString('base64url');
    return `${h}.${p}.${s}`;
  };
  const pedir = (sub: string, equipmentId: string) =>
    request(app.getHttpServer()).post('/v1/loans').set('Authorization', `Bearer ${tokenDe(sub)}`).send({ equipmentId });
  const novoItem = async (status: 'DISPONIVEL' | 'EMPRESTADO' | 'EM_MANUTENCAO' = 'DISPONIVEL') =>
    (await prisma.equipment.create({ data: { tenantId, name: `Item ${Math.random()}`, category: 'CABO', status } })).id;

  beforeAll(async () => {
    if (!/@(localhost|127\.0\.0\.1)[:/]/.test(process.env.DATABASE_URL ?? '')) {
      throw new Error('Teste da spec 003 só roda contra o Postgres local.');
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
    tenantId = (await prisma.tenant.create({ data: { slug: TENANT, name: 'Teste 003' } })).id;
    for (const [id, email] of [[ANA, 'ana@t003.local'], [BIA, 'bia@t003.local']]) {
      await prisma.user.create({ data: { id, email, name: email } });
      await prisma.membership.create({ data: { userId: id, tenantId, role: 'COLABORADOR' } });
    }
  });

  async function limpar() {
    const t = await prisma.tenant.findUnique({ where: { slug: TENANT } });
    if (t) {
      await prisma.loan.deleteMany({ where: { tenantId: t.id } });
      await prisma.equipment.deleteMany({ where: { tenantId: t.id } });
    }
    await prisma.user.deleteMany({ where: { id: { in: [ANA, BIA] } } });
    await prisma.tenant.deleteMany({ where: { slug: TENANT } });
  }

  beforeEach(async () => {
    await prisma.loan.deleteMany({ where: { tenantId } });
    await prisma.equipment.deleteMany({ where: { tenantId } });
  });

  afterAll(async () => {
    await limpar();
    await app.close();
  });

  it('sem sessão responde 401', () => request(app.getHttpServer()).post('/v1/loans').send({}).expect(401));

  it('item disponível: cria o empréstimo com prazo de 14 dias e o item vira Emprestado', async () => {
    const id = await novoItem();
    const antes = Date.now();
    const r = await pedir(ANA, id).expect(201);
    const prazo = new Date(r.body.dueAt).getTime() - new Date(r.body.borrowedAt).getTime();
    expect(prazo).toBe(14 * DIA);
    expect(new Date(r.body.borrowedAt).getTime()).toBeGreaterThanOrEqual(antes - 1000);
    expect((await prisma.equipment.findUnique({ where: { id } }))!.status).toBe('EMPRESTADO');
    const dono = await prisma.loan.findUnique({ where: { id: r.body.id } });
    expect(dono).toMatchObject({ userId: ANA, status: 'ABERTO' });
  });

  it('item emprestado ou em manutenção é recusado com 409', async () => {
    const r1 = await pedir(ANA, await novoItem('EMPRESTADO')).expect(409);
    expect(r1.body.code).toBe('INDISPONIVEL');
    await pedir(ANA, await novoItem('EM_MANUTENCAO')).expect(409);
  });

  it('o mesmo item não é emprestado duas vezes', async () => {
    const id = await novoItem();
    await pedir(ANA, id).expect(201);
    await pedir(BIA, id).expect(409);
  });

  it('equipamento inexistente ou id inválido responde 404', async () => {
    await pedir(ANA, '00000000-0000-4000-8000-000000000000').expect(404);
    await pedir(ANA, 'nao-e-uuid').expect(404);
  });

  it('o 4º item é recusado pelo limite de 3', async () => {
    for (let i = 0; i < 3; i++) await pedir(ANA, await novoItem()).expect(201);
    const quarto = await novoItem();
    const r = await pedir(ANA, quarto).expect(422);
    expect(r.body.code).toBe('LIMITE');
    expect((await prisma.equipment.findUnique({ where: { id: quarto } }))!.status).toBe('DISPONIVEL');
  });

  it('quem tem item em atraso não pega outro, mesmo abaixo do limite', async () => {
    const atrasado = await novoItem('EMPRESTADO');
    await prisma.loan.create({
      data: { tenantId, userId: ANA, equipmentId: atrasado, borrowedAt: new Date(Date.now() - 20 * DIA), dueAt: new Date(Date.now() - 6 * DIA) },
    });
    const r = await pedir(ANA, await novoItem()).expect(422);
    expect(r.body.code).toBe('ATRASO');
    await pedir(BIA, await novoItem()).expect(201);
  });

  it('GET /v1/loans/me mostra os abertos, o limite e o bloqueio por atraso', async () => {
    await pedir(ANA, await novoItem()).expect(201);
    const r = await request(app.getHttpServer()).get('/v1/loans/me').set('Authorization', `Bearer ${tokenDe(ANA)}`).expect(200);
    expect(r.body).toMatchObject({ limite: 3, bloqueadoPorAtraso: false });
    expect(r.body.emprestimos).toHaveLength(1);
  });
});
