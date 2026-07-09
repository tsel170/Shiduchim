import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../api/apiError';
import { matchCasesApi } from '../api/matchCasesApi';
import { PageState } from '../components/common/PageState';
import {
  getDashboardTabFromPath,
  getStageClassName,
  getStageLabel,
  isCaseClosed,
  MATCH_CASE_DASHBOARD_TABS,
} from '../constants/matchCaseOptions';
import { CaseStage, MatchCase } from '../types/matchCase';
import { getProfileDisplayName } from '../utils/profileDisplay';
import './Page.css';
import './ShadchanSuggestionsPage.css';
import './MatchCasesPage.css';

export const MatchCasesDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeStage = getDashboardTabFromPath(location.pathname);

  const [cases, setCases] = useState<MatchCase[]>([]);
  const [allCases, setAllCases] = useState<MatchCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await matchCasesApi.list();
      const filtered =
        activeStage === 'closed'
          ? all.filter((item) => isCaseClosed(item))
          : all.filter((item) => item.stage === activeStage && !isCaseClosed(item));
      setCases(filtered);
      setAllCases(all);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setCases([]);
      setAllCases([]);
    } finally {
      setLoading(false);
    }
  }, [activeStage]);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  const tabCounts = useMemo(() => {
    const counts: Record<CaseStage | 'closed', number> = {
      profile_check: 0,
      background_check: 0,
      ready_to_meet: 0,
      meeting: 0,
      closed: 0,
    };
    for (const item of allCases) {
      if (isCaseClosed(item)) {
        counts.closed += 1;
      } else {
        counts[item.stage] += 1;
      }
    }
    return counts;
  }, [allCases]);

  const emptyLabel =
    activeStage === 'closed' ? 'סגור' : getStageLabel(activeStage as CaseStage);

  return (
    <div className="page match-cases-page">
      <header className="page__header">
        <h1 className="page__title">תיקי שידוך</h1>
        <p className="page__subtitle">ניהול תיקים לפי שלב בתהליך</p>
      </header>

      <nav className="suggestions-tabs match-cases-page__tabs" aria-label="סינון לפי שלב">
        {MATCH_CASE_DASHBOARD_TABS.map((tab) => (
          <button
            key={tab.path}
            type="button"
            className={`suggestions-tabs__tab${
              tab.stage === activeStage ? ' suggestions-tabs__tab--active' : ''
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
          <p>אין תיקים בשלב «{emptyLabel}».</p>
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
                  <span className={`case-stage-badge ${getStageClassName(matchCase.stage)}`}>
                    {getStageLabel(matchCase.stage)}
                  </span>
                  <p className="match-cases-list__meta">
                    {matchCase.viewerContext?.statusMessage}
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
