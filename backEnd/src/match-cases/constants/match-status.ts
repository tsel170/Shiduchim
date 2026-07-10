/**
 * @deprecated Use shidduch-workflow.ts — kept as alias layer for existing imports.
 */
export {
  SHIDDUCH_STATUSES as MATCH_STATUSES,
  type ShidduchStatus as MatchStatus,
  MATCH_PRIORITIES,
  type MatchPriority,
  PERSON_CASE_ACTIONS,
  type PersonCaseAction,
  CASE_HISTORY_ACTIONS,
  type CaseHistoryAction,
  SHADCHAN_ALLOWED_TRANSITIONS,
  isShadchanTransitionAllowed,
  canPersonActOnCase,
  getShadchanPipelineNext,
  SHADCHAN_PIPELINE_NEXT,
  isCaseVisibleToAccount,
  isShadchanPushCase,
  TERMINAL_SHIDDUCH_STATUSES,
  normalizeShidduchStatus,
  isTerminalShidduchStatus,
  canViewContactDetails,
  type WaitingForTarget,
  WAITING_FOR_TARGETS,
  resolvePersonAction,
  initialStatusForCreate,
} from './shidduch-workflow';

// Legacy person-action resolver removed — use resolvePersonAction in shidduch-workflow.ts

export function isReopenTransition(): boolean {
  return false;
}

export function resolvePersonActionTransition(): null {
  return null;
}
