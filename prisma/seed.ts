// Seed idempotente (rules/migration.md, ADR-001 §Dados e persistência).
//
// Cria o tenant `suporte_ti` e os 12 equipamentos da spec 006. Usuário e
// Membership NÃO entram aqui: o id de User é o mesmo UUID do Supabase Auth, e
// a conta do professor é criada por prisma/criar-conta-professor.ts, que lê a
// senha do ambiente (spec 006 CA-04, CA-05).
//
// IMAGENS_BASE_URL: URL pública do bucket `equipamentos`, por exemplo
// https://<projeto>.supabase.co/storage/v1/object/public/equipamentos
import { PrismaClient } from '@prisma/client';
import { semearEquipamentos } from './seed/equipamentos';

const prisma = new PrismaClient();

async function main() {
  const baseImagens = process.env.IMAGENS_BASE_URL;
  if (!baseImagens) throw new Error('Defina IMAGENS_BASE_URL (URL pública do bucket equipamentos).');

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'suporte_ti' },
    update: {},
    create: { slug: 'suporte_ti', name: 'Suporte de TI' },
  });
  console.log(`Tenant pronto: ${tenant.slug} (${tenant.id})`);

  const total = await semearEquipamentos(prisma, tenant.id, baseImagens);
  console.log(`Equipamentos prontos: ${total}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
