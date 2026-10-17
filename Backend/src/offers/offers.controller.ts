import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OffersService } from './offers.service';

@ApiTags('Offers & Discounts Management')
@Controller('api/offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @ApiOperation({ summary: 'Get all active offers and discount presets' })
  @Get()
  async findAll() {
    const data = await this.offersService.findAll();
    return { success: true, count: data.length, data };
  }

  @ApiOperation({ summary: 'Get single offer details by ID' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.offersService.findOne(id);
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Create new custom offer percentage' })
  @Post()
  async create(@Body() body: any) {
    const data = await this.offersService.create(body);
    return { success: true, message: 'Offer created successfully', data };
  }

  @ApiOperation({ summary: 'Update offer by ID' })
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const data = await this.offersService.update(id, body);
    return { success: true, message: 'Offer updated successfully', data };
  }

  @ApiOperation({ summary: 'Delete offer by ID' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.offersService.remove(id);
  }
}
