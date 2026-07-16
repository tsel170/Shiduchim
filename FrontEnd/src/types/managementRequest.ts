import { ShadchanSummary } from './account';

export type ManagementRequestStatus = 'pending' | 'approved' | 'declined';

export type ManagementRequestResponse = 'approved' | 'declined';

export interface ManagementRequest {
  requestId: string;
  shadchanId: string;
  personAccountId: string;
  personProfileId: string;
  message: string;
  status: ManagementRequestStatus;
  createdAt: string;
  updatedAt: string;
  shadchan?: ShadchanSummary;
}

export interface ManagementRequestProfileContext {
  canSend: boolean;
  alreadyLinked: boolean;
  reason?: string | null;
  pendingRequest?: ManagementRequest | null;
}
