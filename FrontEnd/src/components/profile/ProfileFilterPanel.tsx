import React from 'react';

import {

  DEFAULT_FILTER_CONFIGURATION,

  HOBBY_OPTIONS,

  MIN_PROFILE_AGE,

  MARITAL_STATUS_OPTIONS,

  GENDER_OPTIONS,

  PERSONALITY_TRAIT_OPTIONS,

  RELIGIOUS_STREAMS,

} from '../../constants/profileOptions';

import { FilterConfiguration } from '../../types/profile';

import { isFilterKeyAtDefault, resetFilterKey } from '../../utils/filters';
import { formatHeightFeetInches } from '../../utils/height';
import { CitySelect } from './CitySelect';
import './ProfileFilterPanel.css';



interface ProfileFilterPanelProps {

  value: FilterConfiguration;

  onChange: (next: FilterConfiguration) => void;

  onResetAll: () => void;

  onClose?: () => void;

}



type FilterKey = keyof FilterConfiguration;



export const ProfileFilterPanel: React.FC<ProfileFilterPanelProps> = ({

  value,

  onChange,

  onResetAll,

  onClose,

}) => {

  const patch = <K extends FilterKey>(key: K, next: FilterConfiguration[K]) => {

    onChange({ ...value, [key]: next });

  };



  const resetKey = (key: FilterKey) => {

    onChange(resetFilterKey(value, key));

  };



  const toggleMulti = (key: FilterKey, item: string) => {

    const list = value[key] as string[];

    patch(

      key as never,

      (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]) as never

    );

  };



  const patchAgeRange = (next: { min?: number; max?: number }) => {
    const min = Math.max(MIN_PROFILE_AGE, next.min ?? value.ageRange.min);
    const max = Math.max(min, next.max ?? value.ageRange.max);
    patch('ageRange', { min, max });
  };



  const anyFilterActive = (Object.keys(DEFAULT_FILTER_CONFIGURATION) as FilterKey[]).some(

    (key) => !isFilterKeyAtDefault(value, key)

  );



  return (

    <section className="filter-panel">

      <header className="filter-panel__header">

        <div className="filter-panel__header-text">

          <h2>פילטרים</h2>

          <p>סינון פרופילים לפי העדפותיך</p>

        </div>

        <div className="filter-panel__header-actions">

          {anyFilterActive && (

            <button type="button" className="filter-panel__reset-all" onClick={onResetAll}>

              איפוס הכל

            </button>

          )}

          {onClose && (

            <button type="button" className="filter-panel__close" onClick={onClose} aria-label="סגור">

              ×

            </button>

          )}

        </div>

      </header>



      <div className="filter-panel__body">

        <FilterSection

          themeClass="profile-field--age"

          title="גיל"

          onReset={() => resetKey('ageRange')}

          canReset={!isFilterKeyAtDefault(value, 'ageRange')}

        >

          <div className="filter-panel__range-grid">

            <label className="filter-panel__range">

              <span>מינימום</span>

              <input

                type="number"

                min={MIN_PROFILE_AGE}

                max={value.ageRange.max}

                value={value.ageRange.min}

                onChange={(e) => patchAgeRange({ min: Number(e.target.value) })}

              />

            </label>

            <label className="filter-panel__range">

              <span>מקסימום</span>

              <input

                type="number"

                min={value.ageRange.min}

                max={120}

                value={value.ageRange.max}

                onChange={(e) => patchAgeRange({ max: Number(e.target.value) })}

              />

            </label>

          </div>

        </FilterSection>



        <FilterSection

          themeClass="profile-field--height"

          title="גובה (ס״מ)"

          onReset={() => resetKey('heightRange')}

          canReset={!isFilterKeyAtDefault(value, 'heightRange')}

        >

          <div className="filter-panel__range-grid">

            <label className="filter-panel__range">
              <span>מינימום</span>
              <input
                type="number"
                value={value.heightRange.min}
                onChange={(e) =>
                  patch('heightRange', { ...value.heightRange, min: Number(e.target.value) })
                }
              />
              <span className="filter-panel__range-conversion">
                {formatHeightConversion(value.heightRange.min)}
              </span>
            </label>
            <label className="filter-panel__range">
              <span>מקסימום</span>
              <input
                type="number"
                value={value.heightRange.max}
                onChange={(e) =>
                  patch('heightRange', { ...value.heightRange, max: Number(e.target.value) })
                }
              />
              <span className="filter-panel__range-conversion">
                {formatHeightConversion(value.heightRange.max)}
              </span>
            </label>
          </div>
        </FilterSection>

        <FilterSection
          themeClass="profile-field--city"
          title="ערים"
          onReset={() => resetKey('cities')}
          canReset={!isFilterKeyAtDefault(value, 'cities')}
        >
          <CitySelect
            value={value.cities[0] ?? ''}
            onChange={(cityId) =>
              patch('cities', cityId ? [cityId] : [])
            }
            placeholder="סנן לפי עיר ספציפית"
          />
          <p className="filter-panel__hint">בחירה מרשימת היישובים הרשמית בלבד</p>
        </FilterSection>

        <FilterSection
          themeClass="profile-field--distance"
          title="מרחק מעיר"
          onReset={() => {
            onChange({
              ...value,
              originCityId: null,
              maxDistanceKm: null,
            });
          }}
          canReset={
            !isFilterKeyAtDefault(value, 'originCityId') ||
            !isFilterKeyAtDefault(value, 'maxDistanceKm')
          }
        >
          <CitySelect
            value={value.originCityId ?? ''}
            onChange={(cityId) => patch('originCityId', cityId || null)}
            placeholder="בחרי עיר מרכז לרדיוס"
          />
          <label className="filter-panel__range filter-panel__range--distance">
            <span className="filter-panel__range-label">
              {value.maxDistanceKm == null
                ? 'רדיוס: כבוי (מציג הכל)'
                : `רדיוס: עד ${value.maxDistanceKm} ק״מ`}
            </span>
            <input
              type="range"
              min={0}
              max={500}
              step={10}
              value={value.maxDistanceKm ?? 0}
              onChange={(e) => {
                const next = Number(e.target.value);
                patch('maxDistanceKm', next <= 0 ? null : next);
              }}
            />
            <div className="filter-panel__range-footer">
              <span>הכל</span>
              <input
                type="number"
                min={0}
                max={500}
                className="filter-panel__range-number"
                value={value.maxDistanceKm ?? ''}
                placeholder="ק״מ"
                onChange={(e) =>
                  patch(
                    'maxDistanceKm',
                    e.target.value === ''
                      ? null
                      : Math.max(0, Math.min(500, Number(e.target.value) || 0)) || null
                  )
                }
              />
              <span>500</span>
            </div>
          </label>
          {value.maxDistanceKm != null && !value.originCityId ? (
            <p className="filter-panel__hint filter-panel__hint--warn">
              בחרי עיר למעלה — בלי עיר המרחק לא מסנן.
            </p>
          ) : (
            <p className="filter-panel__hint">
              ריק / 0 = כל הפרופילים. עם מספר + עיר = רק פרופילים בתוך הרדיוס.
            </p>
          )}
        </FilterSection>

        <FilterChipsSection

          themeClass="profile-field--religiousStream"

          title="זרם דתי"

          options={RELIGIOUS_STREAMS.map((x) => ({ id: x.id, label: x.label }))}

          selected={value.religiousStreams}

          onToggle={(id) => toggleMulti('religiousStreams', id)}

          onReset={() => resetKey('religiousStreams')}

          canReset={!isFilterKeyAtDefault(value, 'religiousStreams')}

        />

        <FilterChipsSection

          themeClass="profile-field--gender"

          title="מין"

          options={GENDER_OPTIONS.map((x) => ({ id: x.value, label: x.label }))}

          selected={value.genders}

          onToggle={(id) => toggleMulti('genders', id)}

          onReset={() => resetKey('genders')}

          canReset={!isFilterKeyAtDefault(value, 'genders')}

        />

        <FilterChipsSection

          themeClass="profile-field--maritalStatus"

          title="מצב משפחתי"

          options={MARITAL_STATUS_OPTIONS.map((x) => ({ id: x.value, label: x.label }))}

          selected={value.maritalStatuses}

          onToggle={(id) => toggleMulti('maritalStatuses', id)}

          onReset={() => resetKey('maritalStatuses')}

          canReset={!isFilterKeyAtDefault(value, 'maritalStatuses')}

        />

        <FilterChipsSection

          themeClass="profile-field--personalityTraits"

          title="תכונות אישיות"

          options={PERSONALITY_TRAIT_OPTIONS.map((x) => ({ id: x, label: x }))}

          selected={value.personalityTraits}

          onToggle={(id) => toggleMulti('personalityTraits', id)}

          onReset={() => resetKey('personalityTraits')}

          canReset={!isFilterKeyAtDefault(value, 'personalityTraits')}

        />

        <FilterChipsSection

          themeClass="profile-field--hobbies"

          title="תחביבים"

          options={HOBBY_OPTIONS.map((x) => ({ id: x, label: x }))}

          selected={value.hobbies}

          onToggle={(id) => toggleMulti('hobbies', id)}

          onReset={() => resetKey('hobbies')}

          canReset={!isFilterKeyAtDefault(value, 'hobbies')}

        />

        <FilterChipsSection

          themeClass="profile-field--lookingFor"

          title="מחפש/ת"

          options={PERSONALITY_TRAIT_OPTIONS.map((x) => ({ id: x, label: x }))}

          selected={value.lookingFor}

          onToggle={(id) => toggleMulti('lookingFor', id)}

          onReset={() => resetKey('lookingFor')}

          canReset={!isFilterKeyAtDefault(value, 'lookingFor')}

        />

      </div>

    </section>

  );

};



