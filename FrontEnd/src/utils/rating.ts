import {
  FavoriteProfile,
  Profile,
  ProfileRating,
  ProfileRatingCategory,
  RequiredProfileRatingCategory,
} from '../types/profile';

export function getRateableCategories(
  profile: Pick<Profile, 'hobbies' | 'familyVision' | 'lookingFor'>
): RequiredProfileRatingCategory[] {
  const categories: RequiredProfileRatingCategory[] = ['personality'];
  if (profile.hobbies.length > 0) categories.push('hobbies');
  if (profile.familyVision.trim()) categories.push('familyVision');
  if (profile.lookingFor.length > 0) categories.push('lookingFor');
  return categories;
}

function hasRatingValue(rating: ProfileRating | undefined, category: ProfileRatingCategory): boolean {
  const value = rating?.[category];
  return typeof value === 'number' && value >= 1 && value <= 5;
}

export function isRatingsCompleteForProfile(
  profile: Pick<Profile, 'hobbies' | 'familyVision' | 'lookingFor'>,
  rating?: ProfileRating
): rating is ProfileRating {
  return getRateableCategories(profile).every((category) => hasRatingValue(rating, category));
}

export function isRatingsComplete(rating?: ProfileRating): rating is ProfileRating {
  return Boolean(
    hasRatingValue(rating, 'personality') &&
      hasRatingValue(rating, 'hobbies') &&
      hasRatingValue(rating, 'familyVision') &&
      hasRatingValue(rating, 'lookingFor')
  );
}

export function isRatingsCompleteStrict(
  profile: Pick<Profile, 'hobbies' | 'familyVision' | 'lookingFor'>,
  rating?: ProfileRating
): rating is ProfileRating &
  Required<Pick<ProfileRating, RequiredProfileRatingCategory>> {
  return isRatingsCompleteForProfile(profile, rating);
}

export type FavoriteSortKey = 'average' | RequiredProfileRatingCategory | 'look';

export function calculateAverageRating(
  rating: Partial<Pick<ProfileRating, RequiredProfileRatingCategory | 'look'>>
): number {
  const values = [
    rating.personality,
    rating.hobbies,
    rating.familyVision,
    rating.lookingFor,
    rating.look,
  ].filter((value): value is number => typeof value === 'number');
  if (values.length === 0) return 0;
  const sum = values.reduce((total, value) => total + value, 0);
  return Number((sum / values.length).toFixed(1));
}

export function getFavoriteSortScore(
  rating: FavoriteProfile['rating'],
  sortBy: FavoriteSortKey
): number {
  if (sortBy === 'average') {
    return calculateAverageRating(rating);
  }
  const score = rating[sortBy];
  return score ?? -1;
}

export function toFavoriteProfile(
  profile: Profile,
  rating: ProfileRating,
  favoriteId = 'local-favorite'
): FavoriteProfile {
  return {
    favoriteId,
    profileId: profile.id,
    createdAt: new Date().toISOString(),
    rating: {
      personality: rating.personality!,
      hobbies: rating.hobbies!,
      familyVision: rating.familyVision!,
      lookingFor: rating.lookingFor!,
      ...(rating.look !== undefined ? { look: rating.look } : {}),
    },
  };
}

export function toFavoriteApiRating(
  profile: Pick<Profile, 'hobbies' | 'familyVision' | 'lookingFor'>,
  rating: ProfileRating
) {
  const payload: Record<string, number> = {
    personality: rating.personality!,
  };

  for (const category of getRateableCategories(profile)) {
    if (category === 'personality') continue;
    const value = rating[category];
    if (typeof value === 'number') {
      payload[category] = value;
    }
  }

  if (typeof rating.look === 'number') {
    payload.look = rating.look;
  }

  return payload;
}
