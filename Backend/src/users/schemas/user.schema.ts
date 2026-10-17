import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ minimize: false, timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false, default: '' })
  email: string;

  @Prop({ required: false, default: '' })
  password: string;

  @Prop({ type: Object, default: {} })
  cartData: Record<string, any>;

  @Prop({ default: 'user' })
  role: string;

  @Prop({ default: '' })
  phone: string;

  @Prop({ default: '' })
  phoneNumber: string;

  @Prop({ default: false })
  phone_verified: boolean;

  @Prop({ default: false })
  phoneVerified: boolean;

  @Prop({ default: null })
  phoneVerifiedAt: Date;

  @Prop({ default: '' })
  firebaseUid: string;

  @Prop({ default: 'ACTIVE' })
  status: string;

  @Prop({ default: '' })
  avatar: string;

  @Prop({ default: '' })
  bio: string;

  @Prop({ default: 'delivery' })
  preferredFulfillment: string;

  @Prop({ default: 'WHATSAPP_SMS' })
  orderUpdateChannel: string;

  @Prop({ default: 'GMAIL_EMAIL' })
  receiptChannel: string;

  @Prop({ default: 'WHATSAPP_SMS' })
  receiveReceiptType: string;

  @Prop({ default: false })
  isPreferenceConfigured: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