function FilterSection({

  themeClass,

  title,

  onReset,

  canReset,

  children,

}: {

  themeClass: string;

  title: string;

  onReset: () => void;

  canReset: boolean;

  children: React.ReactNode;

}) {

  return (

    <div className={`filter-panel__section ${themeClass}`}>

      <FilterSectionHeader title={title} onReset={onReset} canReset={canReset} />

      {children}

    </div>

  );

}



function FilterChipsSection({

  themeClass,

  title,

  options,

  selected,

  onToggle,

  onReset,

  canReset,

}: {

  themeClass: string;

  title: string;

  options: ReadonlyArray<{ id: string; label: string }>;

  selected: string[];

  onToggle: (id: string) => void;

  onReset: () => void;

  canReset: boolean;

}) {

  return (

    <FilterSection themeClass={themeClass} title={title} onReset={onReset} canReset={canReset}>

      <div className="filter-panel__chips">

        {options.map((option) => {

          const active = selected.includes(option.id);

          return (

            <button

              key={option.id}

              type="button"

              className={`filter-panel__chip${active ? ' filter-panel__chip--active' : ''}`}

              onClick={() => onToggle(option.id)}

              aria-pressed={active}

            >

              {option.label}

            </button>

          );

        })}

      </div>

    </FilterSection>

  );

}



function formatHeightConversion(heightCm: number): string {
  if (!Number.isFinite(heightCm) || heightCm <= 0) {
    return '—';
  }
  return formatHeightFeetInches(heightCm);
}

function FilterSectionHeader({
  title,
  onReset,
  canReset,
}: {
  title: string;
  onReset: () => void;
  canReset: boolean;
}) {

  return (

    <div className="filter-panel__section-header">

      <h3 className="filter-panel__section-title">{title}</h3>

      <button

        type="button"

        className="filter-panel__reset"

        onClick={onReset}

        disabled={!canReset}

        title={canReset ? 'איפוס מסנן זה' : 'ברירת מחדל'}

      >

        איפוס

      </button>

    </div>

  );

}

