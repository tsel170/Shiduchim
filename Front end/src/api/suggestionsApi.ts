import { SuggestionCheckStatus, SuggestionStage } from '../types/suggestion';
import { apiRequest } from './apiClient';

export interface ApiSuggestion {
  suggestionId: string;
  profileId: string;
  shadchanId: string;
  shadchanNote: string;
  sentAt: string;
  stage: SuggestionStage;
  checkStatus?: SuggestionCheckStatus;
}

export const suggestionsApi = {
  list(stage?: SuggestionStage) {
    const suffix = stage ? `?stage=${stage}` : '';
    return apiRequest<ApiSuggestion[]>(`/suggestions${suffix}`);
  },

  create(payload: {
    ownerAccountId: string;
    profileId: string;
    shadchanNote: string;
    stage?: SuggestionStage;
    checkStatus?: SuggestionCheckStatus;
  }) {
    return apiRequest<ApiSuggestion>('/suggestions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  update(
    suggestionId: string,
    payload: Partial<Pick<ApiSuggestion, 'shadchanNote' | 'stage' | 'checkStatus'>>
  ) {
    return apiRequest<ApiSuggestion>(`/suggestions/${suggestionId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
};
