import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { User } from './user.schema';

export type SessionDocument = HydratedDocument<Session>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Session extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user_id: User;

  @Prop({ required: true })
  token: string;

  @Prop({ required: true, type: Date })
  expires_at: Date;

  @Prop()
  user_agent: string;

  @Prop()
  ip_address: string;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ type: Date, default: Date.now })
  last_active_at: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
