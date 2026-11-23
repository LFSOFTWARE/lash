import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { LeadsController } from '../leads/leads.controller';
import { AdminController } from './admin.controller';

@Module({
  imports: [AuthModule, EnrollmentsModule],
  controllers: [AdminController, LeadsController],
})
export class AdminModule {}
