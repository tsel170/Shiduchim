import { CaseStage, CaseHistoryAction, MatchCase, PersonSlot, ProfileDecision, ShidduchStatus, STAGE_LABELS } from '../types/matchCase';
import { FullProfile } from '../types/profile';
import { getProfileDisplayName } from '../utils/profileDisplay';

export const TERMINAL_SHIDDUCH_STATUSES: readonly ShidduchStatus[] = [
  'matched',
  'denied',
  'cancelled',
];

export const CASE_STAGES: readonly CaseStage[] = [
  'profile_check',
  'background_check',
  'ready_to_meet',
  'meeting',
];

export const MATCH_STATUS_LABELS: Record<ShidduchStatus, string> = {
  sent_to_shadchan: 'נשלח לשדכן',
  waiting_for_other_side: 'ממתין לצד השני',
  background_check: 'בדיקת רקע',
  waiting_for_meeting_approval: 'ממתין לאישור פגישה',
  meeting_scheduled: 'פגישה נקבעה',
  waiting_after_meeting: 'ממתין אחרי פגישה',
  matched: 'הותאם',
  denied: 'נדחה',
  on_hold: 'בהמתנה',
  cancelled: 'בוטל',
};

export const STAGE_APPROVE_LABELS: Record<CaseStage, string> = {
  profile_check: 'אהבתי את הפרופיל',
  background_check: 'נשמע/ת נחמד/ה, בואו ניפגש',
  ready_to_meet: 'בואו ניפגש',
  meeting: 'נפגשנו — נהניתי מהפגישה',
};

export function getStageApproveLabel(stage: CaseStage | null | undefined): string {
  if (!stage) return 'מעוניין/ת';
  return STAGE_APPROVE_LABELS[stage] ?? 'מעוניין/ת';
}

export function getCounterpartyInCase(
  matchCase: {
    senderProfileId: string;
    targetProfileId: string;
    senderAccountId: string;
    targetAccountId: string | null;
    senderProfile?: FullProfile | null;
    targetProfile?: FullProfile | null;
  },
  myAccountId: string
): { profileId: string; name: string } | null {
  if (matchCase.senderAccountId === myAccountId) {
    const profile = matchCase.targetProfile;
    return {
      profileId: matchCase.targetProfileId,
      name: profile ? getProfileDisplayName(profile) : matchCase.targetProfileId,
    };
  }
  if (matchCase.targetAccountId === myAccountId) {
    const profile = matchCase.senderProfile;
    return {
      profileId: matchCase.senderProfileId,
      name: profile ? getProfileDisplayName(profile) : matchCase.senderProfileId,
    };
  }
  return null;
}

export const MATCH_PRIORITY_LABELS = {
  low: 'נמוכה',
  normal: 'רגילה',
  high: 'גבוהה',
} as const;

export const PERSON_CASE_TABS: ReadonlyArray<{
  stage: CaseStage | 'all';
  path: string;
  label: string;
}> = [
  { stage: 'all', path: '/my-cases', label: 'הכל' },
  { stage: 'profile_check', path: '/my-cases/profile-check', label: STAGE_LABELS.profile_check },
  { stage: 'background_check', path: '/my-cases/background', label: STAGE_LABELS.background_check },
  { stage: 'ready_to_meet', path: '/my-cases/ready-to-meet', label: STAGE_LABELS.ready_to_meet },
  { stage: 'meeting', path: '/my-cases/meeting', label: STAGE_LABELS.meeting },
];

export const MATCH_CASE_DASHBOARD_TABS: ReadonlyArray<{
  stage: CaseStage | 'closed';
  path: string;
  label: string;
}> = [
  { stage: 'profile_check', path: '/match-cases/profile-check', label: STAGE_LABELS.profile_check },
  { stage: 'background_check', path: '/match-cases/background', label: STAGE_LABELS.background_check },
  { stage: 'ready_to_meet', path: '/match-cases/ready-to-meet', label: STAGE_LABELS.ready_to_meet },
  { stage: 'meeting', path: '/match-cases/meeting', label: STAGE_LABELS.meeting },
  { stage: 'closed', path: '/match-cases/closed', label: 'סגור' },
];

export function getStageLabel(stage: CaseStage | null | undefined): string {
  if (!stage) return '';
  return STAGE_LABELS[stage] ?? stage;
}

export function getMatchStatusLabel(status: ShidduchStatus | null | undefined): string {
  if (!status) return '';
  return MATCH_STATUS_LABELS[status] ?? status;
}

