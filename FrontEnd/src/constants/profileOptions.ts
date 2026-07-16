import {
  DisplayField,
  DisplayPreferences,
  FilterConfiguration,
  Gender,
  MaritalStatus,
  ProfileRatingCategory,
} from '../types/profile';

export const MAX_PROFILE_PHOTOS = 6;
export const MIN_PROFILE_AGE = 18;

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

export const GENDER_OPTIONS: ReadonlyArray<{ value: Gender; label: string }> = [
  { value: 'male', label: 'גבר' },
  { value: 'female', label: 'אישה' },
];

export const PERSONALITY_TRAIT_OPTIONS = [
  'אדיב/ה',
  'ישר/ה',
  'נאמן/נאמנה',
  'מכבד/ת',
  'סבלני/ת',
  'רחום/ת',
  'אמפתי/ת',
  'אופטימי/ת',
  'אחראי/ת',
  'אמין/ה',
  'חרוץ/חרוצה',
  'שאפתן/ית',
  'בטוח/ה בעצמו',
  'צנוע/ה',
  'נדיב/ה',
  'תומך/ת',
  'שומע/ה טוב',
  'מתקשר/ת טוב',
  'רגוע/ה',
  'חיובי/ת',
  'מצחיק/ה',
  'יצירתי/ת',
  'בעל/ת אופקים',
  'משפחתי/ת',
  'עצמאי/ת',
  'בוגר/ה רגשית',
  'מאורגן/ת',
  'הרפתקן/ית',
  'מתחשב/ת',
  'ראוי/ה לאמון',
] as const;

export const HOBBY_OPTIONS = [
  'קריאה',
  'בישול',
  'אפייה',
  'נסיעות',
  'טיולי הליכה',
  'קемпינג',
  'ריצה',
  'כושר',
  'שחייה',
  'רכיבה על אופניים',
  'צילום',
  'ציור',
  'מוזיקה',
  'שירה',
  'נגינה',
  'משחקי קופסה',
  'משחקי מחשב',
  'קולנוע',
  'תיאטרון',
  'ריקוד',
  'התנדבות',
  'גינון',
  'יצירה ומלאכות יד',
  'לימוד שפות',
  'תכנות',
  'שחמט',
  'דיג',
  'כתיבה',
  'האזנה לפודקאst',
  'בתי קפה',
] as const;

export const LOOKING_FOR_OPTIONS = PERSONALITY_TRAIT_OPTIONS;

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
  { id: 'gender', label: 'מין' },
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
  'gender',
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
  { id: 'familyVision', label: 'חזון בית ומשפחה' },
  { id: 'lookingFor', label: 'מחפש/ת' },
  { id: 'look', label: 'מראה' },
];

export const DEFAULT_FILTER_CONFIGURATION: FilterConfiguration = {
  ageRange: { min: MIN_PROFILE_AGE, max: 50 },
  heightRange: { min: 140, max: 210 },
  cities: [],
  religiousStreams: [],
  genders: [],
  maritalStatuses: [],
  personalityTraits: [],
  hobbies: [],
  lookingFor: [],
};

export const DEFAULT_DISPLAY_PREFERENCES: DisplayPreferences = {
  visibleFields: {
    city: true,
    height: true,
    gender: true,
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
    'gender',
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

export function isKnownCityId(city: string): boolean {
  return Boolean(city) && CITIES.some((entry) => entry.id === city);
}

export function isPersonalityTrait(value: string): boolean {
  return (PERSONALITY_TRAIT_OPTIONS as readonly string[]).includes(value);
}

export function filterPersonalityTraits(values: string[]): string[] {
  return values.filter(isPersonalityTrait);
}

export function getReligiousStreamLabel(streamId: string): string {
  return RELIGIOUS_STREAMS.find((s) => s.id === streamId)?.label ?? streamId;
}

export function getMaritalStatusLabel(status: MaritalStatus): string {
  return MARITAL_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
}

export function getGenderLabel(gender: Gender): string {
  return GENDER_OPTIONS.find((o) => o.value === gender)?.label ?? gender;
}
