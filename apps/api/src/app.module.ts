import { Controller, Get, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { InjectConnection, MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { Connection } from 'mongoose';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { EnvModule } from './config/config.module';
import { ENV, Env } from './config/env';
import { ContentModule } from './content/content.module';
import { DatabaseModule } from './database.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { ProductsModule } from './products/products.module';
import { AlunaModule } from './progress/aluna.module';
import { StorageModule } from './storage/storage.module';

@Controller('health')
class HealthController {
  constructor(@InjectConnection() private db: Connection) {}

  @Get()
  health() {
    return { ok: true, banco: this.db.readyState === 1 ? 'conectado' : 'desconectado' };
  }
}

@Module({
  imports: [
    EnvModule,
    MongooseModule.forRootAsync({ inject: [ENV], useFactory: (env: Env) => ({ uri: env.mongoUri }) }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    DatabaseModule,
    CommonModule,
    StorageModule,
    AuthModule,
    ProductsModule,
    ContentModule,
    EnrollmentsModule,
    AlunaModule,
    AdminModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
