import React, { useState } from 'react';
import {
  DEFAULT_PROFILE_SHARE_SETTINGS,
  getProfileShareFieldLabel,
  isRequiredShareField,
  OPTIONAL_SHARE_FIELDS,
} from '../../constants/profileShareOptions';
import { ProfileShareField, ProfileShareSettings } from '../../types/profileShare';
import {
  isProfileShareSettingsAtDefault,
  isShareFieldVisible,
  normalizeProfileShareSettings,
} from '../../utils/profileShareHelpers';
import './DisplayPreferencesPanel.css';

interface ProfileShareFieldsPanelProps {
  value: ProfileShareSettings;
  onChange: (next: ProfileShareSettings) => void;
}

export const ProfileShareFieldsPanel: React.FC<ProfileShareFieldsPanelProps> = ({
  value,
  onChange,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const updateSettings = (next: ProfileShareSettings) => {
    onChange(normalizeProfileShareSettings(next));
  };

  const setFieldVisible = (field: ProfileShareField, visible: boolean) => {
    if (isRequiredShareField(field)) return;
    updateSettings({
      ...value,
      visibleFields: {
        ...value.visibleFields,
        [field]: visible,
      },
    });
  };

  const toggleOptionalField = (field: ProfileShareField) => {
    setFieldVisible(field, !isShareFieldVisible(value, field));
  };

  const reorderFields = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const order = [...value.fieldOrder];
    const [moved] = order.splice(fromIndex, 1);
    order.splice(toIndex, 0, moved);
    updateSettings({ ...value, fieldOrder: order });
  };

  const resetAll = () => {
    updateSettings({
      ...value,
      visibleFields: { ...DEFAULT_PROFILE_SHARE_SETTINGS.visibleFields },
      fieldOrder: [...DEFAULT_PROFILE_SHARE_SETTINGS.fieldOrder],
    });
  };

  const hasCustomSettings = !isProfileShareSettingsAtDefault(value);

  return (
    <div className="display-prefs shadchan-share-fields">
      <div className="display-prefs__section">
        <div className="shadchan-share-fields__section-head">
          <div>
            <h3>שדות שניתן להסתיר</h3>
            <p className="display-prefs__hint">לחץ על מתג או על כפתור ההצגה/הסתרה</p>
          </div>
          {hasCustomSettings && (
            <button type="button" className="display-prefs__reset-all" onClick={resetAll}>
              איפוס הכל
            </button>
          )}
        </div>

        <div className="display-prefs__toggles">
          {OPTIONAL_SHARE_FIELDS.map((field) => {
            const active = isShareFieldVisible(value, field);
            return (
              <button
                key={field}
                type="button"
                className={`display-prefs__toggle profile-field--${field}${
                  active ? ' display-prefs__toggle--active' : ''
                }`}
                onClick={() => toggleOptionalField(field)}
                aria-pressed={active}
              >
                {getProfileShareFieldLabel(field)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="display-prefs__section">
        <h3>סדר שיתוף</h3>
        <p className="display-prefs__hint">גרור/י מהידית כדי לשנות סדר</p>

        <ul className="display-prefs__list">
          {value.fieldOrder.map((field, index) => {
            const required = isRequiredShareField(field);
            const visible = isShareFieldVisible(value, field);
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index && draggedIndex !== index;

            return (
              <li
                key={field}
                className={`display-prefs__row profile-field--${field}${
                  isDragging ? ' display-prefs__row--dragging' : ''
                }${isDragOver ? ' display-prefs__row--drag-over' : ''}${
                  !required && !visible ? ' display-prefs__row--hidden-field' : ''
                }`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOverIndex(index);
                }}
                onDragLeave={() => {
                  if (dragOverIndex === index) setDragOverIndex(null);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  if (draggedIndex !== null) reorderFields(draggedIndex, index);
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
              >
                <span
                  className="display-prefs__handle"
                  draggable
                  onDragStart={() => setDraggedIndex(index)}
                  onDragEnd={() => {
                    setDraggedIndex(null);
                    setDragOverIndex(null);
                  }}
                  aria-label="גרור לשינוי סדר"
                >
                  <DragHandleIcon />
                </span>
                <span className="display-prefs__label">{getProfileShareFieldLabel(field)}</span>
                {required ? (
                  <span className="display-prefs__badge">תמיד מוצג</span>
                ) : (
                  <button
                    type="button"
                    className={`display-prefs__visibility-btn${
                      visible ? ' display-prefs__visibility-btn--on' : ''
                    }`}
                    onClick={() => toggleOptionalField(field)}
                    aria-pressed={visible}
                  >
                    {visible ? 'מוצג' : 'מוסתר'}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

function DragHandleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="9" cy="7" r="1.5" />
      <circle cx="15" cy="7" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="17" r="1.5" />
      <circle cx="15" cy="17" r="1.5" />
    </svg>
  );
}
