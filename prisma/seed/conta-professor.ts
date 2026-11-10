// Spec 006 — conta do professor (CA-04, CA-05, CA-06, CA-07).
import { PrismaClient, Role } from '@prisma/client';

export const EMAIL_PROFESSOR = 'marcelo.grilo@institutojef.org.br';
export const NOME_PROFESSOR = 'Marcelo Grilo';

/** O que este módulo precisa do Supabase Auth — trocado por um falso nos testes. */
export interface AuthAdmin {
  buscarPorEmail(email: string): Promise<{ id: string } | null>;
  criar(email: string, senha: string, nome: string): Promise<{ id: string }>;
  definirSenha(id: string, senha: string): Promise<void>;
}

/** CA-05: a senha só vem do ambiente de quem roda; nunca de arquivo do repositório. */
export function senhaDoAmbiente(env: NodeJS.ProcessEnv = process.env): string {
  const senha = env.PROFESSOR_SENHA;
  if (!senha) throw new Error('Defina PROFESSOR_SENHA só no terminal (nunca em arquivo).');
  return senha;
}

/**
 * Garante a conta no Auth, o usuário espelho e o vínculo Colaborador no
 * tenant. Rodar de novo não duplica nada (CA-06) e não cria empréstimo (CA-07).
 */
export async function garantirContaProfessor(
  prisma: PrismaClient,
  auth: AuthAdmin,
  tenantId: string,
  senha: string,
): Promise<{ userId: string; criada: boolean }> {
  const existente = await auth.buscarPorEmail(EMAIL_PROFESSOR);
  let userId: string;
  if (existente) {
    userId = existente.id;
    await auth.definirSenha(userId, senha); // a senha padrão da turma vale mesmo se alguém mudou
  } else {
    userId = (await auth.criar(EMAIL_PROFESSOR, senha, NOME_PROFESSOR)).id;
  }

  await prisma.user.upsert({
    where: { id: userId },
    update: { email: EMAIL_PROFESSOR, name: NOME_PROFESSOR },
    create: { id: userId, email: EMAIL_PROFESSOR, name: NOME_PROFESSOR },
  });
  await prisma.membership.upsert({
    where: { userId_tenantId: { userId, tenantId } },
    update: { role: Role.COLABORADOR },
    create: { userId, tenantId, role: Role.COLABORADOR },
  });
  return { userId, criada: !existente };
}

/** Cliente da API admin do Supabase Auth, só com fetch nativo. */
export function authAdminSupabase(url: string, chave: string): AuthAdmin {
  const base = url.replace(/\/+$/, '');
  // Chave nova (sb_secret_) não é JWT: vai só em apikey.
  const cab: Record<string, string> = chave.startsWith('sb_')
    ? { apikey: chave, 'Content-Type': 'application/json' }
    : { apikey: chave, Authorization: `Bearer ${chave}`, 'Content-Type': 'application/json' };

  async function pedir(caminho: string, init: RequestInit = {}) {
    const r = await fetch(`${base}/auth/v1${caminho}`, { ...init, headers: cab });
    if (!r.ok) throw new Error(`Supabase Auth ${init.method ?? 'GET'} ${caminho}: ${r.status} ${await r.text()}`);
    return r.json();
  }

  return {
    async buscarPorEmail(email) {
      for (let pagina = 1; pagina <= 20; pagina++) {
        const { users } = (await pedir(`/admin/users?page=${pagina}&per_page=200`)) as { users: { id: string; email?: string }[] };
        const achado = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
        if (achado) return { id: achado.id };
        if (users.length < 200) return null;
      }
      return null;
    },
    async criar(email, senha, nome) {
      const u = (await pedir('/admin/users', {
        method: 'POST',
        body: JSON.stringify({ email, password: senha, email_confirm: true, user_metadata: { name: nome } }),
      })) as { id: string };
      return { id: u.id };
    },
    async definirSenha(id, senha) {
      await pedir(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify({ password: senha }) });
    },
  };
}
