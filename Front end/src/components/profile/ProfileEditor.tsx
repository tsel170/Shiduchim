import React from 'react';
import { FullProfile, ProfileFormErrors } from '../../types/profile';
import {
  CITIES,
  MARITAL_STATUS_OPTIONS,
  RELIGIOUS_STREAMS,
  PERSONALITY_TRAIT_OPTIONS,
} from '../../constants/profileOptions';
import { formatHeightAll } from '../../utils/height';
import { PhotoUploader } from './PhotoUploader';
import { TraitSelector } from './TraitSelector';
import { HobbySelector } from './HobbySelector';
import { LookingForSelector } from './LookingForSelector';
import { ReferenceContactsEditor } from './ReferenceContactsEditor';
import '../../styles/forms.css';
import './ProfileEditor.css';

interface ProfileEditorProps {
  profile: FullProfile;
  onChange: (profile: FullProfile) => void;
  errors?: ProfileFormErrors;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
  profile,
  onChange,
  errors = {},
}) => {
  const patch = <K extends keyof FullProfile>(key: K, value: FullProfile[K]) => {
    onChange({ ...profile, [key]: value });
  };

  return (
    <div className="profile-editor">
      <section className="form-section">
        <h2 className="form-section__title">תמונות</h2>
        <PhotoUploader
          photos={profile.photos}
          onChange={(photos) => patch('photos', photos)}
          error={errors.photos}
        />
      </section>

      <section className="form-section">
        <h2 className="form-section__title">פרטים אישיים</h2>
        <div className="form-row form-row--2">
          <div className="form-field">
            <label className="form-field__label" htmlFor="firstName">
              שם פרטי
            </label>
            <input
              id="firstName"
              type="text"
              className="form-field__input"
              value={profile.firstName}
              onChange={(e) => patch('firstName', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="form-field__label" htmlFor="lastName">
              שם משפחה
            </label>
            <input
              id="lastName"
              type="text"
              className="form-field__input"
              value={profile.lastName}
              onChange={(e) => patch('lastName', e.target.value)}
            />
          </div>
        </div>
        <div className="form-row form-row--2">
          <div className="form-field">
            <label className="form-field__label" htmlFor="age">
              גיל
            </label>
            <input
              id="age"
              type="number"
              min={1}
              className={`form-field__input${errors.age ? ' form-field__input--error' : ''}`}
              value={profile.age || ''}
              onChange={(e) => patch('age', Number(e.target.value))}
            />
            {errors.age && <span className="form-field__error">{errors.age}</span>}
          </div>
          <div className="form-field">
            <label className="form-field__label" htmlFor="city">
              עיר
            </label>
            <select
              id="city"
              className="form-field__select"
              value={profile.city}
              onChange={(e) => patch('city', e.target.value)}
            >
              {CITIES.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-field">
          <label className="form-field__label" htmlFor="heightCm">
            גובה (ס"מ)
          </label>
          <input
            id="heightCm"
            type="number"
            min={1}
            className={`form-field__input${errors.heightCm ? ' form-field__input--error' : ''}`}
            value={profile.heightCm || ''}
            onChange={(e) => patch('heightCm', Number(e.target.value))}
          />
          {profile.heightCm > 0 && (
            <span className="form-field__hint">{formatHeightAll(profile.heightCm)}</span>
          )}
          {errors.heightCm && <span className="form-field__error">{errors.heightCm}</span>}
        </div>
        <div className="form-row form-row--2">
          <div className="form-field">
            <label className="form-field__label" htmlFor="religiousStream">
              זרם דתי
            </label>
            <select
              id="religiousStream"
              className="form-field__select"
              value={profile.religiousStream}
              onChange={(e) => patch('religiousStream', e.target.value)}
            >
              {RELIGIOUS_STREAMS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label className="form-field__label" htmlFor="maritalStatus">
              מצב משפחתי
            </label>
            <select
              id="maritalStatus"
              className="form-field__select"
              value={profile.maritalStatus}
              onChange={(e) => patch('maritalStatus', e.target.value)}
            >
              {MARITAL_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="form-section">
        <h2 className="form-section__title">אודות</h2>
        <TraitSelector
          label="תכונות אישיות"
          options={PERSONALITY_TRAIT_OPTIONS}
          selected={profile.personalityTraits}
          onChange={(personalityTraits) => patch('personalityTraits', personalityTraits)}
          customPlaceholder="תכונה נוספת..."
        />
        <div className="profile-editor__spacer" />
        <HobbySelector
          selected={profile.hobbies}
          onChange={(hobbies) => patch('hobbies', hobbies)}
        />
      </section>

      <section className="form-section">
        <h2 className="form-section__title">חזון לבית ומשפחה</h2>
        <div className="form-field">
          <textarea
            id="familyVision"
            className="form-field__textarea"
            rows={5}
            value={profile.familyVision}
            onChange={(e) => patch('familyVision', e.target.value)}
            placeholder="תאר/י את החזון שלך לבית ולמשפחה..."
          />
        </div>
      </section>

      <section className="form-section">
        <h2 className="form-section__title">מחפש/ת</h2>
        <LookingForSelector
          selected={profile.lookingFor}
          onChange={(lookingFor) => patch('lookingFor', lookingFor)}
        />
      </section>

      <section className="form-section">
        <ReferenceContactsEditor
          references={profile.references}
          onChange={(references) => patch('references', references)}
          errors={errors.references}
        />
      </section>
    </div>
  );
};
