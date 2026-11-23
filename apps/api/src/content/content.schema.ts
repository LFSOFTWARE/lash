import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

/** Módulo de um curso online. */
@Schema({ collection: 'modules', timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' } })
export class Modulo {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Product', required: true, index: true }) courseId: Types.ObjectId;
  @Prop({ required: true, trim: true }) titulo: string;
  @Prop({ default: 0 }) ordem: number;
}
export type ModuloDoc = HydratedDocument<Modulo>;
export const ModuloSchema = SchemaFactory.createForClass(Modulo);

export const PROVEDORES = ['bunny', 'vimeo', 'youtube'] as const;

@Schema({ _id: false })
export class Material {
  @Prop({ required: true }) nome: string;
  /** Chave no armazenamento. */
  @Prop({ required: true }) arquivo: string;
}
const MaterialSchema = SchemaFactory.createForClass(Material);

@Schema({ collection: 'lessons', timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' } })
export class Aula {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Modulo', required: true, index: true }) moduleId: Types.ObjectId;
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Product', required: true, index: true }) courseId: Types.ObjectId;
  @Prop({ required: true, trim: true }) titulo: string;
  @Prop({ default: '' }) descricao: string;
  @Prop({ type: String, enum: PROVEDORES }) videoProvider?: (typeof PROVEDORES)[number];
  /** Nunca sai nas rotas públicas: o player só é entregue a quem tem acesso. */
  @Prop() videoId?: string;
  /** Duração em segundos. */
  @Prop({ default: 0 }) duracao: number;
  @Prop({ type: [MaterialSchema], default: [] }) materiais: Material[];
  @Prop({ default: 0 }) ordem: number;
  @Prop({ default: false }) aulaGratis: boolean;
}
export type AulaDoc = HydratedDocument<Aula>;
export const AulaSchema = SchemaFactory.createForClass(Aula);
