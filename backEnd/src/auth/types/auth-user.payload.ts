export class AuthUserPayload {
  accountId!: string;
  email!: string;
  role!: 'person' | 'shadchan';
  profileId!: string | null;
}
