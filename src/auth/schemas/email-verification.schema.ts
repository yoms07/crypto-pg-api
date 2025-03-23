import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { User } from './user.schema';

export type EmailVerificationDocument = HydratedDocument<EmailVerification>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class EmailVerification extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user_id: User;

  @Prop({ required: true })
  token: string;

  @Prop({ required: true, type: Date })
  expires_at: Date;

  @Prop({ default: false })
  is_used: boolean;
}

export const EmailVerificationSchema =
  SchemaFactory.createForClass(EmailVerification);
