import { DEFAULT_FILTER_CONFIGURATION, MIN_PROFILE_AGE } from '../constants/profileOptions';
import { FilterConfiguration, Profile } from '../types/profile';

/** Merge partial/stale saved filters with defaults (e.g. after new filter keys are added). */
export function normalizeFilterConfiguration(
  filters?: Partial<FilterConfiguration> | null
): FilterConfiguration {
  const input = filters ?? {};
  const ageMin = Math.max(
    MIN_PROFILE_AGE,
    input.ageRange?.min ?? DEFAULT_FILTER_CONFIGURATION.ageRange.min
  );
  const ageMax = Math.max(
    ageMin,
    input.ageRange?.max ?? DEFAULT_FILTER_CONFIGURATION.ageRange.max
  );

  return {
    ...DEFAULT_FILTER_CONFIGURATION,
    ...input,
    ageRange: {
      min: ageMin,
      max: ageMax,
    },
    heightRange: {
      ...DEFAULT_FILTER_CONFIGURATION.heightRange,
      ...input.heightRange,
    },
    cities: input.cities ?? DEFAULT_FILTER_CONFIGURATION.cities,
    religiousStreams:
      input.religiousStreams ?? DEFAULT_FILTER_CONFIGURATION.religiousStreams,
    genders: input.genders ?? DEFAULT_FILTER_CONFIGURATION.genders,
    maritalStatuses:
      input.maritalStatuses ?? DEFAULT_FILTER_CONFIGURATION.maritalStatuses,
    personalityTraits:
      input.personalityTraits ?? DEFAULT_FILTER_CONFIGURATION.personalityTraits,
    hobbies: input.hobbies ?? DEFAULT_FILTER_CONFIGURATION.hobbies,
    lookingFor: input.lookingFor ?? DEFAULT_FILTER_CONFIGURATION.lookingFor,
  };
}

export function isFilterKeyAtDefault(
  filters: FilterConfiguration,
  key: keyof FilterConfiguration
): boolean {
  const normalized = normalizeFilterConfiguration(filters);
  const current = normalized[key];
  const defaults = DEFAULT_FILTER_CONFIGURATION[key];

  if (Array.isArray(current)) {
    return current.length === 0;
  }

  const range = current as { min: number; max: number };
  const defaultRange = defaults as { min: number; max: number };
  return range.min === defaultRange.min && range.max === defaultRange.max;
}

export function resetFilterKey(
  filters: FilterConfiguration,
  key: keyof FilterConfiguration
): FilterConfiguration {
  return normalizeFilterConfiguration({
    ...filters,
    [key]: DEFAULT_FILTER_CONFIGURATION[key],
  });
}

const includesAny = (source: string[], selected: string[]) =>
  selected.length === 0 || selected.some((item) => source.includes(item));

const hasFilterValue = (value: string) => Boolean(value.trim());

const includesValue = (value: string, selected: string[]) =>
  selected.length === 0 || (hasFilterValue(value) && selected.includes(value));

const hasRecordedHeight = (heightCm: number) => heightCm > 0;

export function filterProfiles(
  profiles: Profile[],
  filters: FilterConfiguration
): Profile[] {
  const normalized = normalizeFilterConfiguration(filters);

  return profiles.filter((profile) => {
    if (
      profile.age < normalized.ageRange.min ||
      profile.age > normalized.ageRange.max
    ) {
      return false;
    }
    if (
      hasRecordedHeight(profile.heightCm) &&
      (profile.heightCm < normalized.heightRange.min ||
        profile.heightCm > normalized.heightRange.max)
    ) {
      return false;
    }
    if (!includesValue(profile.religiousStream, normalized.religiousStreams)) {
      return false;
    }
    if (!includesValue(profile.gender, normalized.genders)) return false;
    if (!includesValue(profile.maritalStatus, normalized.maritalStatuses)) {
      return false;
    }
    if (!includesAny(profile.personalityTraits, normalized.personalityTraits)) {
      return false;
    }
    if (!includesAny(profile.hobbies, normalized.hobbies)) return false;
    if (!includesAny(profile.lookingFor, normalized.lookingFor)) return false;
    return true;
  });
}
