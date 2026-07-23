import React, { useEffect, useMemo, useState } from 'react';
import { citiesApi } from '../../api/citiesApi';
import { City } from '../../utils/citiesStore';
import './CitySelect.css';

interface CitySelectProps {
  id?: string;
  value: string;
  onChange: (cityId: string) => void;
  className?: string;
  selectClassName?: string;
  inputClassName?: string;
  placeholder?: string;
}

function hasSearchLetters(value: string): boolean {
  return /[A-Za-z\u0590-\u05FF]/.test(value);
}

export const CitySelect: React.FC<CitySelectProps> = ({
  id,
  value,
  onChange,
  inputClassName = 'form-field__input',
  placeholder = 'הקלד/י לחיפוש עיר',
}) => {
  const [cities, setCities] = useState<City[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    citiesApi
      .list()
      .then((list) => {
        if (!cancelled) setCities(list);
      })
      .catch(() => {
        if (!cancelled) setError('לא ניתן לטעון את רשימת היישובים');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = useMemo(
    () => cities.find((city) => city.id === value) ?? null,
    [cities, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!hasSearchLetters(q)) return [];
    return cities
      .filter((city) => city.name.includes(q) || city.id === q)
      .slice(0, 40);
  }, [cities, query]);

  const showDropdown = open && !loading && hasSearchLetters(query);

  const clearCity = () => {
    onChange('');
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="city-select">
      <div className="city-select__input-row">
        <input
          id={id}
          type="search"
          className={inputClassName}
          value={open || !selected ? query : selected.name}
          placeholder={loading ? 'טוען יישובים...' : placeholder}
          disabled={loading}
          onFocus={() => {
            setOpen(true);
            setQuery(selected?.name ?? '');
          }}
          onChange={(event) => {
            const next = event.target.value;
            setOpen(true);
            setQuery(next);
            // Clearing the text clears the profile city.
            if (!next.trim()) {
              onChange('');
            }
          }}
          onBlur={() => {
            window.setTimeout(() => {
              setOpen(false);
              if (!query.trim()) {
                onChange('');
                setQuery('');
              } else if (selected) {
                setQuery(selected.name);
              }
            }, 150);
          }}
          autoComplete="off"
          aria-label={placeholder}
          aria-expanded={showDropdown}
          role="combobox"
        />
        {(value || query) && (
          <button
            type="button"
            className="city-select__clear"
            onMouseDown={(event) => event.preventDefault()}
            onClick={clearCity}
            aria-label="נקה בחירת עיר"
          >
            ×
          </button>
        )}
      </div>

      {showDropdown && (
        <ul className="city-select__dropdown" role="listbox">
          {filtered.length === 0 ? (
            <li className="city-select__empty">לא נמצאו יישובים</li>
          ) : (
            filtered.map((city) => (
              <li key={city.id}>
                <button
                  type="button"
                  className={`city-select__option${city.id === value ? ' city-select__option--active' : ''}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onChange(city.id);
                    setQuery(city.name);
                    setOpen(false);
                  }}
                >
                  {city.name}
                </button>
              </li>
            ))
          )}
        </ul>
      )}

      {open && !loading && !hasSearchLetters(query) && (
        <p className="city-select__hint">הקלידו אותיות כדי לחפש עיר</p>
      )}

      {selected && (
        <p className="city-select__selected">
          נבחר: <strong>{selected.name}</strong>
        </p>
      )}

      {error && <p className="city-select__error">{error}</p>}
    </div>
  );
};
