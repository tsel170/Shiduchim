import { AuthUser, AccountRole, ShadchanSummary } from '../types/account';
import { DisplayPreferences, FilterConfiguration } from '../types/profile';
import { apiRequest, setStoredToken } from './apiClient';

export interface LoginResponse {
  token: string;
  account: AuthUser;
}

type ShadchanSummaryInput = Partial<ShadchanSummary> & {
  first_name?: string;
  last_name?: string;
};

function normalizeShadchanSummary(raw: ShadchanSummaryInput): ShadchanSummary {
  return {
    accountId: String(raw.accountId ?? ''),
    firstName: String(raw.firstName ?? raw.first_name ?? '').trim(),
    lastName: String(raw.lastName ?? raw.last_name ?? '').trim(),
    email: String(raw.email ?? ''),
    phone: raw.phone != null && String(raw.phone).trim() ? String(raw.phone) : null,
  };
}

function fetchAllShadchanim() {
  return apiRequest<ShadchanSummary[]>('/accounts/shadchanim')
    .then((list) => list.map((item) => normalizeShadchanSummary(item)))
    .catch(() =>
      apiRequest<ShadchanSummary[]>('/auth/shadchanim')
        .then((list) => list.map((item) => normalizeShadchanSummary(item)))
        .catch(() =>
          apiRequest<AuthUser[]>('/accounts?role=shadchan').then((accounts) =>
            accounts
              .filter((account) => account.role === 'shadchan')
              .map((account) =>
                normalizeShadchanSummary({
                  accountId: account.accountId,
                  firstName: account.firstName,
                  lastName: account.lastName,
                  email: account.email,
                  phone: account.phone,
                })
              )
          )
        )
    );
}

export const authApi = {
  login(email: string, password: string) {
    return apiRequest<LoginResponse>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
      { skipAuth: true }
    );
  },

  register(
    email: string,
    password: string,
    role: AccountRole,
    firstName: string,
    lastName: string,
    phone: string
  ) {
    return apiRequest<LoginResponse>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          role,
          firstName: firstName.trim(),
          ...(lastName.trim() ? { lastName: lastName.trim() } : {}),
          phone: phone.trim(),
        }),
      },
      { skipAuth: true }
    );
  },

  async persistSession(response: LoginResponse) {
    setStoredToken(response.token);
    return response.account;
  },

  getCurrentUser() {
    return apiRequest<AuthUser>('/auth/me');
  },

  updateSettings(settings: {
    filters?: FilterConfiguration;
    displayPreferences?: DisplayPreferences;
  }) {
    return apiRequest<AuthUser>('/auth/me/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  },

  updateProfile(body: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string | null;
  }) {
    return apiRequest<AuthUser>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  getShadchanim() {
    return fetchAllShadchanim();
  },

  getLinkedShadchanim() {
    return apiRequest<ShadchanSummary[]>('/auth/me/linked-shadchanim')
      .then((list) => list.map((item) => normalizeShadchanSummary(item)))
      .catch(async () => {
        const [user, shadchanim] = await Promise.all([
          apiRequest<AuthUser>('/auth/me'),
          fetchAllShadchanim(),
        ]);
        const linkedIds = new Set(user.linkedShadchanIds ?? []);
        return shadchanim.filter((shadchan) => linkedIds.has(shadchan.accountId));
      });
  },

  addLinkedShadchan(shadchanAccountId: string) {
    return apiRequest<AuthUser>('/auth/me/linked-shadchanim', {
      method: 'POST',
      body: JSON.stringify({ shadchanAccountId }),
    });
  },

  removeLinkedShadchan(shadchanAccountId: string) {
    return apiRequest<AuthUser>(`/auth/me/linked-shadchanim/${shadchanAccountId}`, {
      method: 'DELETE',
    });
  },

  clearSession() {
    setStoredToken(null);
  },
};
