import { MatchStatus } from '../types/matchCase';

export const TERMINAL_MATCH_STATUSES: readonly MatchStatus[] = [
  'matched',
  'rejected',
  'cancelled',
  'closed',
];

export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  pending: 'ממתין',
  reviewing: 'בבדיקה',
  contacting_sender: 'יצירת קשר — שולח/ת',
  waiting_for_sender: 'ממתין/ה לשולח/ת',
  contacting_receiver: 'יצירת קשר — מקבל/ת',
  waiting_for_receiver: 'ממתין/ה למקבל/ת',
  matched: 'הותאם',
  rejected: 'נדחה',
  cancelled: 'בוטל',
  closed: 'נסגר',
};

export const MATCH_PRIORITY_LABELS = {
  low: 'נמוכה',
  normal: 'רגילה',
  high: 'גבוהה',
} as const;

/** Shadchan CRM dashboard sections */
export const MATCH_CASE_DASHBOARD_TABS: ReadonlyArray<{
  status: MatchStatus;
  path: string;
  label: string;
}> = [
  { status: 'pending', path: '/match-cases/pending', label: MATCH_STATUS_LABELS.pending },
  { status: 'reviewing', path: '/match-cases/reviewing', label: MATCH_STATUS_LABELS.reviewing },
  {
    status: 'waiting_for_sender',
    path: '/match-cases/waiting-sender',
    label: 'ממתין לשולח/ת',
  },
  {
    status: 'waiting_for_receiver',
    path: '/match-cases/waiting-receiver',
    label: 'ממתין למקבל/ת',
  },
  { status: 'matched', path: '/match-cases/matched', label: MATCH_STATUS_LABELS.matched },
  { status: 'rejected', path: '/match-cases/rejected', label: MATCH_STATUS_LABELS.rejected },
  { status: 'cancelled', path: '/match-cases/cancelled', label: MATCH_STATUS_LABELS.cancelled },
  { status: 'closed', path: '/match-cases/closed', label: MATCH_STATUS_LABELS.closed },
];

export const PERSON_CASE_TABS: ReadonlyArray<{
  status: MatchStatus | 'all';
  path: string;
  label: string;
}> = [
  { status: 'all', path: '/my-cases', label: 'הכל' },
  { status: 'pending', path: '/my-cases/pending', label: MATCH_STATUS_LABELS.pending },
  { status: 'reviewing', path: '/my-cases/reviewing', label: MATCH_STATUS_LABELS.reviewing },
  {
    status: 'waiting_for_sender',
    path: '/my-cases/waiting-sender',
    label: 'ממתין לי',
  },
  {
    status: 'waiting_for_receiver',
    path: '/my-cases/waiting-receiver',
    label: 'הוצע לי',
  },
  { status: 'matched', path: '/my-cases/matched', label: MATCH_STATUS_LABELS.matched },
];

export function getMatchStatusLabel(status: MatchStatus | null | undefined): string {
  if (!status) return '';
  return MATCH_STATUS_LABELS[status] ?? status;
}

export function getMatchStatusClassName(status: MatchStatus): string {
  return `match-status-badge--${status.replace(/_/g, '-')}`;
}

export function isTerminalMatchStatus(status: MatchStatus): boolean {
  return TERMINAL_MATCH_STATUSES.includes(status);
}

const PERSON_ACTION_STATUSES: readonly MatchStatus[] = [
  'pending',
  'reviewing',
  'waiting_for_sender',
  'waiting_for_receiver',
];

export function canPersonActOnCase(status: MatchStatus): boolean {
  return PERSON_ACTION_STATUSES.includes(status);
}

export function getDashboardTabFromPath(pathname: string): MatchStatus {
  if (pathname.includes('/reviewing')) return 'reviewing';
  if (pathname.includes('/waiting-sender')) return 'waiting_for_sender';
  if (pathname.includes('/waiting-receiver')) return 'waiting_for_receiver';
  if (pathname.includes('/matched')) return 'matched';
  if (pathname.includes('/rejected')) return 'rejected';
  if (pathname.includes('/cancelled')) return 'cancelled';
  if (pathname.includes('/closed')) return 'closed';
  return 'pending';
}

export function getPersonCaseRoleLabel(
  matchCase: { senderProfileId: string; targetProfileId: string; tags?: string[] },
  myProfileId?: string | null
): string {
  if (matchCase.tags?.includes('shadchan-push')) return 'הוצע לך';
  if (myProfileId && matchCase.senderProfileId === myProfileId) return 'שלחת לבדיקה';
  if (myProfileId && matchCase.targetProfileId === myProfileId) return 'הוצע לך';
  return 'תיק שידוך';
}

export function getOtherProfileInCase(
  matchCase: { senderProfileId: string; targetProfileId: string; senderProfile?: unknown; targetProfile?: unknown },
  myProfileId?: string | null
) {
  if (myProfileId) {
    if (matchCase.senderProfileId === myProfileId) {
      return matchCase.targetProfile ?? null;
    }
    if (matchCase.targetProfileId === myProfileId) {
      return matchCase.senderProfile ?? null;
    }
  }
  return matchCase.targetProfile ?? matchCase.senderProfile ?? null;
}

export function isCounterpartyProfileInCase(
  matchCase: {
    senderProfileId: string;
    targetProfileId: string;
    senderAccountId: string;
    targetAccountId: string | null;
  },
  profileId: string,
  accountId: string
): boolean {
  if (matchCase.senderAccountId === accountId && matchCase.targetProfileId === profileId) {
    return true;
  }
  if (matchCase.targetAccountId === accountId && matchCase.senderProfileId === profileId) {
    return true;
  }
  return false;
}

export function getPersonCasesTabFromPath(pathname: string): MatchStatus | 'all' {
  if (pathname.includes('/pending')) return 'pending';
  if (pathname.includes('/reviewing')) return 'reviewing';
  if (pathname.includes('/waiting-sender')) return 'waiting_for_sender';
  if (pathname.includes('/waiting-receiver')) return 'waiting_for_receiver';
  if (pathname.includes('/matched')) return 'matched';
  return 'all';
}

/** Next status shadchan can set from current (for quick actions). */
export const SHADCHAN_NEXT_STATUS: Partial<Record<MatchStatus, MatchStatus>> = {
  pending: 'reviewing',
  reviewing: 'contacting_sender',
  contacting_sender: 'waiting_for_sender',
  waiting_for_sender: 'contacting_receiver',
  contacting_receiver: 'waiting_for_receiver',
  waiting_for_receiver: 'matched',
};
