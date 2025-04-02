import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { PaymentLink } from '@/payment/schemas/payment-link.schema';
import { BusinessProfile } from '@/business-profile/schemas/business-profile.schema';

@Schema()
class WebhookPayload {
  @Prop({ required: true })
  event: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  data: Record<string, any>;
}

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class OutboundWebhook extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'BusinessProfile',
    required: true,
  })
  business_profile_id: BusinessProfile;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'PaymentLink',
    required: true,
  })
  payment_link_id: PaymentLink;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  method: string;

  @Prop({ type: WebhookPayload, required: true })
  payload: WebhookPayload;

  @Prop({ type: MongooseSchema.Types.Mixed })
  headers: Record<string, string>;

  @Prop({ required: true })
  status_code: number;

  @Prop()
  response_body: string;

  @Prop({ default: 1 })
  retry_count: number;

  @Prop({
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
  })
  status: string;

  @Prop()
  error_message: string;

  @Prop({ type: Date })
  last_attempted_at: Date;
}

export const OutboundWebhookSchema =
  SchemaFactory.createForClass(OutboundWebhook);
