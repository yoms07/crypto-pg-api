/**
 * sub document
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { HydratedDocument } from 'mongoose';

export type CheckoutCustomizationDocument =
  HydratedDocument<CheckoutCustomization>;

@Schema({ timestamps: false, id: false })
export class CheckoutCustomization extends Document {
  @Prop()
  primary_color: string;

  @Prop()
  secondary_color: string;

  @Prop()
  logo_position: string;

  @Prop()
  background_image_url: string;

  @Prop()
  custom_css: string;
}

export const CheckoutCustomizationSchema = SchemaFactory.createForClass(
  CheckoutCustomization,
);
