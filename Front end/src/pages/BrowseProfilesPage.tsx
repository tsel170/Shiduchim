import React from 'react';
import { ProfileSummary } from '../types/profile';
import { ProfileGrid } from '../components/profile/ProfileGrid';
import './Page.css';

interface BrowseProfilesPageProps {
  profiles: ProfileSummary[];
  savedIds: Set<string>;
  onToggleSave: (id: string) => void;
  onViewProfile: (id: string) => void;
}

export const BrowseProfilesPage: React.FC<BrowseProfilesPageProps> = ({
  profiles,
  savedIds,
  onToggleSave,
  onViewProfile,
}) => {
  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">עיון בפרופילים</h1>
        <p className="page__subtitle">
          {profiles.length} פרופילים זמינים · נתוני הדגמה בלבד
        </p>
      </header>
      <ProfileGrid
        profiles={profiles}
        savedIds={savedIds}
        onToggleSave={onToggleSave}
        onViewProfile={onViewProfile}
      />
    </div>
  );
};
