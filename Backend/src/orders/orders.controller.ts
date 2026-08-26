import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/create-order.dto';

@ApiTags('Orders & Business Management')
@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Get dashboard KPI metrics & order stats' })
  @Get('stats')
  async getStats() {
    return this.ordersService.getDashboardStats();
  }

  @ApiOperation({ summary: 'Get all orders or filter by status & type' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'orderType', required: false })
  @Get()
  async findAll(@Query('status') status?: string, @Query('orderType') orderType?: string) {
    const data = await this.ordersService.findAll(status, orderType);
    return { success: true, count: data.length, data };
  }

  @ApiOperation({ summary: 'Get order details by ID' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.ordersService.findOne(id);
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Create new customer order' })
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    const data = await this.ordersService.create(createOrderDto);
    return { success: true, message: 'Order placed successfully', data };
  }

  @ApiOperation({ summary: 'Update order lifecycle status (NEW -> ACCEPTED -> PREPARING -> READY -> COMPLETED)' })
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    const data = await this.ordersService.updateStatus(id, updateOrderStatusDto);
    return { success: true, message: `Order status updated to ${data.status}`, data };
  }
}
