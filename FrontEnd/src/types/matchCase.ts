import { FullProfile } from './profile';

/** Legacy status — kept for history and migration. */
export type ShidduchStatus =
  | 'sent_to_shadchan'
  | 'waiting_for_other_side'
  | 'background_check'
  | 'waiting_for_meeting_approval'
  | 'meeting_scheduled'
  | 'waiting_after_meeting'
  | 'matched'
  | 'denied'
  | 'on_hold'
  | 'cancelled';

/** @deprecated Use ShidduchStatus */
export type MatchStatus = ShidduchStatus;

export type CaseStage =
  | 'profile_check'
  | 'background_check'
  | 'ready_to_meet'
  | 'meeting';

export type ProfileDecision = 'waiting' | 'approved' | 'denied';

export type WaitingForTarget = 'sender' | 'receiver' | 'shadchan' | 'both';

export type MatchPriority = 'low' | 'normal' | 'high';

export type PersonCaseAction = 'interested' | 'not_interested';

export type ParticipantRole = 'Person' | 'Shadchan';
export type PersonSlot = 'PersonA' | 'PersonB';
export type SimplePersonSlot = 'A' | 'B';
export type ApprovalStatus = 'Pending' | 'Approved' | 'Denied';
export type DenialReason = 'NotInterested' | 'NotSuitable' | 'Timing' | 'Other';
export type CaseActionType =
  | 'approve'
  | 'deny'
  | 'approve_for'
  | 'release_to_person_b'
  | 'advance_stage';

export interface CaseParticipant {
  accountId: string;
  profileId?: string | null;
  role: ParticipantRole;
  personSlot?: PersonSlot | null;
  approvalStatus: ApprovalStatus;
  approvedAt?: string | null;
  approvedByAccountId?: string | null;
}

export interface AvailableActions {
  canApprove: boolean;
  canDeny: boolean;
  canViewContactDetails: boolean;
  contactDetailsBlockedReason?: string;
  canReleaseToPersonB: boolean;
  canApproveForA: boolean;
  canApproveForB: boolean;
  canAdvanceStage: boolean;
  nextStageLabel?: string;
  canCancel: boolean;
}

export interface CaseViewerContext {
  stage: CaseStage;
  stageLabel: string;
  profileAStatus: ProfileDecision | null;
  profileBStatus: ProfileDecision | null;
  mySlot: SimplePersonSlot | 'shadchan' | null;
  myStatus: ProfileDecision | null;
  statusMessage: string;
  isClosed: boolean;
  personAName: string;
  personBName: string;
  availableActions: AvailableActions;
}

export const DENIAL_REASON_LABELS: Record<DenialReason, string> = {
  NotInterested: 'לא מעוניין/ת',
  NotSuitable: 'לא מתאים/ה',
  Timing: 'תזמון',
  Other: 'אחר',
};

export const STAGE_LABELS: Record<CaseStage, string> = {
  profile_check: 'בדיקת פרופיל',
  background_check: 'בדיקת רקע',
  ready_to_meet: 'מוכנים לפגישה',
  meeting: 'פגישה',
};

export const PROFILE_DECISION_LABELS: Record<ProfileDecision, string> = {
  waiting: 'ממתין',
  approved: 'אישר/ה',
  denied: 'דחה/תה',
};

export interface CaseApprovals {
  senderProfileApprovedAt?: string | null;
  receiverProfileApprovedAt?: string | null;
  senderBackgroundCheckApprovedAt?: string | null;
  receiverBackgroundCheckApprovedAt?: string | null;
  senderMeetingApprovedAt?: string | null;
  receiverMeetingApprovedAt?: string | null;
  senderContinuedAfterMeetingAt?: string | null;
  receiverContinuedAfterMeetingAt?: string | null;
}

export type CaseHistoryAction =
  | 'Case Created'
  | 'Profile Sent'
  | 'Accepted By Other Side'
  | 'Background Check Approved'
  | 'Entered Background Check'
  | 'Viewed Contact Details'
  | 'Meeting Approved'
  | 'Meeting Scheduled'
  | 'Meeting Completed'
  | 'Moved To On Hold'
  | 'Denied'
  | 'Matched'
  | 'Notes Added'
  | 'Status Changed'
  | 'Assigned'
  | 'Reassigned'
  | 'Cancelled'
  | 'Resumed';

export interface MatchCase {
  caseId: string;
  senderProfileId: string;
  targetProfileId: string;
  senderAccountId: string;
  targetAccountId: string | null;
  assignedShadchanId: string;
  stage: CaseStage;
  profileAStatus?: ProfileDecision | null;
  profileBStatus?: ProfileDecision | null;
  personBReleased: boolean;
  currentStatus: ShidduchStatus;
  initiatedBy?: 'person' | 'shadchan' | null;
  denialReason?: DenialReason | null;
  denialNote?: string | null;
  canViewContactDetails?: boolean;
  viewerContext?: CaseViewerContext;
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
  previousStatus?: ShidduchStatus;
  newStatus?: ShidduchStatus;
  changedByAccountId: string;
  timestamp: string;
  note?: string;
  actorSlot?: PersonSlot | 'Shadchan';
  onBehalfOfSlot?: PersonSlot;
  denialReason?: DenialReason;
  metadata?: Record<string, unknown>;
}

export interface ProfileMatchStatus {
  profileId: string;
  stage: CaseStage | null;
  currentStatus: ShidduchStatus | null;
  caseId: string | null;
  updatedAt: string | null;
}

export interface ContactDetailsPayload {
  caseId: string;
  profileId: string;
  phone: string | null;
  references: Array<{
    id: string;
    name: string;
    countryCode: string;
    phoneNumber: string;
  }>;
  dorYesharimStatus: string | null;
}
