import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { PaymentLink } from './payment-link.schema';

export type CustomerDocument = HydratedDocument<Customer>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Customer extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'PaymentLink',
    required: true,
  })
  payment_link_id: PaymentLink;

  @Prop()
  email: string;

  @Prop()
  first_name: string;

  @Prop()
  last_name: string;

  @Prop()
  phone_number: string;

  @Prop()
  address: string;

  @Prop({ enum: ['email', 'whatsapp'], default: 'email' })
  notification_preference: string;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
