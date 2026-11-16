import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env';
import { HealthModule } from './health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { EquipmentsModule } from './modules/equipments/equipments.module';
import { LoansModule } from './modules/loans/loans.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    PrismaModule,
    HealthModule,
    AuthModule,
    EquipmentsModule,
    LoansModule,
  ],
})
export class AppModule {}
