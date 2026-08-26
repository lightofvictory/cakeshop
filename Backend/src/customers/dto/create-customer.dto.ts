import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Priya Sharma' })
  name: string;

  @ApiProperty({ example: '+919123456789' })
  phone: string;

  @ApiPropertyOptional({ example: 'priya@gmail.com' })
  email?: string;

  @ApiPropertyOptional({ example: 'Flat 402, Sunshine Apartments' })
  address?: string;

  @ApiPropertyOptional({ example: 'Mumbai' })
  city?: string;

  @ApiPropertyOptional({ example: '400001' })
  pincode?: string;

  @ApiPropertyOptional({ example: false })
  vipStatus?: boolean;

  @ApiPropertyOptional({ example: 'Prefers eggless cakes' })
  notes?: string;
}

export class UpdateCustomerDto {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  address?: string;

  @ApiPropertyOptional()
  city?: string;

  @ApiPropertyOptional()
  pincode?: string;

  @ApiPropertyOptional()
  vipStatus?: boolean;

  @ApiPropertyOptional()
  notes?: string;
}
