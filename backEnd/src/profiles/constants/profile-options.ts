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

export const HOBBIES = [
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

export const LOOKING_FOR_TRAITS = PERSONALITY_TRAITS;

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
