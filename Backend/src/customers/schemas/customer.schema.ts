import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CustomerDocument = Customer & Document;

@Schema({ timestamps: true })
export class Customer {
  @Prop({ default: 'Guest Customer' })
  name: string;

  @Prop({ default: 'N/A' })
  phone: string;

  @Prop({ default: '' })
  email: string;

  @Prop({ default: '' })
  address: string;

  @Prop({ default: '' })
  city: string;

  @Prop({ default: '' })
  pincode: string;

  @Prop({ default: 0 })
  totalOrders: number;

  @Prop({ default: 0 })
  totalSpent: number;

  @Prop({ default: false })
  vipStatus: boolean;

  @Prop({ default: '' })
  notes: string;

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

  @Prop({ default: Date.now })
  lastOrderAt: Date;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
