import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item, ItemDocument } from './schemas/item.schema';
import { CreateItemDto } from './dto/create-item.dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
  ) {}

  async create(createItemDto: CreateItemDto, imageFilename: string): Promise<Item> {
    const newItem = new this.itemModel({
      ...createItemDto,
      price: Number(createItemDto.price),
      image: imageFilename,
    });
    return newItem.save();
  }

  async findAll(category?: string): Promise<Item[]> {
    if (category && category !== 'All' && category !== 'Select') {
      return this.itemModel.find({ category }).exec();
    }
    return this.itemModel.find().exec();
  }

  async findCategories(): Promise<string[]> {
    const categories = await this.itemModel.distinct('category').exec();
    const defaultCategories = [
      'Cake Item',
      'Snakes Item',
      'Deserts Item',
      'Salad Item',
      'Pure Veg',
      'Pasta Item',
      'Cookies Item',
      'Sweet Items',
    ];
    // Combine existing unique categories with default ones
    const combined = Array.from(new Set([...defaultCategories, ...categories]));
    return combined;
  }

  async findOne(id: string): Promise<Item> {
    const item = await this.itemModel.findById(id).exec();
    if (!item) {
      throw new NotFoundException(`Item with ID "${id}" not found`);
    }
    return item;
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const deleted = await this.itemModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Item with ID "${id}" not found`);
    }
    return { success: true, message: 'Item removed successfully' };
  }
}
