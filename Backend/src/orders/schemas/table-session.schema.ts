import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TableSessionDocument = TableSession & Document;

export enum TableSessionStatus {
  OPEN = 'OPEN',
  BILL_REQUESTED = 'BILL_REQUESTED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  CLOSED = 'CLOSED',
}

@Schema({ timestamps: true })
export class TableSession {
  @Prop({ required: true })
  tableNumber: string;

  @Prop({ required: false })
  branchId: string;

  @Prop({ required: true, unique: true })
  sessionToken: string;

  @Prop({ required: true, enum: TableSessionStatus, default: TableSessionStatus.OPEN })
  status: TableSessionStatus;

  @Prop({ required: false, type: [{ type: Types.ObjectId, ref: 'Order' }], default: [] })
  orderIds: Types.ObjectId[];

  @Prop({ required: false, default: 0 })
  totalAmount: number;

  @Prop({ required: false, default: 'PENDING' })
  paymentStatus: string;

  @Prop({ required: false })
  closedAt: Date;
}

export const TableSessionSchema = SchemaFactory.createForClass(TableSession);
