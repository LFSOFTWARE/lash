import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

const trim = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));
const email = () => Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value));
/** Guarda só os dígitos; aceita "(11) 94769-2668". */
const digitos = () => Transform(({ value }) => (typeof value === 'string' ? value.replace(/\D/g, '') : value));

export class CadastroDto {
  @trim() @IsString() @IsNotEmpty() @MaxLength(120) nome: string;
  @email() @IsEmail({}, { message: 'E-mail inválido.' }) email: string;
  @digitos() @Matches(/^\d{10,13}$/, { message: 'WhatsApp inválido.' }) whatsapp: string;
  @IsString() @MinLength(8, { message: 'A senha precisa de pelo menos 8 caracteres.' }) @MaxLength(128) senha: string;
}

export class LoginDto {
  @email() @IsEmail({}, { message: 'E-mail inválido.' }) email: string;
  @IsString() @IsNotEmpty() senha: string;
}

export class EsqueciSenhaDto {
  @email() @IsEmail({}, { message: 'E-mail inválido.' }) email: string;
}

export class RedefinirSenhaDto {
  @IsString() @IsNotEmpty() token: string;
  @IsString() @MinLength(8, { message: 'A senha precisa de pelo menos 8 caracteres.' }) @MaxLength(128) senha: string;
}
