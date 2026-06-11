import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { HeaderPanelMode } from './components/header/Header';
import { RoleRoute } from './components/RoleRoute';
import {
  DEFAULT_DISPLAY_PREFERENCES,
  DEFAULT_FILTER_CONFIGURATION,
} from './constants/profileOptions';
import { useAuth } from './contexts/AuthContext';
import { getProfileById, mockBrowseProfiles } from './data/mockProfiles';
import { mockMyProfile } from './data/mockMyProfile';
import { BrowseProfilesPage } from './pages/BrowseProfilesPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { AddedProfilesPage } from './pages/AddedProfilesPage';
import { AddProfilePage } from './pages/AddProfilePage';
import { MyProfilePage } from './pages/MyProfilePage';
import { RequestsPage } from './pages/RequestsPage';
import { ShadchanSuggestionsPage } from './pages/ShadchanSuggestionsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfileDetailsPage } from './pages/ProfileDetailsPage';
import {
  DisplayPreferences,
  FavoriteProfile,
  FilterConfiguration,
  FullProfile,
  ProfileRating,
  ProfileRatingCategory,
} from './types/profile';
import { filterProfiles, isFilterKeyAtDefault } from './utils/filters';
import { isDisplayPreferencesAtDefault } from './utils/profileHelpers';
import { FavoriteSortKey, isRatingsCompleteStrict, toFavoriteProfile } from './utils/rating';

