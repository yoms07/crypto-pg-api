import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

enum CustomerSource {
  BUSINESS = 'business',
  CUSTOMER = 'customer',
}
@Schema()
class Customer {
  @Prop({ required: true, enum: ['business', 'customer'] })
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

export { Customer };
export const CustomerSchema = SchemaFactory.createForClass(Customer);
