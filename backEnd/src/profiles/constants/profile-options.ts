/** Slug ids aligned with Front end/src/constants/profileOptions.ts */

export const MIN_PROFILE_AGE = 18;

export const CITIES = [
  'jerusalem',
  'bnei-brak',
  'modiin',
  'petah-tikva',
  'haifa',
  'ashdod',
  'beer-sheva',
  'netanya',
  'ramat-gan',
  'tzfat',
  'kiryat-gat',
  'raanana',
  'tel-aviv',
  'bet-shemesh',
] as const;

export const RELIGIOUS_STREAMS = [
  'haredi',
  'modern-haredi',
  'dati-leumi',
  'traditional',
  'sephardi-haredi',
] as const;

export const MARITAL_STATUSES = ['single', 'divorced', 'widowed'] as const;

export const GENDERS = ['male', 'female'] as const;

export const PERSONALITY_TRAITS = [
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

export const HOBBIES = [
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

export const LOOKING_FOR_TRAITS = [
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

export const DISPLAY_FIELDS = [
  'city',
  'height',
  'gender',
  'maritalStatus',
  'religiousStream',
  'personalityTraits',
  'hobbies',
  'familyVision',
  'lookingFor',
] as const;

export const PROFILE_OPTIONS_RESPONSE = {
  cities: CITIES,
  religiousStreams: RELIGIOUS_STREAMS,
  genders: GENDERS,
  maritalStatuses: MARITAL_STATUSES,
  personalityTraits: PERSONALITY_TRAITS,
  hobbies: HOBBIES,
  lookingFor: LOOKING_FOR_TRAITS,
  displayFields: DISPLAY_FIELDS,
};
