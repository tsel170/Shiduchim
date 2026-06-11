import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCityLabel } from '../constants/profileOptions';
import {
  getSuggestionCheckStatusClassName,
  getSuggestionCheckStatusLabel,
  getSuggestionStageEmptyMessage,
  getSuggestionStageSubtitle,
  SUGGESTION_STAGE_TABS,
} from '../constants/suggestionOptions';
import { getProfileById } from '../data/mockProfiles';
import { mockShadchanSuggestions, SuggestionStage } from '../data/mockShadchanSuggestions';
import './AddedProfilesPage.css';
import './Page.css';
import './ShadchanSuggestionsPage.css';

function pathToStage(pathname: string): SuggestionStage {
  if (pathname.startsWith('/suggestions/in-check')) return 'in_check';
  if (pathname.startsWith('/suggestions/checked')) return 'checked';
  return 'new';
}

export const ShadchanSuggestionsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeStage = pathToStage(location.pathname);

  const items = mockShadchanSuggestions
    .filter((suggestion) => suggestion.stage === activeStage)
    .map((suggestion) => {
      const profile = getProfileById(suggestion.profileId);
      return profile ? { suggestion, profile } : null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <div className="page added-profiles-page">
      <header className="page__header">
        <h1 className="page__title">הצעות מהשדכן</h1>
        <p className="page__subtitle">{getSuggestionStageSubtitle(activeStage, items.length)}</p>
      </header>

      <nav className="suggestions-tabs" aria-label="סוגי הצעות">
        {SUGGESTION_STAGE_TABS.map((tab) => (
          <button
            key={tab.stage}
            type="button"
            className={`suggestions-tabs__tab${activeStage === tab.stage ? ' suggestions-tabs__tab--active' : ''}`}
            aria-current={activeStage === tab.stage ? 'page' : undefined}
            onClick={() => navigate(tab.path)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {items.length === 0 ? (
        <div className="profile-grid__empty added-profiles-page__empty">
          <p>{getSuggestionStageEmptyMessage(activeStage)}</p>
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
                {activeStage === 'in_check' && suggestion.checkStatus && (
                  <span
                    className={`suggestion-status-badge ${getSuggestionCheckStatusClassName(suggestion.checkStatus)}`}
                  >
                    {getSuggestionCheckStatusLabel(suggestion.checkStatus)}
                  </span>
                )}
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
