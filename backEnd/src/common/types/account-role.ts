export const ACCOUNT_ROLES = ['person', 'shadchan', 'admin'] as const;

export type AccountRole = (typeof ACCOUNT_ROLES)[number];
