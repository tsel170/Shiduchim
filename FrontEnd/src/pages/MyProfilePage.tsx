import React, { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../api/apiError';
import { FullProfile, ProfileFormErrors } from '../types/profile';
import { ProfileShareSettings } from '../types/profileShare';
import { ProfileEditor } from '../components/profile/ProfileEditor';
import { ShadchanSharePanel } from '../components/profile/ShadchanSharePanel';
import { SharePanelOverlay } from '../components/profile/SharePanelOverlay';
import { createDefaultProfileShareSettings } from '../utils/profileShare';
import {
  validateProfile,
  validateShadchanNewProfile,
  hasValidationErrors,
} from '../utils/profileValidation';
import './Page.css';
import './MyProfilePage.css';

interface MyProfilePageProps {
  mode: 'create' | 'edit';
  initialProfile: FullProfile;
  onSave: (profile: FullProfile) => void | Promise<void>;
  onCreate?: (profile: FullProfile) => void | Promise<void>;
}

export const MyProfilePage: React.FC<MyProfilePageProps> = ({
  mode,
  initialProfile,
  onSave,
  onCreate,
}) => {
  const [profile, setProfile] = useState<FullProfile>(initialProfile);
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareSettings, setShareSettings] = useState<ProfileShareSettings>(() =>
    createDefaultProfileShareSettings()
  );
  const isCreate = mode === 'create';

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  const handleSave = async () => {
    const validationErrors = isCreate
      ? validateShadchanNewProfile(profile)
      : validateProfile(profile);
    setErrors(validationErrors);

    if (hasValidationErrors(validationErrors)) {
      setSaveMessage(null);
      setSaveError(null);
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);
    setSaveError(null);
    try {
      if (isCreate) {
        await onCreate?.(profile);
        setSaveMessage('הפרופיל נוצר בהצלחה');
      } else {
        await onSave(profile);
        setSaveMessage('הפרופיל נשמר בהצלחה');
      }
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (error) {
      setSaveError(getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const openSharePanel = () => {
    setShareSettings(createDefaultProfileShareSettings());
    setIsShareOpen(true);
  };

  return (
    <div className="page my-profile-page">
      <header className="page__header">
        <h1 className="page__title">הפרופיל שלי</h1>
        <p className="page__subtitle">
          {isCreate
            ? 'שדות חובה: שם פרטי, גיל, מין ומצב משפחתי. שאר השדות אופציונליים.'
            : 'עריכת פרטים אישיים'}
        </p>
      </header>

      {saveMessage && (
        <div className="my-profile-page__toast" role="status">
          {saveMessage}
        </div>
      )}

      {saveError && (
        <div className="my-profile-page__message my-profile-page__message--error" role="alert">
          {saveError}
        </div>
      )}

      {isShareOpen && (
        <SharePanelOverlay
          onClose={() => setIsShareOpen(false)}
          ariaLabel="שמירת פרופיל"
        >
          <ShadchanSharePanel
            profile={profile}
            initialTab="other"
            variant="export"
            settings={shareSettings}
            onSettingsChange={setShareSettings}
            onClose={() => setIsShareOpen(false)}
          />
        </SharePanelOverlay>
      )}

      <ProfileEditor
        profile={profile}
        onChange={setProfile}
        errors={errors}
        mode={isCreate ? 'shadchan-add' : 'full'}
      />

      <div className="form-actions form-actions--sticky my-profile-page__save-actions">
        <button
          type="button"
          className={`btn btn--primary${isSaving ? ' btn--loading' : ''}`}
          onClick={handleSave}
          disabled={isSaving}
          aria-busy={isSaving}
        >
          {isSaving && <span className="btn__spinner" aria-hidden="true" />}
          {isSaving ? 'שומר...' : isCreate ? 'צור פרופיל' : 'שמור פרופיל'}
        </button>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={openSharePanel}
          disabled={isSaving}
        >
          שמור בשיטות אחרות
        </button>
      </div>
    </div>
  );
};
