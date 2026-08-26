import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().sort({ displayOrder: 1 }).exec();
  }

  async create(createCategoryDto: any): Promise<Category> {
    const exists = await this.categoryModel.findOne({ name: createCategoryDto.name }).exec();
    if (exists) {
      throw new BadRequestException(`Category "${createCategoryDto.name}" already exists`);
    }
    const newCategory = new this.categoryModel(createCategoryDto);
    return newCategory.save();
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const deleted = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }
    return { success: true, message: 'Category removed successfully' };
  }
}
