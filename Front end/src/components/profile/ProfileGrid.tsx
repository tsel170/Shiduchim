import React from 'react';
import { FavoriteProfile, FullProfile, ProfileRating } from '../../types/profile';
import { isRatingsComplete } from '../../utils/rating';
import { ProfileCard } from './ProfileCard';
import './ProfileGrid.css';

interface ProfileGridProps {
  profiles: FullProfile[];
  favorites: FavoriteProfile[];
  ratingsByProfileId: Record<string, ProfileRating>;
  photosLocked?: boolean;
  showFavoriteControls?: boolean;
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
  onToggleFavorite,
  onViewProfile,
  emptyMessage = 'לא נמצאו פרופילים',
}) => {
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
            canFavorite={isRatingsComplete(ratingsByProfileId[profile.id])}
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
