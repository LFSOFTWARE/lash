import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { ProductsModule } from '../products/products.module';
import { VideoService } from '../video/video.service';
import { AlunaController, AulasController } from './aluna.controller';

@Module({
  imports: [AuthModule, EnrollmentsModule, ProductsModule],
  controllers: [AlunaController, AulasController],
  providers: [VideoService],
})
export class AlunaModule {}
