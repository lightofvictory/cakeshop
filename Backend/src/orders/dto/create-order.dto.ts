import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  OrderStatus,
  OrderType,
  OrderSource,
  FulfillmentType,
  OverallOrderStatus,
  PaymentStatusEnum,
  KitchenStatus,
  FulfillmentStatus,
} from '../schemas/order.schema';

export class OrderItemDto {
  @ApiProperty({ example: 'Birthday Truffle Cake' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 699 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 'cake3.jpg', required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ example: '1 Kg', required: false })
  @IsOptional()
  @IsString()
  weight?: string;

  @ApiProperty({ example: 'Happy Birthday Rahul', required: false })
  @IsOptional()
  @IsString()
  customMessage?: string;
}

export class CustomerInfoDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '+91 9876543210' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'john@example.com', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: 'Flat 402, Sunshine Apartments, MG Road', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'Mumbai', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: '400001', required: false })
  @IsOptional()
  @IsString()
  pincode?: string;
}

export class CreateOrderDto {
  @ApiProperty({ type: CustomerInfoDto })
  @ValidateNested()
  @Type(() => CustomerInfoDto)
  customer: CustomerInfoDto;

  @ApiProperty({ type: [OrderItemDto] })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ enum: OrderSource, example: OrderSource.ECOMMERCE, required: false })
  @IsOptional()
  @IsEnum(OrderSource)
  orderSource?: OrderSource;

  @ApiProperty({ enum: FulfillmentType, example: FulfillmentType.DELIVERY, required: false })
  @IsOptional()
  @IsEnum(FulfillmentType)
  fulfillmentType?: FulfillmentType;

  @ApiProperty({ enum: OrderType, example: OrderType.DELIVERY, required: false })
  @IsOptional()
  @IsEnum(OrderType)
  orderType?: OrderType;

  @ApiProperty({ example: 'COD', required: false })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiProperty({ example: 699 })
  @IsNumber()
  total: number;

  @ApiProperty({ example: 'Please write Happy Birthday Rahul on cake', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: 'Table #12', required: false })
  @IsOptional()
  @IsString()
  tableNumber?: string;

  @ApiProperty({ example: 'ts_981247', required: false })
  @IsOptional()
  @IsString()
  tableSessionId?: string;

  @ApiProperty({ example: 4, required: false })
  @IsOptional()
  @IsNumber()
  guestCount?: number;

  @ApiProperty({ example: 'Flagship Bakery - Downtown', required: false })
  @IsOptional()
  @IsString()
  pickupBranch?: string;

  @ApiProperty({ example: 'Today', required: false })
  @IsOptional()
  @IsString()
  pickupDate?: string;

  @ApiProperty({ example: '10:00 AM - 12:00 PM', required: false })
  @IsOptional()
  @IsString()
  pickupTime?: string;

  @ApiProperty({ example: 'WHATSAPP_SMS', required: false })
  @IsOptional()
  @IsString()
  orderUpdateChannel?: string;

  @ApiProperty({ example: 'WHATSAPP', required: false })
  @IsOptional()
  @IsString()
  receiptChannel?: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OverallOrderStatus, example: OverallOrderStatus.CONFIRMED, required: false })
  @IsOptional()
  @IsString()
  orderStatus?: OverallOrderStatus;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.ACCEPTED, required: false })
  @IsOptional()
  status?: string;

  @ApiProperty({ example: 'Out of stock ingredient', required: false })
  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  deliveryPartner?: { name?: string; phone?: string; trackingUrl?: string };

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateKitchenStatusDto {
  @ApiProperty({ enum: KitchenStatus, example: KitchenStatus.PREPARING })
  @IsEnum(KitchenStatus)
  kitchenStatus: KitchenStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateFulfillmentStatusDto {
  @ApiProperty({ enum: FulfillmentStatus, example: FulfillmentStatus.OUT_FOR_DELIVERY })
  @IsEnum(FulfillmentStatus)
  fulfillmentStatus: FulfillmentStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  deliveryPartner?: { name?: string; phone?: string; trackingUrl?: string };

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdatePaymentStatusDto {
  @ApiProperty({ enum: PaymentStatusEnum, example: PaymentStatusEnum.PAID })
  @IsEnum(PaymentStatusEnum)
  paymentStatus: PaymentStatusEnum;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

