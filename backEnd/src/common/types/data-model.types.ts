export type AccountRole = 'person' | 'shadchan';

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
  name: string;
  countryCode: string;
  phoneNumber: string;
}

export interface FilterCriteria {
  maritalStatuses?: string[];
  religiousStreams?: string[];
  hobbies?: string[];
  personalityTraits?: string[];
}

export interface FilterSettings {
  minAge?: number;
  maxAge?: number;
  cities?: string[];
  maxDistanceKm?: number;
  mustHave?: FilterCriteria;
  mustNotHave?: FilterCriteria;
  minHeightCm?: number;
  maxHeightCm?: number;
}

export interface DisplayPreferences {
  visibleFields: string[];
  hiddenFields: string[];
  fieldOrder: string[];
  rankableFields: string[];
}

export interface AccountSettings {
  filters: FilterSettings;
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
  lastName?: string;
  city?: string;
  age: number;
  heightCm?: number;
  religiousStream?: string;
  maritalStatus: string;
  personalityTraits?: string[];
  hobbies?: string[];
  homeVision?: string;
  lookingFor?: string[];
  references?: ReferenceContact[];
  photos?: string[];
  shadchanIds?: string[];
  aboutMe?: string;
  aboutMyFamily?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileRating {
  firstName: number;
  lastName: number;
  city: number;
  age: number;
  heightCm: number;
  religiousStream: number;
  maritalStatus: number;
  personalityTraits: number;
  hobbies: number;
  homeVision: number;
  lookingFor: number;
  photos: number;
  averageRating: number;
}

export interface FavoriteProfile {
  favoriteId: string;
  ownerAccountId: string;
  profileId: string;
  rating: ProfileRating;
  requestId: string | null;
}

export interface Interest {
  interestId: string;
  ownerAccountId: string;
  profileId: string;
  status: InterestStatus;
  updatedAt: Date;
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
