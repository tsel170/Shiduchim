import { MaritalStatus } from '../types/profile';

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

export function getCityLabel(cityId: string): string {
  return CITIES.find((c) => c.id === cityId)?.label ?? cityId;
}

export function getReligiousStreamLabel(streamId: string): string {
  return RELIGIOUS_STREAMS.find((s) => s.id === streamId)?.label ?? streamId;
}

export function getMaritalStatusLabel(status: MaritalStatus): string {
  return MARITAL_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
}
