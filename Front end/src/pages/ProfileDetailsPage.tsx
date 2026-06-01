import React from 'react';
import { FullProfile } from '../types/profile';
import { ProfileDetails } from '../components/profile/ProfileDetails';
import './Page.css';
import './ProfileDetailsPage.css';

interface ProfileDetailsPageProps {
  profile: FullProfile;
  isSaved: boolean;
  onBack: () => void;
  onToggleSave: () => void;
}

export const ProfileDetailsPage: React.FC<ProfileDetailsPageProps> = ({
  profile,
  isSaved,
  onBack,
  onToggleSave,
}) => {
  const handleSendToShadchan = () => {
    window.alert('בקשה נשלחה לשדכן (הדגמה בלבד)');
  };

  return (
    <div className="page profile-details-page">
      <button type="button" className="profile-details-page__back" onClick={onBack}>
        <BackIcon />
        חזרה לרשימה
      </button>
      <ProfileDetails
        profile={profile}
        isSaved={isSaved}
        onToggleSave={onToggleSave}
        onSendToShadchan={handleSendToShadchan}
      />
    </div>
  );
};

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
