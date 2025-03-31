import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { HydratedDocument } from 'mongoose';

export type WalletDocument = HydratedDocument<Wallet>;

@Schema({ id: false })
export class Wallet extends Document {
  @Prop({ required: true })
  wallet_address: string;

  @Prop({ required: true })
  wallet_type: string;

  @Prop({ default: false })
  is_primary: boolean;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
