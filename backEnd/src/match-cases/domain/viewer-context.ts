import { ApprovalStatus, PersonSlot, ViewerRole, WaitingForParticipant } from './case-participant.types';
import { AvailableActions } from './available-actions';

export interface ParticipantSummary {
  slot: PersonSlot | 'Shadchan';
  displayName: string;
  approvalStatus: ApprovalStatus;
}

export interface CaseViewerContext {
  availableActions: AvailableActions;
  statusMessage: string;
  myRole: ViewerRole;
  myApprovalStatus: ApprovalStatus | null;
  waitingForParticipant: WaitingForParticipant | null;
  waitingOnMe: boolean;
  participantSummaries: ParticipantSummary[];
}
