import { FullProfile } from '../types/profile';

export function isProfileManagedByShadchan(
  profile: FullProfile,
  shadchanAccountId: string
): boolean {
  return (
    profile.addedByShadchanId === shadchanAccountId ||
    (profile.shadchanIds ?? []).includes(shadchanAccountId)
  );
}
