import React from 'react';
import { PROFILE_DECISION_LABELS, ProfileDecision } from '../../types/matchCase';
import './CaseApprovalSummary.css';

interface CaseApprovalSummaryProps {
  personAName: string;
  personBName: string;
  profileAStatus: ProfileDecision;
  profileBStatus: ProfileDecision;
}

export const CaseApprovalSummary: React.FC<CaseApprovalSummaryProps> = ({
  personAName,
  personBName,
  profileAStatus,
  profileBStatus,
}) => {
  const items = [
    { name: personAName, status: profileAStatus, key: 'A' },
    { name: personBName, status: profileBStatus, key: 'B' },
  ];

  return (
    <ul className="case-approval-summary">
      {items.map((item) => (
        <li
          key={item.key}
          className={`case-approval-summary__item case-approval-summary__item--${item.status}`}
        >
          <span className="case-approval-summary__name">{item.name}</span>
          <span className="case-approval-summary__status">
            {PROFILE_DECISION_LABELS[item.status]}
          </span>
        </li>
      ))}
    </ul>
  );
};
