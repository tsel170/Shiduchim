import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { HeaderPanelMode } from './components/header/Header';
import { RoleRoute } from './components/RoleRoute';
import {
  DEFAULT_DISPLAY_PREFERENCES,
  DEFAULT_FILTER_CONFIGURATION,
} from './constants/profileOptions';
import { useAuth } from './contexts/AuthContext';
import { favoritesApi } from './api/favoritesApi';
import { getApiErrorMessage } from './api/apiError';
import { profilesApi } from './api/profilesApi';
import { matchCasesApi } from './api/matchCasesApi';
import { BrowseProfilesPage } from './pages/BrowseProfilesPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { AddedProfilesPage } from './pages/AddedProfilesPage';
import { AddProfilePage } from './pages/AddProfilePage';
import { AiImportPage } from './pages/AiImportPage';
import { EditAddedProfilePage } from './pages/EditAddedProfilePage';
import { MyProfilePage } from './pages/MyProfilePage';
import { MyMatchCasesPage } from './pages/MyMatchCasesPage';
import { ManagementRequestsPage } from './pages/ManagementRequestsPage';
import { MatchCasesDashboardPage } from './pages/MatchCasesDashboardPage';
import { MatchCaseDetailsPage } from './pages/MatchCaseDetailsPage';
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
import { isFilterKeyAtDefault, normalizeFilterConfiguration } from './utils/filters';
import { isDisplayPreferencesAtDefault, normalizeDisplayPreferences } from './utils/profileHelpers';
import { FavoriteSortKey, isRatingsCompleteStrict } from './utils/rating';
import { MatchCase } from './types/matchCase';
import { isCounterpartyProfileInCase } from './constants/matchCaseOptions';
import { buildPersonCreateRequestBody } from './utils/profileValidation';
import { PageState } from './components/common/PageState';

const EMPTY_MY_PROFILE: FullProfile = {
  id: 'new-my-profile',
  firstName: '',
  lastName: '',
  city: '',
  heightCm: 0,
  religiousStream: '',
  gender: '',
  maritalStatus: '',
  age: 0,
  personalityTraits: [],
  hobbies: [],
  familyVision: '',
  lookingFor: [],
  references: [],
  photos: [],
};

const SETTINGS_SAVE_DEBOUNCE_MS = 600;

