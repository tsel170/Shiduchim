import React from 'react';
import { FavoriteProfile, FullProfile, ProfileRating } from '../../types/profile';
import { getRateableCategories, isRatingsCompleteForProfile } from '../../utils/rating';
import { ProfileCard } from './ProfileCard';
import { ProfileCardSkeleton } from './ProfileCardSkeleton';
import './ProfileGrid.css';

const SKELETON_CARD_COUNT = 6;

interface ProfileGridProps {
  profiles: FullProfile[];
  favorites: FavoriteProfile[];
  ratingsByProfileId: Record<string, ProfileRating>;
  photosLocked?: boolean;
  showFavoriteControls?: boolean;
  loading?: boolean;
  onToggleFavorite: (id: string) => void;
  onViewProfile: (id: string) => void;
  emptyMessage?: string;
}

export const ProfileGrid: React.FC<ProfileGridProps> = ({
  profiles,
  favorites,
  ratingsByProfileId,
  photosLocked = true,
  showFavoriteControls = true,
  loading = false,
  onToggleFavorite,
  onViewProfile,
  emptyMessage = 'לא נמצאו פרופילים',
}) => {
  if (loading) {
    return (
      <div className="profile-grid profile-grid--loading" aria-busy="true" aria-label="טוען פרופילים">
        {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
          <div key={`skeleton-${index}`}>
            <ProfileCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="profile-grid__empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="profile-grid" role="list">
      {profiles.map((profile) => (
        <div key={profile.id} role="listitem">
          <ProfileCard
            profile={profile}
            canFavorite={isRatingsCompleteForProfile(profile, ratingsByProfileId[profile.id])}
            photosLocked={photosLocked}
            showFavoriteControls={showFavoriteControls}
            onToggleFavorite={onToggleFavorite}
            onViewProfile={onViewProfile}
            isFavorite={favorites.some((x) => x.profileId === profile.id)}
          />
        </div>
      ))}
    </div>
  );
};
