import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type HealthStatus = { status: 'ok' | 'error'; db: 'up' | 'down' };

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<HealthStatus> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', db: 'up' };
    } catch {
      return { status: 'error', db: 'down' };
    }
  }
}
