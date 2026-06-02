import React, { useMemo, useState } from 'react';
import { FavoriteProfile, FullProfile, RequiredProfileRatingCategory } from '../types/profile';
import {
  calculateAverageRating,
  FavoriteSortKey,
  getFavoriteSortScore,
} from '../utils/rating';
import { getCityLabel, getMaritalStatusLabel } from '../constants/profileOptions';
import {
  FAVORITE_SORT_OPTIONS,
  FavoritesSortPanel,
} from '../components/profile/FavoritesSortPanel';
import './Page.css';
import './SavedProfilesPage.css';

interface SavedProfilesPageProps {
  profiles: FullProfile[];
  favorites: FavoriteProfile[];
  sortBy: FavoriteSortKey;
  sortDirection: 'desc' | 'asc';
  onSortByChange: (sortBy: FavoriteSortKey) => void;
  onSortDirectionChange: (direction: 'desc' | 'asc') => void;
  isSortOpen: boolean;
  onSortOpenChange: (open: boolean) => void;
  onViewProfile: (id: string) => void;
}

const FAVORITE_RATING_ROWS: ReadonlyArray<{
  key: RequiredProfileRatingCategory | 'look';
  label: string;
  themeClass: string;
}> = [
  { key: 'personality', label: 'אישיות', themeClass: 'profile-field--personalityTraits' },
  { key: 'hobbies', label: 'תחביבים', themeClass: 'profile-field--hobbies' },
  { key: 'homeVision', label: 'חזון בית ומשפחה', themeClass: 'profile-field--familyVision' },
  { key: 'lookingFor', label: 'מחפש/ת', themeClass: 'profile-field--lookingFor' },
  { key: 'look', label: 'מראה', themeClass: 'profile-field--look' },
];

export const SavedProfilesPage: React.FC<SavedProfilesPageProps> = ({
  profiles,
  favorites,
  sortBy,
  sortDirection,
  onSortByChange,
  onSortDirectionChange,
  isSortOpen,
  onSortOpenChange,
  onViewProfile,
}) => {
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

  return (
    <div className="page saved-profiles-page">
      <header className="page__header">
        <h1 className="page__title">מועדפים</h1>
        <p className="page__subtitle">{favoriteEntries.length} פרופילים עם דירוג מלא</p>
      </header>

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

      {favoriteEntries.length === 0 ? (
        <div className="profile-grid__empty saved-profiles-page__empty">
          <p>אין מועדפים עדיין. השלמ/י דירוג מלא בפרופיל ואז הוסף/י למועדפים.</p>
        </div>
      ) : (
        <div className="favorites-list">
          {sortedEntries.map(({ favorite, profile }) => (
            <FavoriteCard
              key={profile.id}
              favorite={favorite}
              profile={profile}
              sortBy={sortBy}
              sortTheme={sortTheme}
              onViewProfile={onViewProfile}
            />
          ))}
        </div>
      )}
    </div>
  );
};

function FavoriteCard({
  favorite,
  profile,
  sortBy,
  sortTheme,
  onViewProfile,
}: {
  favorite: FavoriteProfile;
  profile: FullProfile;
  sortBy: FavoriteSortKey;
  sortTheme: string;
  onViewProfile: (id: string) => void;
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
  const cover = profile.photos[0];
  const ratingsPanelId = `favorites-ratings-${profile.id}`;

  return (
    <article className={`favorites-item${ratingsOpen ? ' favorites-item--ratings-open' : ''}`}>
      <div className="favorites-item__media">
        {cover ? (
          <img src={cover} alt="" className="favorites-item__photo" loading="lazy" />
        ) : (
          <div className="favorites-item__photo favorites-item__photo--empty" />
        )}
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
            {FAVORITE_RATING_ROWS.map(({ key, label, themeClass }) => {
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

        <button
          type="button"
          className="btn btn--secondary btn--sm favorites-item__view-btn"
          onClick={() => onViewProfile(profile.id)}
        >
          פתח פרופיל
        </button>
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
