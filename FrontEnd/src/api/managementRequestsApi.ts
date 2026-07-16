import {
  ManagementRequest,
  ManagementRequestProfileContext,
  ManagementRequestResponse,
  ManagementRequestStatus,
} from '../types/managementRequest';
import { apiRequest } from './apiClient';

export const managementRequestsApi = {
  create(payload: { personProfileId: string; message: string }) {
    return apiRequest<ManagementRequest>('/management-requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  list(status?: ManagementRequestStatus) {
    const suffix = status ? `?status=${status}` : '';
    return apiRequest<ManagementRequest[]>(`/management-requests${suffix}`);
  },

  listForShadchan() {
    return apiRequest<ManagementRequest[]>('/management-requests/shadchan');
  },

  getProfileContext(profileId: string) {
    return apiRequest<ManagementRequestProfileContext>(
      `/management-requests/check/${profileId}`
    );
  },

  respond(requestId: string, response: ManagementRequestResponse) {
    return apiRequest<ManagementRequest>(`/management-requests/${requestId}/respond`, {
      method: 'PATCH',
      body: JSON.stringify({ response }),
    });
  },
};
