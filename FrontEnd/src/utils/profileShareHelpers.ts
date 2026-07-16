import {
  DEFAULT_PROFILE_SHARE_SETTINGS,
  isRequiredShareField,
  OPTIONAL_SHARE_FIELDS,
} from '../constants/profileShareOptions';
import { ProfileShareField, ProfileShareSettings } from '../types/profileShare';

export function isShareFieldVisible(
  settings: ProfileShareSettings,
  field: ProfileShareField
): boolean {
  if (isRequiredShareField(field)) return true;
  return settings.visibleFields[field] !== false;
}

export function normalizeProfileShareSettings(
  settings: ProfileShareSettings
): ProfileShareSettings {
  const visibleFields = { ...settings.visibleFields };
  const knownFields = new Set(DEFAULT_PROFILE_SHARE_SETTINGS.fieldOrder);

  settings.fieldOrder.forEach((field) => {
    if (isRequiredShareField(field)) {
      visibleFields[field] = true;
    } else if (visibleFields[field] === undefined) {
      visibleFields[field] = true;
    }
  });

  const fieldOrder = settings.fieldOrder.filter((field) => knownFields.has(field));
  for (const field of DEFAULT_PROFILE_SHARE_SETTINGS.fieldOrder) {
    if (!fieldOrder.includes(field)) {
      fieldOrder.push(field);
    }
  }

  const linesBetweenCategories = Number.isFinite(settings.linesBetweenCategories)
    ? Math.min(10, Math.max(0, Math.round(settings.linesBetweenCategories)))
    : DEFAULT_PROFILE_SHARE_SETTINGS.linesBetweenCategories;

  return { ...settings, visibleFields, fieldOrder, linesBetweenCategories };
}

export function getOrderedVisibleShareFields(settings: ProfileShareSettings): ProfileShareField[] {
  const normalized = normalizeProfileShareSettings(settings);
  return normalized.fieldOrder.filter((field) => isShareFieldVisible(normalized, field));
}

export function isProfileShareSettingsAtDefault(settings: ProfileShareSettings): boolean {
  const normalized = normalizeProfileShareSettings(settings);
  const defaultOrder = DEFAULT_PROFILE_SHARE_SETTINGS.fieldOrder;

  if (normalized.fieldOrder.length !== defaultOrder.length) return false;
  if (normalized.fieldOrder.some((field, index) => field !== defaultOrder[index])) return false;

  const optionalHidden = OPTIONAL_SHARE_FIELDS.some(
    (field) => normalized.visibleFields[field] === false
  );
  const linesChanged =
    normalized.linesBetweenCategories !== DEFAULT_PROFILE_SHARE_SETTINGS.linesBetweenCategories;

  return !optionalHidden && !linesChanged;
}
