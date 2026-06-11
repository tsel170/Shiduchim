export interface ShadchanRequest {
  requestId: string;
  fromPersonId: string;
  fromPersonName: string;
  profileId: string;
  sentAt: string;
  message?: string;
}

export const mockShadchanRequests: ShadchanRequest[] = [
  {
    requestId: 'req-1',
    fromPersonId: 'person-yossi',
    fromPersonName: 'יוסי כהן',
    profileId: 'p1',
    sentAt: '2026-06-02',
    message: 'מעוניין לשמוע עוד על הפרופיל.',
  },
  {
    requestId: 'req-2',
    fromPersonId: 'person-michal',
    fromPersonName: 'מיכל אברהם',
    profileId: 'p2',
    sentAt: '2026-05-30',
    message: 'נשלח דרך "שלח לשדכן".',
  },
  {
    requestId: 'req-3',
    fromPersonId: 'person-eli',
    fromPersonName: 'אלי פרידמן',
    profileId: '5',
    sentAt: '2026-05-28',
    message: 'חשבתי שזה יכול להתאים לי.',
  },
];
