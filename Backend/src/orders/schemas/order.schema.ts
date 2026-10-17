import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

export enum OrderType {
  DELIVERY = 'DELIVERY',
  PICKUP = 'PICKUP',
  DINE_IN = 'DINE_IN',
  TAKEAWAY = 'TAKEAWAY',
}

export enum OrderSource {
  ECOMMERCE = 'ECOMMERCE',
  KIOSK = 'KIOSK',
  QR_ORDER = 'QR_ORDER',
  ADMIN = 'ADMIN',
  POS = 'POS',
}

export enum FulfillmentType {
  DELIVERY = 'DELIVERY',
  PICKUP = 'PICKUP',
  DINE_IN = 'DINE_IN',
  TAKEAWAY = 'TAKEAWAY',
}

export enum OverallOrderStatus {
  DRAFT = 'DRAFT',
  PLACED = 'PLACED',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

export enum PaymentStatusEnum {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum KitchenStatus {
  NOT_SENT = 'NOT_SENT',
  KOT_CREATED = 'KOT_CREATED',
  ACCEPTED = 'ACCEPTED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  ON_HOLD = 'ON_HOLD',
}

export enum FulfillmentStatus {
  PENDING = 'PENDING',
  READY_FOR_DISPATCH = 'READY_FOR_DISPATCH',
  RIDER_ASSIGNED = 'RIDER_ASSIGNED',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  CUSTOMER_ARRIVED = 'CUSTOMER_ARRIVED',
  PICKED_UP = 'PICKED_UP',
  READY_TO_SERVE = 'READY_TO_SERVE',
  SERVED = 'SERVED',
}

export enum OrderStatus {
  // Legacy Common Initial & Termination Statuses
  ORDER_PLACED = 'ORDER_PLACED',
  NEW = 'NEW',
  CONFIRMED = 'CONFIRMED',
  ACCEPTED = 'ACCEPTED',
  PREPARING = 'PREPARING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',

  // Delivery Flow Specific Statuses
  READY_FOR_DISPATCH = 'READY_FOR_DISPATCH',
  DRIVER_ASSIGNED = 'DRIVER_ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',

  // Dine-In Flow Specific Statuses
  READY = 'READY',
  SERVED = 'SERVED',
  BILL_REQUESTED = 'BILL_REQUESTED',
  PAYMENT_COMPLETED = 'PAYMENT_COMPLETED',

  // Pick-Up Flow Specific Statuses
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  CUSTOMER_ARRIVED = 'CUSTOMER_ARRIVED',
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
export class DeliveryPartnerInfo {
  @Prop({ required: false })
  name: string;

  @Prop({ required: false })
  phone: string;

  @Prop({ required: false })
  trackingUrl: string;
}

@Schema({ timestamps: true })
export class StatusHistoryLog {
  @Prop({ required: true })
  status: string;

  @Prop({ required: true, default: Date.now })
  timestamp: Date;

  @Prop({ required: false })
  note: string;

  @Prop({ required: false })
  subsystem?: string;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true })
  orderNumber: string;

  @Prop({ required: true, type: CustomerInfo })
  customer: CustomerInfo;

  @Prop({ required: true, type: [OrderItem] })
  items: OrderItem[];

  @Prop({ required: false, enum: OrderSource, default: OrderSource.ECOMMERCE })
  orderSource: OrderSource;

  @Prop({ required: false, enum: FulfillmentType, default: FulfillmentType.DELIVERY })
  fulfillmentType: FulfillmentType;

  @Prop({ required: true, enum: OrderType, default: OrderType.DELIVERY })
  orderType: OrderType;

  // Primary Overall Order Status
  @Prop({ required: false, enum: OverallOrderStatus, default: OverallOrderStatus.PLACED })
  orderStatus: OverallOrderStatus;

  // Legacy status property kept for backward compatibility
  @Prop({ required: true, default: OrderStatus.ORDER_PLACED })
  status: string;

  // Kitchen Status
  @Prop({ required: false, enum: KitchenStatus, default: KitchenStatus.NOT_SENT })
  kitchenStatus: KitchenStatus;

  // Fulfillment Status
  @Prop({ required: false, enum: FulfillmentStatus, default: FulfillmentStatus.PENDING })
  fulfillmentStatus: FulfillmentStatus;

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

  @Prop({ required: false })
  tableNumber: string;

  @Prop({ required: false })
  tableSessionId: string;

  @Prop({ required: false })
  guestCount: number;

  @Prop({ required: false })
  pickupBranch: string;

  @Prop({ required: false })
  pickupDate: string;

  @Prop({ required: false })
  pickupTime: string;

  @Prop({ required: false, type: DeliveryPartnerInfo })
  deliveryPartner: DeliveryPartnerInfo;

  @Prop({ required: false, default: 'WHATSAPP_SMS' })
  orderUpdateChannel: string;

  @Prop({ required: false, default: 'WHATSAPP' })
  receiptChannel: string;

  @Prop({ required: false, type: [StatusHistoryLog], default: [] })
  statusHistory: StatusHistoryLog[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);
