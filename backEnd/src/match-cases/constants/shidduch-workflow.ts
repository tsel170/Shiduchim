/** Shidduch case lifecycle — single source of truth for status values. */
export const SHIDDUCH_STATUSES = [
  'sent_to_shadchan',
  'waiting_for_other_side',
  'background_check',
  'waiting_for_meeting_approval',
  'meeting_scheduled',
  'waiting_after_meeting',
  'matched',
  'denied',
  'on_hold',
  'cancelled',
] as const;

export type ShidduchStatus = (typeof SHIDDUCH_STATUSES)[number];

export const WAITING_FOR_TARGETS = ['sender', 'receiver', 'shadchan', 'both'] as const;
export type WaitingForTarget = (typeof WAITING_FOR_TARGETS)[number];

export const MATCH_PRIORITIES = ['low', 'normal', 'high'] as const;
export type MatchPriority = (typeof MATCH_PRIORITIES)[number];

export const PERSON_CASE_ACTIONS = ['interested', 'not_interested'] as const;
export type PersonCaseAction = (typeof PERSON_CASE_ACTIONS)[number];

export const CASE_HISTORY_ACTIONS = [
  'Case Created',
  'Profile Sent',
  'Accepted By Other Side',
  'Background Check Approved',
  'Entered Background Check',
  'Viewed Contact Details',
  'Meeting Approved',
  'Meeting Scheduled',
  'Meeting Completed',
  'Moved To On Hold',
  'Denied',
  'Matched',
  'Notes Added',
  'Status Changed',
  'Assigned',
  'Reassigned',
  'Cancelled',
  'Resumed',
] as const;

export type CaseHistoryAction = (typeof CASE_HISTORY_ACTIONS)[number];

export const TERMINAL_SHIDDUCH_STATUSES: readonly ShidduchStatus[] = [
  'matched',
  'denied',
  'cancelled',
];

export const CONTACT_DETAILS_VISIBLE_STATUSES: readonly ShidduchStatus[] = [
  'background_check',
  'waiting_for_meeting_approval',
  'meeting_scheduled',
  'waiting_after_meeting',
  'matched',
];

const SHADCHAN_PUSH_TAG = 'shadchan-push';

export interface CaseApprovalTimestamps {
  senderProfileApprovedAt?: Date | null;
  receiverProfileApprovedAt?: Date | null;
  senderBackgroundCheckApprovedAt?: Date | null;
  receiverBackgroundCheckApprovedAt?: Date | null;
  senderMeetingApprovedAt?: Date | null;
  receiverMeetingApprovedAt?: Date | null;
  senderContinuedAfterMeetingAt?: Date | null;
  receiverContinuedAfterMeetingAt?: Date | null;
}

export interface ShidduchCaseContext {
  currentStatus: ShidduchStatus;
  waitingFor: WaitingForTarget | null;
  senderAccountId: string;
  targetAccountId: string | null;
  tags?: string[];
  approvals: CaseApprovalTimestamps;
}

/** Legacy CRM statuses → Shidduch workflow (one-time migration). */
export const LEGACY_STATUS_MAP: Record<string, ShidduchStatus> = {
  pending: 'sent_to_shadchan',
  reviewing: 'background_check',
  contacting_sender: 'waiting_for_other_side',
  waiting_for_sender: 'waiting_for_other_side',
  contacting_receiver: 'waiting_for_other_side',
  waiting_for_receiver: 'waiting_for_other_side',
  matched: 'matched',
  rejected: 'denied',
  cancelled: 'cancelled',
  closed: 'cancelled',
};

export function normalizeShidduchStatus(status: string): ShidduchStatus {
  if ((SHIDDUCH_STATUSES as readonly string[]).includes(status)) {
    return status as ShidduchStatus;
  }
  return LEGACY_STATUS_MAP[status] ?? 'sent_to_shadchan';
}

export function isTerminalShidduchStatus(status: ShidduchStatus): boolean {
  return TERMINAL_SHIDDUCH_STATUSES.includes(status);
}

