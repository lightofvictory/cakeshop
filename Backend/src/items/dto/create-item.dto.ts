import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateItemDto {
  @ApiProperty({ example: 'Royal Chocolate Truffle Cake', description: 'Name of the cake or snack item' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Rich cocoa sponge layered with dark ganache', description: 'Detailed description of the item' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 699, description: 'Price in INR' })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ example: 20, description: 'Offer percentage (e.g. 10, 20, 25)', required: false })
  @IsOptional()
  offerPercentage?: number;

  @ApiProperty({ example: 'Cake Item', description: 'Category (Cake Item, Snakes Item, Deserts Item, etc.)' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: '6a93b08a0be7885f740c9a6d', description: 'Category ID', required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ example: 'SKU-TRUFFLE-101', description: 'Unique Stock Keeping Unit (SKU) ID', required: false })
  @IsOptional()
  @IsString()
  sku?: string;
}
