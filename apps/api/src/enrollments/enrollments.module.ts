import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminPedidosController, InscricaoController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';

@Module({
  imports: [AuthModule],
  controllers: [InscricaoController, AdminPedidosController],
  providers: [EnrollmentsService],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}
