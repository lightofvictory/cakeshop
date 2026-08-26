import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
  ) {}

  async upsertFromOrder(customerData: any, orderTotal: number): Promise<Customer> {
    if (!customerData || !customerData.phone) return null;

    const phone = customerData.phone.trim();
    const existing = await this.customerModel.findOne({ phone }).exec();

    if (existing) {
      existing.name = customerData.name || existing.name;
      existing.email = customerData.email || existing.email;
      existing.address = customerData.address || existing.address;
      existing.city = customerData.city || existing.city;
      existing.pincode = customerData.pincode || existing.pincode;
      existing.totalOrders += 1;
      existing.totalSpent += orderTotal;
      existing.lastOrderAt = new Date();
      return existing.save();
    } else {
      const newCust = new this.customerModel({
        name: customerData.name || 'Guest Customer',
        phone,
        email: customerData.email || '',
        address: customerData.address || '',
        city: customerData.city || '',
        pincode: customerData.pincode || '',
        totalOrders: 1,
        totalSpent: orderTotal,
        lastOrderAt: new Date(),
      });
      return newCust.save();
    }
  }

  async findAll(): Promise<{ success: boolean; data: Customer[]; stats: any }> {
    const customers = await this.customerModel.find().sort({ lastOrderAt: -1 }).exec();

    const stats = {
      totalCustomers: customers.length,
      vipCount: customers.filter((c) => c.vipStatus).length,
      totalSpentAll: customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0),
      avgSpentPerCust: customers.length
        ? Math.round(customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0) / customers.length)
        : 0,
    };

    return { success: true, data: customers, stats };
  }

  async create(dto: CreateCustomerDto): Promise<Customer> {
    const newCust = new this.customerModel(dto);
    return newCust.save();
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    const updated = await this.customerModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!updated) {
      throw new NotFoundException(`Customer with ID "${id}" not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const res = await this.customerModel.findByIdAndDelete(id).exec();
    if (!res) {
      throw new NotFoundException(`Customer with ID "${id}" not found`);
    }
    return { success: true };
  }
}
