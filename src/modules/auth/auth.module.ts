import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../../config/env';
import { AuthGuard, CHAVES_JWKS, EMISSOR_JWT } from './auth.guard';
import { jwksRemoto } from './jwt';
import { MeController, PerfilRepository } from './me.controller';

@Module({
  controllers: [MeController],
  providers: [
    AuthGuard,
    PerfilRepository,
    {
      provide: CHAVES_JWKS,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => jwksRemoto(config.get('SUPABASE_JWKS_URL', { infer: true })),
    },
    {
      provide: EMISSOR_JWT,
      inject: [ConfigService],
      // O Supabase emite tokens com iss = <SUPABASE_URL>/auth/v1.
      useFactory: (config: ConfigService<Env, true>) => `${config.get('SUPABASE_URL', { infer: true })}/auth/v1`,
    },
  ],
  exports: [AuthGuard, CHAVES_JWKS, EMISSOR_JWT],
})
export class AuthModule {}
