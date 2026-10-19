import { validateEnv } from './env';

describe('validateEnv (AZ-02)', () => {
  it('falha nomeando a variável quando DATABASE_URL falta', () => {
    expect(() => validateEnv({})).toThrow(/DATABASE_URL/);
  });

  it('aceita env mínimo e aplica defaults', () => {
    expect(validateEnv({ DATABASE_URL: 'postgresql://x' })).toMatchObject({
      PORT: 3000,
      NODE_ENV: 'development',
    });
  });
});
