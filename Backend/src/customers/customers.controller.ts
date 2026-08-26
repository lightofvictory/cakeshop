import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/create-customer.dto';

@ApiTags('Customers')
@Controller('api/customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all customers with aggregate metrics' })
  async findAll() {
    return this.customersService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new customer manually' })
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    const data = await this.customersService.create(createCustomerDto);
    return { success: true, data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update customer profile or VIP status' })
  async update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    const data = await this.customersService.update(id, updateCustomerDto);
    return { success: true, data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete customer record' })
  async remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}
