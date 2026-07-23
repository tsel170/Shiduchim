import React, { KeyboardEvent } from 'react';
import { getCityLabel, getMaritalStatusLabel } from '../../constants/profileOptions';
import { FullProfile } from '../../types/profile';
import { ProfileImage } from '../common/ProfileImage';
import './RequestProfilePreview.css';

interface RequestProfilePreviewProps {
  label: string;
  profile: FullProfile;
  onViewProfile: (id: string) => void;
}

export const RequestProfilePreview: React.FC<RequestProfilePreviewProps> = ({
  label,
  profile,
  onViewProfile,
}) => {
  const fullName = `${profile.firstName} ${profile.lastName}`;

  const openProfile = () => onViewProfile(profile.id);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openProfile();
    }
  };

  return (
    <article
      className="request-profile-preview"
      onClick={openProfile}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`צפייה בפרופיל של ${fullName}`}
    >
      <p className="request-profile-preview__label">{label}</p>
      <div className="request-profile-preview__image-wrap">
        <ProfileImage
          photos={profile.photos}
          seed={profile.id}
          alt=""
          imgClassName="request-profile-preview__image"
        />
      </div>
      <h3 className="request-profile-preview__name">{fullName}</h3>
      <p className="request-profile-preview__meta">
        גיל {profile.age}
        <span className="request-profile-preview__dot" aria-hidden="true">
          ·
        </span>
        {getCityLabel(profile.city)}
        <span className="request-profile-preview__dot" aria-hidden="true">
          ·
        </span>
        {getMaritalStatusLabel(profile.maritalStatus)}
      </p>
    </article>
  );
};
