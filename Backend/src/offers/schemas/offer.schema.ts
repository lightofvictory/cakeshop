import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OfferDocument = Offer & Document;

@Schema({ timestamps: true })
export class Offer {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, default: 'PERCENTAGE' })
  offerType: 'PERCENTAGE' | 'FLAT';

  @Prop({ required: false, default: 0 })
  offerPercentage: number;

  @Prop({ required: false, default: 0 })
  flatAmount: number;

  @Prop({ required: true })
  code: string;

  @Prop({ required: false, default: '' })
  description: string;

  @Prop({ required: false, default: '#e03c78' })
  badgeColor: string;

  @Prop({ required: true, default: true })
  isActive: boolean;
}

export const OfferSchema = SchemaFactory.createForClass(Offer);
