import { FullProfile } from '../types/profile';

export type AccountFilter = 'all' | 'with_account' | 'without_account';

export const ACCOUNT_FILTER_TABS: ReadonlyArray<{ id: AccountFilter; label: string }> = [
  { id: 'all', label: 'הכל' },
  { id: 'with_account', label: 'עם חשבון באפליקציה' },
  { id: 'without_account', label: 'בלי חשבון' },
];

export function profileHasUserAccount(profile: FullProfile): boolean {
  return Boolean(profile.ownerAccountId?.trim());
}

export function filterProfilesByAccount(
  profiles: FullProfile[],
  accountFilter: AccountFilter
): FullProfile[] {
  if (accountFilter === 'with_account') {
    return profiles.filter((profile) => profileHasUserAccount(profile));
  }
  if (accountFilter === 'without_account') {
    return profiles.filter((profile) => !profileHasUserAccount(profile));
  }
  return profiles;
}

export function getAccountFilterEmptyMessage(
  accountFilter: AccountFilter,
  defaultMessage: string
): string {
  if (accountFilter === 'with_account') {
    return 'אין פרופילים עם חשבון באפליקציה.';
  }
  if (accountFilter === 'without_account') {
    return 'אין פרופילים בלי חשבון באפליקציה.';
  }
  return defaultMessage;
}
