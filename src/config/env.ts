import { z } from 'zod';

// Só as variáveis que o código usa hoje. Variável nova entra aqui e no
// .env.example no mesmo PR (rules/secrets.md).
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL não definida — copie .env.example para .env'),
  // O navegador manda a origem sem barra final; "https://x.app/" nunca casaria.
  FRONTEND_ORIGIN: z
    .string()
    .url()
    .default('http://localhost:5173')
    .transform((origin) => origin.replace(/\/+$/, '')),
  // Login (spec 001): emissor dos tokens e chaves públicas para conferir a assinatura.
  SUPABASE_URL: z
    .string()
    .url('SUPABASE_URL não definida — necessária para validar o login')
    .transform((url) => url.replace(/\/+$/, '')),
  SUPABASE_JWKS_URL: z.string().url().optional(),
}).transform((env) => ({
  ...env,
  SUPABASE_JWKS_URL: env.SUPABASE_JWKS_URL ?? `${env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`,
}));

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    const problemas = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Variáveis de ambiente inválidas:\n${problemas}`);
  }
  return result.data;
}
