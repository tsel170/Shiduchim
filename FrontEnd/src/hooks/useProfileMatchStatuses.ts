import { useEffect, useState } from 'react';
import { matchCasesApi } from '../api/matchCasesApi';
import { MatchStatus, ProfileMatchStatus } from '../types/matchCase';

export function useProfileMatchStatuses(
  profileIds: string[],
  accountId?: string | null
) {
  const [statusByProfileId, setStatusByProfileId] = useState<
    Record<string, ProfileMatchStatus>
  >({});

  const profileIdsKey = profileIds.join(',');

  useEffect(() => {
    if (!accountId) {
      setStatusByProfileId({});
      return;
    }

    const ids = Array.from(new Set(profileIds.filter(Boolean)));
    if (ids.length === 0) {
      setStatusByProfileId({});
      return;
    }

    let cancelled = false;
    matchCasesApi
      .getProfileStatuses(ids)
      .then((statuses) => {
        if (cancelled) return;
        setStatusByProfileId(
          Object.fromEntries(statuses.map((entry) => [entry.profileId, entry]))
        );
      })
      .catch(() => {
        if (!cancelled) setStatusByProfileId({});
      });

    return () => {
      cancelled = true;
    };
  }, [accountId, profileIdsKey, profileIds]);

  return statusByProfileId;
}

export function getProfileMatchStatusLabel(
  statusByProfileId: Record<string, ProfileMatchStatus>,
  profileId: string
): MatchStatus | null {
  return statusByProfileId[profileId]?.currentStatus ?? null;
}
