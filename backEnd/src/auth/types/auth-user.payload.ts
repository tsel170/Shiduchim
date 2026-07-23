import { AccountRole } from '../../common/types/account-role';

export class AuthUserPayload {
  accountId!: string;
  email!: string;
  role!: AccountRole;
  profileId!: string | null;
}
