import {
  PersonSuggestionResponse,
  ProfileSuggestionContext,
  SuggestionCheckStatus,
  SuggestionStage,
} from '../types/suggestion';
import { FullProfile } from '../types/profile';
import { apiRequest } from './apiClient';

export interface ApiSuggestion {
  suggestionId: string;
  profileId: string;
  shadchanId: string;
  shadchanNote: string;
  sentAt: string;
  stage: SuggestionStage;
  checkStatus?: SuggestionCheckStatus;
  personResponse?: PersonSuggestionResponse | null;
  personRespondedAt?: string | null;
  profile?: FullProfile;
  ownerName?: string;
}

export const suggestionsApi = {
  list(stage?: SuggestionStage) {
    const suffix = stage ? `?stage=${stage}` : '';
    return apiRequest<ApiSuggestion[]>(`/suggestions${suffix}`);
  },

  getProfileContext(profileId: string) {
    return apiRequest<ProfileSuggestionContext>(`/suggestions/check/${profileId}`);
  },

  listShadchanResponses() {
    return apiRequest<ApiSuggestion[]>('/suggestions/shadchan/responses');
  },

  respondToProfile(profileId: string, response: PersonSuggestionResponse) {
    return apiRequest<ApiSuggestion>(`/suggestions/profile/${profileId}/response`, {
      method: 'PATCH',
      body: JSON.stringify({ response }),
    });
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
