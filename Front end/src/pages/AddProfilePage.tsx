import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getApiErrorMessage } from '../api/apiError';
import { profilesApi } from '../api/profilesApi';
import { PageHeader } from '../components/common/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { FullProfile, ProfileFormErrors } from '../types/profile';
import { ProfileEditor } from '../components/profile/ProfileEditor';
import { clearAiImportDraft, loadAiImportDraft, AiImportDraft } from '../utils/aiProfileExtract';
import {
  buildShadchanCreateRequestBody,
  hasValidationErrors,
  validateShadchanNewProfile,
} from '../utils/profileValidation';
import './Page.css';
import './MyProfilePage.css';

const EMPTY_PROFILE: FullProfile = {
  id: 'new-profile',
  firstName: '',
  lastName: '',
  city: '',
  heightCm: 0,
  religiousStream: '',
  gender: '',
  maritalStatus: '',
  age: 0,
  personalityTraits: [],
  hobbies: [],
  familyVision: '',
  lookingFor: [],
  references: [],
  photos: [],
};

function applyAiDraft(base: FullProfile, draft: AiImportDraft): FullProfile {
  const next = { ...base };

  if (typeof draft.firstName === 'string') next.firstName = draft.firstName;
  if (typeof draft.lastName === 'string') next.lastName = draft.lastName;
  if (typeof draft.city === 'string') next.city = draft.city;
  if (typeof draft.religiousStream === 'string') next.religiousStream = draft.religiousStream;
  if (typeof draft.familyVision === 'string') next.familyVision = draft.familyVision;
  if (typeof draft.gender === 'string') next.gender = draft.gender;
  if (typeof draft.maritalStatus === 'string') next.maritalStatus = draft.maritalStatus;

  const age = draft.age;
  if (typeof age === 'number') next.age = age;
  else if (typeof age === 'string') {
    const parsed = parseInt(age, 10);
    if (!Number.isNaN(parsed)) next.age = parsed;
  }

  const height = draft.heightCm;
  if (typeof height === 'number') next.heightCm = height;
  else if (typeof height === 'string') {
    const parsed = parseInt(height, 10);
    if (!Number.isNaN(parsed)) next.heightCm = parsed;
  }

  if (Array.isArray(draft.personalityTraits)) {
    next.personalityTraits = draft.personalityTraits;
  }
  if (Array.isArray(draft.hobbies)) {
    next.hobbies = draft.hobbies;
  }
  if (Array.isArray(draft.lookingFor)) {
    next.lookingFor = draft.lookingFor;
  }

  return next;
}

export const AddProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState<FullProfile>(EMPTY_PROFILE);
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [serverWarning, setServerWarning] = useState<string | null>(null);
  const [fromAiImport, setFromAiImport] = useState(false);

  useEffect(() => {
    if (searchParams.get('from') === 'ai-import') {
      const draft = loadAiImportDraft();
      if (draft) {
        setProfile(applyAiDraft(EMPTY_PROFILE, draft));
        setFromAiImport(true);
        clearAiImportDraft();
      }
    }
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    profilesApi
      .getOptions()
      .then((options) => {
        if (!cancelled && !options.genders?.length) {
          setServerWarning(
            'השרת לא מעודכן. נסה/י לרענן את הדף, ואם הבעיה נמשכת — פנה/י למנהל המערכת.'
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          setServerWarning('לא ניתן להתחבר לשרת. ודא שהשרת פועל ונסה שוב.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    const validationErrors = validateShadchanNewProfile(profile);
    setErrors(validationErrors);

    if (hasValidationErrors(validationErrors)) {
      setSaveMessage(null);
      return;
    }

    if (!currentUser) return;

    setIsSaving(true);
    setSaveMessage(null);
    try {
      await profilesApi.createFromBody(
        buildShadchanCreateRequestBody(profile, currentUser.accountId)
      );
      setSaveMessage('הפרופיל נוסף בהצלחה');
      setProfile(EMPTY_PROFILE);
      setFromAiImport(false);
      setTimeout(() => navigate('/added-profiles'), 1500);
    } catch (error) {
      setSaveMessage(getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="ds-page ds-page--narrow my-profile-page">
      <PageHeader
        title="הוספת פרופיל"
        subtitle="שדות חובה: שם פרטי, גיל, מין ומצב משפחתי. שאר השדות אופציונליים."
        badge={
          fromAiImport ? (
            <span className="ds-badge ds-badge--success">יובא אוטומטית — בדקו לפני שמירה</span>
          ) : undefined
        }
        actions={
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => navigate('/ai-import')}
          >
            ייבוא אוטומטי
          </button>
        }
      />

      {serverWarning && (
        <div className="ds-alert ds-alert--error" role="alert">
          {serverWarning}
        </div>
      )}

      <ProfileEditor
        profile={profile}
        onChange={setProfile}
        errors={errors}
        mode="shadchan-add"
      />

      <div className="form-actions form-actions--sticky form-actions--end my-profile-page__actions">
        <button
          type="button"
          className={`btn btn--primary btn--lg${isSaving ? ' btn--loading' : ''}`}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <span className="btn__spinner" aria-hidden="true" />
              שומר...
            </>
          ) : (
            'שמור פרופיל'
          )}
        </button>
        {saveMessage && (
          <p
            className={`my-profile-page__message${
              saveMessage.includes('הצלחה') ? ' my-profile-page__message--success' : ''
            }`}
          >
            {saveMessage}
          </p>
        )}
      </div>
    </div>
  );
};
