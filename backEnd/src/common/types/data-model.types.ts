export type AccountRole = 'person' | 'shadchan';

export type MatchPriority = 'low' | 'normal' | 'high';

export type MatchStatus =
  | 'pending'
  | 'reviewing'
  | 'contacting_sender'
  | 'waiting_for_sender'
  | 'contacting_receiver'
  | 'waiting_for_receiver'
  | 'matched'
  | 'rejected'
  | 'cancelled'
  | 'closed';

export type PersonCaseAction = 'interested' | 'not_interested';

export type CaseHistoryAction =
  | 'Created'
  | 'Status Changed'
  | 'Assigned'
  | 'Reassigned'
  | 'Note Added'
  | 'Closed'
  | 'Reopened';

export interface MatchCase {
  caseId: string;
  senderProfileId: string;
  targetProfileId: string;
  senderAccountId: string;
  targetAccountId: string | null;
  assignedShadchanId: string;
  currentStatus: MatchStatus;
  priority: MatchPriority;
  tags: string[];
  internalNotes: string;
  createdAt: Date;
  updatedAt: Date;
  closedAt: Date | null;
}

export interface CaseHistoryEntry {
  historyId: string;
  caseId: string;
  action: CaseHistoryAction;
  previousStatus?: MatchStatus;
  newStatus?: MatchStatus;
  changedByAccountId: string;
  timestamp: Date;
  note?: string;
}

export type SuggestionStage = 'new' | 'in_check' | 'checked';

export type SuggestionCheckStatus =
  | 'sending_profile'
  | 'dor_yesharim_checking'
  | 'phone_checking'
  | 'ready_to_meet'
  | 'denied';

export type InterestStatus =
  | 'Dating'
  | 'notRequested'
  | 'requested'
  | 'underReview'
  | 'DoryesharimReview'
  | 'phoneReview'
  | 'presented'
  | 'accepted'
  | 'declined';

export interface ReferenceContact {
  id: string;
  name: string;
  countryCode: string;
  phoneNumber: string;
}

export interface ProfileRating {
  personality: number;
  hobbies: number;
  familyVision: number;
  lookingFor: number;
  look?: number;
  averageRating: number;
}

export interface FilterConfiguration {
  ageRange: { min: number; max: number };
  heightRange: { min: number; max: number };
  cities: string[];
  religiousStreams: string[];
  genders: string[];
  maritalStatuses: string[];
  personalityTraits: string[];
  hobbies: string[];
  lookingFor: string[];
}

export interface DisplayPreferences {
  visibleFields: Record<string, boolean>;
  fieldOrder: string[];
}

export interface AccountSettings {
  filters: FilterConfiguration;
  displayPreferences: DisplayPreferences;
}

export interface Account {
  accountId: string;
  email: string;
  passwordHash: string;
  role: AccountRole;
  profileId: string | null;
  settings: AccountSettings;
}

export interface Profile {
  profileId: string;
  ownerAccountId: string | null;
  addedByShadchanId: string | null;
  firstName: string;
  lastName: string;
  city: string;
  age: number;
  heightCm: number;
  religiousStream: string;
  gender: string;
  maritalStatus: string;
  personalityTraits: string[];
  hobbies: string[];
  familyVision: string;
  lookingFor: string[];
  additionalInfo: string;
  references: ReferenceContact[];
  photos: string[];
  shadchanIds?: string[];
  aboutMe?: string;
  aboutMyFamily?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FavoriteProfile {
  favoriteId: string;
  ownerAccountId: string;
  profileId: string;
  rating: ProfileRating;
  requestId: string | null;
  createdAt: Date;
}

export interface Suggestion {
  suggestionId: string;
  ownerAccountId: string;
  profileId: string;
  shadchanId: string;
  shadchanNote: string;
  sentAt: Date;
  stage: SuggestionStage;
  checkStatus?: SuggestionCheckStatus;
}

export interface MatchRequest {
  requestId: string;
  senderProfileId: string;
  targetProfileId: string;
  shadchanId: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
