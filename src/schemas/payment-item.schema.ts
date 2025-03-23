import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { PaymentLink } from './payment-link.schema';

export type PaymentItemDocument = HydratedDocument<PaymentItem>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class PaymentItem extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'PaymentLink',
    required: true,
  })
  payment_link_id: PaymentLink;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: Number })
  quantity: number;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop()
  category: string;

  @Prop()
  url: string;
}

export const PaymentItemSchema = SchemaFactory.createForClass(PaymentItem);