export function canViewContactDetails(status: ShidduchStatus): boolean {
  return CONTACT_DETAILS_VISIBLE_STATUSES.includes(status);
}

export function isShadchanParticipant(
  accountId: string,
  assignedShadchanId: string,
): boolean {
  return accountId === assignedShadchanId;
}

function isSender(accountId: string, ctx: ShidduchCaseContext): boolean {
  return ctx.senderAccountId === accountId;
}

function isReceiver(accountId: string, ctx: ShidduchCaseContext): boolean {
  return ctx.targetAccountId === accountId;
}

function otherWaitingParty(
  ctx: ShidduchCaseContext,
  actorAccountId: string,
): WaitingForTarget | null {
  if (ctx.waitingFor === 'both') return 'both';
  if (ctx.waitingFor === 'shadchan') return 'shadchan';
  if (ctx.waitingFor === 'sender' && !isSender(actorAccountId, ctx)) return 'sender';
  if (ctx.waitingFor === 'receiver' && !isReceiver(actorAccountId, ctx)) return 'receiver';
  return null;
}

export function canPersonActOnCase(
  ctx: ShidduchCaseContext,
  accountId: string,
): boolean {
  if (isTerminalShidduchStatus(ctx.currentStatus) || ctx.currentStatus === 'on_hold') {
    return false;
  }

  const isSend = isSender(accountId, ctx);
  const isRecv = isReceiver(accountId, ctx);
  if (!isSend && !isRecv) return false;

  switch (ctx.currentStatus) {
    case 'sent_to_shadchan':
      if (ctx.tags?.includes(SHADCHAN_PUSH_TAG)) return isSend || isRecv;
      // Person-request: only shadchan acts until they forward the suggestion to Person B
      return false;
    case 'waiting_for_other_side':
      return (
        (ctx.waitingFor === 'sender' && isSend) ||
        (ctx.waitingFor === 'receiver' && isRecv) ||
        (ctx.waitingFor === 'both' && (isSend || isRecv))
      );
    case 'waiting_for_meeting_approval':
    case 'waiting_after_meeting':
    case 'background_check':
      return (
        (ctx.waitingFor === 'sender' && isSend) ||
        (ctx.waitingFor === 'receiver' && isRecv) ||
        (ctx.waitingFor === 'both' && (isSend || isRecv))
      );
    default:
      return false;
  }
}

export function initialStatusForCreate(tags: string[]): {
  status: ShidduchStatus;
  waitingFor: WaitingForTarget;
  approvals: CaseApprovalTimestamps;
} {
  if (tags.includes(SHADCHAN_PUSH_TAG)) {
    return {
      status: 'sent_to_shadchan',
      waitingFor: 'both',
      approvals: {},
    };
  }
  return {
    status: 'sent_to_shadchan',
    waitingFor: 'shadchan',
    approvals: { senderProfileApprovedAt: new Date() },
  };
}

export interface PersonActionResult {
  status: ShidduchStatus;
  waitingFor: WaitingForTarget | null;
  approvals: CaseApprovalTimestamps;
  historyAction: CaseHistoryAction;
  historyNote: string;
  closeCase?: boolean;
}

