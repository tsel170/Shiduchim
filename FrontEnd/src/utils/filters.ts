import { DEFAULT_FILTER_CONFIGURATION, MIN_PROFILE_AGE, filterPersonalityTraits } from '../constants/profileOptions';
import { FilterConfiguration, Profile } from '../types/profile';
import { distanceKm, getCityCoordinates } from './citiesStore';

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
    lookingFor: filterPersonalityTraits(input.lookingFor ?? DEFAULT_FILTER_CONFIGURATION.lookingFor),
    originCityId: input.originCityId?.trim()
      ? input.originCityId.trim()
      : DEFAULT_FILTER_CONFIGURATION.originCityId,
    maxDistanceKm: normalizeMaxDistanceKm(
      input.maxDistanceKm ?? DEFAULT_FILTER_CONFIGURATION.maxDistanceKm
    ),
  };
}

/** Empty / 0 / invalid → null (distance filter off = show everyone). */
function normalizeMaxDistanceKm(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.min(500, n);
}

export function isFilterKeyAtDefault(
  filters: FilterConfiguration,
  key: keyof FilterConfiguration
): boolean {
  const normalized = normalizeFilterConfiguration(filters);
  const current = normalized[key];
  const defaults = DEFAULT_FILTER_CONFIGURATION[key];

  if (key === 'originCityId' || key === 'maxDistanceKm') {
    return current == null || current === defaults;
  }

  if (Array.isArray(current)) {
    return current.length === 0;
  }

  if (typeof current === 'string' || typeof current === 'number' || current === null) {
    return current === defaults;
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

/**
 * Distance rules (exact product behavior):
 * - maxDistanceKm empty → do not filter by distance (show all matching other filters)
 * - maxDistanceKm set + originCityId → keep profiles whose city is within that radius
 * - maxDistanceKm set but no origin city → do not filter by distance
 */
export function filterProfiles(
  profiles: Profile[],
  filters: FilterConfiguration
): Profile[] {
  const normalized = normalizeFilterConfiguration(filters);
  const maxKm = normalized.maxDistanceKm;
  const originId = normalized.originCityId;
  const distanceActive = Boolean(originId && maxKm != null && maxKm > 0);
  const origin = distanceActive ? getCityCoordinates(originId) : null;

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
    if (!includesValue(profile.city, normalized.cities)) return false;

    if (distanceActive && origin) {
      const target = getCityCoordinates(profile.city, {
        latitude: profile.cityLatitude,
        longitude: profile.cityLongitude,
      });
      if (!target) return false;
      if (distanceKm(origin, target) > maxKm!) return false;
    }

    return true;
  });
}
