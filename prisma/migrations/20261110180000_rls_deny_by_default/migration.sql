-- ADR-001 §Autenticação e autorização: RLS ligado em todas as tabelas, deny by default.
-- Sem nenhuma policy, os papéis anon e authenticated do Supabase (chave pública,
-- que vai no bundle do front) não leem nem escrevem nada pela Data API.
-- O Prisma conecta como dono das tabelas e não é afetado (RLS não se aplica ao dono).
ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "memberships" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "equipments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "loans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;