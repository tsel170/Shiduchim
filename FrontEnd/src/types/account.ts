import { DisplayPreferences, FilterConfiguration } from './profile';

export type AccountRole = 'person' | 'shadchan' | 'admin';

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

export interface PersonSummary {
  accountId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  profileId: string | null;
  displayName: string;
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
  isBlocked?: boolean;
  isDeleted?: boolean;
  deletedAt?: string | null;
}

/** @deprecated Mock-only shape */
export interface Account extends AuthUser {
  password: string;
  favoriteProfileIds?: string[];
  managedProfileIds?: string[];
}
