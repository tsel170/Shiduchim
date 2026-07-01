import { FullProfile } from '../types/profile';

export function getProfileDisplayName(
  profile: Pick<FullProfile, 'displayName' | 'firstName' | 'lastName'>
): string {
  if (profile.displayName?.trim()) {
    return profile.displayName.trim();
  }

  const name = [profile.firstName, profile.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ')
    .trim();

  return name || 'משודך/ת';
}

export function getProfileInitial(
  profile: Pick<FullProfile, 'displayName' | 'firstName' | 'lastName'>
): string {
  const displayName = getProfileDisplayName(profile);
  if (displayName && displayName !== 'משודך/ת') {
    return displayName.charAt(0).toUpperCase();
  }
  return 'מ';
}
