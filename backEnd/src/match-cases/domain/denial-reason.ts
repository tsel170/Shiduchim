export const DENIAL_REASONS = [
  'NotInterested',
  'NotSuitable',
  'Timing',
  'Other',
] as const;

export type DenialReason = (typeof DENIAL_REASONS)[number];

export const DENIAL_REASON_LABELS: Record<DenialReason, string> = {
  NotInterested: 'לא מעוניין/ת',
  NotSuitable: 'לא מתאים/ה',
  Timing: 'תזמון',
  Other: 'אחר',
};

export function denialReasonLabel(reason: DenialReason): string {
  return DENIAL_REASON_LABELS[reason] ?? reason;
}
