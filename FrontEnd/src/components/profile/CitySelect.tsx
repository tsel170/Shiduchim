import React, { useEffect, useState } from 'react';
import { CITIES, isKnownCityId } from '../../constants/profileOptions';
import './CitySelect.css';

interface CitySelectProps {
  id?: string;
  value: string;
  onChange: (city: string) => void;
  className?: string;
  selectClassName?: string;
  inputClassName?: string;
  placeholder?: string;
}

export const CitySelect: React.FC<CitySelectProps> = ({
  id,
  value,
  onChange,
  selectClassName = 'form-field__select',
  inputClassName = 'form-field__input',
  placeholder = 'בחר עיר',
}) => {
  const [mode, setMode] = useState<'list' | 'custom'>(() =>
    value && !isKnownCityId(value) ? 'custom' : 'list'
  );

  useEffect(() => {
    if (value && !isKnownCityId(value)) {
      setMode('custom');
    }
  }, [value]);

  const selectedLabel = CITIES.find((city) => city.id === value)?.label ?? '';

  const switchToCustom = () => {
    setMode('custom');
    onChange('');
  };

  const switchToList = () => {
    setMode('list');
    onChange('');
  };

  return (
    <div className="city-select">
      {mode === 'list' ? (
        <>
          <select
            id={id}
            className={selectClassName}
            value={isKnownCityId(value) ? value : ''}
            onChange={(event) => onChange(event.target.value)}
            aria-label={placeholder}
          >
            <option value="">{placeholder}</option>
            {CITIES.map((city) => (
              <option key={city.id} value={city.id}>
                {city.label}
              </option>
            ))}
          </select>
          <button type="button" className="city-select__mode-btn" onClick={switchToCustom}>
            העיר שלי לא ברשימה
          </button>
          {value && selectedLabel && (
            <p className="city-select__selected">
              נבחר: <strong>{selectedLabel}</strong>
            </p>
          )}
        </>
      ) : (
        <>
          <input
            id={id}
            type="text"
            className={inputClassName}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="הקלד/י שם עיר"
            aria-label="שם עיר"
            maxLength={120}
          />
          <button type="button" className="city-select__mode-btn" onClick={switchToList}>
            בחר מהרשימה
          </button>
        </>
      )}
    </div>
  );
};
