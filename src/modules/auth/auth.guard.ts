import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ChavesJwks, TokenInvalido, Usuario, verificarToken } from './jwt';

export const CHAVES_JWKS = Symbol('CHAVES_JWKS');
export const EMISSOR_JWT = Symbol('EMISSOR_JWT');

export type RequestComUsuario = { headers: Record<string, string | undefined>; usuario?: Usuario };

/** Sem sessão válida, nenhuma rota de domínio responde (spec 001). */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(CHAVES_JWKS) private readonly chaves: ChavesJwks,
    @Inject(EMISSOR_JWT) private readonly emissor: string,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<RequestComUsuario>();
    const [tipo, token] = (req.headers.authorization ?? '').split(' ');
    if (tipo !== 'Bearer' || !token) throw new UnauthorizedException('Sessão ausente.');
    try {
      req.usuario = await verificarToken(token, this.chaves, this.emissor);
      return true;
    } catch (e) {
      if (e instanceof TokenInvalido) throw new UnauthorizedException('Sessão inválida ou expirada.');
      throw e;
    }
  }
}
