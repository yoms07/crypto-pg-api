import { BusinessProfile } from '@/business-profile/schemas/business-profile.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { Customer, CustomerSchema } from './customer.schema';

export type PaymentLinkDocument = HydratedDocument<PaymentLink>;

@Schema()
class PricingAmount {
  @Prop({ required: true })
  amount: string;

  @Prop({ required: true })
  currency: string;
}

@Schema()
class Pricing {
  @Prop({ type: PricingAmount, required: true })
  local: PricingAmount;

  @Prop({ type: PricingAmount })
  settled: PricingAmount;
}

@Schema()
class BlockchainMetadata {
  @Prop({ required: true })
  chain_id: string;

  @Prop({ required: true })
  contract_address: string;

  @Prop({ required: true })
  sender: string;
}

@Schema()
class BlockchainData {
  @Prop({ type: MongooseSchema.Types.Mixed })
  transfer_intent: Record<string, any>;

  @Prop({ type: BlockchainMetadata })
  metadata: BlockchainMetadata;

  @Prop({ type: MongooseSchema.Types.Mixed })
  success_event: Record<string, any>;

  @Prop({ type: MongooseSchema.Types.Mixed })
  failure_event: Record<string, any>;
}

@Schema()
class Item {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  unit_price: string;
}

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class PaymentLink extends Document {
  @Prop({ required: true })
  external_id: string;

  @Prop()
  description: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'BusinessProfile',
    required: true,
  })
  business_profile_id: BusinessProfile;

  @Prop()
  success_redirect_url: string;

  @Prop()
  failure_redirect_url: string;

  @Prop(CustomerSchema)
  customer: Customer;

  @Prop()
  support_email: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata: Record<string, any>;

  @Prop({ type: [Item], default: [] })
  items: Item[];

  @Prop({ type: Pricing, required: true })
  pricing: Pricing;

  @Prop({ type: BlockchainData })
  blockchain_data: BlockchainData;

  @Prop({
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'expired'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: Date })
  failed_at: Date;

  @Prop({ type: Date })
  success_at: Date;

  @Prop({ type: Date, required: true })
  expired_at: Date;
}

export const PaymentLinkSchema = SchemaFactory.createForClass(PaymentLink);
