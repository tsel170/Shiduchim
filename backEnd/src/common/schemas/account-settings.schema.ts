import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  DEFAULT_DISPLAY_PREFERENCES,
  DisplayPreferences,
  DisplayPreferencesSchema,
} from './display-preferences.schema';
import {
  DEFAULT_FILTER_CONFIGURATION,
  FilterConfiguration,
  FilterConfigurationSchema,
} from './filter-settings.schema';

@Schema({ _id: false })
export class AccountSettings {
  @Prop({ type: FilterConfigurationSchema, default: () => DEFAULT_FILTER_CONFIGURATION })
  filters: FilterConfiguration;

  @Prop({
    type: DisplayPreferencesSchema,
    default: () => DEFAULT_DISPLAY_PREFERENCES,
  })
  displayPreferences: DisplayPreferences;
}

export const AccountSettingsSchema =
  SchemaFactory.createForClass(AccountSettings);
