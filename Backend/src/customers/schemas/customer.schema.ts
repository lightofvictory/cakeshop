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

  @Prop({ default: Date.now })
  lastOrderAt: Date;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
