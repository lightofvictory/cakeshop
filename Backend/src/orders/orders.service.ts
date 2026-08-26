import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/create-order.dto';
import { CustomersService } from '../customers/customers.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private customersService: CustomersService,
  ) {}

  private generateOrderNumber(): string {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `#MP${randomNum}`;
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const orderNumber = this.generateOrderNumber();
    const totalAmount = createOrderDto.total + (createOrderDto.orderType === 'DELIVERY' ? 40 : 0);

    const newOrder = new this.orderModel({
      ...createOrderDto,
      orderNumber,
      status: OrderStatus.NEW,
      subtotal: createOrderDto.total,
      deliveryFee: createOrderDto.orderType === 'DELIVERY' ? 40 : 0,
      total: totalAmount,
    });

    const savedOrder = await newOrder.save();

    // Automatically create or update Customer record in database
    if (createOrderDto.customer) {
      try {
        await this.customersService.upsertFromOrder(createOrderDto.customer, totalAmount);
      } catch (err) {
        console.error('Failed to auto-upsert customer profile:', err);
      }
    }

    return savedOrder;
  }

  async findAll(status?: string, orderType?: string): Promise<Order[]> {
    const query: any = {};
    if (status && status !== 'ALL') {
      query.status = status;
    }
    if (orderType && orderType !== 'ALL') {
      query.orderType = orderType;
    }
    return this.orderModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }
    return order;
  }

  async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const { status, rejectionReason } = updateOrderStatusDto;
    const updateData: any = { status };
    if (rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const updated = await this.orderModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    if (!updated) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }
    return updated;
  }

  async getDashboardStats() {
    const allOrders = await this.orderModel.find().exec();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = allOrders.filter(
      (o: any) => new Date(o.createdAt).getTime() >= today.getTime(),
    );

    const todayRevenue = todayOrders
      .filter((o) => o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.REJECTED)
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const counts = {
      new: allOrders.filter((o) => o.status === OrderStatus.NEW).length,
      accepted: allOrders.filter((o) => o.status === OrderStatus.ACCEPTED).length,
      preparing: allOrders.filter((o) => o.status === OrderStatus.PREPARING).length,
      ready: allOrders.filter((o) => o.status === OrderStatus.READY).length,
      outForDelivery: allOrders.filter((o) => o.status === OrderStatus.OUT_FOR_DELIVERY).length,
      completed: allOrders.filter((o) => o.status === OrderStatus.COMPLETED).length,
      cancelled: allOrders.filter((o) => o.status === OrderStatus.CANCELLED || o.status === OrderStatus.REJECTED).length,
      totalOrders: allOrders.length,
      todayOrdersCount: todayOrders.length,
      todayRevenue,
    };

    return { success: true, stats: counts };
  }
}
