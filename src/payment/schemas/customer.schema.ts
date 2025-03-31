import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema()
class Customer {
  @Prop({ required: true, enum: ['business', 'customer'] })
  source: string;

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
