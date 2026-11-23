import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import type { Papel } from '../common/auth.decorators';

@Schema({ collection: 'users', timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' } })
export class User {
  @Prop({ required: true, trim: true }) nome: string;
  @Prop({ required: true, unique: true, lowercase: true, trim: true }) email: string;
  @Prop({ required: true, trim: true }) whatsapp: string;
  @Prop({ required: true, select: false }) senhaHash: string;
  @Prop({ type: String, required: true, enum: ['aluna', 'admin'], default: 'aluna' }) papel: Papel;
  /** Aumenta no logout e ao trocar a senha: invalida os refresh tokens antigos. */
  @Prop({ default: 0, select: false }) tokenVersao: number;
  @Prop({ select: false }) resetHash?: string;
  @Prop({ select: false }) resetExpira?: Date;
  criadoEm: Date;
}

export type UserDoc = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);

export function publicUser(u: UserDoc | (User & { _id: unknown })) {
  return { id: String(u._id), nome: u.nome, email: u.email, whatsapp: u.whatsapp, papel: u.papel, criadoEm: u.criadoEm };
}
