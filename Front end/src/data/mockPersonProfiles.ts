import { FullProfile } from '../types/profile';

const img = (seed: string) =>
  `https://images.unsplash.com/photo-${seed}?w=400&h=400&fit=crop`;

/** Profiles of persons (משודכים) — not shown in browse, used for requests etc. */
export const mockPersonProfiles: FullProfile[] = [
  {
    id: 'person-yossi',
    firstName: 'יוסי',
    lastName: 'כהן',
    city: 'modiin',
    heightCm: 178,
    religiousStream: 'dati-leumi',
    maritalStatus: 'single',
    age: 27,
    personalityTraits: ['אחריות', 'חם/ה', 'רציני/ת'],
    hobbies: ['לימוד תורה', 'טיולים', 'ספורט'],
    familyVision: 'מחפש בית ישראלי חם עם דגש על תורה ומשפחה.',
    lookingFor: ['ערכים דומים', 'לימוד תורה', 'משפחה חמה'],
    references: [],
    photos: [img('1472099645785-5658abf4ff4e')],
  },
  {
    id: 'person-michal',
    firstName: 'מיכל',
    lastName: 'אברהם',
    city: 'ramat-gan',
    heightCm: 165,
    religiousStream: 'modern-haredi',
    maritalStatus: 'single',
    age: 24,
    personalityTraits: ['חם/ה', 'אמפתי/ת', 'מאורגן/ת'],
    hobbies: ['קריאה', 'בישול', 'התנדבות'],
    familyVision: 'בית חם עם ערכי תורה ותמיכה הדדית.',
    lookingFor: ['אחריות', 'צניעות', 'משפחה חמה'],
    references: [],
    photos: [img('1494790108377-be9c29b29330')],
  },
  {
    id: 'person-eli',
    firstName: 'אלי',
    lastName: 'פרידמן',
    city: 'tel-aviv',
    heightCm: 180,
    religiousStream: 'dati-leumi',
    maritalStatus: 'single',
    age: 28,
    personalityTraits: ['רציני/ת', 'אחריות', 'חברותי/ת'],
    hobbies: ['ספורט', 'טיולים', 'מוזיקה'],
    familyVision: 'משפחה עם איזון בין קריירה, בית וערכים.',
    lookingFor: ['ערכים דומים', 'חברות טובה', 'יציבות'],
    references: [],
    photos: [img('1507003211169-0a1dd7228f2d')],
  },
];

export function getPersonProfileById(id: string): FullProfile | undefined {
  return mockPersonProfiles.find((p) => p.id === id);
}
