import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Único lugar que instancia o PrismaClient (ADR-001: o Repository isola o Prisma).
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      const motivo = error instanceof Error ? error.message.split('\n').pop() : String(error);
      throw new Error(`Não foi possível conectar ao banco (DATABASE_URL). ${motivo}`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
