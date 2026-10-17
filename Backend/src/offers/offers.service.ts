import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Offer, OfferDocument } from './schemas/offer.schema';

@Injectable()
export class OffersService {
  constructor(
    @InjectModel(Offer.name) private offerModel: Model<OfferDocument>,
  ) {}

  // Standard initial default offers (combining Percentage & Flat Amount presets)
  private readonly defaultOffers: Array<Partial<Offer>> = [
    { title: 'Standard 10% Discount', offerType: 'PERCENTAGE', offerPercentage: 10, flatAmount: 0, code: '10% OFF', description: '10% percentage discount', badgeColor: '#0284c7', isActive: true },
    { title: 'Popular 15% Discount', offerType: 'PERCENTAGE', offerPercentage: 15, flatAmount: 0, code: '15% OFF', description: '15% percentage discount', badgeColor: '#7c3aed', isActive: true },
    { title: 'Super Saver 20% Discount', offerType: 'PERCENTAGE', offerPercentage: 20, flatAmount: 0, code: '20% OFF', description: '20% percentage discount', badgeColor: '#e03c78', isActive: true },
    { title: 'Festival Special 25% Discount', offerType: 'PERCENTAGE', offerPercentage: 25, flatAmount: 0, code: '25% OFF', description: '25% percentage discount', badgeColor: '#f59e0b', isActive: true },
    { title: 'Half Price 50% Mega Offer', offerType: 'PERCENTAGE', offerPercentage: 50, flatAmount: 0, code: '50% OFF', description: '50% mega percentage discount', badgeColor: '#ef4444', isActive: true },
    { title: 'Flat ₹50 Instant Discount', offerType: 'FLAT', offerPercentage: 0, flatAmount: 50, code: 'FLAT ₹50 OFF', description: 'Flat ₹50 instant price cut', badgeColor: '#10b981', isActive: true },
    { title: 'Flat ₹100 Mega Discount', offerType: 'FLAT', offerPercentage: 0, flatAmount: 100, code: 'FLAT ₹100 OFF', description: 'Flat ₹100 instant price cut', badgeColor: '#8b5cf6', isActive: true },
    { title: 'Flat ₹200 Celebration Discount', offerType: 'FLAT', offerPercentage: 0, flatAmount: 200, code: 'FLAT ₹200 OFF', description: 'Flat ₹200 instant price cut', badgeColor: '#ec4899', isActive: true },
  ];

  async findAll(): Promise<Offer[]> {
    let offers = await this.offerModel.find().sort({ createdAt: -1 }).exec();
    if (offers.length === 0) {
      await this.offerModel.insertMany(this.defaultOffers);
      offers = await this.offerModel.find().sort({ createdAt: -1 }).exec();
    }
    return offers;
  }

  async findOne(id: string): Promise<Offer> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`Invalid offer ID format: "${id}"`);
    }
    const offer = await this.offerModel.findById(id).exec();
    if (!offer) {
      throw new NotFoundException(`Offer with ID "${id}" not found`);
    }
    return offer;
  }

  async create(createOfferDto: any): Promise<Offer> {
    const offerType: 'PERCENTAGE' | 'FLAT' = createOfferDto.offerType === 'FLAT' ? 'FLAT' : 'PERCENTAGE';
    let pct = Number(createOfferDto.offerPercentage) || 0;
    let flat = Number(createOfferDto.flatAmount) || 0;

    if (offerType === 'FLAT') {
      if (!flat || flat <= 0) {
        throw new BadRequestException('Flat discount amount must be greater than 0');
      }
      pct = 0;
    } else {
      if (!pct || pct <= 0 || pct > 100) {
        throw new BadRequestException('Offer percentage must be between 1 and 100');
      }
      flat = 0;
    }

    const defaultCode = offerType === 'FLAT' ? `FLAT ₹${flat} OFF` : `${pct}% OFF`;
    const defaultTitle = offerType === 'FLAT' ? `Flat ₹${flat} Discount` : `${pct}% Discount Offer`;

    const newOffer = new this.offerModel({
      title: createOfferDto.title && createOfferDto.title.trim() ? createOfferDto.title.trim() : defaultTitle,
      offerType: offerType,
      offerPercentage: pct,
      flatAmount: flat,
      code: createOfferDto.code && createOfferDto.code.trim() ? createOfferDto.code.trim() : defaultCode,
      description: createOfferDto.description || '',
      badgeColor: createOfferDto.badgeColor || '#e03c78',
      isActive: createOfferDto.isActive !== undefined ? createOfferDto.isActive : true,
    });
    return newOffer.save();
  }

  async update(id: string, updateOfferDto: any): Promise<Offer> {
    const payload: any = { ...updateOfferDto };
    if (payload.offerType === 'FLAT') {
      payload.flatAmount = Number(payload.flatAmount) || 0;
      payload.offerPercentage = 0;
      if (!payload.code) payload.code = `FLAT ₹${payload.flatAmount} OFF`;
    } else if (payload.offerType === 'PERCENTAGE') {
      payload.offerPercentage = Number(payload.offerPercentage) || 0;
      payload.flatAmount = 0;
      if (!payload.code) payload.code = `${payload.offerPercentage}% OFF`;
    }
    const updated = await this.offerModel.findByIdAndUpdate(id, payload, { new: true }).exec();
    if (!updated) {
      throw new NotFoundException(`Offer with ID "${id}" not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const deleted = await this.offerModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Offer with ID "${id}" not found`);
    }
    return { success: true, message: 'Offer deleted successfully' };
  }
}
