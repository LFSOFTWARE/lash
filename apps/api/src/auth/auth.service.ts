import { ConflictException, Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { hash, verify } from '@node-rs/argon2';
import { createHash, randomBytes } from 'node:crypto';
import { Model } from 'mongoose';
import type { Papel } from '../common/auth.decorators';
import { ENV, Env } from '../config/env';
import { User, UserDoc } from '../users/user.schema';
import { CadastroDto } from './auth.dto';

export const ACCESS_TTL = 15 * 60; // 15 min
export const REFRESH_TTL = 30 * 24 * 60 * 60; // 30 dias
const RESET_TTL_MS = 60 * 60 * 1000; // 1 h

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private log = new Logger('Auth');

  constructor(
    @InjectModel(User.name) private users: Model<User>,
    private jwt: JwtService,
    @Inject(ENV) private env: Env,
  ) {}

  hashSenha(senha: string) {
    return hash(senha);
  }

  async cadastrar(dto: CadastroDto, papel: Papel = 'aluna'): Promise<UserDoc> {
    if (await this.users.exists({ email: dto.email })) {
      throw new ConflictException('Já existe uma conta com este e-mail. Entre com sua senha.');
    }
    try {
      return await this.users.create({ nome: dto.nome, email: dto.email, whatsapp: dto.whatsapp, papel, senhaHash: await this.hashSenha(dto.senha) });
    } catch (e: any) {
      if (e?.code === 11000) throw new ConflictException('Já existe uma conta com este e-mail. Entre com sua senha.');
      throw e;
    }
  }

  async validar(email: string, senha: string): Promise<UserDoc> {
    const u = await this.users.findOne({ email }).select('+senhaHash');
    // Mesmo sem conta, roda uma verificação para não revelar quais e-mails existem pelo tempo de resposta.
    const ok = u ? await verify(u.senhaHash, senha).catch(() => false) : (await hash(senha), false);
    if (!u || !ok) throw new UnauthorizedException('E-mail ou senha incorretos.');
    return u;
  }

  async emitir(u: UserDoc | { _id: unknown; papel: Papel }): Promise<Tokens> {
    const versao = (await this.users.findById(u._id).select('+tokenVersao').lean())?.tokenVersao ?? 0;
    const sub = String(u._id);
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync({ sub, papel: u.papel }, { secret: this.env.jwtSecret, expiresIn: ACCESS_TTL }),
      this.jwt.signAsync({ sub, v: versao }, { secret: this.env.jwtRefreshSecret, expiresIn: REFRESH_TTL }),
    ]);
    return { accessToken, refreshToken };
  }

  async renovar(refreshToken: string | undefined): Promise<{ user: UserDoc; tokens: Tokens }> {
    if (!refreshToken) throw new UnauthorizedException('Sessão expirada. Entre de novo.');
    let p: { sub: string; v: number };
    try {
      p = await this.jwt.verifyAsync(refreshToken, { secret: this.env.jwtRefreshSecret });
    } catch {
      throw new UnauthorizedException('Sessão expirada. Entre de novo.');
    }
    const u = await this.users.findById(p.sub).select('+tokenVersao');
    if (!u || u.tokenVersao !== p.v) throw new UnauthorizedException('Sessão expirada. Entre de novo.');
    return { user: u, tokens: await this.emitir(u) };
  }

  /** Encerra todas as sessões da usuária. */
  async sair(userId: string) {
    await this.users.updateOne({ _id: userId }, { $inc: { tokenVersao: 1 } });
  }

  /** Cria um link de redefinição de senha (vale 1 hora). */
  async gerarLinkSenha(userId: string): Promise<string> {
    const token = randomBytes(32).toString('base64url');
    await this.users.updateOne({ _id: userId }, { resetHash: sha256(token), resetExpira: new Date(Date.now() + RESET_TTL_MS) });
    return `${this.env.webUrl.replace(/\/$/, '')}/redefinir-senha?token=${token}`;
  }

  /**
   * Ainda não há envio de e-mail: o link é gerado e, fora de produção, aparece no log.
   * Em produção a instrutora gera o link pelo painel e manda no WhatsApp.
   */
  async esqueciSenha(email: string) {
    const u = await this.users.findOne({ email }).lean();
    if (!u) return;
    const link = await this.gerarLinkSenha(String(u._id));
    if (process.env.NODE_ENV !== 'production') this.log.log(`Link de redefinição para ${email}: ${link}`);
  }

  async redefinirSenha(token: string, senha: string) {
    const u = await this.users.findOne({ resetHash: sha256(token), resetExpira: { $gt: new Date() } });
    if (!u) throw new UnauthorizedException('Link inválido ou vencido. Peça um novo.');
    await this.users.updateOne(
      { _id: u._id },
      { senhaHash: await this.hashSenha(senha), $unset: { resetHash: 1, resetExpira: 1 }, $inc: { tokenVersao: 1 } },
    );
  }
}
