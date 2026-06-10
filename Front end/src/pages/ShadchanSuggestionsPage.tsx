import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getCityLabel } from '../constants/profileOptions';
import { getProfileById } from '../data/mockProfiles';
import { mockShadchanSuggestions } from '../data/mockShadchanSuggestions';
import './AddedProfilesPage.css';
import './Page.css';

export const ShadchanSuggestionsPage: React.FC = () => {
  const navigate = useNavigate();

  const items = mockShadchanSuggestions
    .map((suggestion) => {
      const profile = getProfileById(suggestion.profileId);
      return profile ? { suggestion, profile } : null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <div className="page added-profiles-page">
      <header className="page__header">
        <h1 className="page__title">הצעות מהשדכן</h1>
        <p className="page__subtitle">{items.length} פרופילים שהשדכן שלח אליך</p>
      </header>

      {items.length === 0 ? (
        <div className="profile-grid__empty added-profiles-page__empty">
          <p>אין הצעות מהשדכן כרגע.</p>
        </div>
      ) : (
        <ul className="added-profiles-list">
          {items.map(({ suggestion, profile }) => (
            <li key={suggestion.suggestionId} className="added-profiles-card">
              <div>
                <h3 className="added-profiles-card__name">
                  {profile.firstName} {profile.lastName}
                </h3>
                <p className="added-profiles-card__meta">
                  גיל {profile.age}
                  <span className="added-profiles-card__dot" aria-hidden="true">
                    ·
                  </span>
                  {getCityLabel(profile.city)}
                </p>
                <p className="added-profiles-card__note">{suggestion.shadchanNote}</p>
              </div>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={() => navigate(`/profiles/${profile.id}`)}
              >
                צפה בפרופיל
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
