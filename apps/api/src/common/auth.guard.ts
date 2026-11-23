import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { ENV, Env } from '../config/env';
import { Papel, PAPEIS, Sessao } from './auth.decorators';

export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';

/** Token de acesso: cabeçalho Authorization: Bearer ou cookie httpOnly. */
export function lerToken(req: Request): string | undefined {
  const h = req.headers.authorization;
  if (h?.startsWith('Bearer ')) return h.slice(7);
  return req.cookies?.[ACCESS_COOKIE];
}

/** Lê a sessão se houver token válido; nunca bloqueia. */
@Injectable()
export class SessaoOpcionalGuard implements CanActivate {
  constructor(private jwt: JwtService, @Inject(ENV) private env: Env) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    const token = lerToken(req);
    if (token) {
      try {
        const p = await this.jwt.verifyAsync<{ sub: string; papel: Papel }>(token, { secret: this.env.jwtSecret });
        req.usuaria = { id: p.sub, papel: p.papel } satisfies Sessao;
      } catch {
        /* token inválido ou vencido: segue sem sessão */
      }
    }
    return true;
  }
}

/** Exige login; com @Papeis, exige também o papel. */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private opcional: SessaoOpcionalGuard, private reflector: Reflector) {}

  async canActivate(ctx: ExecutionContext) {
    await this.opcional.canActivate(ctx);
    const req = ctx.switchToHttp().getRequest();
    const s: Sessao | undefined = req.usuaria;
    if (!s) throw new UnauthorizedException('Entre na sua conta.');
    const papeis = this.reflector.getAllAndOverride<Papel[] | undefined>(PAPEIS, [ctx.getHandler(), ctx.getClass()]);
    if (papeis?.length && !papeis.includes(s.papel)) throw new ForbiddenException('Sem permissão.');
    return true;
  }
}
