/** Extensible marital status — add entries to MARITAL_STATUS_OPTIONS in constants */
export type MaritalStatus = string;
export type CityId = string;
export type ReligiousStreamId = string;

export type ProfileRatingCategory =
  | 'personality'
  | 'hobbies'
  | 'homeVision'
  | 'lookingFor'
  | 'look';

export type RequiredProfileRatingCategory =
  | 'personality'
  | 'hobbies'
  | 'homeVision'
  | 'lookingFor';

export type DisplayField =
  | 'city'
  | 'height'
  | 'maritalStatus'
  | 'religiousStream'
  | 'personalityTraits'
  | 'hobbies'
  | 'familyVision'
  | 'lookingFor';

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
  maritalStatus: MaritalStatus;
  age: number;
  personalityTraits: string[];
  hobbies: string[];
  familyVision: string;
  lookingFor: string[];
  references: ReferenceContact[];
  photos: string[];
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
  homeVision?: number;
  lookingFor?: number;
  look?: number;
  updatedAt: string;
}

/** Required interface: FavoriteProfile */
export interface FavoriteProfile {
  profileId: string;
  createdAt: string;
  rating: Required<Pick<ProfileRating, RequiredProfileRatingCategory>> & {
    look?: number;
  };
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
  maritalStatuses: string[];
  personalityTraits: string[];
  hobbies: string[];
  lookingFor: string[];
}

export interface ProfileFormErrors {
  age?: string;
  heightCm?: string;
  photos?: string;
  references?: Record<string, { name?: string; phoneNumber?: string; countryCode?: string }>;
  general?: string;
}
