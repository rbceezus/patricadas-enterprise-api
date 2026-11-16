import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EmprestimosRepository, LoansController } from './loans.controller';

@Module({
  imports: [AuthModule],
  controllers: [LoansController],
  providers: [EmprestimosRepository],
})
export class LoansModule {}
