import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export const STATUS = ['pendente', 'ativa', 'cancelada'] as const;
export type Status = (typeof STATUS)[number];

/** Pedido de inscrição e, depois de liberado, o acesso da aluna ao produto. */
@Schema({ collection: 'enrollments', timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' } })
export class Enrollment {
  /** Data do pedido; volta a ser "agora" quando um pedido cancelado é refeito. */
  @Prop({ default: () => new Date() }) solicitadaEm: Date;
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true }) userId: Types.ObjectId;
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Product', required: true }) productId: Types.ObjectId;
  @Prop({ type: String, required: true, enum: STATUS, default: 'pendente' }) status: Status;
  @Prop() liberadaEm?: Date;
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' }) liberadaPor?: Types.ObjectId;
  @Prop() canceladaEm?: Date;
  @Prop() expiraEm?: Date;
  /** Curso presencial: data da turma, preenchida pela instrutora. */
  @Prop() dataTurma?: Date;
  /** Recado da aluna no pedido ou anotação da instrutora. */
  @Prop() observacao?: string;
}
export type EnrollmentDoc = HydratedDocument<Enrollment>;
export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);
EnrollmentSchema.index({ userId: 1, productId: 1 }, { unique: true });
EnrollmentSchema.index({ status: 1, solicitadaEm: -1 });
