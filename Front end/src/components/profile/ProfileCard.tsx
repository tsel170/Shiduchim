import React, { KeyboardEvent } from 'react';
import { FullProfile } from '../../types/profile';
import { getGenderLabel, getMaritalStatusLabel } from '../../constants/profileOptions';
import './ProfileCard.css';

interface ProfileCardProps {
  profile: FullProfile;
  canFavorite: boolean;
  photosLocked?: boolean;
  showFavoriteControls?: boolean;
  onToggleFavorite: (id: string) => void;
  onViewProfile: (id: string) => void;
  isFavorite: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  canFavorite,
  photosLocked = true,
  showFavoriteControls = true,
  onToggleFavorite,
  onViewProfile,
  isFavorite,
}) => {
  const fullName = `${profile.firstName} ${profile.lastName}`;
  const cover = profile.photos[0];

  const openProfile = () => onViewProfile(profile.id);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openProfile();
    }
  };

  return (
    <article
      className="profile-card profile-card--clickable"
      onClick={openProfile}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`צפייה בפרופיל של ${fullName}`}
    >
      <div
        className={`profile-card__image-wrap${photosLocked ? ' profile-card__image-wrap--locked' : ''}`}
      >
        {cover ? <img src={cover} alt="" className="profile-card__image" loading="lazy" /> : null}
        {showFavoriteControls && (
          <button
            type="button"
            className={`profile-card__save${isFavorite ? ' profile-card__save--active' : ''}`}
            aria-label={isFavorite ? 'הסר ממועדפים' : 'הוסף למועדפים'}
            aria-pressed={isFavorite}
            disabled={!canFavorite}
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite(profile.id);
            }}
          >
            <HeartIcon filled={isFavorite} />
          </button>
        )}
      </div>

      <div className="profile-card__body">
        <header className="profile-card__header">
          <h3 className="profile-card__name">{fullName}</h3>
          <p className="profile-card__meta">
            <span>גיל {profile.age}</span>
            <span className="profile-card__dot" aria-hidden="true">
              ·
            </span>
            <span>{getGenderLabel(profile.gender) || '—'}</span>
            <span className="profile-card__dot" aria-hidden="true">
              ·
            </span>
            <span>{getMaritalStatusLabel(profile.maritalStatus)}</span>
          </p>
        </header>

        {showFavoriteControls && !canFavorite && (
          <p className="profile-card__hint">יש להשלים דירוג מלא לפני שמירה למועדפים.</p>
        )}

        <p className="profile-card__cta" aria-hidden="true">
          לחץ לצפייה בפרופיל
        </p>
      </div>
    </article>
  );
};

function HeartIcon({ filled }: { filled: boolean }) {
  if (filled) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
