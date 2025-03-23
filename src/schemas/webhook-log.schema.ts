import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { BusinessProfile } from './business-profile.schema';
import { Transaction } from './transaction.schema';

export type WebhookLogDocument = HydratedDocument<WebhookLog>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class WebhookLog extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'BusinessProfile',
    required: true,
  })
  business_id: BusinessProfile;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Transaction',
    required: true,
  })
  transaction_id: Transaction;

  @Prop({ required: true })
  webhook_url: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  payload: Record<string, any>;

  @Prop({ type: Number })
  response_code: number;

  @Prop()
  response_body: string;

  @Prop({ default: 'success', enum: ['success', 'failed'] })
  status: string;

  @Prop({ default: 0, type: Number })
  retry_count: number;
}

export const WebhookLogSchema = SchemaFactory.createForClass(WebhookLog);
