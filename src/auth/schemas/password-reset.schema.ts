import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PasswordReset extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  token: string;

  @Prop({ required: true })
  expires_at: Date;

  @Prop({ default: false })
  is_used: boolean;

  @Prop({ default: 'password_reset' })
  type: string;
}

export const PasswordResetSchema = SchemaFactory.createForClass(PasswordReset);
