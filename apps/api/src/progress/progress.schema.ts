import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

@Schema({ collection: 'progress', timestamps: { createdAt: false, updatedAt: 'atualizadoEm' } })
export class Progresso {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true }) userId: Types.ObjectId;
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Aula', required: true }) lessonId: Types.ObjectId;
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Product', required: true }) courseId: Types.ObjectId;
  @Prop({ default: false }) concluida: boolean;
  @Prop({ default: 0, min: 0 }) ultimoSegundo: number;
  atualizadoEm: Date;
}
export type ProgressoDoc = HydratedDocument<Progresso>;
export const ProgressoSchema = SchemaFactory.createForClass(Progresso);
ProgressoSchema.index({ userId: 1, lessonId: 1 }, { unique: true });
ProgressoSchema.index({ userId: 1, courseId: 1 });