export const AppRoutes: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
    () => filterProfiles(mockBrowseProfiles, filters),
    [filters]
  );

  const hasActiveFilters = useMemo(
    () =>
      (Object.keys(DEFAULT_FILTER_CONFIGURATION) as (keyof FilterConfiguration)[]).some(
        (key) => !isFilterKeyAtDefault(filters, key)
      ),
    [filters]
  );

  const isShadchan = currentUser?.role === 'shadchan';
  const isProfileRoute = location.pathname.startsWith('/profiles/');
  const isBrowseRoute =
    location.pathname === '/' ||
    location.pathname.startsWith('/browse');
  const isFavoritesRoute = location.pathname.startsWith('/favorites');

  const headerPanelMode: HeaderPanelMode = isProfileRoute
    ? isShadchan
      ? 'none'
      : 'preferences'
    : isBrowseRoute
      ? 'filters'
      : isFavoritesRoute
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

  const closeHeaderPanels = useCallback(() => {
    setIsFiltersOpen(false);
    setIsDisplayPrefsOpen(false);
    setIsFavoritesSortOpen(false);
  }, []);

  useEffect(() => {
    closeHeaderPanels();
  }, [location.pathname, closeHeaderPanels]);

  const handleBrandClick = useCallback(() => {
    navigate('/browse');
    closeHeaderPanels();
  }, [navigate, closeHeaderPanels]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  const handleViewProfile = useCallback(
    (id: string) => {
      navigate(`/profiles/${id}`);
      closeHeaderPanels();
    },
    [navigate, closeHeaderPanels]
  );

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

  const handleHeaderPanelToggle = useCallback(() => {
    if (headerPanelMode === 'filters') {
      setIsFiltersOpen((open) => !open);
    } else if (headerPanelMode === 'preferences') {
      setIsDisplayPrefsOpen((open) => !open);
    } else if (headerPanelMode === 'favorites-sort') {
      setIsFavoritesSortOpen((open) => !open);
    }
  }, [headerPanelMode]);

  const userLabel = currentUser?.email ?? undefined;

  return (
    <AppLayout
      onBrandClick={handleBrandClick}
      onLogout={handleLogout}
      userLabel={userLabel}
      headerPanelMode={headerPanelMode}
      isHeaderPanelOpen={isHeaderPanelOpen}
      onHeaderPanelToggle={handleHeaderPanelToggle}
      headerPanelHighlight={
        (headerPanelMode === 'filters' && hasActiveFilters) ||
        (headerPanelMode === 'preferences' && hasCustomDisplayPreferences) ||
        (headerPanelMode === 'favorites-sort' && hasCustomFavoritesSort)
      }
    >
      <Routes>
        <Route path="/" element={<Navigate to="/browse" replace />} />
        <Route
          path="/browse"
          element={
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
          }
        />
        <Route
          path="/favorites"
          element={
            <RoleRoute allowed={['person']}>
              <FavoritesPage
                profiles={mockBrowseProfiles}
                favorites={favorites}
                sortBy={favoritesSortBy}
                sortDirection={favoritesSortDirection}
                onSortByChange={setFavoritesSortBy}
                onSortDirectionChange={setFavoritesSortDirection}
                isSortOpen={isFavoritesSortOpen}
                onSortOpenChange={setIsFavoritesSortOpen}
                onViewProfile={handleViewProfile}
              />
            </RoleRoute>
          }
        />
        <Route
          path="/suggestions"
          element={
            <RoleRoute allowed={['person']}>
              <ShadchanSuggestionsPage />
            </RoleRoute>
          }
        >
          <Route index element={<Navigate to="new" replace />} />
          <Route path="new" element={null} />
          <Route path="in-check" element={null} />
          <Route path="checked" element={null} />
        </Route>
        <Route
          path="/added-profiles"
          element={
            <RoleRoute allowed={['shadchan']}>
              <AddedProfilesPage />
            </RoleRoute>
          }
        />
        <Route
          path="/add-profile"
          element={
            <RoleRoute allowed={['shadchan']}>
              <AddProfilePage />
            </RoleRoute>
          }
        />
        <Route
          path="/requests"
          element={
            <RoleRoute allowed={['shadchan']}>
              <RequestsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/my-profile"
          element={
            <RoleRoute allowed={['person']}>
              <MyProfilePage initialProfile={myProfile} onSave={setMyProfile} />
            </RoleRoute>
          }
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path="/profiles/:profileId"
          element={
            <ProfileDetailsRoute
              displayPreferences={displayPreferences}
              onDisplayPreferencesChange={setDisplayPreferences}
              isDisplayPrefsOpen={isDisplayPrefsOpen}
              onDisplayPrefsOpenChange={setIsDisplayPrefsOpen}
              favorites={favorites}
              ratingsByProfileId={ratingsByProfileId}
              onRate={handleRateProfile}
              onToggleFavorite={handleToggleFavorite}
            />
          }
        />
        <Route path="*" element={<Navigate to="/browse" replace />} />
      </Routes>
    </AppLayout>
  );
};

interface ProfileDetailsRouteProps {
  displayPreferences: DisplayPreferences;
  onDisplayPreferencesChange: (next: DisplayPreferences) => void;
  isDisplayPrefsOpen: boolean;
  onDisplayPrefsOpenChange: (open: boolean) => void;
  favorites: FavoriteProfile[];
  ratingsByProfileId: Record<string, ProfileRating>;
  onRate: (profileId: string, category: ProfileRatingCategory, value: number) => void;
  onToggleFavorite: (profileId: string) => void;
}

const ProfileDetailsRoute: React.FC<ProfileDetailsRouteProps> = ({
  displayPreferences,
  onDisplayPreferencesChange,
  isDisplayPrefsOpen,
  onDisplayPrefsOpenChange,
  favorites,
  ratingsByProfileId,
  onRate,
  onToggleFavorite,
}) => {
  const { currentUser } = useAuth();
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  const viewerRole = currentUser?.role ?? 'person';

  if (!profileId) {
    return <Navigate to="/browse" replace />;
  }

  const profile = getProfileById(profileId);

  if (!profile) {
    return (
      <div className="page">
        <p>הפרופיל לא נמצא.</p>
        <button type="button" className="btn btn--secondary" onClick={() => navigate('/browse')}>
          חזרה
        </button>
      </div>
    );
  }

  return (
    <ProfileDetailsPage
      profile={profile}
      viewerRole={viewerRole}
      rating={ratingsByProfileId[profile.id]}
      displayPreferences={displayPreferences}
      onDisplayPreferencesChange={onDisplayPreferencesChange}
      isDisplayPrefsOpen={isDisplayPrefsOpen}
      onDisplayPrefsOpenChange={onDisplayPrefsOpenChange}
      isFavorite={favorites.some((f) => f.profileId === profile.id)}
      onBack={() => navigate(-1)}
      onRate={(category, value) => onRate(profile.id, category, value)}
      onToggleFavorite={() => onToggleFavorite(profile.id)}
    />
  );
};
