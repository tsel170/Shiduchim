/** Extensible marital status — add entries to MARITAL_STATUS_OPTIONS in constants */
export type MaritalStatus = string;
export type Gender = string;
export type CityId = string;
export type ReligiousStreamId = string;

export type ProfileRatingCategory =
  | 'personality'
  | 'hobbies'
  | 'familyVision'
  | 'lookingFor'
  | 'look';

export type RequiredProfileRatingCategory =
  | 'personality'
  | 'hobbies'
  | 'familyVision'
  | 'lookingFor';

export type DisplayField =
  | 'city'
  | 'height'
  | 'gender'
  | 'maritalStatus'
  | 'religiousStream'
  | 'personalityTraits'
  | 'hobbies'
  | 'familyVision'
  | 'lookingFor'
  | 'additionalInfo';

export interface ReferenceContact {
  id: string;
  name: string;
  phoneNumber: string;
  countryCode: string;
}

/** Required interface: Profile */
export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  city: CityId;
  heightCm: number;
  religiousStream: ReligiousStreamId;
  gender: Gender;
  maritalStatus: MaritalStatus;
  age: number;
  personalityTraits: string[];
  hobbies: string[];
  familyVision: string;
  lookingFor: string[];
  additionalInfo: string;
  references: ReferenceContact[];
  photos: string[];
  ownerAccountId?: string | null;
  addedByShadchanId?: string | null;
  shadchanIds?: string[];
  cityLatitude?: number | null;
  cityLongitude?: number | null;
  isDeleted?: boolean;
  deletedAt?: string | null;
  /** שם תצוגה מחושב (פרופיל → חשבון) */
  displayName?: string;
}

/** Backward compatible alias */
export type FullProfile = Profile;

/** Compact shape for browse grid cards */
export interface ProfileSummary {
  id: string;
  name: string;
  age: number;
  city: string;
  bio: string;
}

/** Required interface: ProfileRating */
export interface ProfileRating {
  profileId: string;
  personality?: number;
  hobbies?: number;
  familyVision?: number;
  lookingFor?: number;
  look?: number;
  updatedAt: string;
}

/** Required interface: FavoriteProfile */
export interface FavoriteProfile {
  favoriteId: string;
  profileId: string;
  createdAt: string;
  rating: Required<Pick<ProfileRating, 'personality'>> &
    Partial<Pick<ProfileRating, 'hobbies' | 'familyVision' | 'lookingFor' | 'look'>>;
}

/** Required interface: DisplayPreferences */
export interface DisplayPreferences {
  visibleFields: Record<DisplayField, boolean>;
  fieldOrder: DisplayField[];
}

/** Required interface: FilterConfiguration */
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
  originCityId: string | null;
  maxDistanceKm: number | null;
}

export interface ProfileFormErrors {
  firstName?: string;
  age?: string;
  gender?: string;
  maritalStatus?: string;
  heightCm?: string;
  photos?: string;
  references?: Record<string, { name?: string; phoneNumber?: string; countryCode?: string }>;
  general?: string;
}
