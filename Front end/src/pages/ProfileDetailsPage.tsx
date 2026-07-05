import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountRole } from '../types/account';
import { DisplayPreferences, FullProfile, ProfileRating, ProfileRatingCategory } from '../types/profile';
import { PersonSuggestionResponse, ShadchanSuggestion } from '../types/suggestion';
import { ManagementRequestProfileContext } from '../types/managementRequest';
import { ProfileShareSettings, ShadchanShareTab } from '../types/profileShare';
import { getApiErrorMessage } from '../api/apiError';
import { managementRequestsApi } from '../api/managementRequestsApi';
import { suggestionsApi } from '../api/suggestionsApi';
import { requestsApi } from '../api/requestsApi';
import { ProfileDetails } from '../components/profile/ProfileDetails';
import { FavoriteButton } from '../components/common/FavoriteButton';
import { SendButton } from '../components/common/SendButton';
import { DisplayPreferencesPanel } from '../components/profile/DisplayPreferencesPanel';
import { ManagementRequestForm } from '../components/profile/ManagementRequestForm';
import { ShadchanSharePanel } from '../components/profile/ShadchanSharePanel';
import { getPersonSuggestionResponseLabel } from '../constants/suggestionOptions';
import { isRatingsCompleteForProfile } from '../utils/rating';
import { profileHasUserAccount } from '../utils/profileAccount';
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
  isSuggestedProfile?: boolean;
  suggestion?: ShadchanSuggestion | null;
  onSuggestionUpdate?: (suggestion: ShadchanSuggestion) => void;
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
  isSuggestedProfile = false,
  suggestion = null,
  onSuggestionUpdate,
}) => {
  const navigate = useNavigate();
  const isShadchan = viewerRole === 'shadchan';
  const [shareTab, setShareTab] = useState<ShadchanShareTab | null>(null);
  const [shareSettings, setShareSettings] = useState<ProfileShareSettings>(() =>
    createDefaultProfileShareSettings()
  );
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [managementOpen, setManagementOpen] = useState(false);
  const [managementContext, setManagementContext] =
    useState<ManagementRequestProfileContext | null>(null);

  useEffect(() => {
    if (!isShadchan || !profile.ownerAccountId) {
      setManagementContext(null);
      return;
    }

    let cancelled = false;
    managementRequestsApi
      .getProfileContext(profile.id)
      .then((context) => {
        if (!cancelled) setManagementContext(context);
      })
      .catch(() => {
        if (!cancelled) setManagementContext(null);
      });

    return () => {
      cancelled = true;
    };
  }, [isShadchan, profile.id, profile.ownerAccountId]);

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

  const handleRespondToSuggestion = async (response: PersonSuggestionResponse) => {
    setIsSending(true);
    setActionMessage(null);
    try {
      const updated = await suggestionsApi.respondToProfile(profile.id, response);
      onSuggestionUpdate?.(updated);
      setActionMessage(
        response === 'interested'
          ? 'עדכנת את השדכן שאת/ה מעוניין/ת — ההצעה עברה לבדיקה'
          : 'עדכנת את השדכן שאינך מעוניין/ת'
      );
    } catch (error) {
      setActionMessage(getApiErrorMessage(error));
    } finally {
      setIsSending(false);
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

  const handleSiteSend = async (note: string, recipientAccountId: string) => {
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

  const handleSendManagementRequest = async (message: string) => {
    setIsSending(true);
    setActionMessage(null);
    try {
      await managementRequestsApi.create({
        personProfileId: profile.id,
        message,
      });
      const context = await managementRequestsApi.getProfileContext(profile.id);
      setManagementContext(context);
      setManagementOpen(false);
      setActionMessage('בקשת הניהול נשלחה — המשודך/ת יוכל/ה לאשר או לדחות');
    } catch (error) {
      setActionMessage(getApiErrorMessage(error));
    } finally {
      setIsSending(false);
    }
  };

  const profileHasAccount = profileHasUserAccount(profile);
  const canSendManagementRequest = managementContext
    ? managementContext.canSend
    : profileHasAccount;
  const managementStatusMessage =
    managementContext?.alreadyLinked
      ? 'הפרופיל כבר באחריותך'
      : managementContext?.reason && !managementContext.canSend
        ? managementContext.reason
        : null;

  const openShare = (tab: ShadchanShareTab) => {
    setManagementOpen(false);
    setShareSettings(createDefaultProfileShareSettings());
    setShareTab(tab);
  };

  const openManagement = () => {
    setShareTab(null);
    setManagementOpen((open) => !open);
    setActionMessage(null);
  };

  const canFavorite = !isShadchan && isRatingsCompleteForProfile(profile, rating);
  const photosUnlocked = isShadchan || isSuggestedProfile || canFavorite;
  const personResponse = suggestion?.personResponse ?? null;

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
              onSiteSend={handleSiteSend}
              onViewPersonProfile={(personProfileId) => navigate(`/profiles/${personProfileId}`)}
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
          <div className="profile-details-page__shadchan-actions">
            <SendButton variant="site" onClick={() => openShare('site')}>
              שלח דרך האתר
            </SendButton>
            <SendButton variant="alt" onClick={() => openShare('other')}>
              שלח בשיטות אחרות
            </SendButton>
            {profileHasAccount && (
              <SendButton
                variant="management"
                selected={managementOpen}
                onClick={openManagement}
                disabled={!canSendManagementRequest}
                title={!canSendManagementRequest ? managementStatusMessage ?? undefined : undefined}
              >
                שלח בקשת ניהול
              </SendButton>
            )}
            {!canSendManagementRequest && managementStatusMessage && (
              <p className="profile-details-page__hint">{managementStatusMessage}</p>
            )}
          </div>
        ) : (
          <>
            {!isSuggestedProfile && (
              <>
                <FavoriteButton
                  isFavorite={isFavorite}
                  isLoading={isFavoriteLoading}
                  onClick={handleToggleFavorite}
                  disabled={!canFavorite}
                  title={
                    !canFavorite ? 'יש להשלים את כל דירוגי הפרופיל לפני הוספה למועדפים.' : ''
                  }
                />
                {!canFavorite && (
                  <p className="profile-details-page__hint">
                    יש להשלים את כל דירוגי הפרופיל לפני הוספה למועדפים.
                  </p>
                )}
                <SendButton
                  variant="shadchan"
                  isLoading={isSending}
                  onClick={handleSendToShadchan}
                >
                  שלח לשדכן
                </SendButton>
              </>
            )}
            {isSuggestedProfile && (
              <>
                {suggestion?.shadchanNote && (
                  <p className="profile-details-page__shadchan-note">
                    הערת השדכן: {suggestion.shadchanNote}
                  </p>
                )}
                <div className="profile-details-page__interest-actions">
                  <SendButton
                    variant="interested"
                    selected={personResponse === 'interested'}
                    isLoading={isSending}
                    onClick={() => handleRespondToSuggestion('interested')}
                  >
                    מעוניין/ת
                  </SendButton>
                  <SendButton
                    variant="decline"
                    selected={personResponse === 'not_interested'}
                    isLoading={isSending}
                    onClick={() => handleRespondToSuggestion('not_interested')}
                  >
                    לא מעוניין/ת
                  </SendButton>
                </div>
                {personResponse && (
                  <p className="profile-details-page__hint profile-details-page__hint--success">
                    עדכון שנשלח לשדכן: {getPersonSuggestionResponseLabel(personResponse)}
                  </p>
                )}
              </>
            )}
          </>
        )}
        {actionMessage && <p className="profile-details-page__hint">{actionMessage}</p>}

        {isShadchan && managementOpen && canSendManagementRequest && (
          <ManagementRequestForm
            profile={profile}
            onSend={handleSendManagementRequest}
            onClose={() => setManagementOpen(false)}
            isSending={isSending}
          />
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
