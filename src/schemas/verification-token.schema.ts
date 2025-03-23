import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { HydratedDocument } from 'mongoose';

export type VerificationTokenDocument = HydratedDocument<VerificationToken>;

@Schema()
export class VerificationToken extends Document {
  @Prop({ required: true })
  identifier: string;

  @Prop({ required: true })
  token: string;

  @Prop({ required: true, type: Date })
  expires: Date;
}

export const VerificationTokenSchema =
  SchemaFactory.createForClass(VerificationToken);
