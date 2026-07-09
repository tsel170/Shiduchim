import React, { useState } from 'react';
import { SendButton } from '../common/SendButton';
import { getStageApproveLabel } from '../../constants/matchCaseOptions';
import { MatchCase } from '../../types/matchCase';
import { DenyCaseDialog } from './DenyCaseDialog';
import { useMatchCaseAction } from '../../hooks/useMatchCaseAction';
import './CaseActionsPanel.css';

interface CaseActionsPanelProps {
  matchCase: MatchCase;
  onUpdated: (matchCase: MatchCase) => void;
}

export const CaseActionsPanel: React.FC<CaseActionsPanelProps> = ({
  matchCase,
  onUpdated,
}) => {
  const actions = matchCase.viewerContext?.availableActions;
  const ctx = matchCase.viewerContext;
  const { isLoading, error, approve, deny, approveFor, releaseToPersonB, advanceStage } =
    useMatchCaseAction(onUpdated);
  const [denyOpen, setDenyOpen] = useState(false);

  if (!actions) return null;

  const hasActions =
    actions.canApprove ||
    actions.canDeny ||
    actions.canApproveForA ||
    actions.canApproveForB ||
    actions.canReleaseToPersonB ||
    actions.canAdvanceStage;

  if (!hasActions) return null;

  const handleDeny = async (reason: Parameters<typeof deny>[1], note: string) => {
    await deny(matchCase.caseId, reason, note || undefined);
    setDenyOpen(false);
  };

  const approveLabel = getStageApproveLabel(ctx?.stage ?? matchCase.stage);

  return (
    <section className="case-actions-panel" aria-label="פעולות תיק">
      {actions.canReleaseToPersonB && (
        <SendButton
          variant="site"
          isLoading={isLoading}
          onClick={() => releaseToPersonB(matchCase.caseId)}
        >
          שלח הצעה לצד ב׳
        </SendButton>
      )}

      {actions.canApprove && (
        <SendButton variant="interested" isLoading={isLoading} onClick={() => approve(matchCase.caseId)}>
          {approveLabel}
        </SendButton>
      )}

      {actions.canApproveForA && (
        <SendButton
          variant="site"
          isLoading={isLoading}
          onClick={() => approveFor(matchCase.caseId, 'A')}
        >
          {ctx?.personAName ? `אישור בשם ${ctx.personAName}` : 'אישור בשם משתתף/ת א׳'}
        </SendButton>
      )}

      {actions.canApproveForB && (
        <SendButton
          variant="site"
          isLoading={isLoading}
          onClick={() => approveFor(matchCase.caseId, 'B')}
        >
          {ctx?.personBName ? `אישור בשם ${ctx.personBName}` : 'אישור בשם משתתף/ת ב׳'}
        </SendButton>
      )}

      {actions.canAdvanceStage && actions.nextStageLabel && (
        <SendButton
          variant="site"
          isLoading={isLoading}
          onClick={() => advanceStage(matchCase.caseId)}
        >
          קדם ל{actions.nextStageLabel}
        </SendButton>
      )}

      {actions.canDeny && (
        <SendButton variant="decline" isLoading={isLoading} onClick={() => setDenyOpen(true)}>
          דחייה
        </SendButton>
      )}

      {error && <p className="case-actions-panel__error">{error}</p>}

      <DenyCaseDialog
        isOpen={denyOpen}
        isLoading={isLoading}
        onConfirm={handleDeny}
        onClose={() => setDenyOpen(false)}
      />
    </section>
  );
};
