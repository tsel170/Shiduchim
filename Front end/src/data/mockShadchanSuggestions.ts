export interface ShadchanSuggestion {
  suggestionId: string;
  profileId: string;
  shadchanNote: string;
  sentAt: string;
}

export const mockShadchanSuggestions: ShadchanSuggestion[] = [
  {
    suggestionId: 'sug-1',
    profileId: 'p3',
    shadchanNote: 'חשבתי שזה יכול להתאים לך — שווה לבדוק.',
    sentAt: '2026-06-02',
  },
  {
    suggestionId: 'sug-2',
    profileId: 'p4',
    shadchanNote: 'פרופיל מומלץ מהמאגר שלי.',
    sentAt: '2026-06-01',
  },
];
