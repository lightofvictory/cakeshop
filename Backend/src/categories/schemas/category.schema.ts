import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, default: '🎂' })
  emoji: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: true, default: 0 })
  displayOrder: number;

  @Prop({ required: true, default: true })
  isActive: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
