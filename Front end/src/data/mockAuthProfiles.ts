import { PlatformProfile } from '../types/platformProfile';

const img = (seed: string) =>
  `https://images.unsplash.com/photo-${seed}?w=600&h=750&fit=crop`;

export const mockAuthProfiles: PlatformProfile[] = [
  {
    profileId: 'p1',
    firstName: 'שרה',
    lastName: 'כהן',
    city: 'jerusalem',
    age: 24,
    heightCm: 165,
    religiousStream: 'modern-haredi',
    maritalStatus: 'single',
    personalityTraits: ['חם/ה', 'אחריות', 'צנוע/ה'],
    hobbies: ['קריאה', 'טיולים', 'לימוד תורה'],
    homeVision: 'מחפשת בית חם עם ערכי תורה ומשפחה מלוכדת.',
    lookingFor: ['ערכים דומים', 'לימוד תורה', 'משפחה חמה'],
    photos: [img('1494790108377-be9c29b29330'), img('1517841905240-472988babdf9')],
  },
  {
    profileId: 'p2',
    firstName: 'רבקה',
    lastName: 'לוי',
    city: 'bnei-brak',
    age: 22,
    heightCm: 160,
    religiousStream: 'haredi',
    maritalStatus: 'single',
    personalityTraits: ['רציני/ת', 'צנוע/ה', 'אמפתי/ת'],
    hobbies: ['בישול', 'התנדבות', 'משפחה'],
    homeVision: 'בית מלא חסד, עם דגש על מסורת וצניעות.',
    lookingFor: ['צניעות', 'ערכים דומים', 'אחריות'],
    photos: [img('1438761681033-6461ffad8d80')],
  },
  {
    profileId: 'p3',
    firstName: 'מירי',
    lastName: 'גולדשטיין',
    city: 'modiin',
    age: 26,
    heightCm: 168,
    religiousStream: 'dati-leumi',
    maritalStatus: 'single',
    personalityTraits: ['יצירתי/ת', 'שמח/ה', 'חברותי/ת'],
    hobbies: ['אמנות', 'מוזיקה', 'טיולים'],
    homeVision: 'משפחה עם אהבה, צחוק וערכים.',
    lookingFor: ['הומור', 'משפחה חמה', 'חברות טובה'],
    photos: [img('1544005313-94ddf0286df2'), img('1487412720507-e7ab37603c6f')],
  },
  {
    profileId: 'p4',
    firstName: 'חנה',
    lastName: 'פרידמן',
    city: 'petah-tikva',
    age: 23,
    heightCm: 163,
    religiousStream: 'modern-haredi',
    maritalStatus: 'single',
    personalityTraits: ['אחריות', 'מאורגן/ת', 'רגוע/ה'],
    hobbies: ['קריאה', 'ספורט', 'לימוד תורה'],
    homeVision: 'בית יציב עם דגש על חינוך ותמיכה הדדית.',
    lookingFor: ['יציבות כלכלית', 'חינוך לילדים', 'לימוד תורה'],
    photos: [img('1507003211169-0a1dd7228f2d')],
  },
];

export function getAuthProfileById(profileId: string): PlatformProfile | undefined {
  return mockAuthProfiles.find((p) => p.profileId === profileId);
}

export function getAuthProfilesByIds(profileIds: string[]): PlatformProfile[] {
  return profileIds
    .map((id) => getAuthProfileById(id))
    .filter((p): p is PlatformProfile => Boolean(p));
}
