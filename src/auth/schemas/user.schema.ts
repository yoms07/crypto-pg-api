import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  _id: true,
})
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  password_hash: string;

  @Prop({ required: true })
  provider: string; // 'email', 'google', 'facebook', etc.

  @Prop()
  provider_id: string; // Only for OAuth users

  @Prop({ default: false })
  email_verified: boolean;

  @Prop({ type: Date })
  email_verified_at: Date;

  @Prop()
  image: string;

  @Prop({ default: true })
  is_active: boolean;

  @Prop()
  access_token: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Create a compound index to ensure uniqueness of email+provider combination
UserSchema.index({ email: 1, provider: 1 }, { unique: true });
