import { FullProfile, ProfileSummary } from '../types/profile';
import { getCityLabel } from '../constants/profileOptions';

export function getFullName(profile: Pick<FullProfile, 'firstName' | 'lastName'>): string {
  return `${profile.firstName} ${profile.lastName}`.trim();
}

export function toProfileSummary(profile: FullProfile): ProfileSummary {
  const bio =
    profile.familyVision.length > 120
      ? `${profile.familyVision.slice(0, 117)}...`
      : profile.familyVision;

  return {
    id: profile.id,
    name: getFullName(profile),
    age: profile.age,
    city: getCityLabel(profile.city),
    bio,
    imageUrl: profile.photos[0] ?? '',
    saved: profile.saved,
  };
}

export function createEmptyReference(): import('../types/profile').ReferenceContact {
  return {
    id: `ref-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: '',
    phoneNumber: '',
    countryCode: '+972',
  };
}
