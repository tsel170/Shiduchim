import React from 'react';
import { DisplayPreferences, FullProfile, ProfileRating, ProfileRatingCategory } from '../types/profile';
import { ProfileDetails } from '../components/profile/ProfileDetails';
import { DisplayPreferencesPanel } from '../components/profile/DisplayPreferencesPanel';
import { isRatingsComplete } from '../utils/rating';
import './Page.css';
import './ProfileDetailsPage.css';

interface ProfileDetailsPageProps {
  profile: FullProfile;
  rating?: ProfileRating;
  displayPreferences: DisplayPreferences;
  onDisplayPreferencesChange: (next: DisplayPreferences) => void;
  isDisplayPrefsOpen: boolean;
  onDisplayPrefsOpenChange: (open: boolean) => void;
  isFavorite: boolean;
  onBack: () => void;
  onRate: (category: ProfileRatingCategory, value: number) => void;
  onToggleFavorite: () => void;
}

export const ProfileDetailsPage: React.FC<ProfileDetailsPageProps> = ({
  profile,
  rating,
  displayPreferences,
  onDisplayPreferencesChange,
  isDisplayPrefsOpen,
  onDisplayPrefsOpenChange,
  isFavorite,
  onBack,
  onRate,
  onToggleFavorite,
}) => {
  const handleSendToShadchan = () => {
    window.alert('בקשה נשלחה לשדכן (הדגמה בלבד)');
  };
  const canFavorite = isRatingsComplete(rating);

  return (
    <div className="page profile-details-page">
      <div className="profile-details-page__toolbar">
        <button type="button" className="profile-details-page__back" onClick={onBack}>
          <BackIcon />
          חזרה לרשימה
        </button>
      </div>

      {isDisplayPrefsOpen && (
        <>
          <button
            type="button"
            className="floating-panel-backdrop"
            onClick={() => onDisplayPrefsOpenChange(false)}
            aria-label="סגור העדפות תצוגה"
          />
          <aside className="floating-panel" aria-label="העדפות תצוגה">
            <DisplayPreferencesPanel
              value={displayPreferences}
              onChange={onDisplayPreferencesChange}
              onClose={() => onDisplayPrefsOpenChange(false)}
            />
          </aside>
        </>
      )}

      <div className="profile-details-page__content">
        <ProfileDetails
          profile={profile}
          displayPreferences={displayPreferences}
          photosUnlocked={canFavorite}
          rating={rating}
          onRate={onRate}
        />
      </div>

      <div className="profile-details-page__actions">
        <button
          type="button"
          className={`btn btn--favorite${isFavorite ? ' btn--favorite--saved' : ''}`}
          onClick={onToggleFavorite}
          disabled={!canFavorite}
          title={!canFavorite ? 'יש להשלים את כל דירוגי הפרופיל לפני הוספה למועדפים.' : ''}
        >
          {isFavorite ? 'הסר ממועדפים' : 'הוסף למועדפים'}
        </button>
        {!canFavorite && (
          <p className="profile-details-page__hint">
            יש להשלים את כל דירוגי הפרופיל לפני הוספה למועדפים.
          </p>
        )}
        <button type="button" className="btn btn--primary" onClick={handleSendToShadchan}>
          שלח לשדכן
        </button>
      </div>
    </div>
  );
};

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
