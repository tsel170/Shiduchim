import { apiRequest } from './apiClient';
import { AccountRole, AuthUser } from '../types/account';
import { FavoriteProfile, FullProfile } from '../types/profile';
import { MatchCase } from '../types/matchCase';

export interface AdminAccount extends AuthUser {
  isBlocked: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  associatedProfile?: FullProfile | null;
  responsibleShadchanim?: Array<{
    accountId: string;
    email: string;
    firstName: string;
    lastName: string;
  }>;
}

export const adminApi = {
  listAccounts(params?: {
    q?: string;
    role?: AccountRole;
    isBlocked?: boolean;
    isDeleted?: boolean;
  }) {
    const query = new URLSearchParams();
    if (params?.q) query.set('q', params.q);
    if (params?.role) query.set('role', params.role);
    if (params?.isBlocked != null) query.set('isBlocked', String(params.isBlocked));
    if (params?.isDeleted != null) query.set('isDeleted', String(params.isDeleted));
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return apiRequest<AdminAccount[]>(`/admin/accounts${suffix}`);
  },

  getAccount(accountId: string) {
    return apiRequest<AdminAccount>(`/admin/accounts/${accountId}`);
  },

  blockAccount(accountId: string) {
    return apiRequest<AdminAccount>(`/admin/accounts/${accountId}/block`, { method: 'PATCH' });
  },

  unblockAccount(accountId: string) {
    return apiRequest<AdminAccount>(`/admin/accounts/${accountId}/unblock`, { method: 'PATCH' });
  },

  softDeleteAccount(accountId: string) {
    return apiRequest<AdminAccount>(`/admin/accounts/${accountId}/soft-delete`, {
      method: 'PATCH',
    });
  },

  restoreAccount(accountId: string) {
    return apiRequest<AdminAccount>(`/admin/accounts/${accountId}/restore`, { method: 'PATCH' });
  },

  listProfiles(includeDeleted = false) {
    const suffix = includeDeleted ? '?includeDeleted=true' : '';
    return apiRequest<FullProfile[]>(`/admin/profiles${suffix}`);
  },

  softDeleteProfile(profileId: string) {
    return apiRequest<FullProfile>(`/admin/profiles/${profileId}/soft-delete`, {
      method: 'PATCH',
    });
  },

  restoreProfile(profileId: string) {
    return apiRequest<FullProfile>(`/admin/profiles/${profileId}/restore`, { method: 'PATCH' });
  },

  listMatchCases() {
    return apiRequest<MatchCase[]>('/admin/match-cases');
  },

  listFavorites() {
    return apiRequest<FavoriteProfile[]>('/admin/favorites');
  },
};
