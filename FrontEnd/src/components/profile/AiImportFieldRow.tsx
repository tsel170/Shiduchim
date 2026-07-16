import React from 'react';
import {
  ExtractedField,
  getConfidenceLabel,
  getConfidenceLevel,
  getOptionLabel,
} from '../../utils/aiProfileExtract';

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const level = getConfidenceLevel(confidence);
  return (
    <span className={`ds-confidence ds-confidence--${level} ai-import__confidence`}>
      <span className="ds-confidence__bar" aria-hidden="true">
        <span
          className="ds-confidence__fill"
          style={{ width: `${Math.round(confidence * 100)}%` }}
        />
      </span>
      <span>{getConfidenceLabel(level)}</span>
      <span className="ai-import__confidence-pct">{Math.round(confidence * 100)}%</span>
    </span>
  );
}

interface ExtractedFieldRowProps {
  field: ExtractedField;
  onChange: (field: ExtractedField) => void;
}

export const ExtractedFieldRow: React.FC<ExtractedFieldRowProps> = ({ field, onChange }) => {
  const needsSelection = field.inputType === 'select' && !field.value;

  return (
    <div
      className={`ai-import__field-row ds-card${
        needsSelection ? ' ai-import__field-row--warning' : ''
      }`}
    >
      <div className="ai-import__field-header">
        <label className="ai-import__field-label" htmlFor={`field-${field.key}`}>
          {field.label}
          {field.inputType === 'select' && (
            <span className="ai-import__field-type ds-badge ds-badge--muted">בחירה מרשימה</span>
          )}
          {field.inputType === 'multiselect' && (
            <span className="ai-import__field-type ds-badge ds-badge--muted">בחירה מרובה</span>
          )}
        </label>
        <ConfidenceBadge confidence={field.confidence} />
      </div>

      {field.inputType === 'select' && field.options && (
        <>
          <select
            id={`field-${field.key}`}
            className={`form-field__select${
              needsSelection ? ' form-field__select--error' : ''
            }`}
            value={field.value}
            onChange={(e) => onChange({ ...field, value: e.target.value, unmatchedRaw: undefined })}
          >
            <option value="">בחר/י {field.label}</option>
            {field.options.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
          {needsSelection && field.unmatchedRaw && (
            <p className="ai-import__field-unmatched">
              זוהה בטקסט: &quot;{field.unmatchedRaw}&quot; — בחר/י ערך תקין מהרשימה
            </p>
          )}
        </>
      )}

      {field.inputType === 'multiselect' && field.options && (
        <div className="ai-import__multiselect" role="group" aria-label={field.label}>
          {field.options.map((opt) => {
            const checked = field.values?.includes(opt.id) ?? false;
            return (
              <label key={opt.id} className="ai-import__checkbox">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const current = field.values ?? [];
                    const values = e.target.checked
                      ? [...current, opt.id]
                      : current.filter((v) => v !== opt.id);
                    onChange({ ...field, values });
                  }}
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      )}

      {field.inputType === 'number' && (
        <input
          id={`field-${field.key}`}
          type="number"
          className="form-field__input"
          value={field.value}
          onChange={(e) => onChange({ ...field, value: e.target.value })}
        />
      )}

      {field.inputType === 'text' && (
        <textarea
          id={`field-${field.key}`}
          className="form-field__textarea ai-import__field-textarea"
          rows={field.key === 'familyVision' ? 4 : 2}
          value={field.value}
          onChange={(e) => onChange({ ...field, value: e.target.value })}
        />
      )}

      {field.sourceSnippet && field.inputType !== 'select' && (
        <p className="ai-import__field-source">
          מקור: <q>{field.sourceSnippet}</q>
        </p>
      )}

      {field.inputType === 'select' && field.value && (
        <p className="ai-import__field-source">
          נבחר: <strong>{getOptionLabel(field, field.value)}</strong>
        </p>
      )}
    </div>
  );
};
