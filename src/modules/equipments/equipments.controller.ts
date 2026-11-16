import { Controller, ForbiddenException, Get, Injectable, Req, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthGuard, RequestComUsuario } from '../auth/auth.guard';

/**
 * Item do catálogo (spec 002). Não diz quem está com o equipamento: isso é
 * informação de Operações (spec 005), não do catálogo.
 */
export interface ItemCatalogo {
  id: string;
  name: string;
  category: 'NOTEBOOK' | 'MONITOR' | 'CABO' | 'CAMERA' | 'ACESSORIO';
  assetTag: string | null;
  notes: string | null;
  status: 'DISPONIVEL' | 'EMPRESTADO' | 'EM_MANUTENCAO';
  image: { url: string; author: string | null; sourceUrl: string | null; license: string | null } | null;
}

/** Repository: o único lugar deste módulo que conhece o Prisma (ADR-001). */
@Injectable()
export class CatalogoRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Tenant do primeiro vínculo da pessoa; null se ela não tem vínculo. */
  async tenantDe(userId: string): Promise<string | null> {
    const vinculo = await this.prisma.membership.findFirst({ where: { userId }, orderBy: { createdAt: 'asc' } });
    return vinculo?.tenantId ?? null;
  }

  async listar(tenantId: string): Promise<ItemCatalogo[]> {
    const itens = await this.prisma.equipment.findMany({
      where: { tenantId },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
    return itens.map((e) => ({
      id: e.id,
      name: e.name,
      category: e.category,
      assetTag: e.assetTag,
      notes: e.notes,
      status: e.status,
      image: e.imageUrl
        ? { url: e.imageUrl, author: e.imageAuthor, sourceUrl: e.imageSourceUrl, license: e.imageLicense }
        : null,
    }));
  }
}

@Controller('equipments')
@UseGuards(AuthGuard)
export class EquipmentsController {
  constructor(private readonly catalogo: CatalogoRepository) {}

  /** Spec 002: visível para qualquer pessoa autenticada, de qualquer papel. */
  @Get()
  async listar(@Req() req: RequestComUsuario): Promise<ItemCatalogo[]> {
    const tenantId = await this.catalogo.tenantDe(req.usuario!.id);
    if (!tenantId) throw new ForbiddenException('Conta sem acesso a este sistema.');
    return this.catalogo.listar(tenantId);
  }
}
