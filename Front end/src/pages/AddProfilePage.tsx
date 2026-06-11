import React, { useState } from 'react';
import { FullProfile, ProfileFormErrors } from '../types/profile';
import { ProfileEditor } from '../components/profile/ProfileEditor';
import { validateProfile, hasValidationErrors } from '../utils/profileValidation';
import './Page.css';
import './MyProfilePage.css';

const EMPTY_PROFILE: FullProfile = {
  id: 'new-profile',
  firstName: '',
  lastName: '',
  city: '',
  heightCm: 170,
  religiousStream: '',
  maritalStatus: 'single',
  age: 22,
  personalityTraits: [],
  hobbies: [],
  familyVision: '',
  lookingFor: [],
  references: [],
  photos: [],
};

export const AddProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<FullProfile>(EMPTY_PROFILE);
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSave = () => {
    const validationErrors = validateProfile(profile);
    setErrors(validationErrors);

    if (hasValidationErrors(validationErrors)) {
      setSaveMessage(null);
      return;
    }

    setSaveMessage('הפרופיל נוסף בהצלחה (הדגמה מקומית)');
    setTimeout(() => setSaveMessage(null), 4000);
  };

  return (
    <div className="page my-profile-page">
      <header className="page__header">
        <h1 className="page__title">הוספת פרופיל</h1>
        <p className="page__subtitle">הוסף פרופיל חדש למאגר שלך · נתונים נשמרים מקומית בלבד</p>
      </header>

      <ProfileEditor profile={profile} onChange={setProfile} errors={errors} />

      <div className="my-profile-page__actions">
        <button type="button" className="btn btn--primary" onClick={handleSave}>
          שמור פרופיל
        </button>
        {saveMessage && <p className="my-profile-page__message">{saveMessage}</p>}
      </div>
    </div>
  );
};
