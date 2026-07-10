import { DenialReason } from './denial-reason';

/** Four stages — the whole case lifecycle. */
export const CASE_STAGES = [
  'profile_check',
  'background_check',
  'ready_to_meet',
  'meeting',
] as const;

export type CaseStage = (typeof CASE_STAGES)[number];

export const PROFILE_DECISIONS = ['waiting', 'approved', 'denied'] as const;
export type ProfileDecision = (typeof PROFILE_DECISIONS)[number];

export const STAGE_LABELS: Record<CaseStage, string> = {
  profile_check: 'בדיקת פרופיל',
  background_check: 'בדיקת רקע',
  ready_to_meet: 'מוכנים לפגישה',
  meeting: 'פגישה',
};

export interface SimplifiedCaseState {
  stage: CaseStage;
  profileAStatus: ProfileDecision;
  profileBStatus: ProfileDecision;
  initiatedBy: 'person' | 'shadchan';
  personBReleased: boolean;
  senderProfileId: string;
  targetProfileId: string;
  senderAccountId: string;
  targetAccountId: string | null;
  closedAt: Date | null;
}

export type PersonSlot = 'A' | 'B';

export interface AvailableActionsSimple {
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

export interface ViewerContextSimple {
  stage: CaseStage;
  stageLabel: string;
  profileAStatus: ProfileDecision | null;
  profileBStatus: ProfileDecision | null;
  mySlot: PersonSlot | 'shadchan' | null;
  myStatus: ProfileDecision | null;
  statusMessage: string;
  isClosed: boolean;
  availableActions: AvailableActionsSimple;
  personAName: string;
  personBName: string;
}

const CONTACT_STAGES: readonly CaseStage[] = [
  'background_check',
  'ready_to_meet',
  'meeting',
];

export function isCaseClosed(state: SimplifiedCaseState): boolean {
  return (
    Boolean(state.closedAt) ||
    state.profileAStatus === 'denied' ||
    state.profileBStatus === 'denied'
  );
}

export function accountIdForSlot(
  state: SimplifiedCaseState,
  slot: PersonSlot,
): string | null {
  return slot === 'A' ? state.senderAccountId : state.targetAccountId;
}

export function slotForAccountId(
  state: SimplifiedCaseState,
  accountId: string,
): PersonSlot | null {
  if (state.senderAccountId === accountId) return 'A';
  if (state.targetAccountId === accountId) return 'B';
  return null;
}

/** Shadchan sent a profile to a person — waiting for receiver response only. */
export function isShadchanPushPending(state: SimplifiedCaseState): boolean {
  return (
    state.initiatedBy === 'shadchan' &&
    !isCaseClosed(state) &&
    state.profileAStatus === 'waiting' &&
    state.profileBStatus === 'waiting'
  );
}

/** Person B cannot see person-initiated case until shadchan releases. */
export function isVisibleToAccount(
  state: SimplifiedCaseState,
  accountId: string,
): boolean {
  if (isShadchanPushPending(state)) {
    return state.targetAccountId === accountId;
  }
  if (state.senderAccountId === accountId) return true;
  if (state.targetAccountId !== accountId) return false;
  return state.personBReleased;
}

export function initialStateForCreate(
  initiatedBy: 'person' | 'shadchan',
): Pick<
  SimplifiedCaseState,
  'stage' | 'profileAStatus' | 'profileBStatus' | 'personBReleased'
> {
  if (initiatedBy === 'shadchan') {
    return {
      stage: 'profile_check',
      profileAStatus: 'waiting',
      profileBStatus: 'waiting',
      personBReleased: false,
    };
  }
  return {
    stage: 'profile_check',
    profileAStatus: 'approved',
    profileBStatus: 'waiting',
    personBReleased: false,
  };
}

export function nextStage(current: CaseStage): CaseStage | null {
  switch (current) {
    case 'profile_check':
      return 'background_check';
    case 'background_check':
      return 'ready_to_meet';
    case 'ready_to_meet':
      return 'meeting';
    case 'meeting':
      return 'ready_to_meet';
    default:
      return null;
  }
}

export function resetBothToWaiting(
  state: SimplifiedCaseState,
  next: CaseStage,
): Pick<SimplifiedCaseState, 'stage' | 'profileAStatus' | 'profileBStatus'> {
  return {
    stage: next,
    profileAStatus: 'waiting',
    profileBStatus: 'waiting',
  };
}

export function bothApproved(state: SimplifiedCaseState): boolean {
  return (
    state.profileAStatus === 'approved' && state.profileBStatus === 'approved'
  );
}

export function canPersonAct(
  state: SimplifiedCaseState,
  accountId: string,
): boolean {
  if (isCaseClosed(state)) return false;
  if (!isVisibleToAccount(state, accountId)) return false;
  const slot = slotForAccountId(state, accountId);
  if (!slot) return false;
  const status = slot === 'A' ? state.profileAStatus : state.profileBStatus;
  return status === 'waiting';
}

export function canShadchanActForSlot(
  state: SimplifiedCaseState,
  slot: PersonSlot,
): boolean {
  if (isCaseClosed(state)) return false;
  const accountId = accountIdForSlot(state, slot);
  if (accountId) return false;
  const status = slot === 'A' ? state.profileAStatus : state.profileBStatus;
  return status === 'waiting';
}

/** Shadchan may deny on behalf of B before B sees the case or while deciding on a push. */
export function isShadchanDenyOnBehalfOfB(
  state: SimplifiedCaseState,
  slot: PersonSlot,
): boolean {
  if (slot !== 'B') return false;
  if (isShadchanPushPending(state)) return true;
  return (
    state.initiatedBy === 'person' &&
    state.stage === 'profile_check' &&
    !state.personBReleased
  );
}

export function inferShadchanDenySlot(
  state: SimplifiedCaseState,
): PersonSlot | null {
  if (isCaseClosed(state)) return null;

  if (isShadchanPushPending(state)) {
    return 'B';
  }

  if (
    state.initiatedBy === 'person' &&
    state.stage === 'profile_check' &&
    !state.personBReleased &&
    state.profileBStatus === 'waiting'
  ) {
    return 'B';
  }

  if (canShadchanActForSlot(state, 'B')) return 'B';
  if (canShadchanActForSlot(state, 'A')) return 'A';

  return null;
}

export function canShadchanAdvanceStage(state: SimplifiedCaseState): boolean {
  if (isCaseClosed(state)) return false;
  if (!bothApproved(state)) return false;
  return nextStage(state.stage) !== null;
}

export function applyApprove(
  state: SimplifiedCaseState,
  slot: PersonSlot,
): {
  profileAStatus: ProfileDecision;
  profileBStatus: ProfileDecision;
} {
  return {
    profileAStatus: slot === 'A' ? 'approved' : state.profileAStatus,
    profileBStatus: slot === 'B' ? 'approved' : state.profileBStatus,
  };
}

export function applyShadchanAdvance(state: SimplifiedCaseState): {
  profileAStatus: ProfileDecision;
  profileBStatus: ProfileDecision;
  stage: CaseStage;
} {
  const next = nextStage(state.stage);
  if (!next || !bothApproved(state)) {
    throw new Error('Cannot advance stage');
  }
  return resetBothToWaiting(state, next);
}

export function applyDeny(
  state: SimplifiedCaseState,
  slot: PersonSlot,
): {
  profileAStatus: ProfileDecision;
  profileBStatus: ProfileDecision;
  closedAt: Date;
} {
  return {
    profileAStatus: slot === 'A' ? 'denied' : state.profileAStatus,
    profileBStatus: slot === 'B' ? 'denied' : state.profileBStatus,
    closedAt: new Date(),
  };
}

export function computeViewerContext(
  state: SimplifiedCaseState,
  viewerAccountId: string,
  viewerRole: 'person' | 'shadchan',
  names: { personAName: string; personBName: string },
): ViewerContextSimple {
  const closed = isCaseClosed(state);
  const mySlot =
    viewerRole === 'shadchan'
      ? ('shadchan' as const)
      : slotForAccountId(state, viewerAccountId);

  const myStatus =
    mySlot === 'A'
      ? state.profileAStatus
      : mySlot === 'B'
        ? state.profileBStatus
        : null;

  const canApprove =
    viewerRole === 'person' && canPersonAct(state, viewerAccountId);
  const canDeny =
    (viewerRole === 'person' && canPersonAct(state, viewerAccountId)) ||
    (viewerRole === 'shadchan' && !closed);

  const contactAllowed =
    CONTACT_STAGES.includes(state.stage) && !closed;
  const visible =
    viewerRole === 'shadchan' ||
    isVisibleToAccount(state, viewerAccountId);

  const canReleaseToPersonB =
    viewerRole === 'shadchan' &&
    !closed &&
    state.initiatedBy === 'person' &&
    state.stage === 'profile_check' &&
    !state.personBReleased;

  const canApproveForA =
    viewerRole === 'shadchan' && canShadchanActForSlot(state, 'A');
  const canApproveForB =
    viewerRole === 'shadchan' && canShadchanActForSlot(state, 'B');

  const canAdvanceStage =
    viewerRole === 'shadchan' && canShadchanAdvanceStage(state);
  const next = canAdvanceStage ? nextStage(state.stage) : null;

  const statusMessage = buildStatusMessage(state, mySlot, names, visible);
  const isShadchan = viewerRole === 'shadchan';

  return {
    stage: state.stage,
    stageLabel: STAGE_LABELS[state.stage],
    profileAStatus: isShadchan ? state.profileAStatus : null,
    profileBStatus: isShadchan ? state.profileBStatus : null,
    mySlot,
    myStatus: isShadchan ? myStatus : null,
    statusMessage,
    isClosed: closed,
    personAName: names.personAName,
    personBName: names.personBName,
    availableActions: {
      canApprove,
      canDeny,
      canViewContactDetails: contactAllowed && visible,
      contactDetailsBlockedReason: !contactAllowed
        ? 'פרטי קשר זמינים משלב בדיקת הרקע'
        : !visible
          ? 'אין גישה לתיק זה'
          : undefined,
      canReleaseToPersonB,
      canApproveForA,
      canApproveForB,
      canAdvanceStage,
      nextStageLabel: next ? STAGE_LABELS[next] : undefined,
      canCancel: viewerRole === 'shadchan' && !closed,
    },
  };
}

function buildStatusMessage(
  state: SimplifiedCaseState,
  mySlot: PersonSlot | 'shadchan' | null,
  names: { personAName: string; personBName: string },
  visible: boolean,
): string {
  if (!visible) return 'ההצעה עדיין לא נשלחה אליך';
  if (isCaseClosed(state)) {
    if (state.profileAStatus === 'denied' || state.profileBStatus === 'denied') {
      return 'התיק נסגר — נדחה';
    }
    return 'התיק סגור';
  }

  const stageLabel = STAGE_LABELS[state.stage];

  if (mySlot === 'shadchan') {
    if (isShadchanPushPending(state)) {
      return `ממתין לתגובת ${names.personBName}`;
    }
    if (state.initiatedBy === 'person' && !state.personBReleased) {
      return 'שלח/י את ההצעה לצד ב׳';
    }
    if (state.profileAStatus === 'waiting' && state.profileBStatus === 'waiting') {
      return `ממתין לאישור ${names.personAName} ו-${names.personBName}`;
    }
    if (state.profileAStatus === 'waiting') {
      return `ממתין לאישור ${names.personAName}`;
    }
    if (state.profileBStatus === 'waiting') {
      return `ממתין לאישור ${names.personBName}`;
    }
    return `${stageLabel} — שניהם אישרו, ניתן לקדם לשלב הבא`;
  }

  if (mySlot === 'A' || mySlot === 'B') {
    const myStatus = mySlot === 'A' ? state.profileAStatus : state.profileBStatus;
    if (myStatus === 'waiting') return `${stageLabel} — ממתין לתגובתך`;
    if (bothApproved(state)) return `${stageLabel} — ממתין לאישור השדכן/ית`;
    return `${stageLabel} — התגובה שלך נקלטה`;
  }

  return stageLabel;
}

export function deriveInitiatedBy(source: {
  initiatedBy?: string | null;
  tags?: string[];
}): 'person' | 'shadchan' {
  if (source.initiatedBy === 'person' || source.initiatedBy === 'shadchan') {
    return source.initiatedBy;
  }
  if (source.tags?.includes('shadchan-push')) {
    return 'shadchan';
  }
  return 'person';
}

/** Map legacy DB status → stage for migration / reads. */
export function stageFromLegacyStatus(status: string): CaseStage {
  switch (status) {
    case 'background_check':
      return 'background_check';
    case 'waiting_for_meeting_approval':
      return 'ready_to_meet';
    case 'meeting_scheduled':
    case 'waiting_after_meeting':
      return 'meeting';
    default:
      return 'profile_check';
  }
}

export function legacyStatusFromStage(
  stage: CaseStage,
  state: Pick<SimplifiedCaseState, 'initiatedBy' | 'personBReleased' | 'profileAStatus' | 'profileBStatus'>,
): string {
  if (state.profileAStatus === 'denied' || state.profileBStatus === 'denied') {
    return 'denied';
  }
  switch (stage) {
    case 'profile_check':
      if (state.initiatedBy === 'person' && !state.personBReleased) {
        return 'sent_to_shadchan';
      }
      return 'waiting_for_other_side';
    case 'background_check':
      return 'background_check';
    case 'ready_to_meet':
      return 'waiting_for_meeting_approval';
    case 'meeting':
      return 'meeting_scheduled';
    default:
      return 'waiting_for_other_side';
  }
}

export function deriveProfileStatusesFromLegacy(
  status: string,
  approvals: {
    senderProfileApprovedAt?: Date | null;
    receiverProfileApprovedAt?: Date | null;
    senderBackgroundCheckApprovedAt?: Date | null;
    receiverBackgroundCheckApprovedAt?: Date | null;
    senderMeetingApprovedAt?: Date | null;
    receiverMeetingApprovedAt?: Date | null;
  },
  initiatedBy: 'person' | 'shadchan',
): { profileAStatus: ProfileDecision; profileBStatus: ProfileDecision } {
  const stage = stageFromLegacyStatus(status);

  const pick = (
    senderAt?: Date | null,
    receiverAt?: Date | null,
  ): { profileAStatus: ProfileDecision; profileBStatus: ProfileDecision } => {
    const a = senderAt ? 'approved' : 'waiting';
    const b = receiverAt ? 'approved' : 'waiting';
    return { profileAStatus: a, profileBStatus: b };
  };

  switch (stage) {
    case 'profile_check':
      if (initiatedBy === 'person') {
        return {
          profileAStatus: 'approved',
          profileBStatus: approvals.receiverProfileApprovedAt ? 'approved' : 'waiting',
        };
      }
      return pick(approvals.senderProfileApprovedAt, approvals.receiverProfileApprovedAt);
    case 'background_check':
      return pick(
        approvals.senderBackgroundCheckApprovedAt,
        approvals.receiverBackgroundCheckApprovedAt,
      );
    case 'ready_to_meet':
      return pick(approvals.senderMeetingApprovedAt, approvals.receiverMeetingApprovedAt);
    case 'meeting':
      return { profileAStatus: 'waiting', profileBStatus: 'waiting' };
    default:
      return { profileAStatus: 'waiting', profileBStatus: 'waiting' };
  }
}

export type CaseActionType =
  | 'approve'
  | 'deny'
  | 'approve_for'
  | 'release_to_person_b'
  | 'advance_stage';

export interface CaseActionInput {
  type: CaseActionType;
  slot?: PersonSlot;
  denialReason?: DenialReason;
  note?: string;
}
