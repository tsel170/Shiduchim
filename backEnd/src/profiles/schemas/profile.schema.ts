import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  ReferenceContact,
  ReferenceContactSchema,
} from '../../common/schemas/reference-contact.schema';

export type ProfileDocument = HydratedDocument<Profile>;

@Schema({ collection: 'profiles', timestamps: true, versionKey: false })
export class Profile {
  @Prop({ required: true, unique: true, index: true })
  profileId: string;

  @Prop({ type: String, default: null, index: true })
  ownerAccountId: string | null;

  @Prop({ type: String, default: null, index: true })
  addedByShadchanId: string | null;

  @Prop({ required: true })
  firstName: string;

  @Prop({ default: '' })
  lastName: string;

  @Prop({ default: '' })
  city: string;

  @Prop({ required: true })
  age: number;

  @Prop({ default: 0 })
  heightCm: number;

  @Prop({ default: '' })
  religiousStream: string;

  @Prop({ type: String, required: true, enum: ['male', 'female'] })
  gender: 'male' | 'female';

  @Prop({ required: true })
  maritalStatus: string;

  @Prop({ type: [String], default: [] })
  personalityTraits: string[];

  @Prop({ type: [String], default: [] })
  hobbies: string[];

  @Prop({ default: '' })
  familyVision: string;

  @Prop({ type: [String], default: [] })
  lookingFor: string[];

  @Prop({ type: [ReferenceContactSchema], default: [] })
  references: ReferenceContact[];

  @Prop({ type: [String], default: [] })
  photos: string[];

  @Prop({ type: [String], default: [] })
  shadchanIds: string[];

  @Prop()
  aboutMe?: string;

  @Prop()
  aboutMyFamily?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
