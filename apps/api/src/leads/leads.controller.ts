import { Body, Controller, Get, NotFoundException, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';
import { Model } from 'mongoose';
import { Papeis } from '../common/auth.decorators';
import { AuthGuard } from '../common/auth.guard';
import { ObjectIdPipe } from '../common/object-id.pipe';
import { waNumero } from '../common/util';
import { Lead } from './lead.schema';

export class LeadDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value)) @IsString() @IsNotEmpty() @MaxLength(120) nome: string;
  @Transform(({ value }) => (typeof value === 'string' ? value.replace(/\D/g, '') : value))
  @Matches(/^\d{10,13}$/, { message: 'WhatsApp inválido.' })
  whatsapp: string;
  @IsOptional() @IsString() @MaxLength(200) interesse?: string;
  @IsOptional() @IsString() @MaxLength(100) origem?: string;
}

export class FiltroLeadsDto {
  @IsOptional() @Transform(({ value }) => value === 'true' || value === true) @IsBoolean() atendido?: boolean;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) pagina?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) porPagina?: number;
}

const formatar = (l: Lead & { _id: unknown }) => ({
  id: String(l._id),
  nome: l.nome,
  whatsapp: l.whatsapp,
  whatsappUrl: `https://wa.me/${waNumero(l.whatsapp)}`,
  interesse: l.interesse,
  origem: l.origem,
  atendido: l.atendido,
  criadoEm: l.criadoEm,
});

@ApiTags('contatos')
@Controller()
export class LeadsController {
  constructor(@InjectModel(Lead.name) private leads: Model<Lead>) {}

  /** Formulário de contato da landing. */
  @Post('leads')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async criar(@Body() dto: LeadDto) {
    await this.leads.create(dto);
    return { ok: true };
  }

  @Get('admin/leads')
  @UseGuards(AuthGuard)
  @Papeis('admin')
  async listar(@Query() f: FiltroLeadsDto) {
    const pagina = f.pagina ?? 1;
    const porPagina = f.porPagina ?? 20;
    const q = f.atendido === undefined ? {} : { atendido: f.atendido };
    const [itens, total] = await Promise.all([
      this.leads.find(q).sort({ criadoEm: -1 }).skip((pagina - 1) * porPagina).limit(porPagina).lean(),
      this.leads.countDocuments(q),
    ]);
    return { itens: itens.map(formatar), total, pagina, porPagina };
  }

  @Patch('admin/leads/:id')
  @UseGuards(AuthGuard)
  @Papeis('admin')
  async marcar(@Param('id', ObjectIdPipe) id: string, @Body('atendido') atendido: boolean) {
    const l = await this.leads.findByIdAndUpdate(id, { atendido: Boolean(atendido) }, { new: true }).lean();
    if (!l) throw new NotFoundException('Contato não encontrado.');
    return formatar(l);
  }
}
