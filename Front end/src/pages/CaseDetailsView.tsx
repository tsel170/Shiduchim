import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getApiErrorMessage } from '../api/apiError';
import { matchCasesApi } from '../api/matchCasesApi';
import { CaseActionsPanel } from '../components/match-cases/CaseActionsPanel';
import { CaseApprovalSummary } from '../components/match-cases/CaseApprovalSummary';
import { CaseStatusMessage } from '../components/match-cases/CaseStatusMessage';
import { ContactDetailsSection } from '../components/match-cases/ContactDetailsSection';
import { PageState } from '../components/common/PageState';
import { SendButton } from '../components/common/SendButton';
import { getMatchStatusLabel, getCounterpartyInCase, isCaseClosed } from '../constants/matchCaseOptions';
import { useAuth } from '../contexts/AuthContext';
import { useMatchCase } from '../hooks/useMatchCase';
import { getProfileDisplayName } from '../utils/profileDisplay';
import { openProfilePreview } from '../utils/profileNavigation';
import './Page.css';
import './MatchCasesPage.css';

interface CaseDetailsViewProps {
  backPath: string;
  showInternalNotes?: boolean;
}

export const CaseDetailsView: React.FC<CaseDetailsViewProps> = ({
  backPath,
  showInternalNotes = false,
}) => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { matchCase, setMatchCase, history, loading, error, reload } = useMatchCase(caseId);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleClose = async () => {
    if (!matchCase) return;
    setIsUpdating(true);
    setActionError(null);
    try {
      const updated = await matchCasesApi.close(matchCase.caseId);
      setMatchCase(updated);
      await reload();
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    } finally {
      setIsUpdating(false);
    }
  };

  if (!caseId) {
    return (
      <button type="button" className="btn btn--secondary btn--sm" onClick={() => navigate(backPath)}>
        חזרה
      </button>
    );
  }

  if (loading) return <PageState loading />;
  if (error || !matchCase) {
    return (
      <div className="page">
        <PageState error={error ?? 'התיק לא נמצא'} />
        <button type="button" className="btn btn--secondary btn--sm" onClick={() => navigate(backPath)}>
          חזרה
        </button>
      </div>
    );
  }

  const ctx = matchCase.viewerContext;
  const senderName = matchCase.senderProfile
    ? getProfileDisplayName(matchCase.senderProfile)
    : matchCase.senderProfileId;
  const targetName = matchCase.targetProfile
    ? getProfileDisplayName(matchCase.targetProfile)
    : matchCase.targetProfileId;
  const actions = ctx?.availableActions;

  const openProfile = (profileId: string) => {
    openProfilePreview(navigate, location, profileId, { caseId });
  };

  const counterparty =
    !showInternalNotes && currentUser?.accountId
      ? getCounterpartyInCase(matchCase, currentUser.accountId)
      : null;

  return (
    <div className="page match-case-details">
      <button type="button" className="btn btn--secondary btn--sm" onClick={() => navigate(backPath)}>
        חזרה
      </button>

      <header className="match-case-details__header">
        <h1 className="page__title">תיק שידוך</h1>
        <CaseStatusMessage matchCase={matchCase} />
      </header>

      {showInternalNotes && ctx && (
        <section className="match-case-details__approvals">
          <h2>סטטוס אישורים</h2>
          <CaseApprovalSummary
            personAName={ctx.personAName ?? senderName}
            personBName={ctx.personBName ?? targetName}
            profileAStatus={ctx.profileAStatus ?? 'waiting'}
            profileBStatus={ctx.profileBStatus ?? 'waiting'}
          />
        </section>
      )}

      <section className="match-case-details__profiles">
        {showInternalNotes ? (
          <>
            <ProfileCard
              name={senderName}
              role="משתתף/ת א׳"
              onView={() => openProfile(matchCase.senderProfileId)}
            />
            <ProfileCard
              name={targetName}
              role="משתתף/ת ב׳"
              onView={() => openProfile(matchCase.targetProfileId)}
            />
          </>
        ) : counterparty ? (
          <ProfileCard
            name={counterparty.name}
            role="הצעה"
            onView={() => openProfile(counterparty.profileId)}
          />
        ) : null}
      </section>

      <ContactDetailsSection matchCase={matchCase} />

      <CaseActionsPanel
        matchCase={matchCase}
        onUpdated={() => {
          reload();
        }}
      />

      {showInternalNotes && matchCase.internalNotes && (
        <section className="match-case-details__notes">
          <h2>הערות פנימיות</h2>
          <p>{matchCase.internalNotes}</p>
        </section>
      )}

      {actions?.canCancel && !isCaseClosed(matchCase) && (
        <section className="match-case-details__actions">
          <SendButton variant="decline" isLoading={isUpdating} onClick={handleClose}>
            בטל תיק
          </SendButton>
        </section>
      )}

      {actionError && <p className="match-case-details__error">{actionError}</p>}

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
                {entry.onBehalfOfSlot && <span>בשם {entry.onBehalfOfSlot}</span>}
                {entry.previousStatus && entry.newStatus && (
                  <span>
                    {getMatchStatusLabel(entry.previousStatus)} → {getMatchStatusLabel(entry.newStatus)}
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

function ProfileCard({
  name,
  role,
  onView,
}: {
  name: string;
  role: string;
  onView: () => void;
}) {
  return (
    <div className="match-case-details__profile-card">
      <span className="match-case-details__role">{role}</span>
      <strong>{name}</strong>
      <button type="button" className="btn btn--secondary btn--sm" onClick={onView}>
        צפייה
      </button>
    </div>
  );
}

export const PersonCaseDetailsPage: React.FC = () => (
  <CaseDetailsView backPath="/my-cases" />
);

export const ShadchanCaseDetailsPage: React.FC = () => (
  <CaseDetailsView backPath="/match-cases" showInternalNotes />
);
