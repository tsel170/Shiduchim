import React from 'react';
import {
  DisplayField,
  DisplayPreferences,
  FullProfile,
  ProfileRating,
  ProfileRatingCategory,
} from '../../types/profile';
import {
  getCityLabel,
  getMaritalStatusLabel,
  getReligiousStreamLabel,
} from '../../constants/profileOptions';
import { formatHeightAll } from '../../utils/height';
import { getFullName, getOrderedVisibleFields } from '../../utils/profileHelpers';
import { ChipList } from '../common/ChipList';
import { ProfileGallery } from './ProfileGallery';
import './ProfileDetails.css';

interface ProfileDetailsProps {
  profile: FullProfile;
  displayPreferences: DisplayPreferences;
  photosUnlocked: boolean;
  rating?: ProfileRating;
  onRate: (category: ProfileRatingCategory, value: number) => void;
}

export const ProfileDetails: React.FC<ProfileDetailsProps> = ({
  profile,
  displayPreferences,
  photosUnlocked,
  rating,
  onRate,
}) => {
  const fullName = getFullName(profile);
  const orderedFields = getOrderedVisibleFields(displayPreferences);

  return (
    <div className="profile-details">
      <div className="profile-details__hero">
        <div className="profile-details__summary">
          <h1 className="profile-details__name">{fullName}</h1>
          <dl className="profile-details__meta-list">
            <div className="profile-details__meta-item">
              <dt>גיל</dt>
              <dd>{profile.age}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="profile-details__fields-grid">
        {orderedFields.map((field) => (
          <ProfileFieldSection
            key={field}
            field={field}
            profile={profile}
            rating={rating}
            onRate={onRate}
          />
        ))}
      </div>

      <section className="profile-details__section profile-details__section--photos">
        <h2 className="profile-details__section-title">תמונות פרופיל</h2>
        {photosUnlocked ? (
          <ProfileGallery photos={profile.photos} alt={fullName} />
        ) : (
          <div className="profile-details__photos-locked">
            <div className="profile-details__photos-locked-blur">
              <ProfileGallery photos={profile.photos} alt={fullName} />
            </div>
            <p>יש לדרג את כל קטגוריות הפרופיל לפני צפייה בתמונות.</p>
          </div>
        )}
        <InlineRating
          label="דירוג מראה"
          category="look"
          value={rating?.look}
          onRate={onRate}
          disabled={!photosUnlocked}
          disabledMessage="דירוג מראה זמין רק לאחר פתיחת התמונות."
        />
      </section>
    </div>
  );
};

function ProfileFieldSection({
  field,
  profile,
  rating,
  onRate,
}: {
  field: DisplayField;
  profile: FullProfile;
  rating?: ProfileRating;
  onRate: (category: ProfileRatingCategory, value: number) => void;
}) {
  const map: Record<
    DisplayField,
    { title: string; content: React.ReactNode; ratingCategory?: ProfileRatingCategory }
  > = {
    city: { title: 'עיר', content: <p className="profile-details__text">{getCityLabel(profile.city)}</p> },
    height: { title: 'גובה', content: <p className="profile-details__text">{formatHeightAll(profile.heightCm)}</p> },
    maritalStatus: {
      title: 'מצב משפחתי',
      content: <p className="profile-details__text">{getMaritalStatusLabel(profile.maritalStatus)}</p>,
    },
    religiousStream: {
      title: 'זרם דתי',
      content: <p className="profile-details__text">{getReligiousStreamLabel(profile.religiousStream)}</p>,
    },
    personalityTraits: {
      title: 'תכונות אישיות',
      content: <ChipList items={profile.personalityTraits} emptyLabel="לא צוינו תכונות" />,
      ratingCategory: 'personality',
    },
    hobbies: {
      title: 'תחביבים',
      content: <ChipList items={profile.hobbies} emptyLabel="לא צוינו תחביבים" />,
      ratingCategory: 'hobbies',
    },
    familyVision: {
      title: 'חזון לבית ומשפחה',
      content: <p className="profile-details__text">{profile.familyVision || 'לא צוין'}</p>,
      ratingCategory: 'homeVision',
    },
    lookingFor: {
      title: 'מחפש/ת',
      content: <ChipList items={profile.lookingFor} variant="primary" emptyLabel="לא צוין" />,
      ratingCategory: 'lookingFor',
    },
  };

  const section = map[field];
  return (
    <section className={`profile-details__section profile-details__section--${field}`}>
      <h2 className="profile-details__section-title">{section.title}</h2>
      {section.content}
      {section.ratingCategory && (
        <InlineRating
          label={`דירוג ${section.title}`}
          category={section.ratingCategory}
          value={rating?.[section.ratingCategory]}
          onRate={onRate}
        />
      )}
    </section>
  );
}

function InlineRating({
  label,
  category,
  value,
  onRate,
  disabled = false,
  disabledMessage,
}: {
  label: string;
  category: ProfileRatingCategory;
  value?: number;
  onRate: (category: ProfileRatingCategory, value: number) => void;
  disabled?: boolean;
  disabledMessage?: string;
}) {
  return (
    <div className="profile-details__inline-rating">
      <span>{label}</span>
      <div className="profile-details__inline-stars">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            className={`profile-details__inline-star${(value ?? 0) >= score ? ' profile-details__inline-star--active' : ''}`}
            onClick={() => onRate(category, score)}
            disabled={disabled}
            title={disabled ? disabledMessage : undefined}
          >
            {score}
          </button>
        ))}
      </div>
      {disabled && disabledMessage && (
        <p className="profile-details__inline-rating-hint">{disabledMessage}</p>
      )}
    </div>
  );
}
