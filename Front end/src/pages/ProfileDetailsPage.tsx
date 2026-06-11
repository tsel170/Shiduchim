import React, { useState } from 'react';
import { AccountRole } from '../types/account';
import { DisplayPreferences, FullProfile, ProfileRating, ProfileRatingCategory } from '../types/profile';
import { ProfileShareSettings, ShadchanShareTab } from '../types/profileShare';
import { ProfileDetails } from '../components/profile/ProfileDetails';
import { DisplayPreferencesPanel } from '../components/profile/DisplayPreferencesPanel';
import { ShadchanSharePanel } from '../components/profile/ShadchanSharePanel';
import { isRatingsComplete } from '../utils/rating';
import { createDefaultProfileShareSettings } from '../utils/profileShare';
import './Page.css';
import './ProfileDetailsPage.css';

interface ProfileDetailsPageProps {
  profile: FullProfile;
  viewerRole: AccountRole;
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
  viewerRole,
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
  const isShadchan = viewerRole === 'shadchan';
  const [shareTab, setShareTab] = useState<ShadchanShareTab | null>(null);
  const [shareSettings, setShareSettings] = useState<ProfileShareSettings>(() =>
    createDefaultProfileShareSettings()
  );

  const handleSendToShadchan = () => {
    window.alert('בקשה נשלחה לשדכן (הדגמה בלבד)');
  };

  const canFavorite = !isShadchan && isRatingsComplete(rating);
  const photosUnlocked = isShadchan || canFavorite;

  const openShare = (tab: ShadchanShareTab) => {
    setShareSettings(createDefaultProfileShareSettings());
    setShareTab(tab);
  };

  return (
    <div className="page profile-details-page">
      <div className="profile-details-page__toolbar">
        <button type="button" className="profile-details-page__back" onClick={onBack}>
          <BackIcon />
          חזרה לרשימה
        </button>
      </div>

      {!isShadchan && isDisplayPrefsOpen && (
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

      {isShadchan && shareTab && (
        <>
          <button
            type="button"
            className="floating-panel-backdrop"
            onClick={() => setShareTab(null)}
            aria-label="סגור שיתוף פרופיל"
          />
          <aside className="floating-panel floating-panel--share" aria-label="שיתוף פרופיל">
            <ShadchanSharePanel
              profile={profile}
              initialTab={shareTab}
              settings={shareSettings}
              onSettingsChange={setShareSettings}
              onClose={() => setShareTab(null)}
            />
          </aside>
        </>
      )}

      <div className="profile-details-page__content">
        <ProfileDetails
          profile={profile}
          displayPreferences={displayPreferences}
          photosUnlocked={photosUnlocked}
          viewerRole={viewerRole}
          rating={rating}
          onRate={onRate}
        />
      </div>

      <div className="profile-details-page__actions">
        {isShadchan ? (
          <>
            <button type="button" className="btn btn--primary" onClick={() => openShare('site')}>
              שלח דרך האתר
            </button>
            <button type="button" className="btn btn--secondary" onClick={() => openShare('other')}>
              שלח בשיטות אחרות
            </button>
          </>
        ) : (
          <>
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
          </>
        )}
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
