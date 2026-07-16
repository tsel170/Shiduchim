import { useState } from 'react';
import { getApiErrorMessage } from '../api/apiError';
import { matchCasesApi } from '../api/matchCasesApi';
import {
  CaseActionType,
  DenialReason,
  MatchCase,
  SimplePersonSlot,
} from '../types/matchCase';

export function useMatchCaseAction(onSuccess?: (matchCase: MatchCase) => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAction = async (
    caseId: string,
    input: {
      type: CaseActionType;
      slot?: SimplePersonSlot;
      denialReason?: DenialReason;
      note?: string;
    }
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await matchCasesApi.caseAction(caseId, input);
      onSuccess?.(updated);
      return updated;
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const approve = (caseId: string) => runAction(caseId, { type: 'approve' });

  const deny = (caseId: string, denialReason: DenialReason, note?: string) =>
    runAction(caseId, { type: 'deny', denialReason, note });

  const approveFor = (caseId: string, slot: SimplePersonSlot) =>
    runAction(caseId, { type: 'approve_for', slot });

  const releaseToPersonB = (caseId: string) =>
    runAction(caseId, { type: 'release_to_person_b' });

  const advanceStage = (caseId: string) =>
    runAction(caseId, { type: 'advance_stage' });

  return { isLoading, error, approve, deny, approveFor, releaseToPersonB, advanceStage, runAction, setError };
}
