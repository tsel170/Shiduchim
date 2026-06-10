export interface ShadchanRequest {
  requestId: string;
  fromPersonName: string;
  profileId: string;
  profileName: string;
  sentAt: string;
  message?: string;
}

export const mockShadchanRequests: ShadchanRequest[] = [
  {
    requestId: 'req-1',
    fromPersonName: 'Person',
    profileId: 'p1',
    profileName: 'שרה כהן',
    sentAt: '2026-06-02',
    message: 'מעוניין/ת לשמוע עוד על הפרופיל.',
  },
  {
    requestId: 'req-2',
    fromPersonName: 'Person',
    profileId: '2',
    profileName: 'יעל לוי',
    sentAt: '2026-05-30',
    message: 'נשלח דרך "שלח לשדכן".',
  },
];
