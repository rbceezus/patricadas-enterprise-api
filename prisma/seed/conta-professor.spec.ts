// Spec 006 — conta do professor. Roda contra o Postgres local, com Auth falso.
import { PrismaClient, Role } from '@prisma/client';
import { AuthAdmin, EMAIL_PROFESSOR, garantirContaProfessor, senhaDoAmbiente } from './conta-professor';

const TENANT = 'teste_spec_006_conta';

function authFalso(): AuthAdmin & { contas: Map<string, { id: string; senha: string }> } {
  const contas = new Map<string, { id: string; senha: string }>();
  return {
    contas,
    async buscarPorEmail(email) { return contas.get(email) ?? null; },
    async criar(email, senha) { const c = { id: `00000000-0000-4000-8000-${String(contas.size + 1).padStart(12, '0')}`, senha }; contas.set(email, c); return c; },
    async definirSenha(id, senha) { for (const c of contas.values()) if (c.id === id) c.senha = senha; },
  };
}

describe('spec 006 — conta do professor', () => {
  const prisma = new PrismaClient();
  let tenantId: string;

  beforeAll(async () => {
    if (!/@(localhost|127\.0\.0\.1)[:/]/.test(process.env.DATABASE_URL ?? '')) {
      throw new Error('Teste da spec 006 só roda contra o Postgres local (DATABASE_URL em localhost).');
    }
    await prisma.tenant.deleteMany({ where: { slug: TENANT } });
    tenantId = (await prisma.tenant.create({ data: { slug: TENANT, name: 'Teste 006 conta' } })).id;
  });

  afterAll(async () => {
    const u = await prisma.user.findUnique({ where: { email: EMAIL_PROFESSOR } });
    if (u?.id.startsWith('00000000-0000-4000-8000-')) await prisma.user.delete({ where: { id: u.id } });
    await prisma.tenant.deleteMany({ where: { slug: TENANT } });
    await prisma.$disconnect();
  });

  it('CA-04: cria a conta no Auth, o usuário espelho e o vínculo Colaborador no tenant', async () => {
    const auth = authFalso();
    const { userId, criada } = await garantirContaProfessor(prisma, auth, tenantId, 'senha-de-teste');
    expect(criada).toBe(true);
    expect(auth.contas.get(EMAIL_PROFESSOR)?.id).toBe(userId);
    expect(await prisma.user.findUniqueOrThrow({ where: { id: userId } })).toMatchObject({ email: EMAIL_PROFESSOR });
    const vinculo = await prisma.membership.findUniqueOrThrow({ where: { userId_tenantId: { userId, tenantId } } });
    expect(vinculo.role).toBe(Role.COLABORADOR);
  });

  it('CA-05: a senha vem só da variável PROFESSOR_SENHA; sem ela o script para', () => {
    expect(() => senhaDoAmbiente({})).toThrow(/PROFESSOR_SENHA/);
    expect(senhaDoAmbiente({ PROFESSOR_SENHA: 'x' })).toBe('x');
  });

  it('CA-06: rodar de novo não duplica conta, usuário nem vínculo', async () => {
    const auth = authFalso();
    const a = await garantirContaProfessor(prisma, auth, tenantId, 's1');
    const b = await garantirContaProfessor(prisma, auth, tenantId, 's2');
    expect(b.userId).toBe(a.userId);
    expect(b.criada).toBe(false);
    expect(auth.contas.size).toBe(1);
    expect(await prisma.membership.count({ where: { userId: a.userId, tenantId } })).toBe(1);
  });

  it('CA-07: a conta termina com zero empréstimos', async () => {
    const { userId } = await garantirContaProfessor(prisma, authFalso(), tenantId, 's');
    expect(await prisma.loan.count({ where: { userId } })).toBe(0);
  });
});
