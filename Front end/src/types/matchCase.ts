import { FullProfile } from './profile';

export type MatchStatus =
  | 'pending'
  | 'reviewing'
  | 'contacting_sender'
  | 'waiting_for_sender'
  | 'contacting_receiver'
  | 'waiting_for_receiver'
  | 'matched'
  | 'rejected'
  | 'cancelled'
  | 'closed';

export type MatchPriority = 'low' | 'normal' | 'high';

export type PersonCaseAction = 'interested' | 'not_interested';

export type CaseHistoryAction =
  | 'Created'
  | 'Status Changed'
  | 'Assigned'
  | 'Reassigned'
  | 'Note Added'
  | 'Closed'
  | 'Reopened';

export interface MatchCase {
  caseId: string;
  senderProfileId: string;
  targetProfileId: string;
  senderAccountId: string;
  targetAccountId: string | null;
  assignedShadchanId: string;
  currentStatus: MatchStatus;
  priority: MatchPriority;
  tags: string[];
  internalNotes: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  senderProfile?: FullProfile;
  targetProfile?: FullProfile;
}

export interface CaseHistoryEntry {
  historyId: string;
  caseId: string;
  action: CaseHistoryAction;
  previousStatus?: MatchStatus;
  newStatus?: MatchStatus;
  changedByAccountId: string;
  timestamp: string;
  note?: string;
}

export interface ProfileMatchStatus {
  profileId: string;
  currentStatus: MatchStatus | null;
  caseId: string | null;
  updatedAt: string | null;
}
