export const CASE_DOMAIN_EVENTS = {
  CASE_CREATED: 'CASE_CREATED',
  APPROVAL_REQUIRED: 'APPROVAL_REQUIRED',
  STAGE_CHANGED: 'STAGE_CHANGED',
  CONTACT_DETAILS_AVAILABLE: 'CONTACT_DETAILS_AVAILABLE',
  MEETING_REQUESTED: 'MEETING_REQUESTED',
  CASE_DENIED: 'CASE_DENIED',
  CASE_CANCELLED: 'CASE_CANCELLED',
} as const;

export type CaseDomainEventType =
  (typeof CASE_DOMAIN_EVENTS)[keyof typeof CASE_DOMAIN_EVENTS];

export interface CaseDomainEvent {
  type: CaseDomainEventType;
  caseId: string;
  payload?: Record<string, unknown>;
  occurredAt: Date;
}
