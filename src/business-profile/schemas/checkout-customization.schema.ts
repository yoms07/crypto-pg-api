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
  primaryColor: string;

  @Prop()
  topBarColor: string;

  @Prop()
  topBarTextColor: string;

  @Prop()
  secondaryColor: string;

  @Prop()
  borderRadius: string;

  @Prop()
  overlayColor: string;

  @Prop()
  bottomBarColor: string;

  @Prop()
  primaryTextColor: string;

  @Prop()
  secondaryTextColor: string;
}

export const CheckoutCustomizationSchema = SchemaFactory.createForClass(
  CheckoutCustomization,
);
