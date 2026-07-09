import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../api/apiError';
import { managementRequestsApi } from '../api/managementRequestsApi';
import { matchCasesApi } from '../api/matchCasesApi';
import { PageState } from '../components/common/PageState';
import { ManagementRequestList } from '../components/suggestions/ManagementRequestList';
import {
  getOtherProfileInCase,
  getPersonCaseRoleLabel,
  getPersonCasesTabFromPath,
  getStageLabel,
  getStageClassName,
  isCaseClosed,
  isWaitingOnMeFromContext,
  PERSON_CASE_TABS,
} from '../constants/matchCaseOptions';
import { useAuth } from '../contexts/AuthContext';
import { ManagementRequest } from '../types/managementRequest';
import { CaseStage, MatchCase } from '../types/matchCase';
import { FullProfile } from '../types/profile';
import { getProfileDisplayName } from '../utils/profileDisplay';
import { openProfilePreview } from '../utils/profileNavigation';
import './Page.css';
import './ShadchanSuggestionsPage.css';
import './MatchCasesPage.css';

export const MyMatchCasesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, refreshCurrentUser } = useAuth();
  const activeTab = getPersonCasesTabFromPath(location.pathname);

  const [cases, setCases] = useState<MatchCase[]>([]);
  const [allCases, setAllCases] = useState<MatchCase[]>([]);
  const [managementRequests, setManagementRequests] = useState<ManagementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [managementMessage, setManagementMessage] = useState<string | null>(null);

  const loadCases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [filtered, all, pendingManagement] = await Promise.all([
        activeTab === 'all' ? matchCasesApi.list() : matchCasesApi.list({ stage: activeTab }),
        matchCasesApi.list(),
        managementRequestsApi.list('pending'),
      ]);
      setCases(filtered);
      setAllCases(all);
      setManagementRequests(pendingManagement);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setCases([]);
      setAllCases([]);
      setManagementRequests([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  const tabCounts = useMemo(() => {
    const counts: Record<CaseStage | 'all', number> = {
      all: allCases.length,
      profile_check: 0,
      background_check: 0,
      ready_to_meet: 0,
      meeting: 0,
    };
    for (const item of allCases) {
      counts[item.stage] += 1;
    }
    return counts;
  }, [allCases]);

  const getOtherProfile = (matchCase: MatchCase): FullProfile | null =>
    getOtherProfileInCase(matchCase, currentUser?.profileId) as FullProfile | null;

  const openCaseProfile = (matchCase: MatchCase) => {
    const other = getOtherProfile(matchCase);
    if (!other) return;
    openProfilePreview(navigate, location, other.id, {
      context: 'case',
      caseId: matchCase.caseId,
    });
  };

  const handleRespondToManagement = async (
    requestId: string,
    response: 'approved' | 'declined'
  ) => {
    setRespondingId(requestId);
    setManagementMessage(null);
    try {
      await managementRequestsApi.respond(requestId, response);
      setManagementRequests((prev) => prev.filter((request) => request.requestId !== requestId));
      if (response === 'approved') {
        await refreshCurrentUser();
      }
      setManagementMessage(
        response === 'approved'
          ? 'אישרת את בקשת הניהול — השדכן/ית נוסף/ה לרשימת השדכנים שלך'
          : 'דחית את בקשת הניהול'
      );
    } catch (err) {
      setManagementMessage(getApiErrorMessage(err));
    } finally {
      setRespondingId(null);
    }
  };

  const pendingManagementCount = managementRequests.length;

  return (
    <div className="page match-cases-page">
      <header className="page__header">
        <h1 className="page__title">התיקים שלי</h1>
        <p className="page__subtitle">מעקב אחר תיקי שידוך ובקשות מהשדכן</p>
      </header>

      {pendingManagementCount > 0 && (
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
              onClick={() => navigate('/management-requests')}
            >
              הצג הכל
            </button>
          </div>
          <ManagementRequestList
            compact
            requests={managementRequests}
            respondingId={respondingId}
            onRespond={handleRespondToManagement}
          />
        </section>
      )}

      {managementMessage && (
        <div className="shadchan-suggestions-page__toast" role="status">
          {managementMessage}
        </div>
      )}

      <nav className="suggestions-tabs" aria-label="סינון לפי סטטוס">
        {PERSON_CASE_TABS.map((tab) => (
          <button
            key={tab.path}
            type="button"
            className={`suggestions-tabs__tab${
              (tab.stage === 'all' && activeTab === 'all') || tab.stage === activeTab
                ? ' suggestions-tabs__tab--active'
                : ''
            }`}
            onClick={() => navigate(tab.path)}
          >
            {tab.label}
            <span className="suggestions-tabs__count">{tabCounts[tab.stage]}</span>
          </button>
        ))}
      </nav>

      {loading ? (
        <PageState loading />
      ) : error ? (
        <PageState error={error} />
      ) : cases.length === 0 ? (
        <div className="match-cases-page__empty">
          <p>אין תיקים בסטטוס זה כרגע.</p>
        </div>
      ) : (
        <ul className="match-cases-list">
          {cases.map((matchCase) => {
            const other = getOtherProfile(matchCase);
            const otherName = other ? getProfileDisplayName(other) : 'פרופיל';
            const roleLabel = getPersonCaseRoleLabel(matchCase, currentUser?.profileId);

            return (
              <li key={matchCase.caseId} className="match-cases-list__item">
                <div className="match-cases-list__main">
                  <h3 className="match-cases-list__title">{otherName}</h3>
                  <p className="match-cases-list__meta">{roleLabel}</p>
                  {matchCase.internalNotes && (
                    <p className="match-cases-list__hint">{matchCase.internalNotes}</p>
                  )}
                  <span className={`case-stage-badge ${getStageClassName(matchCase.stage)}`}>
                    {getStageLabel(matchCase.stage)}
                  </span>
                  {!isCaseClosed(matchCase) && (
                    <p className="match-cases-list__hint">
                      {matchCase.viewerContext?.statusMessage}
                      {isWaitingOnMeFromContext(matchCase) && ' · התור שלך'}
                    </p>
                  )}
                </div>
                <div className="match-cases-list__actions">
                  <button
                    type="button"
                    className="btn btn--primary btn--sm"
                    onClick={() => navigate(`/my-cases/view/${matchCase.caseId}`)}
                  >
                    פתיחת תיק
                  </button>
                  <button
                    type="button"
                    className="btn btn--secondary btn--sm"
                    onClick={() => openCaseProfile(matchCase)}
                    disabled={!other}
                  >
                    צפייה בפרופיל
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
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
