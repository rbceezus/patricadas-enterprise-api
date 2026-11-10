import { Controller, ForbiddenException, Get, Injectable, Req, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthGuard, RequestComUsuario } from './auth.guard';

export interface Perfil {
  id: string;
  email: string;
  name: string;
  role: 'COLABORADOR' | 'OPERACOES';
}

/** Repository: o único lugar deste módulo que conhece o Prisma (ADR-001). */
@Injectable()
export class PerfilRepository {
  constructor(private readonly prisma: PrismaService) {}

  async buscar(userId: string): Promise<Perfil | null> {
    const usuario = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { memberships: { orderBy: { createdAt: 'asc' }, take: 1 } },
    });
    const vinculo = usuario?.memberships[0];
    if (!usuario || !vinculo) return null;
    return { id: usuario.id, email: usuario.email, name: usuario.name, role: vinculo.role };
  }
}

@Controller('me')
@UseGuards(AuthGuard)
export class MeController {
  constructor(private readonly perfis: PerfilRepository) {}

  /** Spec 001 CA-03/CA-04: o papel vem do vínculo, não do token. */
  @Get()
  async me(@Req() req: RequestComUsuario): Promise<Perfil> {
    const perfil = await this.perfis.buscar(req.usuario!.id);
    if (!perfil) throw new ForbiddenException('Conta sem acesso a este sistema.');
    return perfil;
  }
}
