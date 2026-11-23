import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsIn, IsInt, IsMongoId, IsNotEmpty, IsOptional, IsString, MaxLength, Min, ValidateNested } from 'class-validator';
import { PROVEDORES } from './content.schema';

export class CriarModuloDto {
  @IsString() @IsNotEmpty() @MaxLength(160) titulo: string;
  @IsOptional() @IsInt() ordem?: number;
}
export class EditarModuloDto extends PartialType(CriarModuloDto) {}

export class MaterialDto {
  @IsString() @IsNotEmpty() @MaxLength(160) nome: string;
  /** Chave devolvida por POST /admin/uploads. */
  @IsString() @IsNotEmpty() arquivo: string;
}

export class CriarAulaDto {
  @IsString() @IsNotEmpty() @MaxLength(160) titulo: string;
  @IsOptional() @IsString() @MaxLength(5000) descricao?: string;
  @IsOptional() @IsIn(PROVEDORES) videoProvider?: (typeof PROVEDORES)[number];
  @IsOptional() @IsString() @MaxLength(200) videoId?: string;
  /** Segundos. */
  @IsOptional() @IsInt() @Min(0) duracao?: number;
  @IsOptional() @IsArray() @ArrayMaxSize(30) @ValidateNested({ each: true }) @Type(() => MaterialDto) materiais?: MaterialDto[];
  @IsOptional() @IsInt() ordem?: number;
  @IsOptional() @IsBoolean() aulaGratis?: boolean;
}
export class EditarAulaDto extends PartialType(CriarAulaDto) {
  /** Move a aula para outro módulo do mesmo curso. */
  @IsOptional() @IsMongoId() moduleId?: string;
}

export class OrdemDto {
  /** Ids na ordem desejada. */
  @IsArray() @IsMongoId({ each: true }) ids: string[];
}
