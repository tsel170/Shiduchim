import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../api/apiError';
import { profilesApi } from '../api/profilesApi';
import { suggestionsApi } from '../api/suggestionsApi';
import { PageState } from '../components/common/PageState';
import { getCityLabel } from '../constants/profileOptions';
import {
  getSuggestionCheckStatusClassName,
  getSuggestionCheckStatusLabel,
  getSuggestionStageEmptyMessage,
  getSuggestionStageSubtitle,
  SUGGESTION_STAGE_TABS,
} from '../constants/suggestionOptions';
import { ShadchanSuggestion, SuggestionStage } from '../types/suggestion';
import { FullProfile } from '../types/profile';
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

  const [suggestions, setSuggestions] = useState<ShadchanSuggestion[]>([]);
  const [profilesById, setProfilesById] = useState<Record<string, FullProfile>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const loadedSuggestions = await suggestionsApi.list(activeStage);
        if (cancelled) return;
        setSuggestions(loadedSuggestions);

        const nextProfiles: Record<string, FullProfile> = {};
        for (const suggestion of loadedSuggestions) {
          if (suggestion.profile) {
            nextProfiles[suggestion.profileId] = suggestion.profile;
          }
        }

        const missingProfileIds = loadedSuggestions
          .map((suggestion) => suggestion.profileId)
          .filter((profileId) => !nextProfiles[profileId]);

        const fetched = await Promise.allSettled(
          missingProfileIds.map((profileId) => profilesApi.getById(profileId))
        );

        fetched.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            nextProfiles[missingProfileIds[index]] = result.value;
          }
        });

        if (!cancelled) {
          setProfilesById(nextProfiles);
        }
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [activeStage]);

  return (
    <div className="page added-profiles-page">
      <header className="page__header">
        <h1 className="page__title">הצעות מהשדכן</h1>
        <p className="page__subtitle">
          {loading
            ? 'טוען הצעות...'
            : getSuggestionStageSubtitle(activeStage, suggestions.length)}
        </p>
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

      <PageState
        loading={loading}
        error={error}
        isEmpty={!loading && !error && suggestions.length === 0}
        emptyMessage={getSuggestionStageEmptyMessage(activeStage)}
      >
        <ul className="added-profiles-list">
          {suggestions.map((suggestion) => {
            const profile = profilesById[suggestion.profileId];
            const displayName = profile
              ? `${profile.firstName} ${profile.lastName}`.trim()
              : 'פרופיל מוצע';

            return (
              <li key={suggestion.suggestionId} className="added-profiles-card">
                <div>
                  <h3 className="added-profiles-card__name">{displayName}</h3>
                  {profile && (
                    <p className="added-profiles-card__meta">
                      גיל {profile.age}
                      <span className="added-profiles-card__dot" aria-hidden="true">
                        ·
                      </span>
                      {getCityLabel(profile.city)}
                    </p>
                  )}
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
                  onClick={() => navigate(`/profiles/${suggestion.profileId}`)}
                >
                  צפה בפרופיל
                </button>
              </li>
            );
          })}
        </ul>
      </PageState>
    </div>
  );
};
