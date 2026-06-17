import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getApiErrorMessage } from '../api/apiError';
import { profilesApi } from '../api/profilesApi';
import { PageState } from '../components/common/PageState';
import { ProfileEditor } from '../components/profile/ProfileEditor';
import { useAuth } from '../contexts/AuthContext';
import { FullProfile, ProfileFormErrors } from '../types/profile';
import {
  buildShadchanUpdateRequestBody,
  hasValidationErrors,
  validateShadchanNewProfile,
} from '../utils/profileValidation';
import './Page.css';
import './MyProfilePage.css';

export const EditAddedProfilePage: React.FC = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profileId || !currentUser || currentUser.role !== 'shadchan') return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const loaded = await profilesApi.getById(profileId!);
        if (cancelled) return;

        if (loaded.addedByShadchanId !== currentUser!.accountId) {
          navigate('/added-profiles', { replace: true });
          return;
        }

        setProfile(loaded);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [profileId, currentUser, navigate]);

  const handleSave = async () => {
    if (!profile || !profileId) return;

    const validationErrors = validateShadchanNewProfile(profile);
    setErrors(validationErrors);

    if (hasValidationErrors(validationErrors)) {
      setSaveMessage(null);
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);
    try {
      const updated = await profilesApi.updateShadchan(
        profileId,
        buildShadchanUpdateRequestBody(profile)
      );
      setProfile(updated);
      setSaveMessage('הפרופיל עודכן בהצלחה');
      setTimeout(() => navigate('/added-profiles'), 1500);
    } catch (err) {
      setSaveMessage(getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page my-profile-page">
      <header className="page__header">
        <h1 className="page__title">עריכת פרופיל</h1>
        <p className="page__subtitle">
          שדות חובה: שם פרטי, גיל, מין ומצב משפחתי. שאר השדות אופציונליים.
        </p>
      </header>

      <PageState loading={loading} error={error} isEmpty={false}>
        {profile && (
          <>
            <ProfileEditor
              profile={profile}
              onChange={setProfile}
              errors={errors}
              mode="shadchan-add"
            />

            <div className="my-profile-page__actions">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => navigate('/added-profiles')}
                disabled={isSaving}
              >
                ביטול
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'שומר...' : 'שמור שינויים'}
              </button>
              {saveMessage && <p className="my-profile-page__message">{saveMessage}</p>}
            </div>
          </>
        )}
      </PageState>
    </div>
  );
};
