import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { CloudinaryService } from '../common/cloudinary.service';

const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

@ApiTags('Items & Cakes')
@Controller()
export class ItemsController {
  constructor(
    private readonly itemsService: ItemsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @ApiOperation({ summary: 'Get all items or filter by categoryId, category name, itemId, SKU code, or search query' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filter items by category ID' })
  @ApiQuery({ name: 'itemId', required: false, description: 'Filter items by item ID' })
  @ApiQuery({ name: 'sku', required: false, description: 'Filter items by SKU code' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter items by category name' })
  @ApiQuery({ name: 'search', required: false, description: 'Search items by keyword query' })
  @Get('api/items')
  async findAll(
    @Query('categoryId') categoryId?: string,
    @Query('itemId') itemId?: string,
    @Query('sku') sku?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    const data = await this.itemsService.findAll(category, search, categoryId, itemId, sku);
    return { success: true, count: data.length, data };
  }

  @ApiOperation({ summary: 'Get single item by ID' })
  @Get('api/items/:id')
  async findOne(@Param('id') id: string) {
    const data = await this.itemsService.findOne(id);
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Get all available unique item categories' })
  @Get('api/items/categories')
  async getCategories() {
    const data = await this.itemsService.findCategories();
    return { success: true, categories: data };
  }

  @ApiOperation({ summary: 'Create new item with Cloudinary image URL upload' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Gourmet Chocolate Cake' },
        description: { type: 'string', example: 'Rich dark chocolate cake layered with fudge cream' },
        price: { type: 'number', example: 599 },
        category: { type: 'string', example: 'Cake Item' },
        categoryId: { type: 'string', example: '6a93b08a0be7885f740c9a6d' },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @Post('api/items')
  @UseInterceptors(FileInterceptor('image', { storage }))
  async create(
    @Body() createItemDto: CreateItemDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const rawImage = file || (createItemDto as any).image;
    if (!rawImage) {
      throw new BadRequestException('Image file or Cloudinary image URL is required');
    }

    // Upload to Cloudinary and get full Cloudinary Image URL to store in MongoDB directly
    const imageUrl = await this.cloudinaryService.uploadImage(rawImage, 'cakeshop_products');
    const item = await this.itemsService.create(createItemDto, imageUrl);
    return { success: true, message: 'Item added successfully', data: item };
  }

  @ApiOperation({ summary: 'Delete item by ID' })
  @Delete('api/items/:id')
  async remove(@Param('id') id: string) {
    return this.itemsService.remove(id);
  }

  @ApiOperation({ summary: 'Update item by ID' })
  @ApiConsumes('multipart/form-data')
  @Put('api/items/:id')
  @UseInterceptors(FileInterceptor('image', { storage }))
  async updateItem(
    @Param('id') id: string,
    @Body() updateData: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let imageUrl: string | undefined;
    if (file) {
      imageUrl = await this.cloudinaryService.uploadImage(file, 'cakeshop_products');
    } else if (updateData.image && typeof updateData.image === 'string') {
      imageUrl = await this.cloudinaryService.uploadImage(updateData.image, 'cakeshop_products');
    }

    const item = await this.itemsService.update(id, updateData, imageUrl);
    return { success: true, message: 'Item updated successfully', data: item };
  }

  // Backward-compatible Legacy Endpoints (/api/cakes)
  @ApiOperation({ summary: 'Add cake (Legacy endpoint for Admin Panel)' })
  @ApiConsumes('multipart/form-data')
  @Post('api/cakes/addcake')
  @UseInterceptors(FileInterceptor('image', { storage }))
  async addCakeLegacy(
    @Body() createItemDto: CreateItemDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const rawImage = file || (createItemDto as any).image;
    if (!rawImage) {
      throw new BadRequestException('Image file or Cloudinary image URL is required');
    }

    const imageUrl = await this.cloudinaryService.uploadImage(rawImage, 'cakeshop_products');
    const item = await this.itemsService.create(createItemDto, imageUrl);
    return { success: true, message: 'Cake added successfully', data: item };
  }

  @ApiOperation({ summary: 'Get list of cakes (Legacy endpoint)' })
  @Get('api/cakes/listcake')
  async listCakeLegacy() {
    const data = await this.itemsService.findAll();
    return { success: true, data };
  }
}
