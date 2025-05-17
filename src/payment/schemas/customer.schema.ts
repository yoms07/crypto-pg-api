import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum CustomerSource {
  BUSINESS = 'business',
  CUSTOMER = 'customer',
}

@Schema()
export class Customer {
  @Prop({ required: true, enum: CustomerSource })
  source: CustomerSource;

  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  address: string;

  @Prop()
  phone: string;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
