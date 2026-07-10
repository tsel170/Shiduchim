import {
  canPersonActOnCase,
  canViewContactDetails,
  getShadchanPipelineNext,
  isTerminalShidduchStatus,
  normalizeShidduchStatus,
  ShidduchCaseContext,
  ShidduchStatus,
} from '../constants/shidduch-workflow';
import { AvailableActions, EMPTY_AVAILABLE_ACTIONS } from './available-actions';
import {
  ApprovalStatus,
  CaseParticipantData,
  PersonSlot,
  ViewerRole,
  WaitingForParticipant,
} from './case-participant.types';
import {
  accountIdForSlot,
  bothProfilesApproved,
  deriveInitiatedBy,
  ensureParticipants,
  findParticipantByAccountId,
  getPersonParticipant,
  MatchCaseParticipantSource,
  slotForAccountId,
  syncParticipantApprovalStatuses,
  waitingForTargetToParticipant,
} from './participant-helpers';
import { CaseViewerContext, ParticipantSummary } from './viewer-context';

export interface ProfileNameLookup {
  personAName: string;
  personBName: string;
}

function buildCaseContext(source: MatchCaseParticipantSource): ShidduchCaseContext {
  return {
    currentStatus: normalizeShidduchStatus(source.currentStatus),
    waitingFor: (source as { waitingFor?: string | null }).waitingFor as ShidduchCaseContext['waitingFor'],
    senderAccountId: source.senderAccountId,
    targetAccountId: source.targetAccountId,
    tags: source.tags ?? [],
    approvals: source.approvals ?? {},
  };
}

function resolveViewerRole(
  participants: CaseParticipantData[],
  viewerAccountId: string,
  viewerRole: 'person' | 'shadchan',
): ViewerRole {
  if (viewerRole === 'shadchan') {
    const shadchan = participants.find((p) => p.role === 'Shadchan');
    return shadchan?.accountId === viewerAccountId ? 'Shadchan' : null;
  }
  const slot = slotForAccountId(participants, viewerAccountId);
  return slot;
}

function isWaitingOnViewer(
  waitingForParticipant: WaitingForParticipant | null,
  myRole: ViewerRole,
): boolean {
  if (!waitingForParticipant || !myRole) return false;
  if (waitingForParticipant === 'Both') {
    return myRole === 'PersonA' || myRole === 'PersonB';
  }
  return waitingForParticipant === myRole;
}

function contactDetailsBlockedReason(
  status: ShidduchStatus,
  approvals: ShidduchCaseContext['approvals'],
): string | undefined {
  if (!canViewContactDetails(status)) {
    return 'פרטי קשר יהיו זמינים לאחר שלב בדיקת הרקע';
  }
  if (!bothProfilesApproved(approvals)) {
    return 'ממתין לאישור שני הצדדים';
  }
  return undefined;
}

