import React from 'react';
import { ReferenceContact } from '../../types/profile';
import { COUNTRY_CODES } from '../../constants/profileOptions';
import { createEmptyReference } from '../../utils/profileHelpers';
import './ReferenceContactsEditor.css';

interface ReferenceContactsEditorProps {
  references: ReferenceContact[];
  onChange: (references: ReferenceContact[]) => void;
  errors?: Record<string, { name?: string; phoneNumber?: string }>;
}

export const ReferenceContactsEditor: React.FC<ReferenceContactsEditorProps> = ({
  references,
  onChange,
  errors = {},
}) => {
  const update = (id: string, field: keyof ReferenceContact, value: string) => {
    onChange(
      references.map((ref) => (ref.id === id ? { ...ref, [field]: value } : ref))
    );
  };

  const remove = (id: string) => {
    onChange(references.filter((ref) => ref.id !== id));
  };

  const add = () => {
    onChange([...references, createEmptyReference()]);
  };

  return (
    <div className="ref-editor">
      <div className="ref-editor__header">
        <span className="ref-editor__label">ממליצים</span>
        <button type="button" className="btn btn--secondary btn--sm ref-editor__add" onClick={add}>
          + הוסף ממליץ
        </button>
      </div>

      {references.length === 0 ? (
        <p className="ref-editor__empty">לא הוזנו ממליצים. לחץ להוספה.</p>
      ) : (
        <ul className="ref-editor__list">
          {references.map((ref) => {
            const refErrors = errors[ref.id];
            return (
              <li key={ref.id} className="ref-editor__row">
                <div className="ref-editor__fields">
                  <div className="form-field">
                    <label className="form-field__label" htmlFor={`ref-name-${ref.id}`}>
                      שם
                    </label>
                    <input
                      id={`ref-name-${ref.id}`}
                      type="text"
                      className={`form-field__input${refErrors?.name ? ' form-field__input--error' : ''}`}
                      value={ref.name}
                      onChange={(e) => update(ref.id, 'name', e.target.value)}
                      placeholder="שם מלא"
                    />
                    {refErrors?.name && (
                      <span className="form-field__error">{refErrors.name}</span>
                    )}
                  </div>
                  <div className="form-field ref-editor__code">
                    <label className="form-field__label" htmlFor={`ref-code-${ref.id}`}>
                      קידומת
                    </label>
                    <select
                      id={`ref-code-${ref.id}`}
                      className="form-field__select"
                      value={ref.countryCode}
                      onChange={(e) => update(ref.id, 'countryCode', e.target.value)}
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field ref-editor__phone">
                    <label className="form-field__label" htmlFor={`ref-phone-${ref.id}`}>
                      טלפון
                    </label>
                    <input
                      id={`ref-phone-${ref.id}`}
                      type="tel"
                      dir="ltr"
                      className={`form-field__input${refErrors?.phoneNumber ? ' form-field__input--error' : ''}`}
                      value={ref.phoneNumber}
                      onChange={(e) => update(ref.id, 'phoneNumber', e.target.value)}
                      placeholder="050-1234567"
                    />
                    {refErrors?.phoneNumber && (
                      <span className="form-field__error">{refErrors.phoneNumber}</span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  className="ref-editor__delete"
                  aria-label="מחק ממליץ"
                  onClick={() => remove(ref.id)}
                >
                  מחק
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
