import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ type: Types.ObjectId, required: true, ref: 'BusinessProfile' })
  business_profile_id: Types.ObjectId;

  @Prop({ required: true })
  item_name: string;

  @Prop()
  item_description: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  unit_price: string;

  @Prop({ required: true, default: 'IDR' })
  unit_currency: string;

  @Prop({ default: true })
  is_active: boolean;

  @Prop()
  sku: string;

  @Prop({ default: 0 })
  stock: number;

  @Prop()
  image_url: string;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
