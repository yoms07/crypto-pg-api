import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { PaymentLink } from './payment-link.schema';
import { Wallet } from './wallet.schema';

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Transaction extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'PaymentLink',
    required: true,
  })
  payment_link_id: PaymentLink;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Wallet', required: true })
  wallet_id: Wallet;

  @Prop()
  transaction_hash: string;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ required: true })
  currency_code: string;

  @Prop({ required: true, type: Number })
  crypto_amount: number;

  @Prop({ required: true })
  crypto_currency: string;

  @Prop({ type: Number })
  exchange_rate: number;

  @Prop({ default: 'pending', enum: ['pending', 'confirmed', 'failed'] })
  status: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
