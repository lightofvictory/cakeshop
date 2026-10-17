import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OtpDocument = Otp & Document;

@Schema({ timestamps: true })
export class Otp {
  @Prop({ required: true })
  phone: string;

  @Prop({ default: '' })
  email: string;

  @Prop({ required: true })
  otp_hash: string;

  @Prop({ required: true, enum: ['REGISTER', 'LOGIN', 'RESET_PASSWORD', 'AUTH'], default: 'AUTH' })
  purpose: string;

  @Prop({ required: true })
  expires_at: Date;

  @Prop({ default: 0 })
  attempts: number;

  @Prop({ default: false })
  is_used: boolean;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
