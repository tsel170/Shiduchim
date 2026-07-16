import { useCallback, useEffect, useState } from 'react';
import { getApiErrorMessage } from '../api/apiError';
import { matchCasesApi } from '../api/matchCasesApi';
import { CaseHistoryEntry, MatchCase } from '../types/matchCase';

export function useMatchCase(caseId: string | undefined) {
  const [matchCase, setMatchCase] = useState<MatchCase | null>(null);
  const [history, setHistory] = useState<CaseHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!caseId) return;
    setLoading(true);
    setError(null);
    try {
      const [detail, timeline] = await Promise.all([
        matchCasesApi.getById(caseId),
        matchCasesApi.getHistory(caseId),
      ]);
      setMatchCase(detail);
      setHistory(timeline);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setMatchCase(null);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { matchCase, setMatchCase, history, loading, error, reload };
}
