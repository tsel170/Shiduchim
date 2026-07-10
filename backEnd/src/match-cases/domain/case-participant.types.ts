export const PARTICIPANT_ROLES = ['Person', 'Shadchan'] as const;
export type ParticipantRole = (typeof PARTICIPANT_ROLES)[number];

export const PERSON_SLOTS = ['PersonA', 'PersonB'] as const;
export type PersonSlot = (typeof PERSON_SLOTS)[number];

export const APPROVAL_STATUSES = ['Pending', 'Approved', 'Denied'] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export const WAITING_FOR_PARTICIPANTS = [
  'PersonA',
  'PersonB',
  'Shadchan',
  'Both',
] as const;
export type WaitingForParticipant = (typeof WAITING_FOR_PARTICIPANTS)[number];

export interface CaseParticipantData {
  accountId: string;
  profileId?: string | null;
  role: ParticipantRole;
  personSlot?: PersonSlot | null;
  approvalStatus: ApprovalStatus;
  approvedAt?: Date | null;
  approvedByAccountId?: string | null;
}

export type ViewerRole = 'PersonA' | 'PersonB' | 'Shadchan' | null;
