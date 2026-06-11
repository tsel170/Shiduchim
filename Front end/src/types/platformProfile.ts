/**
 * Browse / catalog profile model.
 * Profile IDs are separate from account IDs.
 */
export interface PlatformProfile {
  profileId: string;
  firstName: string;
  lastName: string;
  city: string;
  age: number;
  heightCm: number;
  religiousStream: string;
  maritalStatus: string;
  personalityTraits: string[];
  hobbies: string[];
  homeVision: string;
  lookingFor: string[];
  photos: string[];
}
