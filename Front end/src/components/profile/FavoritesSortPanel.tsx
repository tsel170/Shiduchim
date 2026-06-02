import React from 'react';
import { FavoriteSortKey } from '../../utils/rating';
import './FavoritesSortPanel.css';

export const FAVORITE_SORT_OPTIONS: ReadonlyArray<{
  id: FavoriteSortKey;
  label: string;
  themeClass: string;
}> = [
  { id: 'average', label: 'ממוצע דירוג', themeClass: 'profile-field--average' },
  { id: 'personality', label: 'אישיות', themeClass: 'profile-field--personalityTraits' },
  { id: 'hobbies', label: 'תחביבים', themeClass: 'profile-field--hobbies' },
  { id: 'homeVision', label: 'חזון בית ומשפחה', themeClass: 'profile-field--familyVision' },
  { id: 'lookingFor', label: 'מחפש/ת', themeClass: 'profile-field--lookingFor' },
  { id: 'look', label: 'מראה', themeClass: 'profile-field--look' },
];

interface FavoritesSortPanelProps {
  sortBy: FavoriteSortKey;
  sortDirection: 'desc' | 'asc';
  onSortByChange: (sortBy: FavoriteSortKey) => void;
  onSortDirectionChange: (direction: 'desc' | 'asc') => void;
  onClose?: () => void;
}

export const FavoritesSortPanel: React.FC<FavoritesSortPanelProps> = ({
  sortBy,
  sortDirection,
  onSortByChange,
  onSortDirectionChange,
  onClose,
}) => {
  const sortLabel = FAVORITE_SORT_OPTIONS.find((opt) => opt.id === sortBy)?.label ?? '';
  const hasCustomSort = sortBy !== 'average' || sortDirection !== 'desc';

  const resetAll = () => {
    onSortByChange('average');
    onSortDirectionChange('desc');
  };

  return (
    <section className="favorites-sort-panel">
      <header className="favorites-sort-panel__header">
        <div className="favorites-sort-panel__header-text">
          <h2>מיון מועדפים</h2>
          <p>בחר/י לפי איזה דירוג למיין את הרשימה</p>
        </div>
        <div className="favorites-sort-panel__header-actions">
          {hasCustomSort && (
            <button type="button" className="favorites-sort-panel__reset-all" onClick={resetAll}>
              איפוס הכל
            </button>
          )}
          {onClose && (
            <button type="button" className="favorites-sort-panel__close" onClick={onClose} aria-label="סגור">
              ×
            </button>
          )}
        </div>
      </header>

      <div className="favorites-sort-panel__body">
        <div className="favorites-sort-panel__section">
          <h3>מיון לפי דירוג</h3>
          <ul className="favorites-sort-panel__list">
            {FAVORITE_SORT_OPTIONS.map((option) => {
              const active = sortBy === option.id;
              return (
                <li key={option.id}>
                  <button
                    type="button"
                    className={`favorites-sort-panel__option ${option.themeClass}${
                      active ? ' favorites-sort-panel__option--active' : ''
                    }`}
                    onClick={() => onSortByChange(option.id)}
                    aria-pressed={active}
                  >
                    <span className="favorites-sort-panel__option-label">{option.label}</span>
                    {active && <span className="favorites-sort-panel__option-badge">נבחר</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="favorites-sort-panel__section favorites-sort-panel__section--direction">
          <h3>כיוון מיון</h3>
          <div className="favorites-sort-panel__direction">
            <button
              type="button"
              className={`favorites-sort-panel__dir profile-field--average${
                sortDirection === 'desc' ? ' favorites-sort-panel__dir--active' : ''
              }`}
              onClick={() => onSortDirectionChange('desc')}
              aria-pressed={sortDirection === 'desc'}
            >
              גבוה → נמוך
            </button>
            <button
              type="button"
              className={`favorites-sort-panel__dir profile-field--height${
                sortDirection === 'asc' ? ' favorites-sort-panel__dir--active' : ''
              }`}
              onClick={() => onSortDirectionChange('asc')}
              aria-pressed={sortDirection === 'asc'}
            >
              נמוך → גבוה
            </button>
          </div>
        </div>

        <p className="favorites-sort-panel__hint">
          ממוין לפי <strong>{sortLabel}</strong> ·{' '}
          {sortDirection === 'desc' ? 'מהגבוה לנמוך' : 'מהנמוך לגבוה'}
        </p>
      </div>
    </section>
  );
};
