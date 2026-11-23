import { PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize, IsArray, IsBoolean, IsIn, IsInt, IsMongoId, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, Min,
} from 'class-validator';
import { CATEGORIAS, FORMATOS, TIPOS } from './product.schema';

const trim = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

export class CriarProdutoDto {
  @IsIn(TIPOS) tipo: (typeof TIPOS)[number];
  @trim() @IsString() @IsNotEmpty() @MaxLength(160) titulo: string;
  /** Gerado a partir do título se vier vazio. */
  @IsOptional() @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'Slug só com letras minúsculas, números e hífens.' }) slug?: string;
  @IsOptional() @IsString() @MaxLength(400) resumo?: string;
  @IsOptional() @IsString() @MaxLength(20000) descricao?: string;
  @IsOptional() @IsString() capa?: string;
  @IsIn(CATEGORIAS) categoria: (typeof CATEGORIAS)[number];
  /** Centavos. */
  @Type(() => Number) @IsInt() @Min(0) preco: number;
  /** Centavos. Opcional; null apaga. Maior que o preço → mostra desconto. */
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) precoOriginal?: number | null;
  @IsOptional() @IsString() @MaxLength(120) condicoes?: string;
  @IsOptional() @IsBoolean() publicado?: boolean;
  @IsOptional() @IsInt() ordem?: number;

  @IsOptional() @IsIn(FORMATOS) formato?: (typeof FORMATOS)[number];
  @IsOptional() @IsString() @MaxLength(60) cargaHoraria?: string;
  @IsOptional() @IsString() @MaxLength(60) nivel?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(100) @IsString({ each: true }) conteudo?: string[];
  @IsOptional() @IsString() @MaxLength(200) local?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(100) @IsString({ each: true }) kit?: string[];
  /** Chave devolvida por POST /admin/uploads. */
  @IsOptional() @IsString() arquivo?: string | null;
  @IsOptional() @IsInt() @Min(1) paginas?: number;
  @IsOptional() @IsArray() @IsMongoId({ each: true }) itens?: string[];
}

export class EditarProdutoDto extends PartialType(CriarProdutoDto) {}

export class FiltroProdutosDto {
  @IsOptional() @IsIn(TIPOS) tipo?: string;
  @IsOptional() @IsIn(FORMATOS) formato?: string;
  @IsOptional() @IsIn(CATEGORIAS) categoria?: string;
}
