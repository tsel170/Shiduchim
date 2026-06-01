import React from 'react';
import { Profile } from '../types/profile';
import { ProfileGrid } from '../components/profile/ProfileGrid';
import './Page.css';

interface SavedProfilesPageProps {
  profiles: Profile[];
  savedIds: Set<string>;
  onToggleSave: (id: string) => void;
}

export const SavedProfilesPage: React.FC<SavedProfilesPageProps> = ({
  profiles,
  savedIds,
  onToggleSave,
}) => {
  const savedProfiles = profiles.filter((p) => savedIds.has(p.id));

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">פרופילים שמורים</h1>
        <p className="page__subtitle">
          {savedProfiles.length} פרופילים שמורים
        </p>
      </header>
      <ProfileGrid
        profiles={savedProfiles}
        savedIds={savedIds}
        onToggleSave={onToggleSave}
        emptyMessage="עדיין לא שמרת פרופילים. לחץ על לב בכרטיס פרופיל כדי לשמור."
      />
    </div>
  );
};