export function resolvePersonAction(
  ctx: ShidduchCaseContext,
  accountId: string,
  action: PersonCaseAction,
): PersonActionResult | null {
  if (!canPersonActOnCase(ctx, accountId)) return null;

  const isSend = isSender(accountId, ctx);
  const approvals = { ...ctx.approvals };

  if (action === 'not_interested') {
    return {
      status: 'denied',
      waitingFor: null,
      approvals,
      historyAction: 'Denied',
      historyNote: 'לא מעוניין/ת',
      closeCase: true,
    };
  }

  switch (ctx.currentStatus) {
    case 'sent_to_shadchan':
    case 'waiting_for_other_side': {
      if (isSender(accountId, ctx)) approvals.senderProfileApprovedAt = new Date();
      if (isReceiver(accountId, ctx)) approvals.receiverProfileApprovedAt = new Date();

      const senderOk = Boolean(approvals.senderProfileApprovedAt);
      const receiverOk = Boolean(approvals.receiverProfileApprovedAt);

      if (senderOk && receiverOk) {
        return {
          status: 'waiting_for_other_side',
          waitingFor: 'shadchan',
          approvals,
          historyAction: 'Accepted By Other Side',
          historyNote: 'שני הצדדים אישרו את הפרופילים',
        };
      }

      const waitingFor: WaitingForTarget = senderOk ? 'receiver' : 'sender';
      return {
        status: 'waiting_for_other_side',
        waitingFor,
        approvals,
        historyAction: 'Accepted By Other Side',
        historyNote: 'אישור פרופיל',
      };
    }
    case 'background_check': {
      if (isSender(accountId, ctx)) {
        approvals.senderBackgroundCheckApprovedAt = new Date();
      }
      if (isReceiver(accountId, ctx)) {
        approvals.receiverBackgroundCheckApprovedAt = new Date();
      }

      const senderOk = Boolean(approvals.senderBackgroundCheckApprovedAt);
      const receiverOk = Boolean(approvals.receiverBackgroundCheckApprovedAt);

      if (senderOk && receiverOk) {
        return {
          status: 'background_check',
          waitingFor: 'shadchan',
          approvals,
          historyAction: 'Background Check Approved',
          historyNote: 'שני הצדדים אישרו לאחר בדיקת הרקע',
        };
      }

      return {
        status: 'background_check',
        waitingFor: senderOk ? 'receiver' : 'sender',
        approvals,
        historyAction: 'Background Check Approved',
        historyNote: 'אישור לאחר צפייה בפרטי קשר',
      };
    }
    case 'waiting_for_meeting_approval': {
      if (isSender(accountId, ctx)) approvals.senderMeetingApprovedAt = new Date();
      if (isReceiver(accountId, ctx)) approvals.receiverMeetingApprovedAt = new Date();

      const senderOk = Boolean(approvals.senderMeetingApprovedAt);
      const receiverOk = Boolean(approvals.receiverMeetingApprovedAt);

      if (senderOk && receiverOk) {
        return {
          status: 'waiting_for_meeting_approval',
          waitingFor: 'shadchan',
          approvals,
          historyAction: 'Meeting Approved',
          historyNote: 'שני הצדדים מעוניינים בפגישה',
        };
      }

      return {
        status: 'waiting_for_meeting_approval',
        waitingFor: senderOk ? 'receiver' : 'sender',
        approvals,
        historyAction: 'Meeting Approved',
        historyNote: 'אישור לפגישה',
      };
    }
    case 'waiting_after_meeting': {
      if (isSender(accountId, ctx)) approvals.senderContinuedAfterMeetingAt = new Date();
      if (isReceiver(accountId, ctx)) approvals.receiverContinuedAfterMeetingAt = new Date();

      const senderOk = Boolean(approvals.senderContinuedAfterMeetingAt);
      const receiverOk = Boolean(approvals.receiverContinuedAfterMeetingAt);

      if (senderOk && receiverOk) {
        return {
          status: 'meeting_scheduled',
          waitingFor: 'shadchan',
          approvals: {
            ...approvals,
            senderContinuedAfterMeetingAt: null,
            receiverContinuedAfterMeetingAt: null,
          },
          historyAction: 'Meeting Completed',
          historyNote: 'שני הצדדים מעוניינים בפגישה נוספת',
        };
      }

      return {
        status: 'waiting_after_meeting',
        waitingFor: senderOk ? 'receiver' : 'sender',
        approvals,
        historyAction: 'Meeting Completed',
        historyNote: 'מעוניין/ת בפגישה נוספת',
      };
    }
    default:
      return null;
  }
}

/** Linear forward step — shadchan may only advance along this path. */
export const SHADCHAN_PIPELINE_NEXT: Partial<Record<ShidduchStatus, ShidduchStatus>> = {
  sent_to_shadchan: 'waiting_for_other_side',
  waiting_for_other_side: 'background_check',
  background_check: 'waiting_for_meeting_approval',
  waiting_for_meeting_approval: 'meeting_scheduled',
  meeting_scheduled: 'waiting_after_meeting',
  waiting_after_meeting: 'matched',
};

