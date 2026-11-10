// Spec 006 CA-05 — nenhuma senha escrita em arquivo versionado.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const RAIZ = join(__dirname, '..', '..');

/**
 * Senha com valor literal: `senha = "x..."`, `password: 'x...'` (texto entre
 * aspas, 6+ caracteres) ou linha de env `PROFESSOR_SENHA=x...`. Nomes de
 * variável (`password: senha`) não contam.
 */
const SENHA_LITERAL = /\b(senha|password)\b\s*[:=]\s*["'`][^"'`]{6,}["'`]|^\s*PROFESSOR_SENHA\s*=\s*\S/im;

function arquivosVersionados(): string[] {
  return execFileSync('git', ['ls-files'], { cwd: RAIZ, encoding: 'utf8' })
    .split('\n')
    .filter((f) => f && !/\.(png|jpe?g|ico|lock)$/i.test(f) && !f.endsWith('package-lock.json'));
}

describe('spec 006 — CA-05: senha fora do repositório', () => {
  it('CA-05: nenhum arquivo versionado atribui uma senha literal', () => {
    const achados = arquivosVersionados().flatMap((arquivo) =>
      readFileSync(join(RAIZ, arquivo), 'utf8')
        .split('\n')
        .map((linha, i) => ({ arquivo, n: i + 1, linha }))
        .filter(({ linha }) => SENHA_LITERAL.test(linha)),
    );
    expect(achados.map(({ arquivo, n, linha }) => `${arquivo}:${n} ${linha.trim()}`)).toEqual([]);
  });

  it('CA-05: o script da conta só obtém a senha por senhaDoAmbiente (PROFESSOR_SENHA)', () => {
    const script = readFileSync(join(RAIZ, 'prisma', 'criar-conta-professor.ts'), 'utf8');
    expect(script).toMatch(/const senha = senhaDoAmbiente\(\);/);
  });

  it('CA-05: o .env.example não traz valor para PROFESSOR_SENHA', () => {
    expect(readFileSync(join(RAIZ, '.env.example'), 'utf8')).not.toMatch(/^PROFESSOR_SENHA=\S/m);
  });
});
