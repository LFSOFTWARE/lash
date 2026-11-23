import { Body, Controller, Get, HttpCode, Inject, Post, Req, Res, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { Model } from 'mongoose';
import { Sessao, Usuaria } from '../common/auth.decorators';
import { AuthGuard, REFRESH_COOKIE } from '../common/auth.guard';
import { ENV, Env } from '../config/env';
import { publicUser, User } from '../users/user.schema';
import { waLink } from '../common/util';
import { CadastroDto, EsqueciSenhaDto, LoginDto, RedefinirSenhaDto } from './auth.dto';
import { AuthService } from './auth.service';
import { gravarCookies, limparCookies } from './cookies';

const LIMITE = { default: { limit: 10, ttl: 60_000 } };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService, @Inject(ENV) private env: Env, @InjectModel(User.name) private users: Model<User>) {}

  /** Cria a conta da aluna e já entra. */
  @Post('cadastro')
  @Throttle(LIMITE)
  async cadastro(@Body() dto: CadastroDto, @Res({ passthrough: true }) res: Response) {
    const u = await this.auth.cadastrar(dto);
    const t = await this.auth.emitir(u);
    gravarCookies(res, this.env, t);
    return { usuaria: publicUser(u), ...t };
  }

  @Post('login')
  @HttpCode(200)
  @Throttle(LIMITE)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const u = await this.auth.validar(dto.email, dto.senha);
    const t = await this.auth.emitir(u);
    gravarCookies(res, this.env, t);
    return { usuaria: publicUser(u), ...t };
  }

  /** Troca o refresh token (cookie ou corpo) por tokens novos. */
  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Body() body: { refreshToken?: string }, @Res({ passthrough: true }) res: Response) {
    const { user, tokens } = await this.auth.renovar(body?.refreshToken ?? req.cookies?.[REFRESH_COOKIE]);
    gravarCookies(res, this.env, tokens);
    return { usuaria: publicUser(user), ...tokens };
  }

  @Post('logout')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  async logout(@Usuaria() s: Sessao, @Res({ passthrough: true }) res: Response) {
    await this.auth.sair(s.id);
    limparCookies(res, this.env);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@Usuaria() s: Sessao) {
    const u = await this.users.findById(s.id);
    return u ? publicUser(u) : null;
  }

  /** Sempre responde igual, exista ou não a conta. */
  @Post('esqueci-senha')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async esqueci(@Body() dto: EsqueciSenhaDto) {
    await this.auth.esqueciSenha(dto.email);
    return {
      mensagem: 'Se o e-mail tiver conta, a Camilla pode te mandar o link para criar uma senha nova. Fale com ela no WhatsApp.',
      whatsappUrl: waLink(this.env.whatsappInstrutora, `Olá! Esqueci a senha da área da aluna. Meu e-mail é ${dto.email}.`),
    };
  }

  @Post('redefinir-senha')
  @HttpCode(204)
  @Throttle(LIMITE)
  async redefinir(@Body() dto: RedefinirSenhaDto) {
    await this.auth.redefinirSenha(dto.token, dto.senha);
  }
}
