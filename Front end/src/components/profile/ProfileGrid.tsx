import React from 'react';
import { ProfileSummary } from '../../types/profile';
import { ProfileCard } from './ProfileCard';
import './ProfileGrid.css';

interface ProfileGridProps {
  profiles: ProfileSummary[];
  savedIds: Set<string>;
  onToggleSave: (id: string) => void;
  onViewProfile: (id: string) => void;
  emptyMessage?: string;
}

export const ProfileGrid: React.FC<ProfileGridProps> = ({
  profiles,
  savedIds,
  onToggleSave,
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
            isSaved={savedIds.has(profile.id)}
            onToggleSave={onToggleSave}
            onViewProfile={onViewProfile}
          />
        </div>
      ))}
    </div>
  );
};
