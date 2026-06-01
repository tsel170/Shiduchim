import React from 'react';
import { FullProfile } from '../../types/profile';
import {
  getCityLabel,
  getMaritalStatusLabel,
  getReligiousStreamLabel,
} from '../../constants/profileOptions';
import { formatHeightAll } from '../../utils/height';
import { getFullName } from '../../utils/profileHelpers';
import { ChipList } from '../common/ChipList';
import { ProfileGallery } from './ProfileGallery';
import './ProfileDetails.css';

interface ProfileDetailsProps {
  profile: FullProfile;
  isSaved?: boolean;
  onToggleSave?: () => void;
  onSendToShadchan?: () => void;
}

export const ProfileDetails: React.FC<ProfileDetailsProps> = ({
  profile,
  isSaved = false,
  onToggleSave,
  onSendToShadchan,
}) => {
  const fullName = getFullName(profile);

  return (
    <div className="profile-details">
      <div className="profile-details__hero">
        <div className="profile-details__gallery">
          <ProfileGallery photos={profile.photos} alt={fullName} />
        </div>
        <div className="profile-details__summary">
          <h1 className="profile-details__name">{fullName}</h1>
          <dl className="profile-details__meta-list">
            <div className="profile-details__meta-item">
              <dt>גיל</dt>
              <dd>{profile.age}</dd>
            </div>
            <div className="profile-details__meta-item">
              <dt>עיר</dt>
              <dd>{getCityLabel(profile.city)}</dd>
            </div>
            <div className="profile-details__meta-item profile-details__meta-item--full">
              <dt>גובה</dt>
              <dd>{formatHeightAll(profile.heightCm)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <section className="profile-details__section">
        <h2 className="profile-details__section-title">אודות</h2>
        <dl className="profile-details__info-grid">
          <div>
            <dt>זרם דתי</dt>
            <dd>{getReligiousStreamLabel(profile.religiousStream)}</dd>
          </div>
          <div>
            <dt>מצב משפחתי</dt>
            <dd>{getMaritalStatusLabel(profile.maritalStatus)}</dd>
          </div>
        </dl>
        <div className="profile-details__subsection">
          <h3>תכונות אישיות</h3>
          <ChipList items={profile.personalityTraits} emptyLabel="לא צוינו תכונות" />
        </div>
        <div className="profile-details__subsection">
          <h3>תחביבים</h3>
          <ChipList items={profile.hobbies} emptyLabel="לא צוינו תחביבים" />
        </div>
      </section>

      <section className="profile-details__section">
        <h2 className="profile-details__section-title">חזון לבית ומשפחה</h2>
        <p className="profile-details__text">{profile.familyVision || 'לא צוין'}</p>
      </section>

      <section className="profile-details__section">
        <h2 className="profile-details__section-title">מחפש/ת</h2>
        <ChipList items={profile.lookingFor} variant="primary" emptyLabel="לא צוין" />
      </section>

      <section className="profile-details__section">
        <h2 className="profile-details__section-title">ממליצים</h2>
        {profile.references.length === 0 ? (
          <p className="profile-details__text profile-details__text--muted">לא הוזנו ממליצים</p>
        ) : (
          <ul className="profile-details__refs">
            {profile.references.map((ref) => (
              <li key={ref.id} className="profile-details__ref-card">
                <span className="profile-details__ref-name">{ref.name}</span>
                <span className="profile-details__ref-phone" dir="ltr">
                  {ref.countryCode} {ref.phoneNumber}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {(onToggleSave || onSendToShadchan) && (
        <div className="profile-details__actions">
          {onToggleSave && (
            <button
              type="button"
              className={`btn btn--secondary${isSaved ? ' btn--saved' : ''}`}
              onClick={onToggleSave}
            >
              {isSaved ? 'הסר משמירה' : 'שמור פרופיל'}
            </button>
          )}
          {onSendToShadchan && (
            <button type="button" className="btn btn--primary" onClick={onSendToShadchan}>
              שלח לשדכן
            </button>
          )}
        </div>
      )}
    </div>
  );
};
