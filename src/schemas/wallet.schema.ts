import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { BusinessProfile } from './business-profile.schema';

export type WalletDocument = HydratedDocument<Wallet>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Wallet extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'BusinessProfile',
    required: true,
  })
  business_id: BusinessProfile;

  @Prop({ required: true })
  wallet_address: string;

  @Prop({ required: true })
  wallet_type: string;

  @Prop({ default: false })
  is_primary: boolean;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
