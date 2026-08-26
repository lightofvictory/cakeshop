import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { SettingsService } from './settings.service';

const multerOptions = {
  storage: diskStorage({
    destination: join(__dirname, '..', '..', 'uploads'),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
};

@ApiTags('Settings')
@Controller('api/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all Shop, Home, and Menu settings as 3 structured objects' })
  async getSettings() {
    const data = await this.settingsService.getStructuredSettings();
    return { success: true, data };
  }

  @Post()
  @ApiOperation({ summary: 'Update Shop, Home, or Menu settings' })
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'logo', maxCount: 1 },
        { name: 'bannerImage', maxCount: 1 },
        { name: 'promoBannerImage', maxCount: 1 },
      ],
      multerOptions,
    ),
  )
  async updateSettings(
    @Body() dto: any,
    @UploadedFiles()
    files: {
      logo?: Express.Multer.File[];
      bannerImage?: Express.Multer.File[];
      promoBannerImage?: Express.Multer.File[];
    },
  ) {
    const body = dto || {};
    let updatePayload: any = { ...body };

    // Safely parse nested json bodies if passed
    if (body.shopSettings) {
      try {
        const parsed = typeof body.shopSettings === 'string' ? JSON.parse(body.shopSettings) : body.shopSettings;
        updatePayload = { ...updatePayload, ...parsed };
      } catch (e) {}
    }
    if (body.homeSettings) {
      try {
        const parsed = typeof body.homeSettings === 'string' ? JSON.parse(body.homeSettings) : body.homeSettings;
        updatePayload = { ...updatePayload, ...parsed };
      } catch (e) {}
    }
    if (body.menuSettings) {
      try {
        const parsed = typeof body.menuSettings === 'string' ? JSON.parse(body.menuSettings) : body.menuSettings;
        updatePayload = { ...updatePayload, ...parsed };
      } catch (e) {}
    }

    if (files?.logo && files.logo[0]) {
      updatePayload.logo = files.logo[0].filename;
    }
    if (files?.bannerImage && files.bannerImage[0]) {
      updatePayload.bannerImage = files.bannerImage[0].filename;
    }
    if (files?.promoBannerImage && files.promoBannerImage[0]) {
      updatePayload.promoBannerImage = files.promoBannerImage[0].filename;
    }

    // Convert boolean strings
    const boolFields = [
      'storeOpen',
      'showHero',
      'showPromo',
      'showTestimonials',
      'showCategoryPills',
      'enableVegFilter',
      'enableCustomCakeNotes',
    ];
    boolFields.forEach((field) => {
      if (updatePayload[field] !== undefined) {
        updatePayload[field] = updatePayload[field] === 'true' || updatePayload[field] === true;
      }
    });

    // Convert number strings
    const numFields = [
      'deliveryFee',
      'freeDeliveryThreshold',
      'minOrderAmount',
      'deliveryRadius',
      'menuGridCols',
    ];
    numFields.forEach((field) => {
      if (updatePayload[field] !== undefined && updatePayload[field] !== '') {
        updatePayload[field] = Number(updatePayload[field]);
      }
    });

    await this.settingsService.updateSettings(updatePayload);
    const data = await this.settingsService.getStructuredSettings();
    return { success: true, data };
  }
}
