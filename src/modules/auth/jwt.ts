// Verificação de JWT do Supabase Auth (ES256) contra o JWKS, só com crypto
// nativo do Node — sem biblioteca fora do ADR-001 (spec 001 CA-02).
import { createPublicKey, verify, type JsonWebKeyInput } from 'node:crypto';

type JsonWebKey = JsonWebKeyInput['key'];

export interface ChavesJwks {
  /** Devolve a chave pública do `kid`, ou null se não existir. */
  chave(kid: string): Promise<JsonWebKey | null>;
}

export interface Usuario {
  id: string;
  email?: string;
}

export class TokenInvalido extends Error {}

function b64url(parte: string): Buffer {
  return Buffer.from(parte, 'base64url');
}

export async function verificarToken(token: string, chaves: ChavesJwks, emissor: string, agora = Date.now()): Promise<Usuario> {
  const partes = token.split('.');
  if (partes.length !== 3) throw new TokenInvalido('formato');
  const [h, p, s] = partes;

  let header: { alg?: string; kid?: string };
  let payload: { sub?: string; email?: string; exp?: number; iss?: string };
  try {
    header = JSON.parse(b64url(h).toString('utf8'));
    payload = JSON.parse(b64url(p).toString('utf8'));
  } catch {
    throw new TokenInvalido('json');
  }
  if (header.alg !== 'ES256' || !header.kid) throw new TokenInvalido('algoritmo');

  const jwk = await chaves.chave(header.kid);
  if (!jwk) throw new TokenInvalido('kid desconhecido');
  const ok = verify('sha256', Buffer.from(`${h}.${p}`), { key: createPublicKey({ key: jwk, format: 'jwk' }), dsaEncoding: 'ieee-p1363' }, b64url(s));
  if (!ok) throw new TokenInvalido('assinatura');

  if (payload.iss !== emissor) throw new TokenInvalido('emissor');
  if (!payload.exp || payload.exp * 1000 <= agora) throw new TokenInvalido('expirado');
  if (!payload.sub) throw new TokenInvalido('sub');
  return { id: payload.sub, email: payload.email };
}

/** Busca o JWKS e guarda por 10 minutos (a chave do Supabase muda raramente). */
export function jwksRemoto(url: string): ChavesJwks {
  let cache: { em: number; chaves: (JsonWebKey & { kid?: string })[] } | null = null;
  return {
    async chave(kid) {
      if (!cache || Date.now() - cache.em > 10 * 60_000 || !cache.chaves.some((k) => k.kid === kid)) {
        const r = await fetch(url);
        if (!r.ok) throw new Error(`JWKS ${r.status}`);
        cache = { em: Date.now(), chaves: ((await r.json()) as { keys: (JsonWebKey & { kid?: string })[] }).keys };
      }
      return cache.chaves.find((k) => k.kid === kid) ?? null;
    },
  };
}
