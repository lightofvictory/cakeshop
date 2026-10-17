import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ItemDocument = Item & Document;

@Schema({ timestamps: true })
export class Item {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: false, default: 'PERCENTAGE' })
  offerType: 'PERCENTAGE' | 'FLAT';

  @Prop({ required: false, default: 0 })
  offerPercentage: number;

  @Prop({ required: false, default: 0 })
  flatAmount: number;

  @Prop({ required: false })
  offerPrice: number;

  @Prop({ required: false })
  originalPrice: number;

  @Prop({ required: false, default: '' })
  discount: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: false })
  categoryId: string;

  @Prop({ required: false })
  sku: string;

  @Prop({ required: true })
  image: string;
}

export const ItemSchema = SchemaFactory.createForClass(Item);
