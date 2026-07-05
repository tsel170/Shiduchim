import React from 'react';
import {
  getMatchStatusClassName,
  getMatchStatusLabel,
} from '../../constants/matchCaseOptions';
import { MatchStatus } from '../../types/matchCase';
import './MatchStatusBadge.css';

interface MatchStatusBadgeProps {
  status: MatchStatus | null | undefined;
  className?: string;
}

export const MatchStatusBadge: React.FC<MatchStatusBadgeProps> = ({
  status,
  className = '',
}) => {
  if (!status) return null;

  return (
    <span
      className={`match-status-badge ${getMatchStatusClassName(status)} ${className}`.trim()}
    >
      {getMatchStatusLabel(status)}
    </span>
  );
};
