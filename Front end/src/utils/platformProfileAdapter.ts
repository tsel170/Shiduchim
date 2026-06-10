import { PlatformProfile } from '../types/platformProfile';
import { FullProfile, ReferenceContact } from '../types/profile';

const AUTH_PROFILE_REFERENCES: Record<string, ReferenceContact[]> = {
  p1: [
    { id: 'p1-r1', name: 'רבקה כהן', phoneNumber: '052-1234567', countryCode: '+972' },
    { id: 'p1-r2', name: 'משה כהן', phoneNumber: '054-9876543', countryCode: '+972' },
  ],
  p2: [{ id: 'p2-r1', name: 'יעל לוי', phoneNumber: '058-1112233', countryCode: '+972' }],
  p3: [{ id: 'p3-r1', name: 'דוד גולדשטיין', phoneNumber: '050-3344556', countryCode: '+972' }],
  p4: [
    { id: 'p4-r1', name: 'שרה פרידמן', phoneNumber: '052-7788990', countryCode: '+972' },
    { id: 'p4-r2', name: 'אבי פרידמן', phoneNumber: '053-4455667', countryCode: '+972' },
  ],
};

/** Maps platform browse profiles into the existing FullProfile shape used by the UI. */
export function platformProfileToFullProfile(profile: PlatformProfile): FullProfile {
  return {
    id: profile.profileId,
    firstName: profile.firstName,
    lastName: profile.lastName,
    city: profile.city,
    age: profile.age,
    heightCm: profile.heightCm,
    religiousStream: profile.religiousStream,
    maritalStatus: profile.maritalStatus,
    personalityTraits: [...profile.personalityTraits],
    hobbies: [...profile.hobbies],
    familyVision: profile.homeVision,
    lookingFor: [...profile.lookingFor],
    references: AUTH_PROFILE_REFERENCES[profile.profileId] ?? [],
    photos: [...profile.photos],
  };
}
