import { FullProfile } from '../types/profile';

export const mockMyProfile: FullProfile = {
  id: 'me',
  firstName: 'יוסי',
  lastName: 'כהן',
  city: 'modiin',
  heightCm: 178,
  religiousStream: 'dati-leumi',
  maritalStatus: 'single',
  age: 27,
  personalityTraits: ['אחריות', 'חם/ה', 'רציני/ת'],
  hobbies: ['לימוד תורה', 'טיולים', 'ספורט'],
  familyVision:
    'מחפש בית ישראלי חם, עם דגש על תורה, משפחה וצמיחה משותפת. חשוב לי בן/בת זוג עם ערכים דומים ופתיחות.',
  lookingFor: ['ערכים דומים', 'לימוד תורה', 'משפחה חמה', 'אחריות'],
  references: [
    {
      id: 'my-ref-1',
      name: 'אברהם כהן',
      phoneNumber: '052-1112233',
      countryCode: '+972',
    },
    {
      id: 'my-ref-2',
      name: 'משה לוי',
      phoneNumber: '054-9988776',
      countryCode: '+972',
    },
  ],
  photos: [
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=750&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=750&fit=crop',
  ],
};
