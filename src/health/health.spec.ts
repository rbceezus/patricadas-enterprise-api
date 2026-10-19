import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';

// Roda contra o Postgres local (npm run db:up) usando o DATABASE_URL do .env.
describe('GET /health (AZ-04)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    prisma = moduleRef.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('devolve 200 e db up quando o banco responde', async () => {
    await request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok', db: 'up' });
  });

  it('devolve 503 e db down quando o banco não responde', async () => {
    jest.spyOn(prisma, '$queryRaw').mockRejectedValueOnce(new Error('conexão perdida'));
    await request(app.getHttpServer())
      .get('/health')
      .expect(503)
      .expect({ status: 'error', db: 'down' });
  });
});
