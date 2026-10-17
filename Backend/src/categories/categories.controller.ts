import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CategoriesService } from './categories.service';
import { CloudinaryService } from '../common/cloudinary.service';

const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    callback(null, `cat-${uniqueSuffix}${ext}`);
  },
});

@ApiTags('Categories Management')
@Controller('api/categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @ApiOperation({ summary: 'Get all active menu categories' })
  @Get()
  async findAll() {
    const data = await this.categoriesService.findAll();
    return { success: true, count: data.length, data };
  }

  @ApiOperation({ summary: 'Get single category by ID' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.categoriesService.findOne(id);
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Create new category with optional image upload' })
  @Post()
  @UseInterceptors(FileInterceptor('image', { storage }))
  async create(@Body() body: any, @UploadedFile() file?: Express.Multer.File) {
    const payload = { ...body };
    const rawImage = file || payload.image;
    if (rawImage) {
      payload.image = await this.cloudinaryService.uploadImage(rawImage, 'cakeshop_categories');
    }
    if (payload.icon && !payload.emoji) {
      payload.emoji = payload.icon;
    }
    const data = await this.categoriesService.create(payload);
    return { success: true, message: 'Category added successfully', data };
  }

  @ApiOperation({ summary: 'Update category by ID with optional image upload' })
  @Put(':id')
  @UseInterceptors(FileInterceptor('image', { storage }))
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const payload = { ...body };
    const rawImage = file || payload.image;
    if (rawImage) {
      payload.image = await this.cloudinaryService.uploadImage(rawImage, 'cakeshop_categories');
    }
    if (payload.icon && !payload.emoji) {
      payload.emoji = payload.icon;
    }
    const data = await this.categoriesService.update(id, payload);
    return { success: true, message: 'Category updated successfully', data };
  }

  @ApiOperation({ summary: 'Delete category by ID' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
