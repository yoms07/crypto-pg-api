import { User } from '@/auth/schemas';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { CheckoutCustomization } from './checkout-customization.schema';
import { ApiKey } from './api-key.schema';
import { Wallet } from './wallet.schema';

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
  webhook_secret: string;

  @Prop()
  business_description: string;

  @Prop()
  contact_email: string;

  @Prop()
  contact_phone: string;

  @Prop({ type: ApiKey, default: null })
  api_key: ApiKey | null;

  @Prop({ type: Wallet, default: null })
  wallet: Wallet | null;

  @Prop(CheckoutCustomization)
  checkout_customization: CheckoutCustomization;

  @Prop()
  created_at: Date;
  @Prop()
  updated_at: Date;
}

export type BusinessProfileDocumentOverride = {
  wallet: Types.Subdocument<Types.ObjectId> & Wallet;
  checkout_customization: Types.Subdocument<Types.ObjectId> &
    CheckoutCustomization;
  api_key: Types.Subdocument<Types.ObjectId> & ApiKey;
};

export type BusinessProfileDocument = HydratedDocument<
  BusinessProfile,
  BusinessProfileDocumentOverride
>;
export const BusinessProfileSchema =
  SchemaFactory.createForClass(BusinessProfile);
