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
    const all = await this.settingsModel.find().exec();
    if (all.length > 1) {
      const keep = all[0];
      await this.settingsModel.deleteMany({ _id: { $ne: keep._id } }).exec();
      return keep;
    }
    if (all.length === 1) {
      return all[0];
    }
    const settings = new this.settingsModel();
    await settings.save();
    return settings;
  }

  async getStructuredSettings(): Promise<any> {
    const raw: any = await this.getRawSettings();
    const doc: any = raw && typeof raw.toObject === 'function' ? raw.toObject({ virtuals: true }) : raw || {};

    const rawDesc = doc.shopDescription || (doc.shopSettings && doc.shopSettings.shopDescription) || '';

    const shopSettings = {
      shopName: doc.shopName || 'Mr. Pastry',
      tagline: doc.tagline || 'Bakery Management & Inventory System',
      shopDescription: rawDesc,
      logo: doc.logo || '',
      phone: doc.phone || '+919876543210',
      email: doc.email || 'support@mrpastry.com',
      senderGmail: doc.senderGmail || 'mrpastrybakery@gmail.com',
      web3FormsKey: doc.web3FormsKey || 'c74fae99-8738-4e3c-83b3-df77ee138b30',
      address: doc.address || '123 Bakery Street, MG Road',
      city: doc.city || 'Mumbai',
      pincode: doc.pincode || '400001',
      instagramUrl: doc.instagramUrl || 'https://instagram.com/mrpastry',
      facebookUrl: doc.facebookUrl || 'https://facebook.com/mrpastry',
      whatsappNumber: doc.whatsappNumber || '+919876543210',
      twitterUrl: doc.twitterUrl || 'https://twitter.com/mrpastry',
      currency: doc.currency || '₹',
      outlets:
        doc.outlets && Array.isArray(doc.outlets) && doc.outlets.length > 0
          ? doc.outlets
          : [
              {
                id: '1',
                name: 'Flagship Bakery - Downtown',
                address: '100 Cake Avenue, Downtown',
                phone: '+919876543210',
                isActive: true,
              },
            ],
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
      defaultHeroBanners: [
        {
          title: 'BOLD FLAVORS.',
          subtitle: 'EPIC CRAVINGS.',
          description: 'Your sweet favorites, made fresh daily.',
          image: doc.bannerImage || '',
          ctaText: 'Order Now',
          ctaLink: '/menu',
        },
        {
          title: 'FRESHLY BAKED',
          subtitle: 'ARTISANAL PASTRIES',
          description: 'Handcrafted daily with love & premium cocoa.',
          image: doc.bannerImage || '',
          ctaText: 'Explore Menu',
          ctaLink: '/menu',
        },
        {
          title: 'CELEBRATE MORE',
          subtitle: 'CUSTOM PARTY CAKES',
          description: 'Make every birthday & special event unforgettable.',
          image: doc.bannerImage || '',
          ctaText: 'Order Special',
          ctaLink: '/extra-special',
        },
      ],
      heroBanners:
        doc.heroBanners && Array.isArray(doc.heroBanners) && doc.heroBanners.length > 0
          ? doc.heroBanners
          : [
              {
                title: 'BOLD FLAVORS.',
                subtitle: 'EPIC CRAVINGS.',
                description: 'Your sweet favorites, made fresh daily.',
                image: doc.bannerImage || '',
                ctaText: 'Order Now',
                ctaLink: '/menu',
              },
              {
                title: 'FRESHLY BAKED',
                subtitle: 'ARTISANAL PASTRIES',
                description: 'Handcrafted daily with love & premium cocoa.',
                image: doc.bannerImage || '',
                ctaText: 'Explore Menu',
                ctaLink: '/menu',
              },
              {
                title: 'CELEBRATE MORE',
                subtitle: 'CUSTOM PARTY CAKES',
                description: 'Make every birthday & special event unforgettable.',
                image: doc.bannerImage || '',
                ctaText: 'Order Special',
                ctaLink: '/extra-special',
              },
            ],
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
      ...doc,
      _id: doc._id,
      shopDescription: rawDesc,
      shopSettings: {
        ...shopSettings,
        ...(doc.shopSettings || {}),
        shopDescription: rawDesc,
      },
      homeSettings: {
        ...homeSettings,
        ...(doc.homeSettings || {}),
      },
      menuSettings: {
        ...menuSettings,
        ...(doc.menuSettings || {}),
      },
    };
  }

  async updateSettings(dto: Partial<Settings>): Promise<Settings> {
    const cleanDto: any = { ...dto };
    delete cleanDto._id;
    delete cleanDto.__v;
    delete cleanDto.createdAt;
    delete cleanDto.updatedAt;

    const rawSettings = await this.getRawSettings();

    await this.settingsModel.collection.updateOne(
      { _id: rawSettings._id },
      {
        $set: {
          ...cleanDto,
          shopDescription: cleanDto.shopDescription !== undefined ? cleanDto.shopDescription : '',
          'shopSettings.shopDescription': cleanDto.shopDescription !== undefined ? cleanDto.shopDescription : '',
        },
      },
      { upsert: true },
    );

    const updated = await this.settingsModel.findById(rawSettings._id).exec();
    return updated;
  }
}
