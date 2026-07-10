import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AccountRole } from '../types/account';
import { DisplayPreferences, FullProfile, ProfileRating, ProfileRatingCategory } from '../types/profile';
import { ManagementRequestProfileContext } from '../types/managementRequest';
import { ProfileShareSettings, ShadchanShareTab } from '../types/profileShare';
import { getApiErrorMessage } from '../api/apiError';
import { managementRequestsApi } from '../api/managementRequestsApi';
import { CaseStatusMessage } from '../components/match-cases/CaseStatusMessage';
import { MatchCase } from '../types/matchCase';
import { ProfileDetails } from '../components/profile/ProfileDetails';
import { FavoriteButton } from '../components/common/FavoriteButton';
import { SendButton } from '../components/common/SendButton';
import { DisplayPreferencesPanel } from '../components/profile/DisplayPreferencesPanel';
import { ManagementRequestForm } from '../components/profile/ManagementRequestForm';
import { ShadchanSharePanel } from '../components/profile/ShadchanSharePanel';
import { SendToShadchanDialog } from '../components/favorites/SendToShadchanDialog';
import { useSendToShadchan } from '../hooks/useSendToShadchan';
import { isRatingsCompleteForProfile } from '../utils/rating';
import { profileHasUserAccount } from '../utils/profileAccount';
import { createDefaultProfileShareSettings } from '../utils/profileShare';
import { getProfileDisplayName } from '../utils/profileDisplay';
import { openProfilePreview } from '../utils/profileNavigation';
import { isDisplayPreferencesAtDefault } from '../utils/profileHelpers';
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
  isModal?: boolean;
  onRate: (category: ProfileRatingCategory, value: number) => void;
  onToggleFavorite: () => void | Promise<void>;
  onSiteSend: (
    note: string,
    recipientAccountId: string,
    recipientProfileId: string
  ) => Promise<void>;
  isMatchCaseView?: boolean;
  matchCase?: MatchCase | null;
  onMatchCaseUpdate?: (matchCase: MatchCase) => void;
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
  isModal = false,
  onRate,
  onToggleFavorite,
  onSiteSend,
  isMatchCaseView = false,
  matchCase = null,
  onMatchCaseUpdate,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isShadchan = viewerRole === 'shadchan';
  const {
    isOpen: isSendDialogOpen,
    dialogGroups,
    senderProfileId,
    senderProfileName,
    loadingShadchanim,
    isSubmitting: isSendSubmitting,
    openSendDialog,
    closeSendDialog,
    sendToShadchan,
  } = useSendToShadchan();
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

  const handleSendToShadchan = () => {
    setActionMessage(null);
    openSendDialog(profile);
  };

  const handleConfirmSendToShadchan = async (
    options: Parameters<typeof sendToShadchan>[0]
  ) => {
    const result = await sendToShadchan(options);
    setActionMessage(result.message);
  };

  const handleSiteSend = async (
    note: string,
    recipientAccountId: string,
    recipientProfileId: string
  ) => {
    setIsSending(true);
    setActionMessage(null);
    try {
      await onSiteSend(note, recipientAccountId, recipientProfileId);
      setActionMessage('תיק השידוך נפתח בהצלחה');
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
  const photosUnlocked = isShadchan || isMatchCaseView || canFavorite;

  return (
    <div className={`page profile-details-page${isModal ? ' profile-details-page--modal' : ''}`}>
      <div className="profile-details-page__toolbar">
        <button type="button" className="profile-details-page__back" onClick={onBack}>
          <BackIcon />
          חזרה
        </button>
        {!isShadchan && isModal && (
          <button
            type="button"
            className={`profile-details-page__prefs${
              isDisplayPrefsOpen ? ' profile-details-page__prefs--open' : ''
            }${
              !isDisplayPreferencesAtDefault(displayPreferences)
                ? ' profile-details-page__prefs--active'
                : ''
            }`}
            onClick={() => onDisplayPrefsOpenChange(!isDisplayPrefsOpen)}
            aria-expanded={isDisplayPrefsOpen}
            aria-label="העדפות תצוגה"
          >
            <DisplayPrefsIcon />
            העדפות תצוגה
          </button>
        )}
      </div>

      {!isShadchan && isDisplayPrefsOpen && (
        <>
          <button
            type="button"
            className={`floating-panel-backdrop${
              isModal ? ' floating-panel-backdrop--modal' : ''
            }`}
            onClick={() => onDisplayPrefsOpenChange(false)}
            aria-label="סגור העדפות תצוגה"
          />
          <aside
            className={`floating-panel${isModal ? ' floating-panel--modal' : ''}`}
            aria-label="העדפות תצוגה"
          >
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
              onViewPersonProfile={(personProfileId) =>
                openProfilePreview(navigate, location, personProfileId)
              }
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
            {!isMatchCaseView && (
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
                <SendButton variant="shadchan" onClick={handleSendToShadchan}>
                  שלח לשדכן
                </SendButton>
              </>
            )}
            {isMatchCaseView && matchCase && (
              <div className="profile-details-page__case-status">
                <CaseStatusMessage matchCase={matchCase} />
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={() => navigate(`/my-cases/view/${matchCase.caseId}`)}
                >
                  מעבר לתיק השידוך
                </button>
              </div>
            )}
          </>
        )}
        {actionMessage && <p className="profile-details-page__hint">{actionMessage}</p>}

        <SendToShadchanDialog
          isOpen={isSendDialogOpen}
          profileName={getProfileDisplayName(profile)}
          groups={dialogGroups}
          senderProfileId={senderProfileId}
          senderProfileName={senderProfileName}
          isLoading={loadingShadchanim}
          isSubmitting={isSendSubmitting}
          onSend={handleConfirmSendToShadchan}
          onClose={closeSendDialog}
        />

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

function DisplayPrefsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 10h8M8 14h5" strokeLinecap="round" />
    </svg>
  );
}
