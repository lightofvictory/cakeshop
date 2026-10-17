import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Item, ItemDocument } from './schemas/item.schema';
import { CreateItemDto } from './dto/create-item.dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
  ) {}

  // Helper to generate default SKU code
  private generateSku(name: string): string {
    const cleanPrefix = (name || 'ITEM').replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `SKU-${cleanPrefix}-${randomNum}`;
  }

  // Helper to calculate offer pricing for BOTH Percentage & Flat Amount discount types
  private calculateOfferDetails(basePrice: number, offerPercentage?: number, offerType?: string, flatAmount?: number) {
    const type = offerType === 'FLAT' ? 'FLAT' : 'PERCENTAGE';
    const pct = Number(offerPercentage) || 0;
    const flat = Number(flatAmount) || 0;

    if (type === 'FLAT' && flat > 0) {
      const discounted = Math.max(0, basePrice - flat);
      return {
        offerType: 'FLAT',
        offerPercentage: 0,
        flatAmount: flat,
        originalPrice: basePrice,
        offerPrice: discounted,
        discount: `FLAT ₹${flat} OFF`,
      };
    } else if (pct > 0) {
      const discounted = Math.round(basePrice * (1 - pct / 100));
      return {
        offerType: 'PERCENTAGE',
        offerPercentage: pct,
        flatAmount: 0,
        originalPrice: basePrice,
        offerPrice: discounted,
        discount: `${pct}% OFF`,
      };
    }

    return {
      offerType: 'PERCENTAGE',
      offerPercentage: 0,
      flatAmount: 0,
      originalPrice: null,
      offerPrice: basePrice,
      discount: '',
    };
  }

  async create(createItemDto: any, imageFilename: string): Promise<Item> {
    const generatedSku = createItemDto.sku && createItemDto.sku.trim()
      ? createItemDto.sku.trim().toUpperCase()
      : this.generateSku(createItemDto.name);

    const price = Number(createItemDto.price);
    const offerMeta = this.calculateOfferDetails(price, createItemDto.offerPercentage, createItemDto.offerType, createItemDto.flatAmount);

    const newItem = new this.itemModel({
      ...createItemDto,
      price: price,
      ...offerMeta,
      sku: generatedSku,
      image: imageFilename,
    });
    return newItem.save();
  }

  async findAll(category?: string, search?: string, categoryId?: string, itemId?: string, sku?: string): Promise<Item[]> {
    const filter: any = {};

    if (itemId && isValidObjectId(itemId)) {
      filter._id = itemId;
    }

    if (sku && sku.trim()) {
      filter.sku = new RegExp(`^${sku.trim()}$`, 'i');
    }

    if (categoryId) {
      if (isValidObjectId(categoryId)) {
        filter.$or = [{ categoryId }, { category: categoryId }];
      } else {
        filter.category = categoryId;
      }
    } else if (category && category !== 'All' && category !== 'Select' && category !== 'ALL') {
      if (isValidObjectId(category)) {
        filter.$or = [{ categoryId: category }, { category }];
      } else {
        filter.category = category;
      }
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      const searchConditions: any[] = [{ name: regex }, { description: regex }, { category: regex }, { sku: regex }];
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
        delete filter.$or;
      } else {
        filter.$or = searchConditions;
      }
    }

    const items = await this.itemModel.find(filter).sort({ createdAt: -1 }).exec();

    // Format output with SKU, full Cloudinary/HTTP Image URL, and offer pricing calculation
    return items.map((item) => {
      if (!item.sku) {
        item.sku = this.generateSku(item.name);
      }
      if (item.image && !item.image.startsWith('http://') && !item.image.startsWith('https://')) {
        item.image = `http://localhost:3000/images/${item.image}`;
      }
      if (item.offerType === 'FLAT' && item.flatAmount > 0) {
        item.originalPrice = item.originalPrice || item.price;
        item.offerPrice = item.offerPrice || Math.max(0, item.price - item.flatAmount);
        item.discount = `FLAT ₹${item.flatAmount} OFF`;
      } else if (item.offerPercentage && item.offerPercentage > 0) {
        item.originalPrice = item.originalPrice || item.price;
        item.offerPrice = item.offerPrice || Math.round(item.price * (1 - item.offerPercentage / 100));
        item.discount = `${item.offerPercentage}% OFF`;
      } else {
        item.offerPrice = item.price;
      }
      return item;
    });
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
    return Array.from(new Set([...defaultCategories, ...categories]));
  }

  async findOne(id: string): Promise<Item> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`Invalid product item ID format: "${id}"`);
    }
    const item = await this.itemModel.findById(id).exec();
    if (!item) {
      throw new NotFoundException(`Product item with ID "${id}" not found`);
    }
    if (!item.sku) {
      item.sku = this.generateSku(item.name);
    }
    if (item.offerType === 'FLAT' && item.flatAmount > 0) {
      item.originalPrice = item.originalPrice || item.price;
      item.offerPrice = item.offerPrice || Math.max(0, item.price - item.flatAmount);
      item.discount = `FLAT ₹${item.flatAmount} OFF`;
    } else if (item.offerPercentage && item.offerPercentage > 0) {
      item.originalPrice = item.originalPrice || item.price;
      item.offerPrice = item.offerPrice || Math.round(item.price * (1 - item.offerPercentage / 100));
      item.discount = `${item.offerPercentage}% OFF`;
    } else {
      item.offerPrice = item.price;
    }
    return item;
  }

  async update(id: string, updateData: any, imageFilename?: string): Promise<Item> {
    const payload: any = { ...updateData };
    if (payload.price) {
      payload.price = Number(payload.price);
    }
    if (payload.offerPercentage !== undefined || payload.offerType !== undefined || payload.flatAmount !== undefined) {
      const basePrice = payload.price || (await this.findOne(id)).price;
      const offerMeta = this.calculateOfferDetails(basePrice, Number(payload.offerPercentage), payload.offerType, Number(payload.flatAmount));
      Object.assign(payload, offerMeta);
    }
    if (payload.sku) {
      payload.sku = payload.sku.trim().toUpperCase();
    }
    if (imageFilename) {
      payload.image = imageFilename;
    }
    const updated = await this.itemModel.findByIdAndUpdate(id, payload, { new: true }).exec();
    if (!updated) {
      throw new NotFoundException(`Product item with ID "${id}" not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const deleted = await this.itemModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Product item with ID "${id}" not found`);
    }
    return { success: true, message: 'Product item removed successfully' };
  }
}
