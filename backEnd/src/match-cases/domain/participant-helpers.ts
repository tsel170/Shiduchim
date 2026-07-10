import {
  CaseApprovalTimestamps,
  ShidduchStatus,
  WaitingForTarget,
} from '../constants/shidduch-workflow';
import {
  ApprovalStatus,
  CaseParticipantData,
  PersonSlot,
  WaitingForParticipant,
} from './case-participant.types';

const SHADCHAN_PUSH_TAG = 'shadchan-push';

export interface MatchCaseParticipantSource {
  senderProfileId: string;
  targetProfileId: string;
  senderAccountId: string;
  targetAccountId: string | null;
  assignedShadchanId: string;
  tags?: string[];
  approvals?: CaseApprovalTimestamps;
  currentStatus: string;
  waitingFor?: string | null;
  participants?: Array<{
    accountId: string;
    profileId?: string | null;
    role: string;
    personSlot?: string | null;
    approvalStatus: string;
    approvedAt?: Date | null;
    approvedByAccountId?: string | null;
  }>;
  initiatedBy?: string | null;
}

export function isShadchanInitiated(tags?: string[]): boolean {
  return tags?.includes(SHADCHAN_PUSH_TAG) ?? false;
}

export function deriveInitiatedBy(source: MatchCaseParticipantSource): 'person' | 'shadchan' {
  if (source.initiatedBy === 'shadchan' || source.initiatedBy === 'person') {
    return source.initiatedBy;
  }
  return isShadchanInitiated(source.tags) ? 'shadchan' : 'person';
}

export function buildParticipantsFromLegacy(
  source: MatchCaseParticipantSource,
): CaseParticipantData[] {
  const status = source.currentStatus as ShidduchStatus;
  const approvals = source.approvals ?? {};

  return [
    {
      accountId: source.senderAccountId,
      profileId: source.senderProfileId,
      role: 'Person',
      personSlot: 'PersonA',
      approvalStatus: derivePersonApprovalStatus('PersonA', status, approvals),
      approvedAt: approvals.senderProfileApprovedAt ?? null,
      approvedByAccountId: null,
    },
    {
      accountId: source.targetAccountId ?? '',
      profileId: source.targetProfileId,
      role: 'Person',
      personSlot: 'PersonB',
      approvalStatus: derivePersonApprovalStatus('PersonB', status, approvals),
      approvedAt: approvals.receiverProfileApprovedAt ?? null,
      approvedByAccountId: null,
    },
    {
      accountId: source.assignedShadchanId,
      profileId: null,
      role: 'Shadchan',
      personSlot: null,
      approvalStatus: 'Approved',
      approvedAt: null,
      approvedByAccountId: null,
    },
  ];
}

export function ensureParticipants(
  source: MatchCaseParticipantSource,
): CaseParticipantData[] {
  if (source.participants && source.participants.length >= 2) {
    return source.participants.map((p) => ({
      accountId: p.accountId,
      profileId: p.profileId,
      role: p.role as CaseParticipantData['role'],
      personSlot: (p.personSlot as CaseParticipantData['personSlot']) ?? null,
      approvalStatus: p.approvalStatus as CaseParticipantData['approvalStatus'],
      approvedAt: p.approvedAt,
      approvedByAccountId: p.approvedByAccountId,
    }));
  }
  return buildParticipantsFromLegacy(source);
}

export function getPersonParticipant(
  participants: CaseParticipantData[],
  slot: PersonSlot,
): CaseParticipantData | undefined {
  return participants.find((p) => p.role === 'Person' && p.personSlot === slot);
}

export function getShadchanParticipant(
  participants: CaseParticipantData[],
): CaseParticipantData | undefined {
  return participants.find((p) => p.role === 'Shadchan');
}

export function findParticipantByAccountId(
  participants: CaseParticipantData[],
  accountId: string,
): CaseParticipantData | undefined {
  return participants.find((p) => p.accountId === accountId);
}

export function waitingForTargetToParticipant(
  waitingFor: WaitingForTarget | null,
): WaitingForParticipant | null {
  if (!waitingFor) return null;
  switch (waitingFor) {
    case 'sender':
      return 'PersonA';
    case 'receiver':
      return 'PersonB';
    case 'shadchan':
      return 'Shadchan';
    case 'both':
      return 'Both';
    default:
      return null;
  }
}

export function waitingForParticipantToTarget(
  waitingFor: WaitingForParticipant | null,
): WaitingForTarget | null {
  if (!waitingFor) return null;
  switch (waitingFor) {
    case 'PersonA':
      return 'sender';
    case 'PersonB':
      return 'receiver';
    case 'Shadchan':
      return 'shadchan';
    case 'Both':
      return 'both';
    default:
      return null;
  }
}

export function derivePersonApprovalStatus(
  slot: PersonSlot,
  status: ShidduchStatus,
  approvals: CaseApprovalTimestamps,
): ApprovalStatus {
  if (status === 'denied' || status === 'cancelled') return 'Denied';
  if (status === 'matched') return 'Approved';

  const isA = slot === 'PersonA';
  const profileOk = isA
    ? Boolean(approvals.senderProfileApprovedAt)
    : Boolean(approvals.receiverProfileApprovedAt);

  switch (status) {
    case 'sent_to_shadchan':
      return isA && profileOk ? 'Approved' : 'Pending';
    case 'waiting_for_other_side':
      return profileOk ? 'Approved' : 'Pending';
    case 'background_check': {
      const bgOk = isA
        ? Boolean(approvals.senderBackgroundCheckApprovedAt)
        : Boolean(approvals.receiverBackgroundCheckApprovedAt);
      return bgOk ? 'Approved' : 'Pending';
    }
    case 'waiting_for_meeting_approval': {
      const meetingOk = isA
        ? Boolean(approvals.senderMeetingApprovedAt)
        : Boolean(approvals.receiverMeetingApprovedAt);
      return meetingOk ? 'Approved' : 'Pending';
    }
    case 'waiting_after_meeting': {
      const continuedOk = isA
        ? Boolean(approvals.senderContinuedAfterMeetingAt)
        : Boolean(approvals.receiverContinuedAfterMeetingAt);
      return continuedOk ? 'Approved' : 'Pending';
    }
    case 'meeting_scheduled':
    case 'on_hold':
      return profileOk ? 'Approved' : 'Pending';
    default:
      return 'Pending';
  }
}

export function syncParticipantApprovalStatuses(
  participants: CaseParticipantData[],
  status: ShidduchStatus,
  approvals: CaseApprovalTimestamps,
): CaseParticipantData[] {
  return participants.map((p) => {
    if (p.role !== 'Person' || !p.personSlot) return p;
    return {
      ...p,
      approvalStatus: derivePersonApprovalStatus(p.personSlot, status, approvals),
    };
  });
}

export function accountIdForSlot(
  participants: CaseParticipantData[],
  slot: PersonSlot,
): string | null {
  return getPersonParticipant(participants, slot)?.accountId ?? null;
}

export function slotForAccountId(
  participants: CaseParticipantData[],
  accountId: string,
): PersonSlot | null {
  const p = findParticipantByAccountId(participants, accountId);
  if (p?.role === 'Person' && p.personSlot) return p.personSlot;
  return null;
}

export function bothProfilesApproved(approvals: CaseApprovalTimestamps): boolean {
  return (
    Boolean(approvals.senderProfileApprovedAt) &&
    Boolean(approvals.receiverProfileApprovedAt)
  );
}
