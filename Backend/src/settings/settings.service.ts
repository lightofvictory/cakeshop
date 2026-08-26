import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings, SettingsDocument } from './schemas/settings.schema';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings.name) private settingsModel: Model<SettingsDocument>,
  ) {}

  async getRawSettings(): Promise<any> {
    let settings = await this.settingsModel.findOne().exec();
    if (!settings) {
      settings = new this.settingsModel();
      await settings.save();
    }
    return settings;
  }

  async getStructuredSettings(): Promise<any> {
    const raw: any = await this.getRawSettings();
    const doc: any = raw && typeof raw.toObject === 'function' ? raw.toObject() : raw || {};

    const shopSettings = {
      shopName: doc.shopName || 'Mr. Pastry',
      tagline: doc.tagline || 'Bakery Management & Inventory System',
      logo: doc.logo || '',
      phone: doc.phone || '+919876543210',
      email: doc.email || 'support@mrpastry.com',
      address: doc.address || '123 Bakery Street, MG Road',
      city: doc.city || 'Mumbai',
      pincode: doc.pincode || '400001',
      instagramUrl: doc.instagramUrl || 'https://instagram.com/mrpastry',
      facebookUrl: doc.facebookUrl || 'https://facebook.com/mrpastry',
      whatsappNumber: doc.whatsappNumber || '+919876543210',
      twitterUrl: doc.twitterUrl || 'https://twitter.com/mrpastry',
      currency: doc.currency || '₹',
      storeOpen: doc.storeOpen !== undefined ? doc.storeOpen : true,
      openTime: doc.openTime || '08:00',
      closeTime: doc.closeTime || '22:00',
      deliveryRadius: doc.deliveryRadius || 10,
      minOrderAmount: doc.minOrderAmount || 299,
      deliveryFee: doc.deliveryFee || 40,
      freeDeliveryThreshold: doc.freeDeliveryThreshold || 999,
    };

    const homeSettings = {
      bannerImage: doc.bannerImage || '',
      heroTitle: doc.heroTitle || 'The Best Cakes For Every Celebration',
      heroSubtitle: doc.heroSubtitle || 'Beautifully made cakes, pastries, and sweet moments from the Mr. Pastry kitchen.',
      heroCtaText: doc.heroCtaText || 'Explore Cakes',
      promoMarqueeText: doc.promoMarqueeText || '🎉 Special Offer: Free Delivery on orders over ₹999!',
      promoBannerImage: doc.promoBannerImage || '',
      showHero: doc.showHero !== undefined ? doc.showHero : true,
      showPromo: doc.showPromo !== undefined ? doc.showPromo : true,
      showTestimonials: doc.showTestimonials !== undefined ? doc.showTestimonials : true,
    };

    const menuSettings = {
      menuTitle: doc.menuTitle || 'Explore Our Bakery Menu',
      menuSubtitle: doc.menuSubtitle || 'Handcrafted cakes, fresh savory snacks & artisanal desserts.',
      menuGridCols: doc.menuGridCols || 4,
      showCategoryPills: doc.showCategoryPills !== undefined ? doc.showCategoryPills : true,
      enableVegFilter: doc.enableVegFilter !== undefined ? doc.enableVegFilter : true,
      enableCustomCakeNotes: doc.enableCustomCakeNotes !== undefined ? doc.enableCustomCakeNotes : true,
    };

    return {
      _id: doc._id,
      shopSettings,
      homeSettings,
      menuSettings,
      // include top-level flat fields for complete backwards compatibility
      ...doc,
    };
  }

  async updateSettings(dto: Partial<Settings>): Promise<Settings> {
    let settings = await this.settingsModel.findOne().exec();
    if (!settings) {
      settings = new this.settingsModel(dto);
    } else {
      Object.assign(settings, dto);
    }
    return settings.save();
  }
}
