import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { PaymentLink } from './payment-link.schema';

export type PaymentFeeDocument = HydratedDocument<PaymentFee>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class PaymentFee extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'PaymentLink',
    required: true,
  })
  payment_link_id: PaymentLink;

  @Prop({ required: true, enum: ['percentage', 'fixed'] })
  fee_type: string;

  @Prop({ required: true, type: Number })
  value: number;
}

export const PaymentFeeSchema = SchemaFactory.createForClass(PaymentFee);
