import { validateEnv } from './env';

describe('validateEnv (AZ-02)', () => {
  it('falha nomeando a variável quando DATABASE_URL falta', () => {
    expect(() => validateEnv({})).toThrow(/DATABASE_URL/);
  });

  // Desde a spec 001 (login), SUPABASE_URL faz parte do env mínimo.
  const MINIMO = { DATABASE_URL: 'postgresql://x', SUPABASE_URL: 'https://p.supabase.co' };

  it('aceita env mínimo e aplica defaults', () => {
    expect(validateEnv(MINIMO)).toMatchObject({
      PORT: 3000,
      NODE_ENV: 'development',
    });
  });

  it('remove a barra final de FRONTEND_ORIGIN para o CORS casar', () => {
    expect(validateEnv({ ...MINIMO, FRONTEND_ORIGIN: 'https://front.vercel.app/' }).FRONTEND_ORIGIN).toBe(
      'https://front.vercel.app',
    );
  });

  it('spec 001: falha nomeando SUPABASE_URL quando ela falta', () => {
    expect(() => validateEnv({ DATABASE_URL: 'postgresql://x' })).toThrow(/SUPABASE_URL/);
  });

  it('spec 001: deriva o JWKS do SUPABASE_URL quando SUPABASE_JWKS_URL não vem', () => {
    expect(validateEnv(MINIMO).SUPABASE_JWKS_URL).toBe('https://p.supabase.co/auth/v1/.well-known/jwks.json');
  });
});
