import { INestApplication, RequestMethod } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from './config/env';

// Configuração compartilhada entre servidor local (main.ts), Vercel
// (api/index.ts) e testes — os três precisam se comportar igual.
export function configureApp(app: INestApplication): void {
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  // ADR-001 §Contrato: prefixo /v1 desde o início. /health fica fora do
  // prefixo porque é verificação de infraestrutura, não contrato.
  app.setGlobalPrefix('v1', { exclude: [{ path: 'health', method: RequestMethod.GET }] });

  // ADR-001 §Segurança: allowlist com a origem do front, credentials habilitado.
  app.enableCors({ origin: config.get('FRONTEND_ORIGIN', { infer: true }), credentials: true });
}
