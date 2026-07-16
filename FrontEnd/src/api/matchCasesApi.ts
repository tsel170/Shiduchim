import {
  CaseHistoryEntry,
  MatchCase,
  MatchPriority,
  MatchStatus,
  PersonCaseAction,
  ProfileMatchStatus,
} from '../types/matchCase';
import { apiRequest } from './apiClient';

export const matchCasesApi = {
  create(payload: {
    senderProfileId: string;
    targetProfileId: string;
    assignedShadchanId: string;
    note?: string;
    priority?: MatchPriority;
    tags?: string[];
  }) {
    return apiRequest<MatchCase>('/matchCases', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  list(params?: {
    status?: MatchStatus;
    stage?: import('../types/matchCase').CaseStage;
    priority?: MatchPriority;
    assignedShadchanId?: string;
    profileId?: string;
    tag?: string;
    sort?: 'newest' | 'oldest' | 'updated';
  }) {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.stage) query.set('stage', params.stage);
    if (params?.priority) query.set('priority', params.priority);
    if (params?.assignedShadchanId) query.set('assignedShadchanId', params.assignedShadchanId);
    if (params?.profileId) query.set('profileId', params.profileId);
    if (params?.tag) query.set('tag', params.tag);
    if (params?.sort) query.set('sort', params.sort);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return apiRequest<MatchCase[]>(`/matchCases${suffix}`);
  },

  getById(caseId: string) {
    return apiRequest<MatchCase>(`/matchCases/${caseId}`);
  },

  update(
    caseId: string,
    payload: Partial<{
      currentStatus: MatchStatus;
      priority: MatchPriority;
      tags: string[];
      internalNotes: string;
      assignedShadchanId: string;
      note: string;
    }>
  ) {
    return apiRequest<MatchCase>(`/matchCases/${caseId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  personAction(caseId: string, action: PersonCaseAction, denialReason?: import('../types/matchCase').DenialReason, note?: string) {
    return apiRequest<MatchCase>(`/matchCases/${caseId}/person-action`, {
      method: 'PATCH',
      body: JSON.stringify({ action, denialReason, note }),
    });
  },

  caseAction(
    caseId: string,
    payload: {
      type: import('../types/matchCase').CaseActionType;
      slot?: import('../types/matchCase').SimplePersonSlot;
      denialReason?: import('../types/matchCase').DenialReason;
      note?: string;
    }
  ) {
    return apiRequest<MatchCase>(`/matchCases/${caseId}/actions`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getContactDetails(caseId: string) {
    return apiRequest<import('../types/matchCase').ContactDetailsPayload>(
      `/matchCases/${caseId}/contact-details`
    );
  },

  close(caseId: string, reason: string) {
    return apiRequest<MatchCase>(`/matchCases/${caseId}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    });
  },

  getHistory(caseId: string) {
    return apiRequest<CaseHistoryEntry[]>(`/matchCases/${caseId}/history`);
  },

  getProfileStatuses(profileIds: string[]) {
    if (profileIds.length === 0) return Promise.resolve([] as ProfileMatchStatus[]);
    const query = new URLSearchParams({ profileIds: profileIds.join(',') });
    return apiRequest<{ statuses: ProfileMatchStatus[] }>(
      `/matchCases/profile-statuses?${query.toString()}`
    ).then((res) => res.statuses);
  },

  getProfileContext(profileId: string) {
    return apiRequest<{ hasCase: boolean; matchCase?: MatchCase }>(
      `/matchCases/profile-context/${profileId}`
    );
  },
};
