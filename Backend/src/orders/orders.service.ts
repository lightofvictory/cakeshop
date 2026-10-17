import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Order,
  OrderDocument,
  OrderStatus,
  OrderSource,
  FulfillmentType,
  OverallOrderStatus,
  PaymentStatusEnum,
  KitchenStatus,
  FulfillmentStatus,
} from './schemas/order.schema';
import { TableSession, TableSessionDocument } from './schemas/table-session.schema';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  UpdateKitchenStatusDto,
  UpdateFulfillmentStatusDto,
  UpdatePaymentStatusDto,
} from './dto/create-order.dto';
import { CustomersService } from '../customers/customers.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(TableSession.name) private tableSessionModel: Model<TableSessionDocument>,
    private customersService: CustomersService,
  ) {}

  private generateOrderNumber(): string {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `#MP${randomNum}`;
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const orderNumber = this.generateOrderNumber();
    const fulfillmentType = createOrderDto.fulfillmentType || (createOrderDto.orderType as any) || FulfillmentType.DELIVERY;
    const orderSource = createOrderDto.orderSource || OrderSource.ECOMMERCE;
    
    const deliveryFee = fulfillmentType === FulfillmentType.DELIVERY ? 40 : 0;
    const totalAmount = createOrderDto.total + deliveryFee;

    const initialStatus = OrderStatus.ORDER_PLACED;
    const initialStatusLog = [{
      status: initialStatus,
      timestamp: new Date(),
      note: `Order placed via ${orderSource} (${fulfillmentType})`,
      subsystem: 'SYSTEM',
    }];

    const newOrder = new this.orderModel({
      ...createOrderDto,
      orderNumber,
      orderSource,
      fulfillmentType,
      orderType: fulfillmentType as any,
      orderStatus: OverallOrderStatus.PLACED,
      status: initialStatus,
      kitchenStatus: KitchenStatus.NOT_SENT,
      fulfillmentStatus: FulfillmentStatus.PENDING,
      paymentStatus: createOrderDto.paymentMethod === 'ONLINE' ? PaymentStatusEnum.PENDING : PaymentStatusEnum.PENDING,
      subtotal: createOrderDto.total,
      deliveryFee,
      total: totalAmount,
      statusHistory: initialStatusLog,
    });

    const savedOrder = await newOrder.save();

    // Automatically link to TableSession if QR order or table specified
    if (createOrderDto.tableNumber || createOrderDto.tableSessionId) {
      try {
        const sessionToken = createOrderDto.tableSessionId || `table_${createOrderDto.tableNumber}`;
        await this.tableSessionModel.findOneAndUpdate(
          { sessionToken },
          {
            tableNumber: createOrderDto.tableNumber || '1',
            sessionToken,
            $push: { orderIds: savedOrder._id },
            $inc: { totalAmount: totalAmount },
          },
          { upsert: true, new: true },
        );
      } catch (err) {
        console.error('Failed to link table session:', err);
      }
    }

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

  async findAll(status?: string, orderType?: string, source?: string): Promise<Order[]> {
    const query: any = {};
    if (status && status !== 'ALL') {
      query.$or = [{ status }, { orderStatus: status }];
    }
    if (orderType && orderType !== 'ALL') {
      query.$or = [{ orderType }, { fulfillmentType: orderType }];
    }
    if (source && source !== 'ALL') {
      query.orderSource = source;
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
    const { orderStatus, status, rejectionReason, deliveryPartner, note } = updateOrderStatusDto;
    const targetStatus = status || orderStatus || OverallOrderStatus.CONFIRMED;

    const updateData: any = {
      status: targetStatus,
      orderStatus: orderStatus || targetStatus,
    };
    if (rejectionReason) {
      updateData.rejectionReason = rejectionReason;
      updateData.orderStatus = OverallOrderStatus.REJECTED;
    }
    if (deliveryPartner) {
      updateData.deliveryPartner = deliveryPartner;
    }

    const newLog = {
      status: targetStatus,
      timestamp: new Date(),
      note: note || `Order status updated to ${targetStatus}`,
      subsystem: 'ORDER',
    };

    const updated = await this.orderModel
      .findByIdAndUpdate(
        id,
        {
          $set: updateData,
          $push: { statusHistory: newLog },
        },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }
    return updated;
  }

  async updateKitchenStatus(id: string, dto: UpdateKitchenStatusDto): Promise<Order> {
    const { kitchenStatus, note } = dto;
    const newLog = {
      status: `KITCHEN_${kitchenStatus}`,
      timestamp: new Date(),
      note: note || `Kitchen status updated to ${kitchenStatus}`,
      subsystem: 'KITCHEN',
    };

    const updated = await this.orderModel
      .findByIdAndUpdate(
        id,
        {
          $set: { kitchenStatus },
          $push: { statusHistory: newLog },
        },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }
    return updated;
  }

  async updateFulfillmentStatus(id: string, dto: UpdateFulfillmentStatusDto): Promise<Order> {
    const { fulfillmentStatus, deliveryPartner, note } = dto;
    const updateData: any = { fulfillmentStatus };
    if (deliveryPartner) {
      updateData.deliveryPartner = deliveryPartner;
    }

    const newLog = {
      status: `FULFILLMENT_${fulfillmentStatus}`,
      timestamp: new Date(),
      note: note || `Fulfillment status updated to ${fulfillmentStatus}`,
      subsystem: 'FULFILLMENT',
    };

    const updated = await this.orderModel
      .findByIdAndUpdate(
        id,
        {
          $set: updateData,
          $push: { statusHistory: newLog },
        },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }
    return updated;
  }

  async updatePaymentStatus(id: string, dto: UpdatePaymentStatusDto): Promise<Order> {
    const { paymentStatus, note } = dto;
    const newLog = {
      status: `PAYMENT_${paymentStatus}`,
      timestamp: new Date(),
      note: note || `Payment status updated to ${paymentStatus}`,
      subsystem: 'PAYMENT',
    };

    const updated = await this.orderModel
      .findByIdAndUpdate(
        id,
        {
          $set: { paymentStatus },
          $push: { statusHistory: newLog },
        },
        { new: true },
      )
      .exec();

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
      .filter((o: any) => o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.REJECTED && o.orderStatus !== OverallOrderStatus.CANCELLED)
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const counts = {
      new: allOrders.filter((o: any) => o.status === OrderStatus.NEW || o.orderStatus === OverallOrderStatus.PLACED).length,
      accepted: allOrders.filter((o: any) => o.status === OrderStatus.ACCEPTED || o.orderStatus === OverallOrderStatus.CONFIRMED).length,
      preparing: allOrders.filter((o: any) => o.status === OrderStatus.PREPARING || o.kitchenStatus === KitchenStatus.PREPARING).length,
      ready: allOrders.filter((o: any) => o.status === OrderStatus.READY || o.kitchenStatus === KitchenStatus.READY).length,
      outForDelivery: allOrders.filter((o: any) => o.status === OrderStatus.OUT_FOR_DELIVERY || o.fulfillmentStatus === FulfillmentStatus.OUT_FOR_DELIVERY).length,
      completed: allOrders.filter((o: any) => o.status === OrderStatus.COMPLETED || o.orderStatus === OverallOrderStatus.COMPLETED).length,
      cancelled: allOrders.filter((o: any) => o.status === OrderStatus.CANCELLED || o.orderStatus === OverallOrderStatus.CANCELLED || o.status === OrderStatus.REJECTED).length,
      totalOrders: allOrders.length,
      todayOrdersCount: todayOrders.length,
      todayRevenue,
    };

    return { success: true, stats: counts };
  }
}

