import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  UpdateKitchenStatusDto,
  UpdateFulfillmentStatusDto,
  UpdatePaymentStatusDto,
} from './dto/create-order.dto';

@ApiTags('Orders & Business Management')
@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Get dashboard KPI metrics & order stats' })
  @Get('stats')
  async getStats() {
    return this.ordersService.getDashboardStats();
  }

  @ApiOperation({ summary: 'Get all orders or filter by status, orderType, & source' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'orderType', required: false })
  @ApiQuery({ name: 'source', required: false })
  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('orderType') orderType?: string,
    @Query('source') source?: string,
  ) {
    const data = await this.ordersService.findAll(status, orderType, source);
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

  @ApiOperation({ summary: 'Update overall order status' })
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    const data = await this.ordersService.updateStatus(id, updateOrderStatusDto);
    return { success: true, message: `Order status updated to ${data.status}`, data };
  }

  @ApiOperation({ summary: 'Update Kitchen / KOT Status (NOT_SENT -> KOT_CREATED -> PREPARING -> READY)' })
  @Patch(':id/kitchen-status')
  async updateKitchenStatus(
    @Param('id') id: string,
    @Body() dto: UpdateKitchenStatusDto,
  ) {
    const data = await this.ordersService.updateKitchenStatus(id, dto);
    return { success: true, message: `Kitchen status updated to ${data.kitchenStatus}`, data };
  }

  @ApiOperation({ summary: 'Update Fulfillment Status (OUT_FOR_DELIVERY, DELIVERED, PICKED_UP, SERVED)' })
  @Patch(':id/fulfillment-status')
  async updateFulfillmentStatus(
    @Param('id') id: string,
    @Body() dto: UpdateFulfillmentStatusDto,
  ) {
    const data = await this.ordersService.updateFulfillmentStatus(id, dto);
    return { success: true, message: `Fulfillment status updated to ${data.fulfillmentStatus}`, data };
  }

  @ApiOperation({ summary: 'Update Payment Status (PENDING -> PAID / REFUNDED)' })
  @Patch(':id/payment-status')
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentStatusDto,
  ) {
    const data = await this.ordersService.updatePaymentStatus(id, dto);
    return { success: true, message: `Payment status updated to ${data.paymentStatus}`, data };
  }
}

