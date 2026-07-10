import { FullProfile } from '../types/profile';
import { apiRequest } from './apiClient';

export interface ApiRequest {
  requestId: string;
  senderProfileId?: string;
  targetProfileId: string;
  shadchanId: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  senderProfile?: FullProfile | null;
  targetProfile: FullProfile;
  targetOwnerAccountId?: string | null;
}

export const requestsApi = {
  list() {
    return apiRequest<ApiRequest[]>('/requests');
  },

  listOutgoing() {
    return apiRequest<ApiRequest[]>('/requests/outgoing');
  },

  create(payload: {
    targetProfileId: string;
    senderProfileId?: string;
    shadchanId?: string;
    notes?: string;
  }) {
    return apiRequest<ApiRequest>('/requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  update(requestId: string, payload: { notes?: string }) {
    return apiRequest<ApiRequest>(`/requests/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  remove(requestId: string) {
    return apiRequest<void>(`/requests/${requestId}`, {
      method: 'DELETE',
    });
  },
};
