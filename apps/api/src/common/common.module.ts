import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard, SessaoOpcionalGuard } from './auth.guard';

@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [SessaoOpcionalGuard, AuthGuard],
  exports: [JwtModule, SessaoOpcionalGuard, AuthGuard],
})
export class CommonModule {}
