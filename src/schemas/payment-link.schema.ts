import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { BusinessProfile } from './business-profile.schema';

export type PaymentLinkDocument = HydratedDocument<PaymentLink>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class PaymentLink extends Document {
  @Prop({ required: true })
  external_id: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'BusinessProfile',
    required: true,
  })
  business_id: BusinessProfile;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ default: 'IDR' })
  currency_code: string;

  @Prop()
  description: string;

  @Prop({ required: true, type: Number })
  duration_minutes: number;

  @Prop()
  success_redirect_url: string;

  @Prop()
  failure_redirect_url: string;

  @Prop({
    default: 'active',
    enum: ['active', 'expired', 'completed', 'failed'],
  })
  status: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata: Record<string, any>;

  @Prop({ type: Date })
  expires_at: Date;
}

export const PaymentLinkSchema = SchemaFactory.createForClass(PaymentLink);
