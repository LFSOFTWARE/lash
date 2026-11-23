import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, Min, MinLength } from 'class-validator';

export class ProgressoDto {
  @IsOptional() @IsBoolean() concluida?: boolean;
  /** Posição do vídeo em segundos, para continuar de onde parou. */
  @IsOptional() @IsInt() @Min(0) ultimoSegundo?: number;
}

export class PerfilDto {
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(120) nome?: string;
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.replace(/\D/g, '') : value))
  @Matches(/^\d{10,13}$/, { message: 'WhatsApp inválido.' })
  whatsapp?: string;
}

export class TrocarSenhaDto {
  @IsString() @IsNotEmpty() senhaAtual: string;
  @IsString() @MinLength(8, { message: 'A senha precisa de pelo menos 8 caracteres.' }) @MaxLength(128) senhaNova: string;
}
