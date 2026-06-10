import { Account } from '../types/account';

export const mockAccounts: Account[] = [
  {
    accountId: 'acc-person-1',
    email: 'Person',
    password: 'Person',
    role: 'person',
    favoriteProfileIds: ['p1', 'p2'],
  },
  {
    accountId: 'acc-shadchan-1',
    email: 'Shadchan',
    password: 'Shadchan',
    role: 'shadchan',
    managedProfileIds: ['p3', 'p4'],
  },
];
