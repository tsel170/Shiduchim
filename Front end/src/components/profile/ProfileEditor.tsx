import React from 'react';
import { FullProfile, ProfileFormErrors } from '../../types/profile';
import {
  CITIES,
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  RELIGIOUS_STREAMS,
  MIN_PROFILE_AGE,
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
  /** שדכן מוסיף פרופיל — שדות חובה מסומנים, שאר השדות אופציונליים */
  mode?: 'full' | 'shadchan-add';
}

function RequiredMark() {
  return (
    <span className="form-field__required" aria-hidden="true">
      {' '}
      *
    </span>
  );
}

function OptionalMark() {
  return <span className="form-field__optional"> (אופציונלי)</span>;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
  profile,
  onChange,
  errors = {},
  mode = 'full',
}) => {
  const isShadchanAdd = mode === 'shadchan-add';
  const patch = <K extends keyof FullProfile>(key: K, value: FullProfile[K]) => {
    onChange({ ...profile, [key]: value });
  };

  return (
    <div className="profile-editor">
      <section className="form-section">
        <h2 className="form-section__title">
          תמונות
          {isShadchanAdd && <OptionalMark />}
        </h2>
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
              <RequiredMark />
            </label>
            <input
              id="firstName"
              type="text"
              className={`form-field__input${errors.firstName ? ' form-field__input--error' : ''}`}
              value={profile.firstName}
              onChange={(e) => patch('firstName', e.target.value)}
            />
            {errors.firstName && (
              <span className="form-field__error">{errors.firstName}</span>
            )}
          </div>
          <div className="form-field">
            <label className="form-field__label" htmlFor="lastName">
              שם משפחה
              {isShadchanAdd && <OptionalMark />}
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
              <RequiredMark />
            </label>
            <input
              id="age"
              type="number"
              min={MIN_PROFILE_AGE}
              max={120}
              className={`form-field__input${errors.age ? ' form-field__input--error' : ''}`}
              value={profile.age || ''}
              onChange={(e) => {
                const raw = e.target.value;
                if (!raw) {
                  patch('age', 0);
                  return;
                }
                patch('age', Number(raw));
              }}
            />
            {errors.age && <span className="form-field__error">{errors.age}</span>}
          </div>
          <div className="form-field">
            <label className="form-field__label" htmlFor="city">
              עיר
              {isShadchanAdd && <OptionalMark />}
            </label>
            <select
              id="city"
              className="form-field__select"
              value={profile.city}
              onChange={(e) => patch('city', e.target.value)}
            >
              <option value="">בחר עיר</option>
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
            {isShadchanAdd && <OptionalMark />}
          </label>
          <input
            id="heightCm"
            type="number"
            min={1}
            className={`form-field__input${errors.heightCm ? ' form-field__input--error' : ''}`}
            value={profile.heightCm > 0 ? profile.heightCm : ''}
            onChange={(e) => {
              const raw = e.target.value;
              patch('heightCm', raw ? Number(raw) : 0);
            }}
          />
          {profile.heightCm > 0 && (
            <span className="form-field__hint">{formatHeightAll(profile.heightCm)}</span>
          )}
          {errors.heightCm && <span className="form-field__error">{errors.heightCm}</span>}
        </div>
        <div className="form-row form-row--2">
          <div className="form-field">
            <label className="form-field__label" htmlFor="gender">
              מין
              <RequiredMark />
            </label>
            <select
              id="gender"
              className={`form-field__select${errors.gender ? ' form-field__select--error' : ''}`}
              value={profile.gender}
              onChange={(e) => patch('gender', e.target.value)}
            >
              <option value="">בחר מין</option>
              {GENDER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.gender && <span className="form-field__error">{errors.gender}</span>}
          </div>
          <div className="form-field">
            <label className="form-field__label" htmlFor="religiousStream">
              זרם דתי
              {isShadchanAdd && <OptionalMark />}
            </label>
            <select
              id="religiousStream"
              className="form-field__select"
              value={profile.religiousStream}
              onChange={(e) => patch('religiousStream', e.target.value)}
            >
              <option value="">בחר זרם דתי</option>
              {RELIGIOUS_STREAMS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-field">
            <label className="form-field__label" htmlFor="maritalStatus">
              מצב משפחתי
              <RequiredMark />
            </label>
            <select
              id="maritalStatus"
              className={`form-field__select${errors.maritalStatus ? ' form-field__select--error' : ''}`}
              value={profile.maritalStatus}
              onChange={(e) => patch('maritalStatus', e.target.value)}
            >
              <option value="">בחר מצב משפחתי</option>
              {MARITAL_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.maritalStatus && (
              <span className="form-field__error">{errors.maritalStatus}</span>
            )}
        </div>
      </section>

      <section className="form-section">
        <h2 className="form-section__title">
          אודות
          {isShadchanAdd && <OptionalMark />}
        </h2>
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
        <h2 className="form-section__title">
          חזון לבית ומשפחה
          {isShadchanAdd && <OptionalMark />}
        </h2>
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
        <h2 className="form-section__title">
          מחפש/ת
          {isShadchanAdd && <OptionalMark />}
        </h2>
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
