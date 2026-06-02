import React, { useCallback, useMemo, useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { HeaderPanelMode } from './components/header/Header';
import { NavItem } from './components/sidebar/Sidebar';
import {
  DEFAULT_DISPLAY_PREFERENCES,
  DEFAULT_FILTER_CONFIGURATION,
} from './constants/profileOptions';
import {
  getProfileById,
  mockFullProfiles,
} from './data/mockProfiles';
import { mockMyProfile } from './data/mockMyProfile';
import {
  DisplayPreferences,
  FavoriteProfile,
  FilterConfiguration,
  FullProfile,
  ProfileRating,
  ProfileRatingCategory,
} from './types/profile';
import { BrowseProfilesPage } from './pages/BrowseProfilesPage';
import { SavedProfilesPage } from './pages/SavedProfilesPage';
import { MyRequestsPage } from './pages/MyRequestsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfileDetailsPage } from './pages/ProfileDetailsPage';
import { MyProfilePage } from './pages/MyProfilePage';
import { filterProfiles, isFilterKeyAtDefault } from './utils/filters';
import { isDisplayPreferencesAtDefault } from './utils/profileHelpers';
import { FavoriteSortKey, isRatingsCompleteStrict, toFavoriteProfile } from './utils/rating';

function App() {
  const [activeNav, setActiveNav] = useState<NavItem>('browse');
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [myProfile, setMyProfile] = useState<FullProfile>(mockMyProfile);
  const [filters, setFilters] = useState<FilterConfiguration>(DEFAULT_FILTER_CONFIGURATION);
  const [displayPreferences, setDisplayPreferences] = useState<DisplayPreferences>(
    DEFAULT_DISPLAY_PREFERENCES
  );
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isDisplayPrefsOpen, setIsDisplayPrefsOpen] = useState(false);
  const [isFavoritesSortOpen, setIsFavoritesSortOpen] = useState(false);
  const [favoritesSortBy, setFavoritesSortBy] = useState<FavoriteSortKey>('average');
  const [favoritesSortDirection, setFavoritesSortDirection] = useState<'desc' | 'asc'>('desc');
  const [ratingsByProfileId, setRatingsByProfileId] = useState<Record<string, ProfileRating>>({});
  const [favorites, setFavorites] = useState<FavoriteProfile[]>([]);

  const filteredProfiles = useMemo(
    () => filterProfiles(mockFullProfiles, filters),
    [filters]
  );

  const hasActiveFilters = useMemo(
    () =>
      (Object.keys(DEFAULT_FILTER_CONFIGURATION) as (keyof FilterConfiguration)[]).some(
        (key) => !isFilterKeyAtDefault(filters, key)
      ),
    [filters]
  );

  const closeHeaderPanels = useCallback(() => {
    setIsFiltersOpen(false);
    setIsDisplayPrefsOpen(false);
    setIsFavoritesSortOpen(false);
  }, []);

  const handleNavigate = useCallback(
    (item: NavItem) => {
      setActiveNav(item);
      setViewingProfileId(null);
      closeHeaderPanels();
    },
    [closeHeaderPanels]
  );

  const handleBrandClick = useCallback(() => {
    setActiveNav('browse');
    setViewingProfileId(null);
    closeHeaderPanels();
  }, [closeHeaderPanels]);

  const handleViewProfile = useCallback(
    (id: string) => {
      setViewingProfileId(id);
      setIsFiltersOpen(false);
      setIsDisplayPrefsOpen(false);
      setIsFavoritesSortOpen(false);
    },
    []
  );

  const handleBackFromDetails = useCallback(() => {
    setViewingProfileId(null);
    setIsDisplayPrefsOpen(false);
  }, []);

  const handleRateProfile = useCallback(
    (profileId: string, category: ProfileRatingCategory, value: number) => {
      setRatingsByProfileId((prev) => ({
        ...prev,
        [profileId]: {
          ...prev[profileId],
          profileId,
          [category]: value,
          updatedAt: new Date().toISOString(),
        },
      }));
    },
    []
  );

  const handleToggleFavorite = useCallback(
    (profileId: string) => {
      setFavorites((prev) => {
        const existing = prev.some((f) => f.profileId === profileId);
        if (existing) return prev.filter((f) => f.profileId !== profileId);
        const profile = getProfileById(profileId);
        const rating = ratingsByProfileId[profileId];
        if (!profile || !isRatingsCompleteStrict(rating)) return prev;
        return [...prev, toFavoriteProfile(profile, rating)];
      });
    },
    [ratingsByProfileId]
  );

  const headerPanelMode: HeaderPanelMode = viewingProfileId
    ? 'preferences'
    : activeNav === 'browse'
      ? 'filters'
      : activeNav === 'saved'
        ? 'favorites-sort'
        : 'none';

  const isHeaderPanelOpen =
    headerPanelMode === 'filters'
      ? isFiltersOpen
      : headerPanelMode === 'preferences'
        ? isDisplayPrefsOpen
        : isFavoritesSortOpen;

  const hasCustomFavoritesSort =
    favoritesSortBy !== 'average' || favoritesSortDirection !== 'desc';

  const hasCustomDisplayPreferences = useMemo(
    () => !isDisplayPreferencesAtDefault(displayPreferences),
    [displayPreferences]
  );

  const handleHeaderPanelToggle = useCallback(() => {
    if (headerPanelMode === 'filters') {
      setIsFiltersOpen((open) => !open);
    } else if (headerPanelMode === 'preferences') {
      setIsDisplayPrefsOpen((open) => !open);
    } else if (headerPanelMode === 'favorites-sort') {
      setIsFavoritesSortOpen((open) => !open);
    }
  }, [headerPanelMode]);

  const mainContent = useMemo(() => {
    if (viewingProfileId) {
      const profile = getProfileById(viewingProfileId);
      if (!profile) {
        return (
          <div className="page">
            <p>הפרופיל לא נמצא.</p>
            <button type="button" className="btn btn--secondary" onClick={handleBackFromDetails}>
              חזרה
            </button>
          </div>
        );
      }
      return (
        <ProfileDetailsPage
          profile={profile}
          rating={ratingsByProfileId[profile.id]}
          displayPreferences={displayPreferences}
          onDisplayPreferencesChange={setDisplayPreferences}
          isDisplayPrefsOpen={isDisplayPrefsOpen}
          onDisplayPrefsOpenChange={setIsDisplayPrefsOpen}
          isFavorite={favorites.some((f) => f.profileId === profile.id)}
          onBack={handleBackFromDetails}
          onRate={(category, value) => handleRateProfile(profile.id, category, value)}
          onToggleFavorite={() => handleToggleFavorite(profile.id)}
        />
      );
    }

    switch (activeNav) {
      case 'browse':
        return (
          <BrowseProfilesPage
            profiles={filteredProfiles}
            favorites={favorites}
            ratingsByProfileId={ratingsByProfileId}
            filters={filters}
            onFiltersChange={setFilters}
            onResetFilters={() => setFilters(DEFAULT_FILTER_CONFIGURATION)}
            isFiltersOpen={isFiltersOpen}
            onFiltersOpenChange={setIsFiltersOpen}
            onToggleFavorite={handleToggleFavorite}
            onViewProfile={handleViewProfile}
          />
        );
      case 'saved':
        return (
          <SavedProfilesPage
            profiles={mockFullProfiles}
            favorites={favorites}
            sortBy={favoritesSortBy}
            sortDirection={favoritesSortDirection}
            onSortByChange={setFavoritesSortBy}
            onSortDirectionChange={setFavoritesSortDirection}
            isSortOpen={isFavoritesSortOpen}
            onSortOpenChange={setIsFavoritesSortOpen}
            onViewProfile={handleViewProfile}
          />
        );
      case 'my-profile':
        return (
          <MyProfilePage
            initialProfile={myProfile}
            onSave={setMyProfile}
          />
        );
      case 'requests':
        return <MyRequestsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return null;
    }
  }, [
    activeNav,
    viewingProfileId,
    filteredProfiles,
    filters,
    isFiltersOpen,
    favorites,
    ratingsByProfileId,
    displayPreferences,
    isDisplayPrefsOpen,
    isFavoritesSortOpen,
    favoritesSortBy,
    favoritesSortDirection,
    myProfile,
    handleToggleFavorite,
    handleRateProfile,
    handleViewProfile,
    handleBackFromDetails,
  ]);

  const sidebarActive: NavItem = viewingProfileId ? 'browse' : activeNav;

  return (
    <AppLayout
      activeNav={sidebarActive}
      onNavigate={handleNavigate}
      onBrandClick={handleBrandClick}
      headerPanelMode={headerPanelMode}
      isHeaderPanelOpen={isHeaderPanelOpen}
      onHeaderPanelToggle={handleHeaderPanelToggle}
      headerPanelHighlight={
        (headerPanelMode === 'filters' && hasActiveFilters) ||
        (headerPanelMode === 'preferences' && hasCustomDisplayPreferences) ||
        (headerPanelMode === 'favorites-sort' && hasCustomFavoritesSort)
      }
    >
      {mainContent}
    </AppLayout>
  );
}

export default App;
