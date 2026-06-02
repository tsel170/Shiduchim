import {
  FavoriteProfile,
  Profile,
  ProfileRating,
  RequiredProfileRatingCategory,
} from '../types/profile';

export function isRatingsComplete(rating?: ProfileRating): rating is ProfileRating {
  return Boolean(
    rating?.personality &&
      rating?.hobbies &&
      rating?.homeVision &&
      rating?.lookingFor
  );
}

export function isRatingsCompleteStrict(
  rating?: ProfileRating
): rating is ProfileRating &
  Required<Pick<ProfileRating, RequiredProfileRatingCategory>> {
  return Boolean(
    rating?.personality &&
      rating?.hobbies &&
      rating?.homeVision &&
      rating?.lookingFor
  );
}

export type FavoriteSortKey = 'average' | RequiredProfileRatingCategory | 'look';

export function calculateAverageRating(
  rating: Pick<Required<ProfileRating>, RequiredProfileRatingCategory>
): number {
  const total =
    rating.personality +
    rating.hobbies +
    rating.homeVision +
    rating.lookingFor;
  return Number((total / 4).toFixed(1));
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
  rating: ProfileRating
): FavoriteProfile {
  return {
    profileId: profile.id,
    createdAt: new Date().toISOString(),
    rating: {
      personality: rating.personality!,
      hobbies: rating.hobbies!,
      homeVision: rating.homeVision!,
      lookingFor: rating.lookingFor!,
      ...(rating.look !== undefined ? { look: rating.look } : {}),
    },
  };
}
