import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  AccountSettings,
  AccountSettingsSchema,
} from '../../common/schemas/account-settings.schema';

export type AccountDocument = HydratedDocument<Account>;

@Schema({ collection: 'accounts', versionKey: false })
export class Account {
  @Prop({ required: true, unique: true, index: true })
  accountId: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ type: String, required: true, enum: ['person', 'shadchan'] })
  role: 'person' | 'shadchan';

  @Prop({ type: String, default: null })
  profileId: string | null;

  @Prop({ type: String, default: null })
  phone: string | null;

  @Prop({ type: String, default: '' })
  firstName: string;

  @Prop({ type: String, default: '' })
  lastName: string;

  @Prop({ type: AccountSettingsSchema, default: () => ({}) })
  settings: AccountSettings;

  @Prop({ type: [String], default: [] })
  linkedShadchanIds: string[];
}

export const AccountSchema = SchemaFactory.createForClass(Account);
