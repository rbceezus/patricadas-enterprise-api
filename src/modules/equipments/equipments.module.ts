import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CatalogoRepository, EquipmentsController } from './equipments.controller';

@Module({
  imports: [AuthModule],
  controllers: [EquipmentsController],
  providers: [CatalogoRepository],
})
export class EquipmentsModule {}
