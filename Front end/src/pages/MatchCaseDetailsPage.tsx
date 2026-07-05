import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getApiErrorMessage } from '../api/apiError';
import { matchCasesApi } from '../api/matchCasesApi';
import { MatchStatusBadge } from '../components/match-cases/MatchStatusBadge';
import { PageState } from '../components/common/PageState';
import { SendButton } from '../components/common/SendButton';
import {
  getMatchStatusLabel,
  SHADCHAN_NEXT_STATUS,
} from '../constants/matchCaseOptions';
import { CaseHistoryEntry, MatchCase, MatchStatus } from '../types/matchCase';
import { getProfileDisplayName } from '../utils/profileDisplay';
import './Page.css';
import './MatchCasesPage.css';

export const MatchCaseDetailsPage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();

  const [matchCase, setMatchCase] = useState<MatchCase | null>(null);
  const [history, setHistory] = useState<CaseHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const load = useCallback(async () => {
    if (!caseId) return;
    setLoading(true);
    setError(null);
    try {
      const [detail, timeline] = await Promise.all([
        matchCasesApi.getById(caseId),
        matchCasesApi.getHistory(caseId),
      ]);
      setMatchCase(detail);
      setHistory(timeline);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setMatchCase(null);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdvanceStatus = async () => {
    if (!matchCase) return;
    const next = SHADCHAN_NEXT_STATUS[matchCase.currentStatus];
    if (!next) return;

    setIsUpdating(true);
    setActionError(null);
    try {
      const updated = await matchCasesApi.update(matchCase.caseId, {
        currentStatus: next,
        note: `עודכן ל${getMatchStatusLabel(next)}`,
      });
      setMatchCase(updated);
      const timeline = await matchCasesApi.getHistory(matchCase.caseId);
      setHistory(timeline);
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = async () => {
    if (!matchCase) return;
    setIsUpdating(true);
    setActionError(null);
    try {
      const updated = await matchCasesApi.close(matchCase.caseId);
      setMatchCase(updated);
      const timeline = await matchCasesApi.getHistory(matchCase.caseId);
      setHistory(timeline);
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    } finally {
      setIsUpdating(false);
    }
  };

  const openProfile = (profileId: string) => {
    navigate(`/profiles/${profileId}`);
  };

  if (!caseId) {
    return <NavigateBack navigate={navigate} />;
  }

  if (loading) {
    return <PageState loading />;
  }

  if (error || !matchCase) {
    return (
      <div className="page">
        <PageState error={error ?? 'התיק לא נמצא'} />
        <NavigateBack navigate={navigate} />
      </div>
    );
  }

  const senderName = matchCase.senderProfile
    ? getProfileDisplayName(matchCase.senderProfile)
    : matchCase.senderProfileId;
  const targetName = matchCase.targetProfile
    ? getProfileDisplayName(matchCase.targetProfile)
    : matchCase.targetProfileId;
  const nextStatus = SHADCHAN_NEXT_STATUS[matchCase.currentStatus];

  return (
    <div className="page match-case-details">
      <button type="button" className="btn btn--secondary btn--sm" onClick={() => navigate(-1)}>
        חזרה
      </button>

      <header className="match-case-details__header">
        <h1 className="page__title">תיק שידוך</h1>
        <MatchStatusBadge status={matchCase.currentStatus} />
      </header>

      <section className="match-case-details__profiles">
        <div className="match-case-details__profile-card">
          <span className="match-case-details__role">שולח/ת</span>
          <strong>{senderName}</strong>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => openProfile(matchCase.senderProfileId)}
          >
            צפייה
          </button>
        </div>
        <div className="match-case-details__profile-card">
          <span className="match-case-details__role">יעד</span>
          <strong>{targetName}</strong>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => openProfile(matchCase.targetProfileId)}
          >
            צפייה
          </button>
        </div>
      </section>

      {matchCase.internalNotes && (
        <section className="match-case-details__notes">
          <h2>הערות פנימיות</h2>
          <p>{matchCase.internalNotes}</p>
        </section>
      )}

      <section className="match-case-details__actions">
        {nextStatus && matchCase.currentStatus !== 'closed' && (
          <SendButton
            variant="site"
            isLoading={isUpdating}
            onClick={handleAdvanceStatus}
          >
            קדם ל{getMatchStatusLabel(nextStatus as MatchStatus)}
          </SendButton>
        )}
        {matchCase.currentStatus !== 'closed' && (
          <SendButton variant="decline" isLoading={isUpdating} onClick={handleClose}>
            סגור תיק
          </SendButton>
        )}
        {actionError && <p className="match-case-details__error">{actionError}</p>}
      </section>

      <section className="match-case-details__timeline">
        <h2>היסטוריה</h2>
        {history.length === 0 ? (
          <p>אין רשומות עדיין.</p>
        ) : (
          <ol className="match-case-details__history">
            {history.map((entry) => (
              <li key={entry.historyId} className="match-case-details__history-item">
                <time dateTime={entry.timestamp}>
                  {new Date(entry.timestamp).toLocaleString('he-IL')}
                </time>
                <span>{entry.action}</span>
                {entry.previousStatus && entry.newStatus && (
                  <span>
                    {getMatchStatusLabel(entry.previousStatus)} →{' '}
                    {getMatchStatusLabel(entry.newStatus)}
                  </span>
                )}
                {entry.note && <p>{entry.note}</p>}
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
};

function NavigateBack({ navigate }: { navigate: (path: string) => void }) {
  return (
    <button
      type="button"
      className="btn btn--secondary btn--sm"
      onClick={() => navigate('/match-cases')}
    >
      חזרה לתיקים
    </button>
  );
}
