import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/** Contato deixado na landing (quem ainda não se inscreveu). */
@Schema({ collection: 'leads', timestamps: { createdAt: 'criadoEm', updatedAt: false } })
export class Lead {
  @Prop({ required: true, trim: true }) nome: string;
  @Prop({ required: true, trim: true }) whatsapp: string;
  @Prop({ trim: true }) interesse?: string;
  @Prop({ trim: true }) origem?: string;
  @Prop({ default: false }) atendido: boolean;
  criadoEm: Date;
}
export type LeadDoc = HydratedDocument<Lead>;
export const LeadSchema = SchemaFactory.createForClass(Lead);
LeadSchema.index({ criadoEm: -1 });
