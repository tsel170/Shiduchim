import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../api/apiError';
import { matchCasesApi } from '../api/matchCasesApi';
import { MatchStatusBadge } from '../components/match-cases/MatchStatusBadge';
import { PageState } from '../components/common/PageState';
import {
  getDashboardTabFromPath,
  getMatchStatusLabel,
  MATCH_CASE_DASHBOARD_TABS,
} from '../constants/matchCaseOptions';
import { MatchCase, MatchStatus } from '../types/matchCase';
import { getProfileDisplayName } from '../utils/profileDisplay';
import './Page.css';
import './ShadchanSuggestionsPage.css';
import './MatchCasesPage.css';

export const MatchCasesDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeStatus = getDashboardTabFromPath(location.pathname);

  const [cases, setCases] = useState<MatchCase[]>([]);
  const [allCases, setAllCases] = useState<MatchCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [filtered, all] = await Promise.all([
        matchCasesApi.list({ status: activeStatus }),
        matchCasesApi.list(),
      ]);
      setCases(filtered);
      setAllCases(all);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setCases([]);
      setAllCases([]);
    } finally {
      setLoading(false);
    }
  }, [activeStatus]);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  const tabCounts = useMemo(() => {
    const counts = Object.fromEntries(
      MATCH_CASE_DASHBOARD_TABS.map((tab) => [tab.status, 0])
    ) as Record<MatchStatus, number>;
    for (const item of allCases) {
      counts[item.currentStatus] += 1;
    }
    return counts;
  }, [allCases]);

  return (
    <div className="page match-cases-page">
      <header className="page__header">
        <h1 className="page__title">תיקי שידוך</h1>
        <p className="page__subtitle">ניהול תיקים לפי שלב בתהליך</p>
      </header>

      <nav className="suggestions-tabs match-cases-page__tabs" aria-label="סינון לפי סטטוס">
        {MATCH_CASE_DASHBOARD_TABS.map((tab) => (
          <button
            key={tab.path}
            type="button"
            className={`suggestions-tabs__tab${
              tab.status === activeStatus ? ' suggestions-tabs__tab--active' : ''
            }`}
            onClick={() => navigate(tab.path)}
          >
            {tab.label}
            <span className="suggestions-tabs__count">{tabCounts[tab.status]}</span>
          </button>
        ))}
      </nav>

      {loading ? (
        <PageState loading />
      ) : error ? (
        <PageState error={error} />
      ) : cases.length === 0 ? (
        <div className="match-cases-page__empty">
          <p>אין תיקים בסטטוס «{getMatchStatusLabel(activeStatus)}».</p>
        </div>
      ) : (
        <ul className="match-cases-list">
          {cases.map((matchCase) => {
            const senderName = matchCase.senderProfile
              ? getProfileDisplayName(matchCase.senderProfile)
              : 'שולח/ת';
            const targetName = matchCase.targetProfile
              ? getProfileDisplayName(matchCase.targetProfile)
              : 'יעד';

            return (
              <li key={matchCase.caseId} className="match-cases-list__item">
                <div className="match-cases-list__main">
                  <h3 className="match-cases-list__title">
                    {senderName} ← {targetName}
                  </h3>
                  <MatchStatusBadge status={matchCase.currentStatus} />
                  <p className="match-cases-list__meta">
                    עודכן {new Date(matchCase.updatedAt).toLocaleDateString('he-IL')}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={() => navigate(`/match-cases/view/${matchCase.caseId}`)}
                >
                  פרטי תיק
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
