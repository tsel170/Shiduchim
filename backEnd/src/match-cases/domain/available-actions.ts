import { PersonSlot } from './case-participant.types';
import { ShidduchStatus } from '../constants/shidduch-workflow';

export interface AvailableActions {
  canApprove: boolean;
  canDeny: boolean;
  canViewContactDetails: boolean;
  contactDetailsBlockedReason?: string;
  canScheduleMeeting: boolean;
  canApproveForOtherParty: boolean;
  approveForSlots: PersonSlot[];
  canCancel: boolean;
  canReopen: boolean;
  canAdvanceStage: boolean;
  availableStageTransitions: ShidduchStatus[];
  canAddPrivateNote: boolean;
  canReassign: boolean;
}

export const EMPTY_AVAILABLE_ACTIONS: AvailableActions = {
  canApprove: false,
  canDeny: false,
  canViewContactDetails: false,
  canScheduleMeeting: false,
  canApproveForOtherParty: false,
  approveForSlots: [],
  canCancel: false,
  canReopen: false,
  canAdvanceStage: false,
  availableStageTransitions: [],
  canAddPrivateNote: false,
  canReassign: false,
};
