export type AccountRole = 'person' | 'shadchan';

export interface Account {
  accountId: string;
  email: string;
  password: string;
  role: AccountRole;
  favoriteProfileIds?: string[];
  managedProfileIds?: string[];
}

/** Safe subset stored in client session (no password). */
export type AuthUser = Omit<Account, 'password'>;
