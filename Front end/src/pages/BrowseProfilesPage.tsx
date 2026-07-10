import React, { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProfileMatchStatuses } from '../hooks/useProfileMatchStatuses';
import { FavoriteProfile, FilterConfiguration, FullProfile, ProfileRating } from '../types/profile';
import { AccountFilterTabs } from '../components/profile/AccountFilterTabs';
import { ProfileGrid } from '../components/profile/ProfileGrid';
import { ProfileFilterPanel } from '../components/profile/ProfileFilterPanel';
import {
  AccountFilter,
  filterProfilesByAccount,
  getAccountFilterEmptyMessage,
} from '../utils/profileAccount';
import './Page.css';
import './BrowseProfilesPage.css';

interface BrowseProfilesPageProps {
  profiles: FullProfile[];
  favorites: FavoriteProfile[];
  ratingsByProfileId: Record<string, ProfileRating>;
  filters: FilterConfiguration;
  loading?: boolean;
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
  loading = false,
  onFiltersChange,
  onResetFilters,
  isFiltersOpen,
  onFiltersOpenChange,
  onToggleFavorite,
  onViewProfile,
}) => {
  const { currentUser } = useAuth();
  const photosLocked = currentUser?.role !== 'shadchan';
  const isShadchan = currentUser?.role === 'shadchan';
  const [accountFilter, setAccountFilter] = useState<AccountFilter>('all');

  const visibleProfiles = useMemo(() => {
    if (!isShadchan) return profiles;
    return filterProfilesByAccount(profiles, accountFilter);
  }, [profiles, accountFilter, isShadchan]);

  const browseProfileIds = useMemo(
    () => visibleProfiles.map((profile) => profile.id),
    [visibleProfiles]
  );
  const matchStatusByProfileId = useProfileMatchStatuses(
    currentUser?.role === 'person' ? browseProfileIds : [],
    currentUser?.accountId
  );
  const matchStatusesForGrid = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(matchStatusByProfileId).map(([id, entry]) => [
          id,
          entry.currentStatus,
        ])
      ),
    [matchStatusByProfileId]
  );

  const subtitle = loading
    ? 'טוען פרופילים...'
    : isShadchan && accountFilter !== 'all'
      ? `${visibleProfiles.length} מתוך ${profiles.length} פרופילים זמינים · תצוגה מקוצרת: שם, גיל ומצב משפחתי`
      : `${visibleProfiles.length} פרופילים זמינים · תצוגה מקוצרת: שם, גיל ומצב משפחתי`;

  const emptyMessage = getAccountFilterEmptyMessage(
    accountFilter,
    'לא נמצאו פרופילים התואמים לחיפוש.'
  );

  return (
    <div className="page browse-page">
      <header className="page__header">
        <h1 className="page__title">עיון בפרופילים</h1>
        <p className="page__subtitle">{subtitle}</p>
      </header>

      {isShadchan && (
        <AccountFilterTabs value={accountFilter} onChange={setAccountFilter} />
      )}

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
        profiles={visibleProfiles}
        favorites={favorites}
        ratingsByProfileId={ratingsByProfileId}
        photosLocked={photosLocked}
        showFavoriteControls={false}
        loading={loading}
        emptyMessage={isShadchan ? emptyMessage : undefined}
        onToggleFavorite={onToggleFavorite}
        onViewProfile={onViewProfile}
        matchStatusByProfileId={matchStatusesForGrid}
      />
    </div>
  );
};
