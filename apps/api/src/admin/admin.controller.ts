import { Controller, Get, NotFoundException, Param, Post, Query, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Model, Types } from 'mongoose';
import { AuthService } from '../auth/auth.service';
import { Papeis } from '../common/auth.decorators';
import { AuthGuard } from '../common/auth.guard';
import { ObjectIdPipe } from '../common/object-id.pipe';
import { escapeRegex, waLink, waNumero } from '../common/util';
import { Enrollment } from '../enrollments/enrollment.schema';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { Lead } from '../leads/lead.schema';
import { Product } from '../products/product.schema';
import { publicUser, User } from '../users/user.schema';

export class FiltroAlunasDto {
  @IsOptional() @IsString() @MaxLength(100) busca?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) pagina?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) porPagina?: number;
}

@ApiTags('admin · alunas')
@Controller('admin')
@UseGuards(AuthGuard)
@Papeis('admin')
export class AdminController {
  constructor(
    private auth: AuthService,
    private enrollments: EnrollmentsService,
    @InjectModel(User.name) private users: Model<User>,
    @InjectModel(Enrollment.name) private enrollmentModel: Model<Enrollment>,
    @InjectModel(Product.name) private products: Model<Product>,
    @InjectModel(Lead.name) private leads: Model<Lead>,
  ) {}

  /** Números do topo do painel. */
  @Get('resumo')
  async resumo() {
    const [pendentes, ativas, alunasAtivas, produtosPublicados, leadsNovos, recentes] = await Promise.all([
      this.enrollmentModel.countDocuments({ status: 'pendente' }),
      this.enrollmentModel.countDocuments({ status: 'ativa' }),
      this.enrollmentModel.distinct('userId', { status: 'ativa' }).then((l) => l.length),
      this.products.countDocuments({ publicado: true }),
      this.leads.countDocuments({ atendido: false }),
      this.enrollments.listar({ status: 'pendente', porPagina: 5 }),
    ]);
    return { pedidosPendentes: pendentes, acessosAtivos: ativas, alunasAtivas, produtosPublicados, contatosNaoAtendidos: leadsNovos, pendentesRecentes: recentes.itens };
  }

  @Get('alunas')
  async alunas(@Query() f: FiltroAlunasDto) {
    const pagina = f.pagina ?? 1;
    const porPagina = f.porPagina ?? 20;
    const q: Record<string, unknown> = { papel: 'aluna' };
    if (f.busca) {
      const r = new RegExp(escapeRegex(f.busca.trim()), 'i');
      const dig = f.busca.replace(/\D/g, '');
      q.$or = [{ nome: r }, { email: r }, ...(dig.length >= 4 ? [{ whatsapp: new RegExp(dig) }] : [])];
    }
    const [lista, total] = await Promise.all([
      this.users.find(q).sort({ criadoEm: -1 }).skip((pagina - 1) * porPagina).limit(porPagina).lean(),
      this.users.countDocuments(q),
    ]);
    const contagem = await this.enrollmentModel.aggregate<{ _id: { u: Types.ObjectId; s: string }; n: number }>([
      { $match: { userId: { $in: lista.map((u) => u._id) } } },
      { $group: { _id: { u: '$userId', s: '$status' }, n: { $sum: 1 } } },
    ]);
    return {
      itens: lista.map((u) => {
        const c = (s: string) => contagem.find((x) => String(x._id.u) === String(u._id) && x._id.s === s)?.n ?? 0;
        return { ...publicUser(u), whatsappUrl: `https://wa.me/${waNumero(u.whatsapp)}`, pedidos: { pendente: c('pendente'), ativa: c('ativa'), cancelada: c('cancelada') } };
      }),
      total,
      pagina,
      porPagina,
    };
  }

  @Get('alunas/:id')
  async aluna(@Param('id', ObjectIdPipe) id: string) {
    const u = await this.users.findById(id);
    if (!u) throw new NotFoundException('Aluna não encontrada.');
    return { ...publicUser(u), whatsappUrl: `https://wa.me/${waNumero(u.whatsapp)}`, pedidos: await this.enrollments.meus(id) };
  }

  /** Link para a aluna criar uma senha nova (vale 1 hora), já com a mensagem de WhatsApp pronta. */
  @Post('alunas/:id/link-senha')
  async linkSenha(@Param('id', ObjectIdPipe) id: string) {
    const u = await this.users.findById(id).lean();
    if (!u) throw new NotFoundException('Aluna não encontrada.');
    const link = await this.auth.gerarLinkSenha(id);
    return {
      link,
      whatsappUrl: waLink(waNumero(u.whatsapp), `Oi, ${u.nome.split(' ')[0]}! Aqui está o link para criar sua senha da área da aluna (vale 1 hora): ${link}`),
    };
  }
}
