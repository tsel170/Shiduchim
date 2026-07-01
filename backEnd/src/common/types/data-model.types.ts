export type AccountRole = 'person' | 'shadchan';

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
