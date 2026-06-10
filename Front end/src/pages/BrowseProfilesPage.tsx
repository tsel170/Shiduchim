import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FavoriteProfile, FilterConfiguration, FullProfile, ProfileRating } from '../types/profile';
import { ProfileGrid } from '../components/profile/ProfileGrid';
import { ProfileFilterPanel } from '../components/profile/ProfileFilterPanel';
import './Page.css';
import './BrowseProfilesPage.css';

interface BrowseProfilesPageProps {
  profiles: FullProfile[];
  favorites: FavoriteProfile[];
  ratingsByProfileId: Record<string, ProfileRating>;
  filters: FilterConfiguration;
  onFiltersChange: (next: FilterConfiguration) => void;
  onResetFilters: () => void;
  isFiltersOpen: boolean;
  onFiltersOpenChange: (open: boolean) => void;
  onToggleFavorite: (id: string) => void;
  onViewProfile: (id: string) => void;
}

export const BrowseProfilesPage: React.FC<BrowseProfilesPageProps> = ({
  profiles,
  favorites,
  ratingsByProfileId,
  filters,
  onFiltersChange,
  onResetFilters,
  isFiltersOpen,
  onFiltersOpenChange,
  onToggleFavorite,
  onViewProfile,
}) => {
  const { currentUser } = useAuth();
  const photosLocked = currentUser?.role !== 'shadchan';

  return (
    <div className="page browse-page">
      <header className="page__header">
        <h1 className="page__title">עיון בפרופילים</h1>
        <p className="page__subtitle">
          {profiles.length} פרופילים זמינים · תצוגה מקוצרת: שם, גיל ומצב משפחתי
        </p>
      </header>

      {isFiltersOpen && (
        <>
          <button
            type="button"
            className="floating-panel-backdrop"
            onClick={() => onFiltersOpenChange(false)}
            aria-label="סגור פילטרים"
          />
          <aside className="floating-panel floating-panel--wide" aria-label="פילטרים">
            <ProfileFilterPanel
              value={filters}
              onChange={onFiltersChange}
              onResetAll={onResetFilters}
              onClose={() => onFiltersOpenChange(false)}
            />
          </aside>
        </>
      )}

      <ProfileGrid
        profiles={profiles}
        favorites={favorites}
        ratingsByProfileId={ratingsByProfileId}
        photosLocked={photosLocked}
        showFavoriteControls={false}
        onToggleFavorite={onToggleFavorite}
        onViewProfile={onViewProfile}
      />
    </div>
  );
};
