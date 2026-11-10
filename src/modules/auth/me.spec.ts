// Spec 001 (API) — GET /v1/me. Roda contra o Postgres local com chaves ES256
// geradas no teste no lugar do JWKS do Supabase.
import { generateKeyPairSync, sign, KeyObject } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../app.module';
import { configureApp } from '../../app.setup';
import { PrismaService } from '../../prisma/prisma.service';
import { CHAVES_JWKS, EMISSOR_JWT } from './auth.guard';

const EMISSOR = 'https://teste.supabase.co/auth/v1';
const KID = 'kid-teste';
const TENANT = 'teste_spec_001';
const COM_VINCULO = '11111111-1111-4111-8111-111111111111';
const SEM_VINCULO = '22222222-2222-4222-8222-222222222222';

function token(chave: KeyObject, payload: Record<string, unknown>, kid = KID): string {
  const h = Buffer.from(JSON.stringify({ alg: 'ES256', kid, typ: 'JWT' })).toString('base64url');
  const p = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const s = sign('sha256', Buffer.from(`${h}.${p}`), { key: chave, dsaEncoding: 'ieee-p1363' }).toString('base64url');
  return `${h}.${p}.${s}`;
}

describe('spec 001 — GET /v1/me', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const outra = generateKeyPairSync('ec', { namedCurve: 'P-256' }).privateKey;
  const daqui = (sub: string, extra: Record<string, unknown> = {}) =>
    token(privateKey, { sub, iss: EMISSOR, exp: Math.floor(Date.now() / 1000) + 600, ...extra });

  beforeAll(async () => {
    if (!/@(localhost|127\.0\.0\.1)[:/]/.test(process.env.DATABASE_URL ?? '')) {
      throw new Error('Teste da spec 001 só roda contra o Postgres local.');
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

    await prisma.tenant.deleteMany({ where: { slug: TENANT } });
    await prisma.user.deleteMany({ where: { id: { in: [COM_VINCULO, SEM_VINCULO] } } });
    const tenant = await prisma.tenant.create({ data: { slug: TENANT, name: 'Teste 001' } });
    await prisma.user.create({ data: { id: COM_VINCULO, email: 'colab@teste.local', name: 'Colab Teste' } });
    await prisma.user.create({ data: { id: SEM_VINCULO, email: 'sem@teste.local', name: 'Sem Vínculo' } });
    await prisma.membership.create({ data: { userId: COM_VINCULO, tenantId: tenant.id, role: 'COLABORADOR' } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: { in: [COM_VINCULO, SEM_VINCULO] } } });
    await prisma.tenant.deleteMany({ where: { slug: TENANT } });
    await app.close();
  });

  it('CA-01: sem token responde 401', () => request(app.getHttpServer()).get('/v1/me').expect(401));

  it('CA-02: assinatura de outra chave responde 401', () =>
    request(app.getHttpServer())
      .get('/v1/me')
      .set('Authorization', `Bearer ${token(outra, { sub: COM_VINCULO, iss: EMISSOR, exp: Math.floor(Date.now() / 1000) + 600 })}`)
      .expect(401));

  it('CA-02: token expirado responde 401', () =>
    request(app.getHttpServer()).get('/v1/me').set('Authorization', `Bearer ${daqui(COM_VINCULO, { exp: 1 })}`).expect(401));

  it('CA-02: token de outro emissor responde 401', () =>
    request(app.getHttpServer())
      .get('/v1/me')
      .set('Authorization', `Bearer ${daqui(COM_VINCULO, { iss: 'https://outro.supabase.co/auth/v1' })}`)
      .expect(401));

  it('CA-03: token válido com vínculo devolve id, email, name e role do vínculo', async () => {
    const r = await request(app.getHttpServer())
      .get('/v1/me')
      .set('Authorization', `Bearer ${daqui(COM_VINCULO, { role: 'service_role' })}`)
      .expect(200);
    expect(r.body).toEqual({ id: COM_VINCULO, email: 'colab@teste.local', name: 'Colab Teste', role: 'COLABORADOR' });
  });

  it('CA-04: token válido sem vínculo responde 403', () =>
    request(app.getHttpServer()).get('/v1/me').set('Authorization', `Bearer ${daqui(SEM_VINCULO)}`).expect(403));
});
