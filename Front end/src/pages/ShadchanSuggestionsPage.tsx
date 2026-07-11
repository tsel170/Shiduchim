import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../api/apiError';
import { managementRequestsApi } from '../api/managementRequestsApi';
import { profilesApi } from '../api/profilesApi';
import { suggestionsApi } from '../api/suggestionsApi';
import { PageState } from '../components/common/PageState';
import { ManagementRequestList } from '../components/suggestions/ManagementRequestList';
import { getCityLabel } from '../constants/profileOptions';
import {
  getManagementRequestsSubtitle,
  getSuggestionCheckStatusClassName,
  getSuggestionCheckStatusLabel,
  getSuggestionStageEmptyMessage,
  getSuggestionStageSubtitle,
  getSuggestionsPageView,
  MANAGEMENT_REQUESTS_EMPTY_MESSAGE,
  SUGGESTIONS_PAGE_TABS,
} from '../constants/suggestionOptions';
import { useAuth } from '../contexts/AuthContext';
import { ManagementRequest } from '../types/managementRequest';
import { ShadchanSuggestion, SuggestionStage } from '../types/suggestion';
import { FullProfile } from '../types/profile';
import { openProfilePreview } from '../utils/profileNavigation';
import { getUserDisplayLabel } from '../utils/accountName';
import './AddedProfilesPage.css';
import './Page.css';
import './ShadchanSuggestionsPage.css';