export const MATCH_STATUS_ICONS: Record<ShidduchStatus, string> = {
  sent_to_shadchan: '🟡',
  waiting_for_other_side: '🟠',
  background_check: '🔵',
  waiting_for_meeting_approval: '🟣',
  meeting_scheduled: '🟢',
  waiting_after_meeting: '🟤',
  matched: '✅',
  denied: '❌',
  on_hold: '⏸',
  cancelled: '⚫',
};

export function getMatchStatusDisplay(status: ShidduchStatus | null | undefined): string {
  if (!status) return '';
  const icon = MATCH_STATUS_ICONS[status] ?? '';
  return `${icon} ${getMatchStatusLabel(status)}`.trim();
}

export function getMatchStatusClassName(status: ShidduchStatus): string {
  return `match-status-badge--${status.replace(/_/g, '-')}`;
}

export function getStageClassName(stage: CaseStage): string {
  return `case-stage-badge--${stage.replace(/_/g, '-')}`;
}

export function isTerminalMatchStatus(status: ShidduchStatus): boolean {
  return TERMINAL_SHIDDUCH_STATUSES.includes(status);
}

export function isCaseClosed(
  matchCase: Pick<MatchCase, 'viewerContext' | 'closedAt' | 'profileAStatus' | 'profileBStatus'>
): boolean {
  if (Boolean(matchCase.closedAt) || Boolean(matchCase.viewerContext?.isClosed)) {
    return true;
  }
  return (
    matchCase.profileAStatus === 'denied' ||
    matchCase.profileBStatus === 'denied' ||
    matchCase.viewerContext?.profileAStatus === 'denied' ||
    matchCase.viewerContext?.profileBStatus === 'denied'
  );
}

export function isWaitingOnMeFromContext(matchCase: Pick<MatchCase, 'viewerContext'>): boolean {
  return matchCase.viewerContext?.availableActions.canApprove ?? false;
}

export function getDashboardTabFromPath(pathname: string): CaseStage | 'closed' {
  if (pathname.includes('/background')) return 'background_check';
  if (pathname.includes('/ready-to-meet')) return 'ready_to_meet';
  if (pathname.includes('/meeting')) return 'meeting';
  if (pathname.includes('/closed')) return 'closed';
  return 'profile_check';
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

export function getPersonCasesTabFromPath(pathname: string): CaseStage | 'all' {
  if (pathname.includes('/profile-check')) return 'profile_check';
  if (pathname.includes('/background')) return 'background_check';
  if (pathname.includes('/ready-to-meet')) return 'ready_to_meet';
  if (pathname.includes('/meeting')) return 'meeting';
  return 'all';
}

export function decisionForStage(
  matchCase: Pick<MatchCase, 'profileAStatus' | 'profileBStatus'>,
  slot: 'A' | 'B'
): ProfileDecision {
  const status = slot === 'A' ? matchCase.profileAStatus : matchCase.profileBStatus;
  return status ?? 'waiting';
}

export const CASE_HISTORY_ACTION_LABELS: Record<CaseHistoryAction, string> = {
  'Case Created': 'תיק נוצר',
  'Profile Sent': 'פרופיל נשלח',
  'Accepted By Other Side': 'הצד השני אישר',
  'Background Check Approved': 'בדיקת רקע אושרה',
  'Entered Background Check': 'נכנס לשלב בדיקת רקע',
  'Viewed Contact Details': 'נצפו פרטי קשר',
  'Meeting Approved': 'פגישה אושרה',
  'Meeting Scheduled': 'פגישה נקבעה',
  'Meeting Completed': 'פגישה הושלמה',
  'Moved To On Hold': 'הועבר להמתנה',
  Denied: 'נדחה',
  Matched: 'הותאם',
  'Notes Added': 'נוספו הערות',
  'Status Changed': 'הסטטוס השתנה',
  Assigned: 'הוקצה',
  Reassigned: 'הוקצה מחדש',
  Cancelled: 'בוטל',
  Resumed: 'חודש',
};

export function getCaseHistoryActionLabel(action: string): string {
  const trimmed = action.trim();
  if (!trimmed) return trimmed;
  return CASE_HISTORY_ACTION_LABELS[trimmed as CaseHistoryAction] ?? trimmed;
}

export function getPersonSlotLabel(slot: PersonSlot | 'Shadchan' | string): string {
  switch (slot) {
    case 'PersonA':
      return 'משתתף/ת א׳';
    case 'PersonB':
      return 'משתתף/ת ב׳';
    case 'Shadchan':
      return 'שדכן/ית';
    default:
      return slot;
  }
}
