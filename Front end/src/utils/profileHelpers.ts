import { DisplayField, DisplayPreferences, FullProfile, ProfileSummary } from '../types/profile';
import {
  DEFAULT_DISPLAY_PREFERENCES,
  getCityLabel,
  isRequiredDisplayField,
  OPTIONAL_DISPLAY_FIELDS,
} from '../constants/profileOptions';

export function normalizeDisplayPreferences(preferences: DisplayPreferences): DisplayPreferences {
  const visibleFields = { ...preferences.visibleFields };
  preferences.fieldOrder.forEach((field) => {
    if (isRequiredDisplayField(field)) {
      visibleFields[field] = true;
    } else if (visibleFields[field] === undefined) {
      visibleFields[field] = true;
    }
  });
  return { ...preferences, visibleFields };
}

export function isDisplayFieldVisible(
  preferences: DisplayPreferences,
  field: DisplayField
): boolean {
  if (isRequiredDisplayField(field)) return true;
  return preferences.visibleFields[field] !== false;
}

export function getOrderedVisibleFields(preferences: DisplayPreferences): DisplayField[] {
  const normalized = normalizeDisplayPreferences(preferences);
  return normalized.fieldOrder.filter((field) => isDisplayFieldVisible(normalized, field));
}

export function isDisplayPreferencesAtDefault(preferences: DisplayPreferences): boolean {
  const normalized = normalizeDisplayPreferences(preferences);
  const defaultOrder = DEFAULT_DISPLAY_PREFERENCES.fieldOrder;
  if (normalized.fieldOrder.length !== defaultOrder.length) {
    return false;
  }
  const orderChanged = normalized.fieldOrder.some((field, index) => field !== defaultOrder[index]);
  if (orderChanged) {
    return false;
  }
  const optionalHidden = OPTIONAL_DISPLAY_FIELDS.some(
    (field) => normalized.visibleFields[field] === false
  );
  return !optionalHidden;
}

export function getFullName(profile: Pick<FullProfile, 'firstName' | 'lastName'>): string {
  return `${profile.firstName} ${profile.lastName}`.trim();
}

export function toProfileSummary(profile: FullProfile): ProfileSummary {
  const bio =
    profile.familyVision.length > 120
      ? `${profile.familyVision.slice(0, 117)}...`
      : profile.familyVision;

  return {
    id: profile.id,
    name: getFullName(profile),
    age: profile.age,
    city: getCityLabel(profile.city),
    bio,
  };
}

export function createEmptyReference(): import('../types/profile').ReferenceContact {
  return {
    id: `ref-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: '',
    phoneNumber: '',
    countryCode: '+972',
  };
}