export const ShadchanSuggestionsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshCurrentUser, currentUser } = useAuth();
  const activeView = getSuggestionsPageView(location.pathname);
  const activeStage = activeView === 'management' ? 'new' : (activeView as SuggestionStage);
  const isManagementView = activeView === 'management';

  const [suggestions, setSuggestions] = useState<ShadchanSuggestion[]>([]);
  const [stageCounts, setStageCounts] = useState<Record<SuggestionStage, number>>({
    new: 0,
    in_check: 0,
    checked: 0,
  });
  const [managementRequests, setManagementRequests] = useState<ManagementRequest[]>([]);
  const [profilesById, setProfilesById] = useState<Record<string, FullProfile>>({});
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [managementLoading, setManagementLoading] = useState(true);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [managementError, setManagementError] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadManagementRequests = useCallback(async () => {
    setManagementLoading(true);
    setManagementError(null);
    try {
      const requests = await managementRequestsApi.list('pending');
      setManagementRequests(requests);
    } catch (err) {
      setManagementError(getApiErrorMessage(err));
      setManagementRequests([]);
    } finally {
      setManagementLoading(false);
    }
  }, []);

  useEffect(() => {
    loadManagementRequests();
  }, [loadManagementRequests]);

  useEffect(() => {
    if (isManagementView) return;

    let cancelled = false;

    async function load() {
      setSuggestionsLoading(true);
      setSuggestionsError(null);

      try {
        const [loadedSuggestions, allSuggestions] = await Promise.all([
          suggestionsApi.list(activeStage),
          suggestionsApi.list(),
        ]);
        if (cancelled) return;

        setSuggestions(loadedSuggestions);

        const counts: Record<SuggestionStage, number> = {
          new: 0,
          in_check: 0,
          checked: 0,
        };
        for (const item of allSuggestions) {
          counts[item.stage] += 1;
        }
        setStageCounts(counts);

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
        if (!cancelled) {
          setSuggestionsError(getApiErrorMessage(err));
          setSuggestions([]);
        }
      } finally {
        if (!cancelled) setSuggestionsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [activeStage, isManagementView]);

  const handleRespondToManagementRequest = useCallback(
    async (requestId: string, response: 'approved' | 'declined') => {
      setRespondingId(requestId);
      setActionMessage(null);
      try {
        await managementRequestsApi.respond(requestId, response);
        setManagementRequests((prev) => prev.filter((request) => request.requestId !== requestId));
        if (response === 'approved') {
          await refreshCurrentUser();
        }
        setActionMessage(
          response === 'approved'
            ? 'אישרת את בקשת הניהול — השדכן/ית נוסף/ה לרשימת השדכנים שלך'
            : 'דחית את בקשת הניהול'
        );
      } catch (err) {
        setActionMessage(getApiErrorMessage(err));
      } finally {
        setRespondingId(null);
      }
    },
    [refreshCurrentUser]
  );

  const loading = isManagementView ? managementLoading : suggestionsLoading;
  const error = isManagementView ? managementError : suggestionsError;
  const pendingCount = managementRequests.length;

  const subtitle = loading
    ? 'טוען...'
    : isManagementView
      ? getManagementRequestsSubtitle(pendingCount)
      : getSuggestionStageSubtitle(activeStage, suggestions.length);

  const emptyMessage = isManagementView
    ? `${MANAGEMENT_REQUESTS_EMPTY_MESSAGE} בקשות מגיעות לחשבון המחובר (${currentUser ? getUserDisplayLabel(currentUser) : 'לא ידוע'}).`
    : getSuggestionStageEmptyMessage(activeStage);

  const isEmpty = isManagementView ? pendingCount === 0 : suggestions.length === 0;
  const totalSuggestionCount = stageCounts.new + stageCounts.in_check + stageCounts.checked;
  const otherStageCount = totalSuggestionCount - stageCounts[activeStage as SuggestionStage];

  const showManagementBanner = !isManagementView && pendingCount > 0;

  return (
    <div className="page added-profiles-page shadchan-suggestions-page">
      {isManagementView ? (
        <header className="suggestions-page-hero suggestions-page-hero--management">
          <div className="suggestions-page-hero__glow" aria-hidden="true" />
          <div className="suggestions-page-hero__icon" aria-hidden="true">
            <HandshakeIcon />
          </div>
          <h1 className="suggestions-page-hero__title">בקשות ניהול</h1>
          <p className="suggestions-page-hero__subtitle">
            {loading ? 'טוען...' : getManagementRequestsSubtitle(pendingCount)}
          </p>
        </header>
      ) : (
        <header className="page__header">
          <h1 className="page__title">הצעות מהשדכן</h1>
          <p className="page__subtitle">{subtitle}</p>
        </header>
      )}

      <nav className="suggestions-tabs" aria-label="סוגי הצעות">
        {SUGGESTIONS_PAGE_TABS.map((tab) => (
          <button
            key={tab.view}
            type="button"
            className={`suggestions-tabs__tab${
              activeView === tab.view ? ' suggestions-tabs__tab--active' : ''
            }${tab.view === 'management' ? ' suggestions-tabs__tab--management' : ''}`}
            aria-current={activeView === tab.view ? 'page' : undefined}
            onClick={() => navigate(tab.path)}
          >
            {tab.label}
            {tab.view === 'management' && pendingCount > 0 && (
              <span className="suggestions-tabs__badge">{pendingCount}</span>
            )}
            {tab.view !== 'management' && stageCounts[tab.view as SuggestionStage] > 0 && (
              <span className="suggestions-tabs__badge">
                {stageCounts[tab.view as SuggestionStage]}
              </span>
            )}
          </button>
        ))}
      </nav>

      {actionMessage && (
        <div className="shadchan-suggestions-page__toast" role="status">
          {actionMessage}
        </div>
      )}

      {showManagementBanner && (
        <section className="management-requests-banner" aria-label="בקשות ניהול ממתינות">
          <div className="management-requests-banner__glow" aria-hidden="true" />
          <div className="management-requests-banner__header">
            <div className="management-requests-banner__intro">
              <span className="management-requests-banner__icon" aria-hidden="true">
                <HandshakeIcon />
              </span>
              <div>
                <h2 className="management-requests-banner__title">בקשות ניהול ממתינות</h2>
                <p className="management-requests-banner__text">
                  שדכנים מבקשים לנהל את הפרופיל שלך — אשר/י או דחה/י כאן
                </p>
              </div>
            </div>
            <button
              type="button"
              className="management-requests-banner__link"
              onClick={() => navigate('/suggestions/management')}
            >
              הצג הכל
            </button>
          </div>
          <ManagementRequestList
            compact
            requests={managementRequests}
            respondingId={respondingId}
            onRespond={handleRespondToManagementRequest}
          />
        </section>
      )}

      <PageState
        loading={loading}
        error={error}
        isEmpty={!loading && !error && isEmpty && !showManagementBanner}
        emptyMessage={
          !isManagementView && isEmpty && otherStageCount > 0
            ? `${emptyMessage} יש ${otherStageCount} הצעות בטאבים אחרים.`
            : emptyMessage
        }
      >
        {isManagementView ? (
          <ManagementRequestList
            requests={managementRequests}
            respondingId={respondingId}
            onRespond={handleRespondToManagementRequest}
          />
        ) : (
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
                    onClick={() =>
                      openProfilePreview(navigate, location, suggestion.profileId, {
                        context: 'suggestion',
                      })
                    }
                  >
                    צפה בפרופיל
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </PageState>
    </div>
  );
};

function HandshakeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 00-3-3.87" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
