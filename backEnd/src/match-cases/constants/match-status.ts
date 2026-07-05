export const MATCH_STATUSES = [
  'pending',
  'reviewing',
  'contacting_sender',
  'waiting_for_sender',
  'contacting_receiver',
  'waiting_for_receiver',
  'matched',
  'rejected',
  'cancelled',
  'closed',
] as const;

export type MatchStatus = (typeof MATCH_STATUSES)[number];

export const MATCH_PRIORITIES = ['low', 'normal', 'high'] as const;
export type MatchPriority = (typeof MATCH_PRIORITIES)[number];

export const PERSON_CASE_ACTIONS = ['interested', 'not_interested'] as const;
export type PersonCaseAction = (typeof PERSON_CASE_ACTIONS)[number];

export const CASE_HISTORY_ACTIONS = [
  'Created',
  'Status Changed',
  'Assigned',
  'Reassigned',
  'Note Added',
  'Closed',
  'Reopened',
] as const;

export type CaseHistoryAction = (typeof CASE_HISTORY_ACTIONS)[number];

/** Shadchan-driven transitions along the main pipeline (+ terminal exits). */
export const SHADCHAN_ALLOWED_TRANSITIONS: Record<
  MatchStatus,
  readonly MatchStatus[]
> = {
  pending: ['reviewing', 'rejected', 'cancelled', 'closed'],
  reviewing: ['contacting_sender', 'rejected', 'cancelled', 'closed'],
  contacting_sender: ['waiting_for_sender', 'rejected', 'cancelled', 'closed'],
  waiting_for_sender: ['contacting_receiver', 'rejected', 'cancelled', 'closed'],
  contacting_receiver: ['waiting_for_receiver', 'rejected', 'cancelled', 'closed'],
  waiting_for_receiver: ['matched', 'rejected', 'cancelled', 'closed'],
  matched: ['closed'],
  rejected: ['closed', 'reviewing'],
  cancelled: ['closed', 'pending'],
  closed: ['reviewing', 'pending'],
};

const PERSON_INTERESTED_TARGET: Partial<Record<MatchStatus, MatchStatus>> = {
  pending: 'reviewing',
  reviewing: 'reviewing',
  waiting_for_sender: 'contacting_receiver',
  waiting_for_receiver: 'matched',
};

const NON_TERMINAL_FOR_DECLINE: readonly MatchStatus[] = [
  'pending',
  'reviewing',
  'contacting_sender',
  'waiting_for_sender',
  'contacting_receiver',
  'waiting_for_receiver',
];

export function resolvePersonActionTransition(
  currentStatus: MatchStatus,
  action: PersonCaseAction,
): MatchStatus | null {
  if (action === 'not_interested') {
    return NON_TERMINAL_FOR_DECLINE.includes(currentStatus) ? 'rejected' : null;
  }

  return PERSON_INTERESTED_TARGET[currentStatus] ?? null;
}

export function isShadchanTransitionAllowed(
  from: MatchStatus,
  to: MatchStatus,
): boolean {
  return SHADCHAN_ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function isReopenTransition(from: MatchStatus, to: MatchStatus): boolean {
  return (
    from === 'closed' && (to === 'reviewing' || to === 'pending')
  ) || (
    from === 'rejected' && to === 'reviewing'
  ) || (
    from === 'cancelled' && to === 'pending'
  );
}
