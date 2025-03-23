import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { BusinessProfile } from './business-profile.schema';

export type ApiKeyDocument = HydratedDocument<ApiKey>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class ApiKey extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'BusinessProfile',
    required: true,
  })
  business_id: BusinessProfile;

  @Prop({ required: true })
  key_hash: string;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ type: Date, default: null })
  last_used_at: Date;
}

export const ApiKeySchema = SchemaFactory.createForClass(ApiKey);
