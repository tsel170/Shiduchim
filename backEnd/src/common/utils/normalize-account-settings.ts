import { AccountSettings } from '../schemas/account-settings.schema';
import { DEFAULT_DISPLAY_PREFERENCES } from '../schemas/display-preferences.schema';
import { DEFAULT_FILTER_CONFIGURATION } from '../schemas/filter-settings.schema';
import { MIN_PROFILE_AGE } from '../../profiles/constants/profile-options';

type PartialSettings = {
  filters?: Partial<AccountSettings['filters']>;
  displayPreferences?: Partial<AccountSettings['displayPreferences']>;
};

export function normalizeAccountSettings(
  settings?: PartialSettings | null,
): AccountSettings {
  const filters = settings?.filters;
  const displayPreferences = settings?.displayPreferences;
  const ageMin = Math.max(
    MIN_PROFILE_AGE,
    filters?.ageRange?.min ?? DEFAULT_FILTER_CONFIGURATION.ageRange.min,
  );
  const ageMax = Math.max(
    ageMin,
    filters?.ageRange?.max ?? DEFAULT_FILTER_CONFIGURATION.ageRange.max,
  );

  return {
    filters: {
      ...DEFAULT_FILTER_CONFIGURATION,
      ...filters,
      ageRange: {
        min: ageMin,
        max: ageMax,
      },
      heightRange: {
        ...DEFAULT_FILTER_CONFIGURATION.heightRange,
        ...filters?.heightRange,
      },
      cities: filters?.cities ?? DEFAULT_FILTER_CONFIGURATION.cities,
      religiousStreams:
        filters?.religiousStreams ?? DEFAULT_FILTER_CONFIGURATION.religiousStreams,
      genders: filters?.genders ?? DEFAULT_FILTER_CONFIGURATION.genders,
      maritalStatuses:
        filters?.maritalStatuses ?? DEFAULT_FILTER_CONFIGURATION.maritalStatuses,
      personalityTraits:
        filters?.personalityTraits ?? DEFAULT_FILTER_CONFIGURATION.personalityTraits,
      hobbies: filters?.hobbies ?? DEFAULT_FILTER_CONFIGURATION.hobbies,
      lookingFor: filters?.lookingFor ?? DEFAULT_FILTER_CONFIGURATION.lookingFor,
    },
    displayPreferences: {
      ...DEFAULT_DISPLAY_PREFERENCES,
      ...displayPreferences,
      visibleFields: {
        ...DEFAULT_DISPLAY_PREFERENCES.visibleFields,
        ...displayPreferences?.visibleFields,
      },
      fieldOrder: (() => {
        const order = [
          ...(displayPreferences?.fieldOrder ?? DEFAULT_DISPLAY_PREFERENCES.fieldOrder),
        ];
        for (const field of DEFAULT_DISPLAY_PREFERENCES.fieldOrder) {
          if (!order.includes(field)) {
            order.push(field);
          }
        }
        return order;
      })(),
    },
  };
}
