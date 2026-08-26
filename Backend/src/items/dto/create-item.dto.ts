import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

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

  @ApiProperty({ example: 'Cake Item', description: 'Category (Cake Item, Snakes Item, Deserts Item, etc.)' })
  @IsString()
  @IsNotEmpty()
  category: string;
}
