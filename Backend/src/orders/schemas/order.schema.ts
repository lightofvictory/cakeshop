import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

export enum OrderType {
  DELIVERY = 'DELIVERY',
  PICKUP = 'PICKUP',
  DINE_IN = 'DINE_IN',
}

export enum OrderStatus {
  NEW = 'NEW',
  ACCEPTED = 'ACCEPTED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

@Schema({ timestamps: true })
export class OrderItem {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, default: 1 })
  quantity: number;

  @Prop({ required: false })
  image: string;

  @Prop({ required: false })
  weight: string;

  @Prop({ required: false })
  customMessage: string;
}

@Schema({ timestamps: true })
export class CustomerInfo {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: false })
  email: string;

  @Prop({ required: false })
  address: string;

  @Prop({ required: false })
  city: string;

  @Prop({ required: false })
  pincode: string;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true })
  orderNumber: string;

  @Prop({ required: true, type: CustomerInfo })
  customer: CustomerInfo;

  @Prop({ required: true, type: [OrderItem] })
  items: OrderItem[];

  @Prop({ required: true, enum: OrderType, default: OrderType.DELIVERY })
  orderType: OrderType;

  @Prop({ required: true, enum: OrderStatus, default: OrderStatus.NEW })
  status: OrderStatus;

  @Prop({ required: true, default: 'COD' })
  paymentMethod: string;

  @Prop({ required: true, default: 'PENDING' })
  paymentStatus: string;

  @Prop({ required: true, default: 0 })
  subtotal: number;

  @Prop({ required: true, default: 0 })
  deliveryFee: number;

  @Prop({ required: true, default: 0 })
  discount: number;

  @Prop({ required: true, default: 0 })
  total: number;

  @Prop({ required: false })
  notes: string;

  @Prop({ required: false })
  rejectionReason: string;

  @Prop({ required: false })
  scheduledTime: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
