import { FilterConfiguration } from '../types/data-model.types';
import { MIN_PROFILE_AGE } from '../../profiles/constants/profile-options';

export interface ProfileFilterable {
  age: number;
  heightCm?: number;
  city?: string;
  religiousStream?: string;
  gender?: string;
  maritalStatus: string;
  personalityTraits?: string[];
  hobbies?: string[];
  lookingFor?: string[];
}

const includesAny = (source: string[], selected: string[]) =>
  selected.length === 0 || selected.some((item) => source.includes(item));

const hasFilterValue = (value: string | undefined) => Boolean(value?.trim());

const includesValue = (value: string | undefined, selected: string[]) =>
  selected.length === 0 || (hasFilterValue(value) && selected.includes(value!));

const hasRecordedHeight = (heightCm?: number) => (heightCm ?? 0) > 0;

export function matchesFilterConfiguration<T extends ProfileFilterable>(
  profile: T,
  filters: FilterConfiguration,
): boolean {
  const minAge = Math.max(MIN_PROFILE_AGE, filters.ageRange.min);
  const maxAge = Math.max(minAge, filters.ageRange.max);
  if (profile.age < minAge || profile.age > maxAge) {
    return false;
  }
  const height = profile.heightCm ?? 0;
  if (
    hasRecordedHeight(height) &&
    (height < filters.heightRange.min || height > filters.heightRange.max)
  ) {
    return false;
  }
  if (!includesValue(profile.religiousStream, filters.religiousStreams)) return false;
  if (!includesValue(profile.gender, filters.genders)) return false;
  if (!includesValue(profile.maritalStatus, filters.maritalStatuses)) return false;
  if (!includesAny(profile.personalityTraits ?? [], filters.personalityTraits)) {
    return false;
  }
  if (!includesAny(profile.hobbies ?? [], filters.hobbies)) return false;
  if (!includesAny(profile.lookingFor ?? [], filters.lookingFor)) return false;
  return true;
}
