import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { HydratedDocument } from 'mongoose';

export type ApiKeyDocument = HydratedDocument<ApiKey>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class ApiKey extends Document {
  @Prop({ required: true })
  key_hash: string;

  @Prop({ required: true })
  encrypted_key: string;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ type: Date, default: null })
  last_used_at: Date | null;
}

export const ApiKeySchema = SchemaFactory.createForClass(ApiKey);
