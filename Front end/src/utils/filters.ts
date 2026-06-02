import { DEFAULT_FILTER_CONFIGURATION } from '../constants/profileOptions';
import { FilterConfiguration, Profile } from '../types/profile';

export function isFilterKeyAtDefault(
  filters: FilterConfiguration,
  key: keyof FilterConfiguration
): boolean {
  const current = filters[key];
  const defaults = DEFAULT_FILTER_CONFIGURATION[key];
  if (Array.isArray(current)) {
    return current.length === 0 && (defaults as string[]).length === 0;
  }
  const range = current as { min: number; max: number };
  const defaultRange = defaults as { min: number; max: number };
  return range.min === defaultRange.min && range.max === defaultRange.max;
}

export function resetFilterKey(
  filters: FilterConfiguration,
  key: keyof FilterConfiguration
): FilterConfiguration {
  return {
    ...filters,
    [key]: DEFAULT_FILTER_CONFIGURATION[key],
  };
}

const includesAny = (source: string[], selected: string[]) =>
  selected.length === 0 || selected.some((item) => source.includes(item));

const includesValue = (value: string, selected: string[]) =>
  selected.length === 0 || selected.includes(value);

export function filterProfiles(
  profiles: Profile[],
  filters: FilterConfiguration
): Profile[] {
  return profiles.filter((profile) => {
    if (profile.age < filters.ageRange.min || profile.age > filters.ageRange.max) {
      return false;
    }
    if (
      profile.heightCm < filters.heightRange.min ||
      profile.heightCm > filters.heightRange.max
    ) {
      return false;
    }
    if (!includesValue(profile.city, filters.cities)) return false;
    if (!includesValue(profile.religiousStream, filters.religiousStreams)) return false;
    if (!includesValue(profile.maritalStatus, filters.maritalStatuses)) return false;
    if (!includesAny(profile.personalityTraits, filters.personalityTraits)) return false;
    if (!includesAny(profile.hobbies, filters.hobbies)) return false;
    if (!includesAny(profile.lookingFor, filters.lookingFor)) return false;
    return true;
  });
}
