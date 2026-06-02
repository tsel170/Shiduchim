import {
  DisplayField,
  DisplayPreferences,
  FilterConfiguration,
  MaritalStatus,
  ProfileRatingCategory,
} from '../types/profile';

export const MAX_PROFILE_PHOTOS = 6;

export const CITIES = [
  { id: 'jerusalem', label: 'ירושלים' },
  { id: 'bnei-brak', label: 'בני ברק' },
  { id: 'modiin', label: 'מודיעין' },
  { id: 'petah-tikva', label: 'פתח תקווה' },
  { id: 'haifa', label: 'חיפה' },
  { id: 'ashdod', label: 'אשדוד' },
  { id: 'beer-sheva', label: 'באר שבע' },
  { id: 'netanya', label: 'נתניה' },
  { id: 'ramat-gan', label: 'רמת גן' },
  { id: 'tzfat', label: 'צפת' },
  { id: 'kiryat-gat', label: 'קריית גת' },
  { id: 'raanana', label: 'רעננה' },
  { id: 'tel-aviv', label: 'תל אביב' },
  { id: 'bet-shemesh', label: 'בית שמש' },
] as const;

export const RELIGIOUS_STREAMS = [
  { id: 'haredi', label: 'חרדי' },
  { id: 'modern-haredi', label: 'חרדי מודרני' },
  { id: 'dati-leumi', label: 'דתי לאומי' },
  { id: 'traditional', label: 'מסורתי' },
  { id: 'sephardi-haredi', label: 'חרדי ספרדי' },
] as const;

/** Add new marital status options here without changing types */
export const MARITAL_STATUS_OPTIONS: ReadonlyArray<{ value: MaritalStatus; label: string }> = [
  { value: 'single', label: 'רווק/ה' },
  { value: 'divorced', label: 'גרוש/ה' },
  { value: 'widowed', label: 'אלמן/ה' },
];

export const PERSONALITY_TRAIT_OPTIONS = [
  'חם/ה',
  'אחריות',
  'שמח/ה',
  'רציני/ת',
  'יצירתי/ת',
  'צנוע/ה',
  'חברותי/ת',
  'רגוע/ה',
  'אנרגטי/ת',
  'אמפתי/ת',
  'מאורגן/ת',
  'גמיש/ה',
] as const;

export const HOBBY_OPTIONS = [
  'קריאה',
  'טיולים',
  'בישול',
  'מוזיקה',
  'ספורט',
  'אמנות',
  'התנדבות',
  'לימוד תורה',
  'צילום',
  'טבע',
  'משפחה',
  'יוגה',
] as const;

export const LOOKING_FOR_OPTIONS = [
  'ערכים דומים',
  'לימוד תורה',
  'משפחה חמה',
  'יציבות כלכלית',
  'צניעות',
  'חינוך לילדים',
  'עלייה לארץ',
  'קריירה מאוזנת',
  'חברות טובה',
  'הומור',
  'אחריות',
  'רוחניות',
] as const;

export const COUNTRY_CODES = [
  { code: '+972', label: 'ישראל (+972)' },
  { code: '+1', label: 'ארה"ב (+1)' },
  { code: '+44', label: 'בריטניה (+44)' },
  { code: '+33', label: 'צרפת (+33)' },
  { code: '+49', label: 'גרמניה (+49)' },
] as const;

export const DISPLAY_FIELDS: ReadonlyArray<{ id: DisplayField; label: string }> = [
  { id: 'city', label: 'עיר' },
  { id: 'height', label: 'גובה' },
  { id: 'maritalStatus', label: 'מצב משפחתי' },
  { id: 'religiousStream', label: 'זרם דתי' },
  { id: 'personalityTraits', label: 'תכונות אישיות' },
  { id: 'hobbies', label: 'תחביבים' },
  { id: 'familyVision', label: 'חזון בית ומשפחה' },
  { id: 'lookingFor', label: 'מחפש/ת' },
];

/** Always visible on profile page — reorder only */
export const REQUIRED_DISPLAY_FIELDS: ReadonlyArray<DisplayField> = [
  'personalityTraits',
  'hobbies',
  'familyVision',
  'lookingFor',
];

export const OPTIONAL_DISPLAY_FIELDS: ReadonlyArray<DisplayField> = [
  'city',
  'height',
  'maritalStatus',
  'religiousStream',
];

const REQUIRED_DISPLAY_FIELD_SET = new Set<DisplayField>(REQUIRED_DISPLAY_FIELDS);

export function isRequiredDisplayField(field: DisplayField): boolean {
  return REQUIRED_DISPLAY_FIELD_SET.has(field);
}

export function isOptionalDisplayField(field: DisplayField): boolean {
  return !isRequiredDisplayField(field);
}

export function getDisplayFieldLabel(field: DisplayField): string {
  return DISPLAY_FIELDS.find((x) => x.id === field)?.label ?? field;
}

export const RATING_CATEGORIES: ReadonlyArray<{
  id: ProfileRatingCategory;
  label: string;
}> = [
  { id: 'personality', label: 'אישיות' },
  { id: 'hobbies', label: 'תחביבים' },
  { id: 'homeVision', label: 'חזון בית ומשפחה' },
  { id: 'lookingFor', label: 'מחפש/ת' },
  { id: 'look', label: 'מראה' },
];

export const DEFAULT_FILTER_CONFIGURATION: FilterConfiguration = {
  ageRange: { min: 18, max: 50 },
  heightRange: { min: 140, max: 210 },
  cities: [],
  religiousStreams: [],
  maritalStatuses: [],
  personalityTraits: [],
  hobbies: [],
  lookingFor: [],
};

export const DEFAULT_DISPLAY_PREFERENCES: DisplayPreferences = {
  visibleFields: {
    city: true,
    height: true,
    maritalStatus: true,
    religiousStream: true,
    personalityTraits: true,
    hobbies: true,
    familyVision: true,
    lookingFor: true,
  },
  fieldOrder: [
    'city',
    'height',
    'maritalStatus',
    'religiousStream',
    'personalityTraits',
    'hobbies',
    'familyVision',
    'lookingFor',
  ],
};

export function getCityLabel(cityId: string): string {
  return CITIES.find((c) => c.id === cityId)?.label ?? cityId;
}

export function getReligiousStreamLabel(streamId: string): string {
  return RELIGIOUS_STREAMS.find((s) => s.id === streamId)?.label ?? streamId;
}

export function getMaritalStatusLabel(status: MaritalStatus): string {
  return MARITAL_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
}
