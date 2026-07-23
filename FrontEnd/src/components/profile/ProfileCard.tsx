import React, { KeyboardEvent } from 'react';
import { MatchStatus } from '../../types/matchCase';
import { MatchStatusBadge } from '../match-cases/MatchStatusBadge';
import { FavoriteButton } from '../common/FavoriteButton';
import { ProfileImage } from '../common/ProfileImage';
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
  matchStatus?: MatchStatus | null;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  canFavorite,
  photosLocked = true,
  showFavoriteControls = true,
  onToggleFavorite,
  onViewProfile,
  isFavorite,
  matchStatus = null,
}) => {
  const fullName = `${profile.firstName} ${profile.lastName}`;

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
        <ProfileImage
          photos={profile.photos}
          alt=""
          locked={photosLocked}
          imgClassName="profile-card__image"
        />
        {showFavoriteControls && (
          <FavoriteButton
            variant="icon"
            isFavorite={isFavorite}
            disabled={!canFavorite}
            className="profile-card__favorite"
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite(profile.id);
            }}
          />
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
          {matchStatus && (
            <MatchStatusBadge status={matchStatus} className="profile-card__status" />
          )}
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