export function getShadchanPipelineNext(
  status: ShidduchStatus,
): ShidduchStatus | null {
  return SHADCHAN_PIPELINE_NEXT[status] ?? null;
}

export function isShadchanPushCase(tags?: string[]): boolean {
  return tags?.includes(SHADCHAN_PUSH_TAG) ?? false;
}

/** Person B must not see/act until shadchan forwards a person-request case. */
export function isCaseVisibleToAccount(
  accountId: string,
  source: {
    senderAccountId: string;
    targetAccountId: string | null;
    currentStatus: string;
    tags?: string[];
  },
): boolean {
  if (source.senderAccountId === accountId) return true;
  if (source.targetAccountId !== accountId) return false;

  const status = normalizeShidduchStatus(source.currentStatus);
  if (isShadchanPushCase(source.tags)) return true;
  // Incoming person-request: hidden while still at shadchan review
  return status !== 'sent_to_shadchan';
}

export const SHADCHAN_ALLOWED_TRANSITIONS: Record<
  ShidduchStatus,
  readonly ShidduchStatus[]
> = {
  sent_to_shadchan: ['waiting_for_other_side', 'denied', 'on_hold', 'cancelled'],
  waiting_for_other_side: ['background_check', 'denied', 'on_hold', 'cancelled'],
  background_check: [
    'waiting_for_meeting_approval',
    'denied',
    'on_hold',
    'cancelled',
  ],
  waiting_for_meeting_approval: [
    'meeting_scheduled',
    'denied',
    'on_hold',
    'cancelled',
  ],
  meeting_scheduled: ['waiting_after_meeting', 'matched', 'denied', 'on_hold', 'cancelled'],
  waiting_after_meeting: ['meeting_scheduled', 'matched', 'denied', 'on_hold', 'cancelled'],
  matched: [],
  denied: [],
  on_hold: [
    'sent_to_shadchan',
    'waiting_for_other_side',
    'background_check',
    'waiting_for_meeting_approval',
    'meeting_scheduled',
    'waiting_after_meeting',
  ],
  cancelled: [],
};

export function isShadchanTransitionAllowed(
  from: ShidduchStatus,
  to: ShidduchStatus,
): boolean {
  return SHADCHAN_ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function waitingForAfterShadchanTransition(
  from: ShidduchStatus,
  to: ShidduchStatus,
): WaitingForTarget | null {
  if (to === 'waiting_for_other_side') return 'receiver';
  if (to === 'background_check') return 'both';
  if (to === 'waiting_for_meeting_approval') return 'both';
  if (to === 'meeting_scheduled') return null;
  if (to === 'waiting_after_meeting') return 'both';
  if (to === 'matched') return null;
  if (to === 'on_hold') return null;
  if (to === 'denied' || to === 'cancelled') return null;
  if (from === 'on_hold') return null;
  return null;
}

export function historyActionForShadchanTransition(
  from: ShidduchStatus,
  to: ShidduchStatus,
): CaseHistoryAction {
  if (to === 'background_check') return 'Entered Background Check';
  if (to === 'meeting_scheduled') return 'Meeting Scheduled';
  if (to === 'matched') return 'Matched';
  if (to === 'denied') return 'Denied';
  if (to === 'on_hold') return 'Moved To On Hold';
  if (to === 'cancelled') return 'Cancelled';
  if (from === 'on_hold') return 'Resumed';
  return 'Status Changed';
}

export function migrateLegacyWaitingFor(
  legacyStatus: string,
): WaitingForTarget | null {
  switch (legacyStatus) {
    case 'waiting_for_sender':
      return 'sender';
    case 'waiting_for_receiver':
      return 'receiver';
    case 'contacting_sender':
    case 'contacting_receiver':
    case 'reviewing':
      return 'shadchan';
    case 'pending':
      return 'shadchan';
    default:
      return null;
  }
}
