import React, { useState } from 'react';
import './TraitSelector.css';

interface TraitSelectorProps {
  label: string;
  hint?: string;
  options: readonly string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  allowCustom?: boolean;
  customPlaceholder?: string;
}

export const TraitSelector: React.FC<TraitSelectorProps> = ({
  label,
  hint,
  options,
  selected,
  onChange,
  allowCustom = true,
  customPlaceholder = 'הוסף ערך חדש...',
}) => {
  const [customValue, setCustomValue] = useState('');

  const toggle = (item: string) => {
    if (selected.includes(item)) {
      onChange(selected.filter((s) => s !== item));
    } else {
      onChange([...selected, item]);
    }
  };

  const addCustom = () => {
    const trimmed = customValue.trim();
    if (!trimmed || selected.includes(trimmed)) return;
    onChange([...selected, trimmed]);
    setCustomValue('');
  };

  const allOptions = allowCustom
    ? Array.from(new Set([...options, ...selected]))
    : [...options];

  return (
    <div className="trait-selector">
      <div className="trait-selector__header">
        <span className="trait-selector__label">{label}</span>
        {hint && <span className="trait-selector__hint">{hint}</span>}
      </div>
      <div className="trait-selector__chips">
        {allOptions.map((item) => {
          const isSelected = selected.includes(item);
          return (
            <button
              key={item}
              type="button"
              className={`trait-selector__chip${isSelected ? ' trait-selector__chip--selected' : ''}`}
              aria-pressed={isSelected}
              onClick={() => toggle(item)}
            >
              {item}
              {isSelected && <span className="trait-selector__check" aria-hidden="true">✓</span>}
            </button>
          );
        })}
      </div>
      {allowCustom && (
        <div className="trait-selector__custom">
          <input
            type="text"
            className="trait-selector__input"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder={customPlaceholder}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustom())}
          />
          <button type="button" className="btn btn--secondary btn--sm trait-selector__add" onClick={addCustom}>
            הוסף
          </button>
        </div>
      )}
      {selected.length > 0 && (
        <button
          type="button"
          className="trait-selector__clear"
          onClick={() => onChange([])}
        >
          נקה הכל
        </button>
      )}
    </div>
  );
};