function computePersonActions(
  ctx: ShidduchCaseContext,
  accountId: string,
  status: ShidduchStatus,
  approvals: ShidduchCaseContext['approvals'],
): AvailableActions {
  const canAct = canPersonActOnCase(ctx, accountId);
  const blockedReason = contactDetailsBlockedReason(status, approvals);
  const canView = canViewContactDetails(status) && !blockedReason;

  return {
    ...EMPTY_AVAILABLE_ACTIONS,
    canApprove: canAct,
    canDeny: canAct || (!isTerminalShidduchStatus(status) && status !== 'on_hold'),
    canViewContactDetails: canView,
    contactDetailsBlockedReason: blockedReason,
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
}

function pendingPersonSlotsForStage(
  status: ShidduchStatus,
  participants: CaseParticipantData[],
): PersonSlot[] {
  const slots: PersonSlot[] = [];
  for (const slot of ['PersonA', 'PersonB'] as PersonSlot[]) {
    const p = getPersonParticipant(participants, slot);
    if (p && p.approvalStatus === 'Pending') slots.push(slot);
  }
  if (slots.length === 0 && status === 'waiting_for_other_side') {
    return participants
      .filter((p) => p.role === 'Person' && p.approvalStatus === 'Pending' && p.personSlot)
      .map((p) => p.personSlot as PersonSlot);
  }
  if (slots.length === 0 && status === 'background_check') {
    return participants
      .filter((p) => p.role === 'Person' && p.approvalStatus === 'Pending' && p.personSlot)
      .map((p) => p.personSlot as PersonSlot);
  }
  return slots;
}

const SHADCHAN_APPROVE_FOR_STATUSES: readonly ShidduchStatus[] = [
  'waiting_for_other_side',
  'background_check',
  'waiting_for_meeting_approval',
  'waiting_after_meeting',
];

function computeShadchanActions(
  ctx: ShidduchCaseContext,
  status: ShidduchStatus,
  participants: CaseParticipantData[],
): AvailableActions {
  const pipelineNext = getShadchanPipelineNext(status);
  const terminal = isTerminalShidduchStatus(status);
  const pendingSlots = pendingPersonSlotsForStage(status, participants);
  const blockedReason = contactDetailsBlockedReason(status, ctx.approvals);
  const canApproveFor =
    SHADCHAN_APPROVE_FOR_STATUSES.includes(status) &&
    pendingSlots.length > 0 &&
    !terminal;

  return {
    ...EMPTY_AVAILABLE_ACTIONS,
    canApprove: false,
    canDeny: !terminal,
    canViewContactDetails: canViewContactDetails(status) && !blockedReason,
    contactDetailsBlockedReason: blockedReason,
    canScheduleMeeting:
      status === 'waiting_for_meeting_approval' && bothProfilesApproved(ctx.approvals),
    canApproveForOtherParty: canApproveFor,
    approveForSlots: canApproveFor ? pendingSlots : [],
    canCancel: !terminal && status !== 'cancelled',
    canReopen: status === 'on_hold',
    canAdvanceStage: Boolean(pipelineNext) && status !== 'on_hold',
    availableStageTransitions: pipelineNext ? [pipelineNext] : [],
    canAddPrivateNote: true,
    canReassign: !terminal,
  };
}

function computeStatusMessage(
  source: MatchCaseParticipantSource,
  status: ShidduchStatus,
  waitingForParticipant: WaitingForParticipant | null,
  myRole: ViewerRole,
  waitingOnMe: boolean,
  participants: CaseParticipantData[],
  names: ProfileNameLookup,
): string {
  if (status === 'denied') return 'התיק נדחה';
  if (status === 'cancelled') return 'התיק בוטל';
  if (status === 'matched') return 'התיק הושלם בהצלחה';
  if (status === 'on_hold') return 'התיק בהמתנה';

  const initiatedBy = deriveInitiatedBy(source);

  if (myRole === 'Shadchan') {
    if (waitingForParticipant === 'PersonA') {
      return `ממתין לאישור ${names.personAName}`;
    }
    if (waitingForParticipant === 'PersonB') {
      return `ממתין לאישור ${names.personBName}`;
    }
    if (waitingForParticipant === 'Both') {
      return 'ממתין לאישור שני הצדדים';
    }
    if (waitingForParticipant === 'Shadchan') {
      return 'התור שלך להמשיך את התיק';
    }
    return 'תיק שידוך פעיל';
  }

  if (myRole === 'PersonA' || myRole === 'PersonB') {
    if (waitingOnMe) {
      if (initiatedBy === 'shadchan' && status === 'sent_to_shadchan') {
        return 'הצעה חדשה מהשדכן שלך';
      }
      return 'ממתין לתגובתך';
    }

    const otherSlot: PersonSlot = myRole === 'PersonA' ? 'PersonB' : 'PersonA';
    const other = getPersonParticipant(participants, otherSlot);
    const otherName = otherSlot === 'PersonA' ? names.personAName : names.personBName;

    if (other?.approvalStatus === 'Pending') {
      return `ממתין ל${otherName}`;
    }
    if (waitingForParticipant === 'Shadchan') {
      return 'ממתין לשדכן/ית';
    }
    return 'התיק בתהליך';
  }

  return 'תיק שידוך';
}

export function computeViewerContext(
  source: MatchCaseParticipantSource,
  viewerAccountId: string,
  viewerRole: 'person' | 'shadchan',
  names: ProfileNameLookup,
): CaseViewerContext {
  const status = normalizeShidduchStatus(source.currentStatus);
  const ctx = buildCaseContext(source);
  let participants = ensureParticipants(source);
  participants = syncParticipantApprovalStatuses(
    participants,
    status,
    source.approvals ?? {},
  );

  const myRole = resolveViewerRole(participants, viewerAccountId, viewerRole);
  const waitingForParticipant = waitingForTargetToParticipant(ctx.waitingFor);
  const waitingOnMe = isWaitingOnViewer(waitingForParticipant, myRole);

  let availableActions: AvailableActions;
  if (myRole === 'Shadchan') {
    availableActions = computeShadchanActions(ctx, status, participants);
  } else if (myRole === 'PersonA' || myRole === 'PersonB') {
    const personAccountId = accountIdForSlot(participants, myRole) ?? viewerAccountId;
    availableActions = computePersonActions(ctx, personAccountId, status, ctx.approvals);
  } else {
    availableActions = { ...EMPTY_AVAILABLE_ACTIONS };
  }

  const personA = getPersonParticipant(participants, 'PersonA');
  const personB = getPersonParticipant(participants, 'PersonB');

  const participantSummaries: ParticipantSummary[] = [
    {
      slot: 'PersonA',
      displayName: names.personAName,
      approvalStatus: personA?.approvalStatus ?? 'Pending',
    },
    {
      slot: 'PersonB',
      displayName: names.personBName,
      approvalStatus: personB?.approvalStatus ?? 'Pending',
    },
  ];

  const myParticipant = findParticipantByAccountId(participants, viewerAccountId);
  const myApprovalStatus: ApprovalStatus | null =
    myParticipant?.role === 'Person' ? myParticipant.approvalStatus : null;

  return {
    availableActions,
    statusMessage: computeStatusMessage(
      source,
      status,
      waitingForParticipant,
      myRole,
      waitingOnMe,
      participants,
      names,
    ),
    myRole,
    myApprovalStatus,
    waitingForParticipant,
    waitingOnMe,
    participantSummaries,
  };
}

export function resolveApproveForAccountId(
  participants: CaseParticipantData[],
  slot: PersonSlot,
): string | null {
  return accountIdForSlot(participants, slot);
}
