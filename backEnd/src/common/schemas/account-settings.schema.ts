import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  DisplayPreferences,
  DisplayPreferencesSchema,
} from './display-preferences.schema';
import { FilterSettings, FilterSettingsSchema } from './filter-settings.schema';

@Schema({ _id: false })
export class AccountSettings {
  @Prop({ type: FilterSettingsSchema, default: () => ({}) })
  filters: FilterSettings;

  @Prop({
    type: DisplayPreferencesSchema,
    default: () => ({
      visibleFields: [],
      hiddenFields: [],
      fieldOrder: [],
      rankableFields: [],
    }),
  })
  displayPreferences: DisplayPreferences;
}

export const AccountSettingsSchema =
  SchemaFactory.createForClass(AccountSettings);
