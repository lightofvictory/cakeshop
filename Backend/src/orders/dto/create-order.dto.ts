import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus, OrderType } from '../schemas/order.schema';

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

  @ApiProperty({ enum: OrderType, example: OrderType.DELIVERY })
  @IsEnum(OrderType)
  orderType: OrderType;

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
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus, example: OrderStatus.ACCEPTED })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({ example: 'Out of stock ingredient', required: false })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