export const AppRoutes: React.FC = () => {
  const { currentUser, logout, updateAccountSettings, refreshCurrentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [myProfile, setMyProfile] = useState<FullProfile | null>(null);
  const [browseProfiles, setBrowseProfiles] = useState<FullProfile[]>([]);
  const [browseLoading, setBrowseLoading] = useState(true);
  const [browseError, setBrowseError] = useState<string | null>(null);
  const [profileCatalog, setProfileCatalog] = useState<Record<string, FullProfile>>({});
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
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [myProfileLoading, setMyProfileLoading] = useState(false);
  const filtersSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const displaySaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredProfiles = useMemo(() => browseProfiles, [browseProfiles]);

  const catalogProfiles = useMemo(() => Object.values(profileCatalog), [profileCatalog]);

  useEffect(() => {
    if (!currentUser?.settings) return;
    setFilters(normalizeFilterConfiguration(currentUser.settings.filters));
    setDisplayPreferences(
      normalizeDisplayPreferences(currentUser.settings.displayPreferences)
    );
  }, [currentUser?.accountId]);

  useEffect(() => {
    return () => {
      if (filtersSaveTimerRef.current) clearTimeout(filtersSaveTimerRef.current);
      if (displaySaveTimerRef.current) clearTimeout(displaySaveTimerRef.current);
    };
  }, []);

  const handleFiltersChange = useCallback(
    (next: FilterConfiguration) => {
      setFilters(next);
      if (!currentUser) return;

      if (filtersSaveTimerRef.current) clearTimeout(filtersSaveTimerRef.current);
      filtersSaveTimerRef.current = setTimeout(() => {
        updateAccountSettings({ filters: next }).catch(() => undefined);
      }, SETTINGS_SAVE_DEBOUNCE_MS);
    },
    [currentUser, updateAccountSettings]
  );

  const handleDisplayPreferencesChange = useCallback(
    (next: DisplayPreferences) => {
      setDisplayPreferences(next);
      if (!currentUser) return;

      if (displaySaveTimerRef.current) clearTimeout(displaySaveTimerRef.current);
      displaySaveTimerRef.current = setTimeout(() => {
        updateAccountSettings({ displayPreferences: next }).catch(() => undefined);
      }, SETTINGS_SAVE_DEBOUNCE_MS);
    },
    [currentUser, updateAccountSettings]
  );

  const handleResetFilters = useCallback(() => {
    handleFiltersChange(DEFAULT_FILTER_CONFIGURATION);
  }, [handleFiltersChange]);

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;

    async function loadBrowse() {
      setBrowseLoading(true);
      setBrowseError(null);
      try {
        const profiles = await profilesApi.search(filters);
        if (!cancelled) {
          setBrowseProfiles(profiles);
          setProfileCatalog((prev) => ({
            ...prev,
            ...Object.fromEntries(profiles.map((profile) => [profile.id, profile])),
          }));
        }
      } catch (error) {
        if (!cancelled) setBrowseError(getApiErrorMessage(error));
      } finally {
        if (!cancelled) setBrowseLoading(false);
      }
    }

    loadBrowse();
    return () => {
      cancelled = true;
    };
  }, [filters, currentUser?.accountId]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'person') {
      setFavoritesLoading(false);
      return;
    }

    let cancelled = false;

    async function loadFavorites() {
      setFavoritesLoading(true);
      try {
        const items = await favoritesApi.list();
        if (cancelled) return;
        setFavorites(items);

        if (items.length > 0) {
          const profiles = await Promise.all(
            items.map(async (item) => {
              try {
                return await profilesApi.getById(item.profileId);
              } catch {
                return null;
              }
            })
          );
          if (cancelled) return;
          const loadedProfiles = profiles.filter((profile): profile is FullProfile => profile !== null);
          setProfileCatalog((prev) => ({
            ...prev,
            ...Object.fromEntries(loadedProfiles.map((profile) => [profile.id, profile])),
          }));
        }
      } catch {
        if (!cancelled) setFavorites([]);
      } finally {
        if (!cancelled) setFavoritesLoading(false);
      }
    }

    loadFavorites();
    return () => {
      cancelled = true;
    };
  }, [currentUser?.accountId, currentUser?.role]);

  useEffect(() => {
    if (!currentUser?.profileId) {
      setMyProfileLoading(false);
      return;
    }

    let cancelled = false;
    setMyProfileLoading(true);

    profilesApi
      .getById(currentUser.profileId)
      .then((profile) => {
        if (!cancelled) {
          setMyProfile(profile);
          setProfileCatalog((prev) => ({ ...prev, [profile.id]: profile }));
        }
      })
      .finally(() => {
        if (!cancelled) setMyProfileLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser?.profileId]);

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
    async (profileId: string) => {
      const existing = favorites.find((favorite) => favorite.profileId === profileId);
      if (existing) {
        await favoritesApi.remove(existing.favoriteId);
        setFavorites((prev) => prev.filter((favorite) => favorite.favoriteId !== existing.favoriteId));
        return;
      }

      const rating = ratingsByProfileId[profileId];
      const profile = profileCatalog[profileId];
      if (!profile || !isRatingsCompleteStrict(profile, rating)) return;

      const created = await favoritesApi.add(profileId, profile, rating);
      setFavorites((prev) => [...prev, created]);
    },
    [favorites, ratingsByProfileId, profileCatalog]
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
            browseError ? (
              <PageState error={browseError} />
            ) : (
              <BrowseProfilesPage
                profiles={filteredProfiles}
                favorites={favorites}
                ratingsByProfileId={ratingsByProfileId}
                filters={filters}
                loading={browseLoading}
                onFiltersChange={handleFiltersChange}
                onResetFilters={handleResetFilters}
                isFiltersOpen={isFiltersOpen}
                onFiltersOpenChange={setIsFiltersOpen}
                onToggleFavorite={handleToggleFavorite}
                onViewProfile={handleViewProfile}
              />
            )
          }
        />
        <Route
          path="/favorites"
          element={
            <RoleRoute allowed={['person']}>
              <FavoritesPage
                profiles={catalogProfiles}
                favorites={favorites}
                loading={favoritesLoading}
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
          path="/my-cases/*"
          element={
            <RoleRoute allowed={['person']}>
              <MyMatchCasesPage />
            </RoleRoute>
          }
        />
        <Route
          path="/management-requests"
          element={
            <RoleRoute allowed={['person']}>
              <ManagementRequestsPage />
            </RoleRoute>
          }
        />
        <Route path="/suggestions/management" element={<Navigate to="/management-requests" replace />} />
        <Route path="/suggestions/*" element={<Navigate to="/my-cases" replace />} />
        <Route path="/suggestions" element={<Navigate to="/my-cases" replace />} />
        <Route path="/requests" element={<Navigate to="/match-cases" replace />} />
        <Route
          path="/added-profiles/:profileId/edit"
          element={
            <RoleRoute allowed={['shadchan']}>
              <EditAddedProfilePage />
            </RoleRoute>
          }
        />
        <Route
          path="/added-profiles"
          element={
            <RoleRoute allowed={['shadchan']}>
              <AddedProfilesPage />
            </RoleRoute>
          }
        />
        <Route
          path="/ai-import"
          element={
            <RoleRoute allowed={['shadchan']}>
              <AiImportPage />
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
          path="/match-cases/view/:caseId"
          element={
            <RoleRoute allowed={['shadchan']}>
              <MatchCaseDetailsPage />
            </RoleRoute>
          }
        />
        <Route path="/match-cases" element={<Navigate to="/match-cases/pending" replace />} />
        <Route
          path="/match-cases/*"
          element={
            <RoleRoute allowed={['shadchan']}>
              <MatchCasesDashboardPage />
            </RoleRoute>
          }
        />
        <Route
          path="/my-profile"
          element={
            <RoleRoute allowed={['person']}>
              <PageState loading={myProfileLoading}>
                <MyProfilePage
                  mode={myProfile ? 'edit' : 'create'}
                  initialProfile={myProfile ?? EMPTY_MY_PROFILE}
                  onSave={async (profile) => {
                    const saved = await profilesApi.update(profile.id, profile);
                    setMyProfile(saved);
                    setProfileCatalog((prev) => ({ ...prev, [saved.id]: saved }));
                  }}
                  onCreate={async (profile) => {
                    if (!currentUser) return;
                    const created = await profilesApi.createMine(
                      buildPersonCreateRequestBody(profile, currentUser.accountId)
                    );
                    await refreshCurrentUser();
                    setMyProfile(created);
                    setProfileCatalog((prev) => ({ ...prev, [created.id]: created }));
                  }}
                />
              </PageState>
            </RoleRoute>
          }
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path="/profiles/:profileId"
          element={
            <ProfileDetailsRoute
              displayPreferences={displayPreferences}
              onDisplayPreferencesChange={handleDisplayPreferencesChange}
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
  const [searchParams] = useSearchParams();
  const viewerRole = currentUser?.role ?? 'person';
  const caseIdParam = searchParams.get('caseId');
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matchCase, setMatchCase] = useState<MatchCase | null>(null);

  useEffect(() => {
    if (!profileId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const loaded = await profilesApi.getById(profileId!);
        if (!cancelled) setProfile(loaded);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [profileId]);

  useEffect(() => {
    if (viewerRole !== 'person' || !profileId) {
      setMatchCase(null);
      return;
    }

    let cancelled = false;

    async function loadCaseContext() {
      try {
        if (caseIdParam) {
          const loaded = await matchCasesApi.getById(caseIdParam);
          if (!cancelled) setMatchCase(loaded);
          return;
        }

        const result = await matchCasesApi.getProfileContext(profileId!);
        if (!cancelled) {
          setMatchCase(result.hasCase ? result.matchCase ?? null : null);
        }
      } catch {
        if (!cancelled) setMatchCase(null);
      }
    }

    loadCaseContext();
    return () => {
      cancelled = true;
    };
  }, [viewerRole, profileId, caseIdParam]);

  const isMatchCaseView =
    Boolean(profileId) &&
    matchCase !== null &&
    viewerRole === 'person' &&
    Boolean(currentUser?.accountId) &&
    isCounterpartyProfileInCase(matchCase, profileId!, currentUser!.accountId);

  if (!profileId) {
    return <Navigate to="/browse" replace />;
  }

  if (loading) {
    return <PageState loading />;
  }

  if (error || !profile) {
    return (
      <div className="page">
        <PageState error={error ?? 'הפרופיל לא נמצא.'} />
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
      isMatchCaseView={isMatchCaseView}
      matchCase={matchCase}
      onMatchCaseUpdate={setMatchCase}
      onSiteSend={async (note, recipientAccountId, recipientProfileId) => {
        if (!recipientAccountId.trim()) {
          throw new Error('יש לבחור משודך/ת מהרשימה');
        }
        if (!recipientProfileId?.trim()) {
          throw new Error('לא נמצא פרופיל למשודך/ת שנבחר/ה');
        }
        if (!currentUser?.accountId) {
          throw new Error('יש להתחבר מחדש');
        }
        await matchCasesApi.create({
          senderProfileId: profile.id,
          targetProfileId: recipientProfileId.trim(),
          assignedShadchanId: currentUser.accountId,
          note,
        });
      }}
    />
  );
};
