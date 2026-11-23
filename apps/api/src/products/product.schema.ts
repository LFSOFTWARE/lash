import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { desconto } from '../common/util';

export const TIPOS = ['curso', 'apostila', 'planilha', 'combo'] as const;
export const FORMATOS = ['presencial', 'online'] as const;
export const CATEGORIAS = ['cilios', 'sobrancelhas'] as const;
export type Tipo = (typeof TIPOS)[number];
export type Formato = (typeof FORMATOS)[number];

/** Tudo o que está à venda: cursos (presenciais e online), apostilas, planilhas e combos. Preços em centavos. */
@Schema({ collection: 'products', timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' } })
export class Product {
  @Prop({ type: String, required: true, enum: TIPOS }) tipo: Tipo;
  @Prop({ required: true, trim: true }) titulo: string;
  @Prop({ required: true, unique: true, lowercase: true, trim: true }) slug: string;
  @Prop({ default: '' }) resumo: string;
  @Prop({ default: '' }) descricao: string;
  @Prop() capa?: string;
  @Prop({ type: String, required: true, enum: CATEGORIAS }) categoria: (typeof CATEGORIAS)[number];
  /** Preço atual, em centavos (só exibição; o pagamento é no WhatsApp). */
  @Prop({ required: true, min: 0 }) preco: number;
  /** Preço "de" (opcional). Maior que o preço → o site mostra o desconto. */
  @Prop({ min: 0 }) precoOriginal?: number;
  /** Texto livre de parcelamento, ex.: "ou 12x no cartão". */
  @Prop() condicoes?: string;
  @Prop({ default: false }) publicado: boolean;
  @Prop({ default: 0 }) ordem: number;

  // Curso
  @Prop({ type: String, enum: FORMATOS }) formato?: Formato;
  @Prop() cargaHoraria?: string;
  @Prop() nivel?: string;
  /** Tópicos do programa (presencial e online). */
  @Prop({ type: [String], default: [] }) conteudo: string[];
  // Presencial
  @Prop() local?: string;
  @Prop({ type: [String], default: [] }) kit: string[];
  // Apostila / planilha
  /** Chave do arquivo no armazenamento (nunca é exposta; o download sai por link assinado). */
  @Prop() arquivo?: string;
  @Prop() paginas?: number;
  // Combo
  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'Product' }], default: [] }) itens: Types.ObjectId[];
}

export type ProductDoc = HydratedDocument<Product>;
export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ publicado: 1, tipo: 1, ordem: 1 });

/** Forma pública do produto: sem a chave do arquivo, com o desconto calculado. */
export function publicProduct(p: ProductDoc | (Product & { _id: unknown }), admin = false) {
  const o = 'toObject' in p ? (p as ProductDoc).toObject() : p;
  const { _id, __v, arquivo, ...resto } = o as Product & { _id: unknown; __v?: number };
  return {
    id: String(_id),
    ...resto,
    itens: (resto.itens ?? []).map(String),
    desconto: desconto(o.preco, o.precoOriginal),
    temArquivo: Boolean(arquivo),
    ...(admin ? { arquivo } : {}),
  };
}
