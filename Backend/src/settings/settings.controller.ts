import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { SettingsService } from './settings.service';

const uploadDir = join(__dirname, '..', '..', 'uploads');
if (!existsSync(uploadDir)) {
  try {
    mkdirSync(uploadDir, { recursive: true });
  } catch (e) {}
}

const multerOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      if (!existsSync(uploadDir)) {
        try {
          mkdirSync(uploadDir, { recursive: true });
        } catch (e) {}
      }
      cb(null, uploadDir);
    },
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
  @UseInterceptors(AnyFilesInterceptor(multerOptions))
  async updateSettings(
    @Body() dto: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const body = dto || {};
    let updatePayload: any = { ...body };

    const getFile = (fieldname: string) => files?.find((f) => f.fieldname === fieldname);

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

    if (body.heroBanners) {
      try {
        let banners = typeof body.heroBanners === 'string' ? JSON.parse(body.heroBanners) : body.heroBanners;
        if (Array.isArray(banners)) {
          banners = banners.map((b: any, idx: number) => {
            const uploadedFile = getFile(`heroBanner_${idx}`);
            if (uploadedFile) {
              b.image = uploadedFile.filename;
            }
            return b;
          });
          updatePayload.heroBanners = banners;
        }
      } catch (e) {}
    }

    if (body.outlets) {
      try {
        const parsedOutlets = typeof body.outlets === 'string' ? JSON.parse(body.outlets) : body.outlets;
        if (Array.isArray(parsedOutlets)) {
          updatePayload.outlets = parsedOutlets;
        }
      } catch (e) {}
    }

    const logoFile = getFile('logo');
    if (logoFile) updatePayload.logo = logoFile.filename;

    const bannerFile = getFile('bannerImage');
    if (bannerFile) updatePayload.bannerImage = bannerFile.filename;

    const promoFile = getFile('promoBannerImage');
    if (promoFile) updatePayload.promoBannerImage = promoFile.filename;

    const footerBannerFile = getFile('footerBannerImage');
    if (footerBannerFile) updatePayload.footerBannerImage = footerBannerFile.filename;

    // Sanitize any invalid string values like '[object Object]' or file objects
    Object.keys(updatePayload).forEach((key) => {
      const val = updatePayload[key];
      if (typeof val === 'string' && val.includes('[object')) {
        delete updatePayload[key];
      }
    });

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

    // Convert number strings safely
    const numFields = [
      'deliveryFee',
      'freeDeliveryThreshold',
      'minOrderAmount',
      'deliveryRadius',
      'menuGridCols',
    ];
    numFields.forEach((field) => {
      if (updatePayload[field] !== undefined && updatePayload[field] !== null && updatePayload[field] !== '') {
        const num = Number(updatePayload[field]);
        if (!isNaN(num)) {
          updatePayload[field] = num;
        } else {
          delete updatePayload[field];
        }
      } else if (updatePayload[field] === '') {
        delete updatePayload[field];
      }
    });

    await this.settingsService.updateSettings(updatePayload);
    const data = await this.settingsService.getStructuredSettings();
    return { success: true, data };
  }
}
