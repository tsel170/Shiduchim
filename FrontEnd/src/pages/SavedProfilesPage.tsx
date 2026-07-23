import React, { useEffect, useMemo, useState } from 'react';
import { getApiErrorMessage } from '../api/apiError';
import { authApi } from '../api/authApi';
import { profilesApi } from '../api/profilesApi';
import { matchCasesApi } from '../api/matchCasesApi';
import { MatchStatusBadge } from '../components/match-cases/MatchStatusBadge';
import { isTerminalMatchStatus } from '../constants/matchCaseOptions';
import { useProfileMatchStatuses } from '../hooks/useProfileMatchStatuses';
import {
  SendToShadchanDialog,
  SendToShadchanOptions,
} from '../components/favorites/SendToShadchanDialog';
import { SendButton } from '../components/common/SendButton';
import {
  FAVORITE_SORT_OPTIONS,
  FavoritesSortPanel,
} from '../components/profile/FavoritesSortPanel';
import { FavoritesListSkeleton } from '../components/profile/FavoriteCardSkeleton';
import { ProfileImage } from '../components/common/ProfileImage';
import { getCityLabel, getMaritalStatusLabel } from '../constants/profileOptions';
import { useAuth } from '../contexts/AuthContext';
import { ShadchanSummary } from '../types/account';
import { MatchStatus } from '../types/matchCase';
import { FavoriteProfile, FullProfile, RequiredProfileRatingCategory } from '../types/profile';
import { getShadchanPickerGroups } from '../utils/shadchanAvailability';
import { formatAccountName } from '../utils/accountName';
import { getProfileDisplayName } from '../utils/profileDisplay';
import {
  calculateAverageRating,
  FavoriteSortKey,
  getFavoriteSortScore,
  getRateableCategories,
} from '../utils/rating';
import './Page.css';
import './SavedProfilesPage.css';

interface SavedProfilesPageProps {
  profiles: FullProfile[];
  favorites: FavoriteProfile[];
  loading?: boolean;
  sortBy: FavoriteSortKey;
  sortDirection: 'desc' | 'asc';
  onSortByChange: (sortBy: FavoriteSortKey) => void;
  onSortDirectionChange: (direction: 'desc' | 'asc') => void;
  isSortOpen: boolean;
  onSortOpenChange: (open: boolean) => void;
  onViewProfile: (id: string) => void;
}

const CARD_ACCENTS = ['#db2777', '#7c3aed', '#4f46e5', '#0891b2', '#059669', '#ea580c'];

const FAVORITE_RATING_ROWS: ReadonlyArray<{
  key: RequiredProfileRatingCategory | 'look';
  label: string;
  themeClass: string;
}> = [
  { key: 'personality', label: 'אישיות', themeClass: 'profile-field--personalityTraits' },
  { key: 'hobbies', label: 'תחביבים', themeClass: 'profile-field--hobbies' },
  { key: 'familyVision', label: 'חזון בית ומשפחה', themeClass: 'profile-field--familyVision' },
  { key: 'lookingFor', label: 'מחפש/ת', themeClass: 'profile-field--lookingFor' },
  { key: 'look', label: 'מראה', themeClass: 'profile-field--look' },
];

