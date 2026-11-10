// CRIA A CONTA DO PROFESSOR — rodado por uma PESSOA, nunca pelo agente.
// Escreve no Supabase Auth e no banco do deploy (spec 006 CA-04/CA-05).
//
// Precisa, só no terminal de quem roda (não no .env):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PROFESSOR_SENHA, DATABASE_URL
// e exige digitar o host do Supabase para confirmar.
import { createInterface } from 'node:readline/promises';
import { PrismaClient } from '@prisma/client';
import { EMAIL_PROFESSOR, authAdminSupabase, garantirContaProfessor, senhaDoAmbiente } from './seed/conta-professor';

async function main() {
  const url = process.env.SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) throw new Error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY só neste terminal.');
  const senha = senhaDoAmbiente();
  const host = new URL(url).host;

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error('Exige terminal interativo de uma pessoa. O agente não cria contas em produção.');
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const digitado = await rl.question(`Criar/atualizar ${EMAIL_PROFESSOR} em ${host}. Digite o host para confirmar: `);
  rl.close();
  if (digitado.trim() !== host) throw new Error('Host não confere. Nada foi feito.');

  const prisma = new PrismaClient();
  try {
    const tenant = await prisma.tenant.findUnique({ where: { slug: 'suporte_ti' } });
    if (!tenant) throw new Error('Tenant suporte_ti não existe: rode o seed antes.');
    const { userId, criada } = await garantirContaProfessor(prisma, authAdminSupabase(url, chave), tenant.id, senha);
    const emprestimos = await prisma.loan.count({ where: { userId } });
    console.log(`${criada ? 'Conta criada' : 'Conta já existia (senha redefinida)'}: ${EMAIL_PROFESSOR} · Colaborador · ${emprestimos} empréstimo(s)`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
