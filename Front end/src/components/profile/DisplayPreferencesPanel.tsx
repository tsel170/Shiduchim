import React, { useState } from 'react';

import {
  DEFAULT_DISPLAY_PREFERENCES,
  getDisplayFieldLabel,
  isRequiredDisplayField,
  OPTIONAL_DISPLAY_FIELDS,
} from '../../constants/profileOptions';
import { DisplayField, DisplayPreferences } from '../../types/profile';
import {
  isDisplayFieldVisible,
  isDisplayPreferencesAtDefault,
  normalizeDisplayPreferences,
} from '../../utils/profileHelpers';

import './DisplayPreferencesPanel.css';



interface DisplayPreferencesPanelProps {

  value: DisplayPreferences;

  onChange: (next: DisplayPreferences) => void;

  onClose?: () => void;

}



export const DisplayPreferencesPanel: React.FC<DisplayPreferencesPanelProps> = ({

  value,

  onChange,

  onClose,

}) => {

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);



  const updatePreferences = (next: DisplayPreferences) => {

    onChange(normalizeDisplayPreferences(next));

  };



  const setFieldVisible = (field: DisplayField, visible: boolean) => {

    if (isRequiredDisplayField(field)) return;

    updatePreferences({

      ...value,

      visibleFields: {

        ...value.visibleFields,

        [field]: visible,

      },

    });

  };



  const toggleOptionalField = (field: DisplayField) => {

    setFieldVisible(field, !isDisplayFieldVisible(value, field));

  };



  const reorderFields = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const order = [...value.fieldOrder];
    const [moved] = order.splice(fromIndex, 1);
    order.splice(toIndex, 0, moved);
    updatePreferences({ ...value, fieldOrder: order });
  };

  const resetAll = () => {
    updatePreferences(DEFAULT_DISPLAY_PREFERENCES);
  };

  const hasCustomPreferences = !isDisplayPreferencesAtDefault(value);

  return (
    <section className="display-prefs">
      <header className="display-prefs__header">
        <div className="display-prefs__header-text">
          <h2>העדפות תצוגה</h2>
          <p>התאמה אישית לדף צפייה בפרופיל בלבד</p>
        </div>
        <div className="display-prefs__header-actions">
          {hasCustomPreferences && (
            <button type="button" className="display-prefs__reset-all" onClick={resetAll}>
              איפוס הכל
            </button>
          )}
          {onClose && (
            <button type="button" className="display-prefs__close" onClick={onClose} aria-label="סגור">
              ×
            </button>
          )}
        </div>
      </header>



      <div className="display-prefs__section">

        <h3>שדות שניתן להסתיר</h3>

        <p className="display-prefs__hint">לחץ על מתג או על כפתור ההצגה/הסתרה</p>

        <div className="display-prefs__toggles">

          {OPTIONAL_DISPLAY_FIELDS.map((field) => {

            const active = isDisplayFieldVisible(value, field);

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

                {getDisplayFieldLabel(field)}

              </button>

            );

          })}

        </div>

      </div>



      <div className="display-prefs__section">

        <h3>סדר תצוגה</h3>

        <p className="display-prefs__hint">גרור/י מהידית כדי לשנות סדר</p>

        <ul className="display-prefs__list">

          {value.fieldOrder.map((field, index) => {

            const required = isRequiredDisplayField(field);

            const visible = isDisplayFieldVisible(value, field);

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

                <span className="display-prefs__label">{getDisplayFieldLabel(field)}</span>

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

    </section>

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

