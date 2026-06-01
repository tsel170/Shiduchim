import React, { useState } from 'react';
import { FullProfile, ProfileFormErrors } from '../types/profile';
import { ProfileEditor } from '../components/profile/ProfileEditor';
import { validateProfile, hasValidationErrors } from '../utils/profileValidation';
import './Page.css';
import './MyProfilePage.css';

interface MyProfilePageProps {
  initialProfile: FullProfile;
  onSave: (profile: FullProfile) => void;
}

export const MyProfilePage: React.FC<MyProfilePageProps> = ({
  initialProfile,
  onSave,
}) => {
  const [profile, setProfile] = useState<FullProfile>(initialProfile);
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSave = () => {
    const validationErrors = validateProfile(profile);
    setErrors(validationErrors);

    if (hasValidationErrors(validationErrors)) {
      setSaveMessage(null);
      return;
    }

    onSave(profile);
    setSaveMessage('הפרופיל נשמר בהצלחה (הדגמה מקומית)');
    setTimeout(() => setSaveMessage(null), 4000);
  };

  return (
    <div className="page my-profile-page">
      <header className="page__header">
        <h1 className="page__title">הפרופיל שלי</h1>
        <p className="page__subtitle">עריכת פרטים אישיים · נתונים נשמרים מקומית בלבד</p>
      </header>

      {saveMessage && (
        <div className="my-profile-page__toast" role="status">
          {saveMessage}
        </div>
      )}

      <ProfileEditor profile={profile} onChange={setProfile} errors={errors} />

      <div className="form-actions form-actions--sticky">
        <button type="button" className="btn btn--primary" onClick={handleSave}>
          שמור פרופיל
        </button>
      </div>
    </div>
  );
};
