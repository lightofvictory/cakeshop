import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().sort({ displayOrder: 1 }).exec();
  }

  async findOne(id: string): Promise<Category> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`Invalid category ID format: "${id}"`);
    }
    const cat = await this.categoryModel.findById(id).exec();
    if (!cat) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }
    return cat;
  }

  async create(createCategoryDto: any): Promise<Category> {
    const exists = await this.categoryModel.findOne({ name: createCategoryDto.name }).exec();
    if (exists) {
      throw new BadRequestException(`Category "${createCategoryDto.name}" already exists`);
    }
    const newCategory = new this.categoryModel(createCategoryDto);
    return newCategory.save();
  }

  async update(id: string, updateCategoryDto: any): Promise<Category> {
    const updated = await this.categoryModel.findByIdAndUpdate(id, updateCategoryDto, { new: true }).exec();
    if (!updated) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const deleted = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }
    return { success: true, message: 'Category removed successfully' };
  }
}
