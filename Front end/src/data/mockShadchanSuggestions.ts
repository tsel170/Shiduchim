export type SuggestionStage = 'new' | 'in_check' | 'checked';

export type SuggestionCheckStatus =
  | 'sending_profile'
  | 'dor_yesharim_checking'
  | 'phone_checking'
  | 'ready_to_meet'
  | 'denied';

export interface ShadchanSuggestion {
  suggestionId: string;
  profileId: string;
  shadchanNote: string;
  sentAt: string;
  stage: SuggestionStage;
  checkStatus?: SuggestionCheckStatus;
}

export const mockShadchanSuggestions: ShadchanSuggestion[] = [
  {
    suggestionId: 'sug-1',
    profileId: 'p3',
    shadchanNote: 'חשבתי שזה יכול להתאים לך — שווה לבדוק.',
    sentAt: '2026-06-02',
    stage: 'new',
  },
  {
    suggestionId: 'sug-2',
    profileId: 'p4',
    shadchanNote: 'פרופיל מומלץ מהמאגר שלי.',
    sentAt: '2026-06-01',
    stage: 'new',
  },
  {
    suggestionId: 'sug-3',
    profileId: 'p1',
    shadchanNote: 'שלחתי את הפרופיל שלך לבדיקה.',
    sentAt: '2026-05-28',
    stage: 'in_check',
    checkStatus: 'sending_profile',
  },
  {
    suggestionId: 'sug-4',
    profileId: 'p2',
    shadchanNote: 'ממתינים לתשובה מדור ישרים.',
    sentAt: '2026-05-25',
    stage: 'in_check',
    checkStatus: 'dor_yesharim_checking',
  },
  {
    suggestionId: 'sug-5',
    profileId: '5',
    shadchanNote: 'בודקים את פרטי הקשר.',
    sentAt: '2026-05-22',
    stage: 'in_check',
    checkStatus: 'phone_checking',
  },
  {
    suggestionId: 'sug-6',
    profileId: '6',
    shadchanNote: 'שני הצדדים אישרו — אפשר לתאם פגישה.',
    sentAt: '2026-05-20',
    stage: 'in_check',
    checkStatus: 'ready_to_meet',
  },
  {
    suggestionId: 'sug-8',
    profileId: '7',
    shadchanNote: 'לצערי ההצעה לא התקדמה.',
    sentAt: '2026-05-18',
    stage: 'in_check',
    checkStatus: 'denied',
  },
  {
    suggestionId: 'sug-7',
    profileId: '8',
    shadchanNote: 'הצעה שעברה את כל הבדיקות בהצלחה.',
    sentAt: '2026-05-10',
    stage: 'checked',
  },
];
