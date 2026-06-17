import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../api/apiError';
import { profilesApi } from '../api/profilesApi';
import { useAuth } from '../contexts/AuthContext';
import { FullProfile, ProfileFormErrors } from '../types/profile';
import { ProfileEditor } from '../components/profile/ProfileEditor';
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

export const AddProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<FullProfile>(EMPTY_PROFILE);
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [serverWarning, setServerWarning] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    profilesApi
      .getOptions()
      .then((options) => {
        if (!cancelled && !options.genders?.length) {
          setServerWarning(
            'הבקאנד על פורט 3002 לא מעודכן. עצור אותו והפעל מחדש: cd backEnd && npm run build && npm run start:dev'
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          setServerWarning('לא ניתן להתחבר לבקאנד. ודא שהשרת רץ על פורט 3002.');
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
      setTimeout(() => navigate('/added-profiles'), 1500);
    } catch (error) {
      setSaveMessage(getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page my-profile-page">
      <header className="page__header">
        <h1 className="page__title">הוספת פרופיל</h1>
        <p className="page__subtitle">
          שדות חובה: שם פרטי, גיל, מין ומצב משפחתי. שאר השדות אופציונליים.
        </p>
      </header>

      {serverWarning && (
        <p className="my-profile-page__message my-profile-page__message--error" role="alert">
          {serverWarning}
        </p>
      )}

      <ProfileEditor
        profile={profile}
        onChange={setProfile}
        errors={errors}
        mode="shadchan-add"
      />

      <div className="my-profile-page__actions">
        <button
          type="button"
          className="btn btn--primary"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'שומר...' : 'שמור פרופיל'}
        </button>
        {saveMessage && <p className="my-profile-page__message">{saveMessage}</p>}
      </div>
    </div>
  );
};
