import { BadRequestException, Body, Controller, Get, HttpCode, Inject, NotFoundException, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { randomBytes } from 'node:crypto';
import { Model } from 'mongoose';
import { AuthService } from '../auth/auth.service';
import { gravarCookies } from '../auth/cookies';
import { Papeis, Sessao, Usuaria } from '../common/auth.decorators';
import { AuthGuard } from '../common/auth.guard';
import { ObjectIdPipe } from '../common/object-id.pipe';
import { ENV, Env } from '../config/env';
import { Product } from '../products/product.schema';
import { publicUser, User } from '../users/user.schema';
import { AcessoManualDto, EditarPedidoDto, FiltroPedidosDto, InscricaoDto, LiberarDto, PedidoDto } from './enrollment.dto';
import { EnrollmentsService } from './enrollments.service';

@ApiTags('inscrição')
@Controller()
export class InscricaoController {
  constructor(
    private svc: EnrollmentsService,
    private auth: AuthService,
    @Inject(ENV) private env: Env,
    @InjectModel(Product.name) private products: Model<Product>,
  ) {}

  /**
   * Formulário de inscrição: cria a conta, grava o pedido pendente, já entra
   * e devolve o link do WhatsApp com a mensagem pronta para combinar o pagamento.
   */
  @Post('inscricoes')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async inscrever(@Body() dto: InscricaoDto, @Res({ passthrough: true }) res: Response) {
    if (!(await this.products.exists({ _id: dto.productId, publicado: true }))) throw new NotFoundException('Produto não encontrado.');
    const u = await this.auth.cadastrar(dto);
    const r = await this.svc.pedir(String(u._id), dto.productId, dto.observacao);
    const t = await this.auth.emitir(u);
    gravarCookies(res, this.env, t);
    return { usuaria: publicUser(u), ...r, ...t };
  }

  /** Aluna já logada pede outro produto. */
  @Post('aluna/pedidos')
  @UseGuards(AuthGuard)
  pedir(@Usuaria() s: Sessao, @Body() dto: PedidoDto) {
    return this.svc.pedir(s.id, dto.productId, dto.observacao);
  }
}

@ApiTags('admin · pedidos')
@Controller('admin/pedidos')
@UseGuards(AuthGuard)
@Papeis('admin')
export class AdminPedidosController {
  constructor(private svc: EnrollmentsService, private auth: AuthService, @InjectModel(User.name) private users: Model<User>) {}

  @Get()
  listar(@Query() f: FiltroPedidosDto) {
    return this.svc.listar(f);
  }

  /** "Liberar acesso" depois do pagamento combinado no WhatsApp. */
  @Post(':id/liberar')
  @HttpCode(200)
  liberar(@Param('id', ObjectIdPipe) id: string, @Usuaria() s: Sessao, @Body() dto: LiberarDto) {
    return this.svc.liberar(id, s.id, dto);
  }

  @Post(':id/cancelar')
  @HttpCode(200)
  cancelar(@Param('id', ObjectIdPipe) id: string) {
    return this.svc.cancelar(id);
  }

  /** Data da turma presencial, validade do acesso, anotação. */
  @Patch(':id')
  editar(@Param('id', ObjectIdPipe) id: string, @Body() dto: EditarPedidoDto) {
    return this.svc.editar(id, dto);
  }

  /**
   * Libera um produto direto para uma aluna existente (userId) ou nova (aluna).
   * Aluna nova sem senha recebe um link para criar a senha, para mandar no WhatsApp.
   */
  @Post()
  async manual(@Usuaria() s: Sessao, @Body() dto: AcessoManualDto) {
    if (!dto.userId === !dto.aluna) throw new BadRequestException('Informe userId ou os dados de uma aluna nova (não os dois).');
    let userId = dto.userId;
    let linkSenha: string | undefined;
    if (dto.aluna) {
      const u = await this.auth.cadastrar({ ...dto.aluna, senha: dto.aluna.senha ?? randomBytes(24).toString('base64url') });
      userId = String(u._id);
      if (!dto.aluna.senha) linkSenha = await this.auth.gerarLinkSenha(userId);
    } else if (!(await this.users.exists({ _id: userId }))) {
      throw new NotFoundException('Aluna não encontrada.');
    }
    const pedido = await this.svc.liberarDireto(userId!, dto.productId, s.id, dto);
    return { pedido, userId, linkSenha };
  }
}
