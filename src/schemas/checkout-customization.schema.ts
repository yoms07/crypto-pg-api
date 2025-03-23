import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { BusinessProfile } from './business-profile.schema';

export type CheckoutCustomizationDocument =
  HydratedDocument<CheckoutCustomization>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class CheckoutCustomization extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'BusinessProfile',
    required: true,
  })
  business_id: BusinessProfile;

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
