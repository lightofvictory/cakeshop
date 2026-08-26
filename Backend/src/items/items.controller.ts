import {
  Controller,
  Get,
  Post,
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
  constructor(private readonly itemsService: ItemsService) {}

  @ApiOperation({ summary: 'Get all items or filter by category' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter items by category (e.g., Cake Item, Snakes Item)' })
  @Get('api/items')
  async findAll(@Query('category') category?: string) {
    const data = await this.itemsService.findAll(category);
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Get all available unique item categories' })
  @Get('api/items/categories')
  async getCategories() {
    const data = await this.itemsService.findCategories();
    return { success: true, categories: data };
  }

  @ApiOperation({ summary: 'Create new item with image upload' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Gourmet Chocolate Cake' },
        description: { type: 'string', example: 'Rich dark chocolate cake layered with fudge cream' },
        price: { type: 'number', example: 599 },
        category: { type: 'string', example: 'Cake Item' },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @Post('api/items')
  @UseInterceptors(FileInterceptor('image', { storage }))
  async create(
    @Body() createItemDto: CreateItemDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    const item = await this.itemsService.create(createItemDto, file.filename);
    return { success: true, message: 'Item added successfully', data: item };
  }

  @ApiOperation({ summary: 'Delete item by ID' })
  @Delete('api/items/:id')
  async remove(@Param('id') id: string) {
    return this.itemsService.remove(id);
  }

  // Backward-compatible Legacy Endpoints (/api/cakes)
  @ApiOperation({ summary: 'Add cake (Legacy endpoint for Admin Panel)' })
  @ApiConsumes('multipart/form-data')
  @Post('api/cakes/addcake')
  @UseInterceptors(FileInterceptor('image', { storage }))
  async addCake(
    @Body() createItemDto: CreateItemDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    const cake = await this.itemsService.create(createItemDto, file.filename);
    return { success: true, message: 'Cake added successfully', data: cake };
  }

  @ApiOperation({ summary: 'List cakes (Legacy endpoint for Admin Panel)' })
  @Get('api/cakes/list')
  async listCakes() {
    const data = await this.itemsService.findAll();
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Remove cake by ID (Legacy endpoint)' })
  @Post('api/cakes/remove')
  async removeCake(@Body('id') id: string) {
    if (!id) {
      throw new BadRequestException('ID is required');
    }
    return this.itemsService.remove(id);
  }
}
