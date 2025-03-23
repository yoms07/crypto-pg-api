import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { User } from './user.schema';

export type UserProfileDocument = HydratedDocument<UserProfile>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class UserProfile extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  })
  user_id: User;

  @Prop({ required: true })
  first_name: string;

  @Prop({ required: true })
  last_name: string;

  @Prop()
  phone_number: string;

  @Prop()
  address: string;
}

export const UserProfileSchema = SchemaFactory.createForClass(UserProfile);
