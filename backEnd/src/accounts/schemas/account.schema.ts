import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  AccountSettings,
  AccountSettingsSchema,
} from '../../common/schemas/account-settings.schema';
import { ACCOUNT_ROLES } from '../../common/types/account-role';
import type { AccountRole } from '../../common/types/account-role';

export type AccountDocument = HydratedDocument<Account>;

@Schema({ collection: 'accounts', versionKey: false })
export class Account {
  @Prop({ required: true, unique: true, index: true })
  accountId: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ type: String, required: true, enum: ACCOUNT_ROLES })
  role: AccountRole;

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

  @Prop({ type: Boolean, default: false, index: true })
  isBlocked: boolean;

  @Prop({ type: Boolean, default: false, index: true })
  isDeleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
