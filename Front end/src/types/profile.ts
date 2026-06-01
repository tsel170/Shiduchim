/** Extensible marital status — add entries to MARITAL_STATUS_OPTIONS in constants */
export type MaritalStatus = string;

export type CityId = string;
export type ReligiousStreamId = string;

export interface ReferenceContact {
  id: string;
  name: string;
  phoneNumber: string;
  countryCode: string;
}

export interface FullProfile {
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
  saved?: boolean;
}

/** Compact shape for browse grid cards */
export interface ProfileSummary {
  id: string;
  name: string;
  age: number;
  city: string;
  bio: string;
  imageUrl: string;
  saved?: boolean;
}

export interface ProfileFormErrors {
  age?: string;
  heightCm?: string;
  photos?: string;
  references?: Record<string, { name?: string; phoneNumber?: string; countryCode?: string }>;
  general?: string;
}
