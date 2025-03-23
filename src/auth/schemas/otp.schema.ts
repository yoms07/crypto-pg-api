import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { User } from './user.schema';

export type OtpDocument = HydratedDocument<Otp>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Otp extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user_id: User;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true, type: Date })
  expires_at: Date;

  @Prop({ default: false })
  is_used: boolean;

  @Prop({ default: 0 })
  attempt_count: number;

  @Prop({ required: true, type: Date })
  created_at: Date;

  @Prop({ type: Date })
  updated_at?: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);

export type OtpWithoutCode = Omit<Otp, 'code'>;
