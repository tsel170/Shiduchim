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
  shadchanId: string;
  shadchanNote: string;
  sentAt: string;
  stage: SuggestionStage;
  checkStatus?: SuggestionCheckStatus;
}
