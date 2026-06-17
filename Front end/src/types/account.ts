import { DisplayPreferences, FilterConfiguration } from './profile';

export type AccountRole = 'person' | 'shadchan';

export interface AccountSettings {
  filters: FilterConfiguration;
  displayPreferences: DisplayPreferences;
}

export interface ShadchanSummary {
  accountId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
}

/** Account returned from API (no password). */
export interface AuthUser {
  accountId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: AccountRole;
  profileId: string | null;
  phone: string | null;
  settings: AccountSettings;
  linkedShadchanIds: string[];
}

/** @deprecated Mock-only shape */
export interface Account extends AuthUser {
  password: string;
  favoriteProfileIds?: string[];
  managedProfileIds?: string[];
}
