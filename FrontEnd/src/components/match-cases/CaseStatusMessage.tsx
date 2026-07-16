import React from 'react';
import { getStageClassName, getStageLabel } from '../../constants/matchCaseOptions';
import { MatchCase } from '../../types/matchCase';
import './CaseStatusMessage.css';

interface CaseStatusMessageProps {
  matchCase: MatchCase;
}

export const CaseStatusMessage: React.FC<CaseStatusMessageProps> = ({ matchCase }) => {
  const ctx = matchCase.viewerContext;
  const stage = ctx?.stage ?? matchCase.stage;
  const message = ctx?.statusMessage;
  const waitingOnMe = ctx?.availableActions.canApprove ?? false;

  return (
    <div className="case-status-message">
      <span className={`case-stage-badge ${getStageClassName(stage)}`}>
        {ctx?.stageLabel ?? getStageLabel(stage)}
      </span>
      {message && (
        <p
          className={`case-status-message__text${
            waitingOnMe ? ' case-status-message__text--highlight' : ''
          }`}
        >
          {message}
          {waitingOnMe ? ' — התור שלך' : ''}
        </p>
      )}
    </div>
  );
};
