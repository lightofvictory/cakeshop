import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';

@ApiTags('Categories Management')
@Controller('api/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'Get all active menu categories' })
  @Get()
  async findAll() {
    const data = await this.categoriesService.findAll();
    return { success: true, count: data.length, data };
  }

  @ApiOperation({ summary: 'Create new category' })
  @Post()
  async create(@Body() createCategoryDto: any) {
    const data = await this.categoriesService.create(createCategoryDto);
    return { success: true, message: 'Category added successfully', data };
  }

  @ApiOperation({ summary: 'Delete category by ID' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
