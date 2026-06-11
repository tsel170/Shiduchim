import {
  SuggestionCheckStatus,
  SuggestionStage,
} from '../data/mockShadchanSuggestions';

const STAGE_LABELS: Record<SuggestionStage, string> = {
  new: 'הצעות חדשות',
  in_check: 'בבדיקה',
  checked: 'נבדקו',
};

const CHECK_STATUS_LABELS: Record<SuggestionCheckStatus, string> = {
  sending_profile: 'שליחת פרופיל',
  dor_yesharim_checking: 'בדיקת דור ישרים',
  phone_checking: 'בדיקת טלפון',
  ready_to_meet: 'מוכן/ה לפגישה',
  denied: 'נדחה',
};

export const SUGGESTION_STAGE_TABS: ReadonlyArray<{
  stage: SuggestionStage;
  path: string;
  label: string;
}> = [
  { stage: 'new', path: '/suggestions/new', label: STAGE_LABELS.new },
  { stage: 'in_check', path: '/suggestions/in-check', label: STAGE_LABELS.in_check },
  { stage: 'checked', path: '/suggestions/checked', label: STAGE_LABELS.checked },
];

export function getSuggestionStageLabel(stage: SuggestionStage): string {
  return STAGE_LABELS[stage];
}

export function getSuggestionCheckStatusLabel(status: SuggestionCheckStatus): string {
  return CHECK_STATUS_LABELS[status];
}

export function getSuggestionCheckStatusClassName(status: SuggestionCheckStatus): string {
  return `suggestion-status-badge--${status.replace(/_/g, '-')}`;
}

const STAGE_SUBTITLE: Record<SuggestionStage, (count: number) => string> = {
  new: (count) => `${count} הצעות חדשות`,
  in_check: (count) => `${count} הצעות בבדיקה`,
  checked: (count) => `${count} הצעות שנבדקו`,
};

export function getSuggestionStageSubtitle(stage: SuggestionStage, count: number): string {
  return STAGE_SUBTITLE[stage](count);
}

const STAGE_EMPTY_MESSAGE: Record<SuggestionStage, string> = {
  new: 'אין הצעות חדשות כרגע.',
  in_check: 'אין הצעות בבדיקה כרגע.',
  checked: 'אין הצעות שנבדקו עדיין.',
};

export function getSuggestionStageEmptyMessage(stage: SuggestionStage): string {
  return STAGE_EMPTY_MESSAGE[stage];
}
