import { FilterConfiguration, FullProfile } from '../types/profile';
import { apiRequest } from './apiClient';

type ProfileInput = Partial<FullProfile> & {
  profileId?: string;
  display_name?: string;
};

function normalizeProfile(raw: ProfileInput): FullProfile {
  const firstName = String(raw.firstName ?? '').trim();
  const lastName = String(raw.lastName ?? '').trim();
  const profileName = [firstName, lastName].filter(Boolean).join(' ').trim();
  const displayName =
    String(raw.displayName ?? raw.display_name ?? '').trim() || profileName;

  return {
    ...(raw as FullProfile),
    id: String(raw.id ?? raw.profileId ?? ''),
    firstName,
    lastName,
    displayName,
  };
}

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

  getAll(params?: {
    addedByShadchanId?: string;
    managedByShadchanId?: string;
    ownerAccountId?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.addedByShadchanId) {
      query.set('addedByShadchanId', params.addedByShadchanId);
    }
    if (params?.managedByShadchanId) {
      query.set('managedByShadchanId', params.managedByShadchanId);
    }
    if (params?.ownerAccountId) {
      query.set('ownerAccountId', params.ownerAccountId);
    }
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return apiRequest<ProfileInput[]>(`/profiles${suffix}`).then((list) =>
      list.map((item) => normalizeProfile(item))
    );
  },

  getById(profileId: string) {
    return apiRequest<ProfileInput>(`/profiles/${profileId}`).then((item) =>
      normalizeProfile(item)
    );
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