export const SavedProfilesPage: React.FC<SavedProfilesPageProps> = ({
  profiles,
  favorites,
  loading = false,
  sortBy,
  sortDirection,
  onSortByChange,
  onSortDirectionChange,
  isSortOpen,
  onSortOpenChange,
  onViewProfile,
}) => {
  const { currentUser } = useAuth();
  const [linkedShadchanim, setLinkedShadchanim] = useState<ShadchanSummary[]>([]);
  const [allShadchanim, setAllShadchanim] = useState<ShadchanSummary[]>([]);
  const [loadingShadchanim, setLoadingShadchanim] = useState(false);
  const [pendingCases, setPendingCases] = useState<Record<string, string>>({});
  const [sendDialogProfile, setSendDialogProfile] = useState<FullProfile | null>(null);
  const [actionProfileId, setActionProfileId] = useState<string | null>(null);
  const [myProfile, setMyProfile] = useState<FullProfile | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(
    null
  );

  const favoriteEntries = useMemo(
    () =>
      favorites
        .map((favorite) => ({
          favorite,
          profile: profiles.find((profile) => profile.id === favorite.profileId),
        }))
        .filter((x): x is { favorite: FavoriteProfile; profile: FullProfile } => Boolean(x.profile)),
    [favorites, profiles]
  );

  const sortedEntries = useMemo(() => {
    const entries = [...favoriteEntries];
    entries.sort((a, b) => {
      const scoreA = getFavoriteSortScore(a.favorite.rating, sortBy);
      const scoreB = getFavoriteSortScore(b.favorite.rating, sortBy);
      if (scoreA !== scoreB) {
        return sortDirection === 'desc' ? scoreB - scoreA : scoreA - scoreB;
      }
      const nameA = `${a.profile.firstName} ${a.profile.lastName}`;
      const nameB = `${b.profile.firstName} ${b.profile.lastName}`;
      return nameA.localeCompare(nameB, 'he');
    });
    return entries;
  }, [favoriteEntries, sortBy, sortDirection]);

  const sortTheme =
    FAVORITE_SORT_OPTIONS.find((opt) => opt.id === sortBy)?.themeClass ?? 'profile-field--average';

  const dialogGroups = useMemo(() => {
    if (!sendDialogProfile) return [];
    return getShadchanPickerGroups(sendDialogProfile, linkedShadchanim, allShadchanim);
  }, [sendDialogProfile, linkedShadchanim, allShadchanim]);

  const favoriteProfileIds = useMemo(
    () => favoriteEntries.map((entry) => entry.profile.id),
    [favoriteEntries]
  );
  const matchStatusByProfileId = useProfileMatchStatuses(
    favoriteProfileIds,
    currentUser?.accountId
  );

  useEffect(() => {
    let cancelled = false;

    async function loadShadchanData() {
      setLoadingShadchanim(true);
      try {
        const [linked, all, outgoingCases] = await Promise.all([
          authApi.getLinkedShadchanim(),
          authApi.getShadchanim(),
          matchCasesApi.list(),
        ]);
        if (!cancelled) {
          setLinkedShadchanim(linked);
          setAllShadchanim(all);
          const activeOutgoing = outgoingCases.filter(
            (matchCase) =>
              matchCase.senderAccountId === currentUser?.accountId &&
              !isTerminalMatchStatus(matchCase.currentStatus)
          );
          setPendingCases(
            Object.fromEntries(
              activeOutgoing.map((matchCase) => [matchCase.targetProfileId, matchCase.caseId])
            )
          );
        }
      } catch {
        if (!cancelled) {
          setLinkedShadchanim([]);
          setAllShadchanim([]);
          setPendingCases({});
        }
      } finally {
        if (!cancelled) setLoadingShadchanim(false);
      }
    }

    loadShadchanData();
    return () => {
      cancelled = true;
    };
  }, [currentUser?.accountId]);

  useEffect(() => {
    if (!toast) return;
    const timerId = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timerId);
  }, [toast]);

  useEffect(() => {
    if (!currentUser?.profileId) {
      setMyProfile(null);
      return;
    }

    let cancelled = false;
    profilesApi
      .getById(currentUser.profileId)
      .then((profile) => {
        if (!cancelled) setMyProfile(profile);
      })
      .catch(() => {
        if (!cancelled) setMyProfile(null);
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser?.profileId]);

  const senderProfileName = myProfile
    ? getProfileDisplayName(myProfile)
    : formatAccountName(currentUser?.firstName, currentUser?.lastName);

  const handleSendToShadchan = async ({ shadchanAccountId, includeMyProfile }: SendToShadchanOptions) => {
    if (!sendDialogProfile) return;

    if (!includeMyProfile || !currentUser?.profileId) {
      setToast({
        message: 'יש לצרף את הפרופיל האישי שלך כדי לפתוח תיק שידוך',
        tone: 'error',
      });
      return;
    }

    setActionProfileId(sendDialogProfile.id);
    setToast(null);
    try {
      const wasLinked = linkedShadchanim.some(
        (shadchan) => shadchan.accountId === shadchanAccountId
      );

      const created = await matchCasesApi.create({
        senderProfileId: currentUser.profileId,
        targetProfileId: sendDialogProfile.id,
        assignedShadchanId: shadchanAccountId,
        note: `המלצה ממועדפים: ${sendDialogProfile.firstName} ${sendDialogProfile.lastName}`,
      });

      if (!wasLinked) {
        try {
          await authApi.addLinkedShadchan(shadchanAccountId);
          const linked = await authApi.getLinkedShadchanim();
          setLinkedShadchanim(linked);
        } catch {
          // Linking is best-effort; the request was already sent.
        }
      }

      setPendingCases((prev) => ({
        ...prev,
        [sendDialogProfile.id]: created.caseId,
      }));
      setSendDialogProfile(null);
      setToast({ message: 'תיק השידוך נפתח ונשלח לשדכן', tone: 'success' });
    } catch (error) {
      setToast({ message: getApiErrorMessage(error), tone: 'error' });
    } finally {
      setActionProfileId(null);
    }
  };

  return (
    <div className="page saved-profiles-page">
      <header className="saved-profiles-page__hero">
        <div className="saved-profiles-page__hero-glow" aria-hidden="true" />
        <div className="saved-profiles-page__hero-icon" aria-hidden="true">
          ♥
        </div>
        <h1 className="saved-profiles-page__title">מועדפים</h1>
        <p className="saved-profiles-page__subtitle">
          {loading ? (
            'טוען מועדפים...'
          ) : (
            <>
              <span className="saved-profiles-page__count">{favoriteEntries.length}</span>
              פרופילים שדירגת ושמרת
            </>
          )}
        </p>
      </header>

      {toast && (
        <div
          className={`saved-profiles-page__toast saved-profiles-page__toast--${toast.tone}`}
          role="status"
        >
          {toast.message}
        </div>
      )}

      {isSortOpen && favoriteEntries.length > 0 && (
        <>
          <button
            type="button"
            className="floating-panel-backdrop"
            onClick={() => onSortOpenChange(false)}
            aria-label="סגור מיון"
          />
          <aside className="floating-panel floating-panel--wide" aria-label="מיון מועדפים">
            <FavoritesSortPanel
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSortByChange={onSortByChange}
              onSortDirectionChange={onSortDirectionChange}
              onClose={() => onSortOpenChange(false)}
            />
          </aside>
        </>
      )}

      {loading ? (
        <FavoritesListSkeleton />
      ) : favoriteEntries.length === 0 ? (
        <div className="saved-profiles-page__empty">
          <span className="saved-profiles-page__empty-icon" aria-hidden="true">
            ☆
          </span>
          <p className="saved-profiles-page__empty-title">אין מועדפים עדיין</p>
          <p className="saved-profiles-page__empty-desc">
            השלמ/י דירוג מלא בפרופיל ואז הוסף/י למועדפים כדי לשלוח לשדכן.
          </p>
        </div>
      ) : (
        <div className="favorites-list">
          {sortedEntries.map(({ favorite, profile }, index) => {
            const hasPendingCase = Boolean(pendingCases[profile.id]);
            const matchStatus = matchStatusByProfileId[profile.id]?.currentStatus ?? null;

            return (
              <FavoriteCard
                key={profile.id}
                favorite={favorite}
                profile={profile}
                sortBy={sortBy}
                sortTheme={sortTheme}
                accentColor={CARD_ACCENTS[index % CARD_ACCENTS.length]}
                isActionLoading={actionProfileId === profile.id}
                hasPendingCase={hasPendingCase}
                matchStatus={matchStatus}
                onViewProfile={onViewProfile}
                onOpenSendDialog={() => setSendDialogProfile(profile)}
              />
            );
          })}
        </div>
      )}

      <SendToShadchanDialog
        isOpen={Boolean(sendDialogProfile)}
        profileName={
          sendDialogProfile
            ? `${sendDialogProfile.firstName} ${sendDialogProfile.lastName}`
            : ''
        }
        groups={dialogGroups}
        senderProfileId={currentUser?.profileId ?? null}
        senderProfileName={senderProfileName}
        isLoading={loadingShadchanim}
        isSubmitting={Boolean(actionProfileId)}
        onSend={handleSendToShadchan}
        onClose={() => {
          if (!actionProfileId) setSendDialogProfile(null);
        }}
      />
    </div>
  );
};

function FavoriteCard({
  favorite,
  profile,
  sortBy,
  sortTheme,
  accentColor,
  isActionLoading,
  hasPendingCase,
  matchStatus,
  onViewProfile,
  onOpenSendDialog,
}: {
  favorite: FavoriteProfile;
  profile: FullProfile;
  sortBy: FavoriteSortKey;
  sortTheme: string;
  accentColor: string;
  isActionLoading: boolean;
  hasPendingCase: boolean;
  matchStatus: MatchStatus | null;
  onViewProfile: (id: string) => void;
  onOpenSendDialog: () => void;
}) {
  const [ratingsOpen, setRatingsOpen] = useState(false);
  const average = calculateAverageRating(favorite.rating);
  const sortScoreLabel =
    sortBy === 'average'
      ? 'ממוצע'
      : FAVORITE_RATING_ROWS.find((row) => row.key === sortBy)?.label ?? '';
  const activeScore =
    sortBy === 'average' ? average : favorite.rating[sortBy as keyof typeof favorite.rating];
  const displayScore =
    activeScore === undefined ? '—' : sortBy === 'average' ? average : activeScore;
  const fullName = `${profile.firstName} ${profile.lastName}`;
  const ratingsPanelId = `favorites-ratings-${profile.id}`;

  return (
    <article
      className={`favorites-item${ratingsOpen ? ' favorites-item--ratings-open' : ''}${
        hasPendingCase ? ' favorites-item--sent' : ''
      }`}
      style={{ '--fav-accent': accentColor } as React.CSSProperties}
    >
      <div className="favorites-item__accent-bar" aria-hidden="true" />
      <div className="favorites-item__media">
        <ProfileImage photos={profile.photos} alt="" imgClassName="favorites-item__photo" />
        {hasPendingCase && <span className="favorites-item__sent-badge">נשלח לשדכן</span>}
      </div>

      <div className="favorites-item__body">
        <h3 className="favorites-item__name">{fullName}</h3>
        <p className="favorites-item__meta">
          <span>גיל {profile.age}</span>
          <span className="favorites-item__dot" aria-hidden="true">
            ·
          </span>
          <span>{getMaritalStatusLabel(profile.maritalStatus)}</span>
        </p>
        <p className="favorites-item__city">{getCityLabel(profile.city)}</p>
        {matchStatus && (
          <MatchStatusBadge status={matchStatus} className="favorites-item__match-status" />
        )}

        <button
          type="button"
          className={`favorites-item__average ${sortTheme}${
            ratingsOpen ? ' favorites-item__average--open' : ''
          }`}
          onClick={() => setRatingsOpen((open) => !open)}
          aria-expanded={ratingsOpen}
          aria-controls={ratingsPanelId}
          aria-label={`${sortScoreLabel} ${displayScore}. ${ratingsOpen ? 'הסתר' : 'הצג'} פירוט דירוגים`}
        >
          <span className="favorites-item__average-value">{displayScore}</span>
          <span className="favorites-item__average-label">
            {sortBy === 'average' ? 'ממוצע דירוג' : sortScoreLabel}
          </span>
          <span className="favorites-item__average-toggle">
            {ratingsOpen ? 'הסתר ▲' : 'פירוט ▼'}
          </span>
        </button>

        {ratingsOpen && (
          <ul id={ratingsPanelId} className="favorites-item__ratings">
            {FAVORITE_RATING_ROWS.filter(({ key }) => {
              if (key === 'look') return favorite.rating.look !== undefined;
              return getRateableCategories(profile).includes(
                key as RequiredProfileRatingCategory
              );
            }).map(({ key, label, themeClass }) => {
              const score = favorite.rating[key];
              if (score === undefined) return null;
              return (
                <li
                  key={key}
                  className={`favorites-rating ${themeClass}${
                    key === sortBy ? ' favorites-rating--sort-active' : ''
                  }`}
                >
                  <span className="favorites-rating__label">{label}</span>
                  <RatingStars value={score} />
                  <span className="favorites-rating__score">{score}/5</span>
                </li>
              );
            })}
          </ul>
        )}

        <div className="favorites-item__actions">
          {hasPendingCase ? (
            <p className="favorites-item__pending-note">תיק שידוך פעיל — ניתן לעקוב ב«התיקים שלי»</p>
          ) : (
            <SendButton
              variant="shadchan"
              size="sm"
              fullWidth
              className="favorites-item__send-btn"
              isLoading={isActionLoading}
              onClick={onOpenSendDialog}
            >
              שלח לשדכן
            </SendButton>
          )}
          <button
            type="button"
            className="btn btn--secondary btn--sm favorites-item__view-btn"
            onClick={() => onViewProfile(profile.id)}
          >
            פתח פרופיל
          </button>
        </div>
      </div>
    </article>
  );
}

function RatingStars({ value }: { value: number }) {
  return (
    <div className="favorites-rating__stars" role="img" aria-label={`${value} מתוך 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`favorites-rating__star${star <= value ? ' favorites-rating__star--on' : ''}`}
        />
      ))}
    </div>
  );
}
