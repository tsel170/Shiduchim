import { FavoriteProfile, FullProfile, ProfileRating } from '../types/profile';
import { apiRequest } from './apiClient';
import { toFavoriteApiRating } from '../utils/rating';

interface ApiFavoriteRating {
  personality: number;
  hobbies?: number;
  familyVision?: number;
  lookingFor?: number;
  look?: number;
  averageRating: number;
}

interface ApiFavorite {
  favoriteId: string;
  profileId: string;
  rating: ApiFavoriteRating;
  requestId: string | null;
  createdAt: string;
}

function toFavoriteProfile(entry: ApiFavorite): FavoriteProfile {
  return {
    favoriteId: entry.favoriteId,
    profileId: entry.profileId,
    createdAt: entry.createdAt,
    rating: {
      personality: entry.rating.personality,
      ...(entry.rating.hobbies !== undefined ? { hobbies: entry.rating.hobbies } : {}),
      ...(entry.rating.familyVision !== undefined
        ? { familyVision: entry.rating.familyVision }
        : {}),
      ...(entry.rating.lookingFor !== undefined ? { lookingFor: entry.rating.lookingFor } : {}),
      ...(entry.rating.look !== undefined ? { look: entry.rating.look } : {}),
    },
  };
}

function toApiRating(
  profile: Pick<FullProfile, 'hobbies' | 'familyVision' | 'lookingFor'>,
  rating: ProfileRating
) {
  return toFavoriteApiRating(profile, rating);
}

export const favoritesApi = {
  async list(): Promise<FavoriteProfile[]> {
    const items = await apiRequest<ApiFavorite[]>('/favorites');
    return items.map(toFavoriteProfile);
  },

  async add(
    profileId: string,
    profile: Pick<FullProfile, 'hobbies' | 'familyVision' | 'lookingFor'>,
    rating: ProfileRating
  ) {
    const entry = await apiRequest<ApiFavorite>('/favorites', {
      method: 'POST',
      body: JSON.stringify({ profileId, rating: toApiRating(profile, rating) }),
    });
    return toFavoriteProfile(entry);
  },

  remove(favoriteId: string) {
    return apiRequest<void>(`/favorites/${favoriteId}`, { method: 'DELETE' });
  },
};
