import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class ReferenceContact {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  countryCode: string;

  @Prop({ required: true })
  phoneNumber: string;
}

export const ReferenceContactSchema =
  SchemaFactory.createForClass(ReferenceContact);
