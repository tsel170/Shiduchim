import React from 'react';
import { Profile } from '../../types/profile';
import './ProfileCard.css';

interface ProfileCardProps {
  profile: Profile;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  isSaved,
  onToggleSave,
}) => {
  return (
    <article className="profile-card">
      <div className="profile-card__image-wrap">
        <img
          src={profile.imageUrl}
          alt={profile.name}
          className="profile-card__image"
          loading="lazy"
        />
        <button
          type="button"
          className={`profile-card__save${isSaved ? ' profile-card__save--active' : ''}`}
          aria-label={isSaved ? 'הסר משמירה' : 'שמור פרופיל'}
          aria-pressed={isSaved}
          onClick={() => onToggleSave(profile.id)}
        >
          <HeartIcon filled={isSaved} />
        </button>
      </div>

      <div className="profile-card__body">
        <header className="profile-card__header">
          <h3 className="profile-card__name">{profile.name}</h3>
          <p className="profile-card__meta">
            <span>{profile.age}</span>
            <span className="profile-card__dot" aria-hidden="true">·</span>
            <span>{profile.city}</span>
          </p>
        </header>

        <p className="profile-card__bio">{profile.bio}</p>

        <div className="profile-card__actions">
          <button type="button" className="btn btn--secondary btn--sm">
            צפה בפרופיל
          </button>
          <button type="button" className="btn btn--primary btn--sm">
            שלח לשדכן
          </button>
        </div>
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
      <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
