import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SettingsDocument = Settings & Document;

@Schema({ timestamps: true })
export class Settings {
  // --- 1. SHOP SETTINGS ---
  @Prop({ default: 'Mr. Pastry' })
  shopName: string;

  @Prop({ default: 'Bakery Management & Inventory System' })
  tagline: string;

  @Prop({ default: '' })
  logo: string;

  @Prop({ default: '+919876543210' })
  phone: string;

  @Prop({ default: 'support@mrpastry.com' })
  email: string;

  @Prop({ default: '123 Bakery Street, MG Road' })
  address: string;

  @Prop({ default: 'Mumbai' })
  city: string;

  @Prop({ default: '400001' })
  pincode: string;

  @Prop({ default: 'https://instagram.com/mrpastry' })
  instagramUrl: string;

  @Prop({ default: 'https://facebook.com/mrpastry' })
  facebookUrl: string;

  @Prop({ default: '+919876543210' })
  whatsappNumber: string;

  @Prop({ default: 'https://twitter.com/mrpastry' })
  twitterUrl: string;

  @Prop({ default: '₹' })
  currency: string;

  @Prop({ default: true })
  storeOpen: boolean;

  @Prop({ default: '08:00' })
  openTime: string;

  @Prop({ default: '22:00' })
  closeTime: string;

  @Prop({ default: 10 })
  deliveryRadius: number;

  @Prop({ default: 299 })
  minOrderAmount: number;

  @Prop({ default: 40 })
  deliveryFee: number;

  @Prop({ default: 999 })
  freeDeliveryThreshold: number;

  // --- 2. HOME SETTINGS ---
  @Prop({ default: '' })
  bannerImage: string;

  @Prop({ default: 'The Best Cakes For Every Celebration' })
  heroTitle: string;

  @Prop({ default: 'Beautifully made cakes, pastries, and sweet moments from the Mr. Pastry kitchen.' })
  heroSubtitle: string;

  @Prop({ default: 'Explore Cakes' })
  heroCtaText: string;

  @Prop({ default: '🎉 Special Offer: Free Delivery on orders over ₹999!' })
  promoMarqueeText: string;

  @Prop({ default: '' })
  promoBannerImage: string;

  @Prop({ default: true })
  showHero: boolean;

  @Prop({ default: true })
  showPromo: boolean;

  @Prop({ default: true })
  showTestimonials: boolean;

  // --- 3. MENU SETTINGS ---
  @Prop({ default: 'Explore Our Bakery Menu' })
  menuTitle: string;

  @Prop({ default: 'Handcrafted cakes, fresh savory snacks & artisanal desserts.' })
  menuSubtitle: string;

  @Prop({ default: 4 })
  menuGridCols: number;

  @Prop({ default: true })
  showCategoryPills: boolean;

  @Prop({ default: true })
  enableVegFilter: boolean;

  @Prop({ default: true })
  enableCustomCakeNotes: boolean;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
