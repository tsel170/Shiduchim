import { FilterConfiguration, FullProfile } from '../types/profile';
import { apiRequest } from './apiClient';

export const profilesApi = {
  getOptions() {
    return apiRequest<{
      cities: string[];
      genders?: string[];
      maritalStatuses: string[];
    }>('/profiles/options', {}, { skipAuth: true });
  },

  search(filters: FilterConfiguration) {
    return apiRequest<FullProfile[]>('/profiles/search', {
      method: 'POST',
      body: JSON.stringify({ filters }),
    });
  },

  getAll(params?: { addedByShadchanId?: string; ownerAccountId?: string }) {
    const query = new URLSearchParams();
    if (params?.addedByShadchanId) {
      query.set('addedByShadchanId', params.addedByShadchanId);
    }
    if (params?.ownerAccountId) {
      query.set('ownerAccountId', params.ownerAccountId);
    }
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return apiRequest<FullProfile[]>(`/profiles${suffix}`);
  },

  getById(profileId: string) {
    return apiRequest<FullProfile>(`/profiles/${profileId}`);
  },

  create(profile: Omit<FullProfile, 'id'> & { addedByShadchanId?: string | null }) {
    return apiRequest<FullProfile>('/profiles', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  },

  createFromBody(body: Record<string, unknown>) {
    return apiRequest<FullProfile>('/profiles', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  createMine(body: Record<string, unknown>) {
    return apiRequest<FullProfile>('/profiles/mine', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  update(profileId: string, profile: Partial<FullProfile>) {
    return apiRequest<FullProfile>(`/profiles/${profileId}`, {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  },

  updateShadchan(profileId: string, body: Record<string, unknown>) {
    return apiRequest<FullProfile>(`/profiles/${profileId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  remove(profileId: string) {
    return apiRequest<void>(`/profiles/${profileId}`, {
      method: 'DELETE',
    });
  },
};
