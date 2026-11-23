import { Type } from 'class-transformer';
import { IsDateString, IsEmail, IsIn, IsInt, IsMongoId, IsNotEmpty, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength, ValidateNested } from 'class-validator';
import { Transform } from 'class-transformer';
import { CadastroDto } from '../auth/auth.dto';
import { TIPOS } from '../products/product.schema';
import { STATUS } from './enrollment.schema';

export class PedidoDto {
  @IsMongoId() productId: string;
  @IsOptional() @IsString() @MaxLength(500) observacao?: string;
}

/** Inscrição de quem ainda não tem conta: cria a conta e o pedido de uma vez. */
export class InscricaoDto extends CadastroDto {
  @IsMongoId() productId: string;
  @IsOptional() @IsString() @MaxLength(500) observacao?: string;
}

export class FiltroPedidosDto {
  @IsOptional() @IsIn(STATUS) status?: (typeof STATUS)[number];
  @IsOptional() @IsIn(TIPOS) tipo?: string;
  @IsOptional() @IsMongoId() productId?: string;
  @IsOptional() @IsMongoId() userId?: string;
  /** Nome, e-mail ou WhatsApp da aluna. */
  @IsOptional() @IsString() @MaxLength(100) busca?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) pagina?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) porPagina?: number;
}

export class LiberarDto {
  @IsOptional() @IsDateString() dataTurma?: string;
  @IsOptional() @IsDateString() expiraEm?: string;
  @IsOptional() @IsString() @MaxLength(500) observacao?: string;
}

export class EditarPedidoDto {
  @IsOptional() @IsDateString() dataTurma?: string | null;
  @IsOptional() @IsDateString() expiraEm?: string | null;
  @IsOptional() @IsString() @MaxLength(500) observacao?: string;
}

const digitos = () => Transform(({ value }) => (typeof value === 'string' ? value.replace(/\D/g, '') : value));
const email = () => Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value));

export class NovaAlunaDto {
  @IsString() @IsNotEmpty() @MaxLength(120) nome: string;
  @email() @IsEmail({}, { message: 'E-mail inválido.' }) email: string;
  @digitos() @Matches(/^\d{10,13}$/, { message: 'WhatsApp inválido.' }) whatsapp: string;
  /** Sem senha: a API gera um link para a aluna criar a dela. */
  @IsOptional() @IsString() @MinLength(8) senha?: string;
}

/** A instrutora cadastra o acesso direto (quem fechou tudo pelo WhatsApp). */
export class AcessoManualDto {
  @IsMongoId() productId: string;
  /** Aluna existente... */
  @IsOptional() @IsMongoId() userId?: string;
  /** ...ou uma nova. */
  @IsOptional() @ValidateNested() @Type(() => NovaAlunaDto) aluna?: NovaAlunaDto;
  @IsOptional() @IsDateString() dataTurma?: string;
  @IsOptional() @IsDateString() expiraEm?: string;
}
