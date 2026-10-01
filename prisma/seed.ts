// Seed idempotente (rules/migration.md, ADR-001 §Dados e persistência).
//
// Cria apenas o tenant inicial `suporte_ti`. Usuário e Membership NÃO
// entram aqui: o id de User é o mesmo UUID do usuário no Supabase Auth
// (ver prisma/schema.prisma, model User), e este seed não tem — e não deve
// inventar — uma credencial ou id de conta real (rules/secrets.md). Depois
// que a primeira conta de Operações existir no Supabase Auth, o vínculo
// Membership(userId, tenantId: suporte_ti, role: OPERACOES) é criado por um
// passo manual ou por uma rotina de convite, não por este seed.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: "suporte_ti" },
    update: {},
    create: {
      slug: "suporte_ti",
      name: "Suporte de TI",
    },
  });

  console.log(`Tenant pronto: ${tenant.slug} (${tenant.id})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
