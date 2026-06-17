import React, { useState } from 'react';
import { AccountRole } from '../types/account';
import { DisplayPreferences, FullProfile, ProfileRating, ProfileRatingCategory } from '../types/profile';
import { ProfileShareSettings, ShadchanShareTab } from '../types/profileShare';
import { getApiErrorMessage } from '../api/apiError';
import { requestsApi } from '../api/requestsApi';
import { ProfileDetails } from '../components/profile/ProfileDetails';
import { DisplayPreferencesPanel } from '../components/profile/DisplayPreferencesPanel';
import { ShadchanSharePanel } from '../components/profile/ShadchanSharePanel';
import { isRatingsCompleteForProfile } from '../utils/rating';
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
  onToggleFavorite: () => void | Promise<void>;
  onSiteSend: (note: string, recipientAccountId: string) => Promise<void>;
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
  onSiteSend,
}) => {
  const isShadchan = viewerRole === 'shadchan';
  const [shareTab, setShareTab] = useState<ShadchanShareTab | null>(null);
  const [shareSettings, setShareSettings] = useState<ProfileShareSettings>(() =>
    createDefaultProfileShareSettings()
  );
  const [recipientAccountId, setRecipientAccountId] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  const handleToggleFavorite = async () => {
    setIsFavoriteLoading(true);
    setActionMessage(null);
    try {
      await onToggleFavorite();
    } catch (error) {
      setActionMessage(getApiErrorMessage(error));
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handleSendToShadchan = async () => {
    setIsSending(true);
    setActionMessage(null);
    try {
      await requestsApi.create({ targetProfileId: profile.id });
      setActionMessage('הבקשה נשלחה לשדכן בהצלחה');
    } catch (error) {
      setActionMessage(getApiErrorMessage(error));
    } finally {
      setIsSending(false);
    }
  };

  const handleSiteSend = async (note: string) => {
    setIsSending(true);
    setActionMessage(null);
    try {
      await onSiteSend(note, recipientAccountId);
      setActionMessage('ההצעה נשלחה בהצלחה');
      setShareTab(null);
    } catch (error) {
      setActionMessage(getApiErrorMessage(error));
    } finally {
      setIsSending(false);
    }
  };

  const canFavorite = !isShadchan && isRatingsCompleteForProfile(profile, rating);
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
              recipientAccountId={recipientAccountId}
              onRecipientAccountIdChange={setRecipientAccountId}
              onSiteSend={handleSiteSend}
              isSending={isSending}
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
              className={`btn btn--favorite${isFavorite ? ' btn--favorite--saved' : ''}${
                isFavoriteLoading ? ' btn--loading' : ''
              }`}
              onClick={handleToggleFavorite}
              disabled={!canFavorite || isFavoriteLoading}
              aria-busy={isFavoriteLoading}
              title={!canFavorite ? 'יש להשלים את כל דירוגי הפרופיל לפני הוספה למועדפים.' : ''}
            >
              {isFavoriteLoading && <span className="btn__spinner" aria-hidden="true" />}
              {isFavoriteLoading
                ? isFavorite
                  ? 'מסיר...'
                  : 'מוסיף...'
                : isFavorite
                  ? 'הסר ממועדפים'
                  : 'הוסף למועדפים'}
            </button>
            {!canFavorite && (
              <p className="profile-details-page__hint">
                יש להשלים את כל דירוגי הפרופיל לפני הוספה למועדפים.
              </p>
            )}
            <button
              type="button"
              className={`btn btn--primary${isSending ? ' btn--loading' : ''}`}
              onClick={handleSendToShadchan}
              disabled={isSending}
              aria-busy={isSending}
            >
              {isSending && <span className="btn__spinner" aria-hidden="true" />}
              {isSending ? 'שולח...' : 'שלח לשדכן'}
            </button>
          </>
        )}
        {actionMessage && <p className="profile-details-page__hint">{actionMessage}</p>}
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
