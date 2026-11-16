import {
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Injectable,
  NotFoundException,
  Post,
  Req,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthGuard, RequestComUsuario } from '../auth/auth.guard';

/** Spec 003: limite por pessoa e prazo padrão. */
export const LIMITE_ITENS = 3;
export const PRAZO_DIAS = 14;
const DIA_MS = 24 * 60 * 60 * 1000;

export interface Emprestimo {
  id: string;
  equipmentId: string;
  equipmentName: string;
  borrowedAt: string;
  dueAt: string;
  atrasado: boolean;
}

export interface SituacaoPessoa {
  emprestimos: Emprestimo[];
  limite: number;
  bloqueadoPorAtraso: boolean;
}

/** Recusas da spec 003, com código estável para o frontend escolher a mensagem. */
export type Recusa = 'NAO_ENCONTRADO' | 'INDISPONIVEL' | 'LIMITE' | 'ATRASO';

class RecusaEmprestimo extends Error {
  constructor(readonly motivo: Recusa) {
    super(motivo);
  }
}

const corpoSolicitar = z.object({ equipmentId: z.string().uuid() });

/** Repository: o único lugar deste módulo que conhece o Prisma (ADR-001). */
@Injectable()
export class EmprestimosRepository {
  constructor(private readonly prisma: PrismaService) {}

  async tenantDe(userId: string): Promise<string | null> {
    const vinculo = await this.prisma.membership.findFirst({ where: { userId }, orderBy: { createdAt: 'asc' } });
    return vinculo?.tenantId ?? null;
  }

  async situacao(userId: string, tenantId: string, agora = new Date()): Promise<SituacaoPessoa> {
    const abertos = await this.prisma.loan.findMany({
      where: { userId, tenantId, status: 'ABERTO' },
      include: { equipment: { select: { name: true } } },
      orderBy: { dueAt: 'asc' },
    });
    const emprestimos = abertos.map((l) => ({
      id: l.id,
      equipmentId: l.equipmentId,
      equipmentName: l.equipment.name,
      borrowedAt: l.borrowedAt.toISOString(),
      dueAt: l.dueAt.toISOString(),
      atrasado: l.dueAt.getTime() < agora.getTime(),
    }));
    return { emprestimos, limite: LIMITE_ITENS, bloqueadoPorAtraso: emprestimos.some((e) => e.atrasado) };
  }

  /**
   * Spec 003: tudo numa transação. A troca de situação só acontece se o item
   * ainda estiver Disponível (updateMany condicional), então dois pedidos
   * simultâneos pelo mesmo item não geram dois empréstimos.
   */
  async solicitar(userId: string, tenantId: string, equipmentId: string, agora = new Date()): Promise<Emprestimo> {
    return this.prisma.$transaction(async (tx) => {
      const equipamento = await tx.equipment.findFirst({ where: { id: equipmentId, tenantId } });
      if (!equipamento) throw new RecusaEmprestimo('NAO_ENCONTRADO');

      const abertos = await tx.loan.findMany({ where: { userId, tenantId, status: 'ABERTO' } });
      if (abertos.some((l) => l.dueAt.getTime() < agora.getTime())) throw new RecusaEmprestimo('ATRASO');
      if (abertos.length >= LIMITE_ITENS) throw new RecusaEmprestimo('LIMITE');

      const trocou = await tx.equipment.updateMany({
        where: { id: equipmentId, tenantId, status: 'DISPONIVEL' },
        data: { status: 'EMPRESTADO' },
      });
      if (trocou.count === 0) throw new RecusaEmprestimo('INDISPONIVEL');

      const l = await tx.loan.create({
        data: { tenantId, userId, equipmentId, borrowedAt: agora, dueAt: new Date(agora.getTime() + PRAZO_DIAS * DIA_MS) },
      });
      return {
        id: l.id,
        equipmentId,
        equipmentName: equipamento.name,
        borrowedAt: l.borrowedAt.toISOString(),
        dueAt: l.dueAt.toISOString(),
        atrasado: false,
      };
    });
  }
}

const RESPOSTA: Record<Recusa, () => Error> = {
  NAO_ENCONTRADO: () => new NotFoundException({ code: 'NAO_ENCONTRADO', message: 'Equipamento não encontrado.' }),
  INDISPONIVEL: () => new ConflictException({ code: 'INDISPONIVEL', message: 'Este equipamento não está disponível.' }),
  LIMITE: () =>
    new UnprocessableEntityException({ code: 'LIMITE', message: `Você já está com ${LIMITE_ITENS} itens emprestados.` }),
  ATRASO: () =>
    new UnprocessableEntityException({ code: 'ATRASO', message: 'Você tem item em atraso. Devolva antes de pegar outro.' }),
};

@Controller('loans')
@UseGuards(AuthGuard)
export class LoansController {
  constructor(private readonly repo: EmprestimosRepository) {}

  private async tenant(req: RequestComUsuario): Promise<string> {
    const tenantId = await this.repo.tenantDe(req.usuario!.id);
    if (!tenantId) throw new ForbiddenException('Conta sem acesso a este sistema.');
    return tenantId;
  }

  /** Empréstimos abertos da própria pessoa, para o limite e o banner de atraso. */
  @Get('me')
  async meus(@Req() req: RequestComUsuario): Promise<SituacaoPessoa> {
    return this.repo.situacao(req.usuario!.id, await this.tenant(req));
  }

  /** Spec 003: o empréstimo é sempre em nome de quem está logado. */
  @Post()
  @HttpCode(201)
  async solicitar(@Req() req: RequestComUsuario, @Body() body: unknown): Promise<Emprestimo> {
    const tenantId = await this.tenant(req);
    const corpo = corpoSolicitar.safeParse(body);
    if (!corpo.success) throw new NotFoundException({ code: 'NAO_ENCONTRADO', message: 'Equipamento não encontrado.' });
    try {
      return await this.repo.solicitar(req.usuario!.id, tenantId, corpo.data.equipmentId);
    } catch (e) {
      if (e instanceof RecusaEmprestimo) throw RESPOSTA[e.motivo]();
      // Índice único parcial (um empréstimo ABERTO por equipamento): corrida perdida.
      if ((e as { code?: string }).code === 'P2002') throw RESPOSTA.INDISPONIVEL();
      throw e;
    }
  }
}
