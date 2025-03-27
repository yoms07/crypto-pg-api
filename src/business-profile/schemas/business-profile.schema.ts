import { User } from '@/auth/schemas';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { CheckoutCustomization } from './checkout-customization.schema';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class BusinessProfile extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user_id: User;

  @Prop({ required: true })
  business_name: string;

  @Prop()
  logo_url: string;

  @Prop()
  webhook_url: string;

  @Prop()
  business_description: string;

  @Prop()
  contact_email: string;

  @Prop()
  contact_phone: string;

  @Prop(CheckoutCustomization)
  checkout_customization: CheckoutCustomization;
}

export type BusinessProfileDocumentOverride = {
  name: Types.Subdocument<Types.ObjectId> & CheckoutCustomization;
};

export type BusinessProfileDocument = HydratedDocument<
  BusinessProfile,
  BusinessProfileDocumentOverride
>;

export const BusinessProfileSchema =
  SchemaFactory.createForClass(BusinessProfile);
