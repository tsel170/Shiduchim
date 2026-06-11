import { DISPLAY_FIELDS } from './profileOptions';
import { ProfileShareField } from '../types/profileShare';

export const PROFILE_SHARE_FIELDS: ReadonlyArray<{ id: ProfileShareField; label: string }> = [
  { id: 'name', label: 'שם' },
  { id: 'age', label: 'גיל' },
  ...DISPLAY_FIELDS,
  { id: 'photo', label: 'תמונת פרופיל' },
];

export const REQUIRED_SHARE_FIELDS: ReadonlyArray<ProfileShareField> = [
  'name',
  'personalityTraits',
  'hobbies',
  'familyVision',
  'lookingFor',
];

export const OPTIONAL_SHARE_FIELDS: ReadonlyArray<ProfileShareField> = [
  'age',
  'city',
  'height',
  'maritalStatus',
  'religiousStream',
  'photo',
];

export const DEFAULT_PROFILE_SHARE_SETTINGS: {
  visibleFields: Record<ProfileShareField, boolean>;
  fieldOrder: ProfileShareField[];
  linesBetweenCategories: number;
  topPrefix: string;
  bottomPrefix: string;
} = {
  visibleFields: {
    name: true,
    age: true,
    city: true,
    height: true,
    maritalStatus: true,
    religiousStream: true,
    personalityTraits: true,
    hobbies: true,
    familyVision: true,
    lookingFor: true,
    photo: true,
  },
  fieldOrder: [
    'name',
    'age',
    'city',
    'height',
    'maritalStatus',
    'religiousStream',
    'personalityTraits',
    'hobbies',
    'familyVision',
    'lookingFor',
    'photo',
  ],
  linesBetweenCategories: 0,
  topPrefix: 'שלום, מצורף פרופיל שיכול להתאים:',
  bottomPrefix: 'אשמח לשמוע מה דעתך/דעתך.',
};

const REQUIRED_SHARE_FIELD_SET = new Set<ProfileShareField>(REQUIRED_SHARE_FIELDS);

export function isRequiredShareField(field: ProfileShareField): boolean {
  return REQUIRED_SHARE_FIELD_SET.has(field);
}

const PREFIX_STORAGE_KEY = 'shiduchim.shadchanSharePrefixes';

export function loadSavedSharePrefixes(): Pick<
  typeof DEFAULT_PROFILE_SHARE_SETTINGS,
  'topPrefix' | 'bottomPrefix'
> {
  try {
    const raw = localStorage.getItem(PREFIX_STORAGE_KEY);
    if (!raw) return { topPrefix: DEFAULT_PROFILE_SHARE_SETTINGS.topPrefix, bottomPrefix: DEFAULT_PROFILE_SHARE_SETTINGS.bottomPrefix };
    const parsed = JSON.parse(raw) as { topPrefix?: string; bottomPrefix?: string };
    return {
      topPrefix: parsed.topPrefix ?? DEFAULT_PROFILE_SHARE_SETTINGS.topPrefix,
      bottomPrefix: parsed.bottomPrefix ?? DEFAULT_PROFILE_SHARE_SETTINGS.bottomPrefix,
    };
  } catch {
    return {
      topPrefix: DEFAULT_PROFILE_SHARE_SETTINGS.topPrefix,
      bottomPrefix: DEFAULT_PROFILE_SHARE_SETTINGS.bottomPrefix,
    };
  }
}

export function saveSharePrefixes(topPrefix: string, bottomPrefix: string): void {
  localStorage.setItem(PREFIX_STORAGE_KEY, JSON.stringify({ topPrefix, bottomPrefix }));
}

export function getProfileShareFieldLabel(field: ProfileShareField): string {
  return PROFILE_SHARE_FIELDS.find((item) => item.id === field)?.label ?? field;
}
