import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { FullProfile } from '../types/profile';
import { readLocalCache, removeLocalJson, writeLocalCache } from '../utils/localStore';

const DRAFT_VERSION = 1;
const AUTOSAVE_MS = 500;

type ProfileDraftPayload = {
  profile: FullProfile;
};

function draftKey(accountId: string, scope: string): string {
  return `shiduchim.profileDraft.v1:${accountId}:${scope}`;
}

/** Strip heavy photo payloads so localStorage stays within quota. */
export function toDraftSafeProfile(profile: FullProfile): FullProfile {
  return {
    ...profile,
    photos: [],
  };
}

export function loadProfileDraft(accountId: string, scope: string): FullProfile | null {
  const payload = readLocalCache<ProfileDraftPayload>(draftKey(accountId, scope), DRAFT_VERSION);
  return payload?.profile ?? null;
}

export function saveProfileDraft(accountId: string, scope: string, profile: FullProfile): void {
  writeLocalCache(draftKey(accountId, scope), DRAFT_VERSION, {
    profile: toDraftSafeProfile(profile),
  });
}

export function clearProfileDraft(accountId: string, scope: string): void {
  removeLocalJson(draftKey(accountId, scope));
}

/**
 * Profile form state with local draft autosave.
 * Restores a draft once per accountId+scope (e.g. profile id).
 */
export function useProfileDraft(options: {
  accountId?: string | null;
  scope: string;
  baseProfile: FullProfile;
  enabled?: boolean;
  skipRestore?: boolean;
}): {
  profile: FullProfile;
  setProfile: Dispatch<SetStateAction<FullProfile>>;
  draftRestored: boolean;
  clearDraft: () => void;
} {
  const {
    accountId,
    scope,
    baseProfile,
    enabled = true,
    skipRestore = false,
  } = options;

  const [profile, setProfile] = useState<FullProfile>(baseProfile);
  const [draftRestored, setDraftRestored] = useState(false);
  const hydratedKeyRef = useRef<string | null>(null);
  const skipNextAutosaveRef = useRef(false);
  const baseId = baseProfile.id;

  useEffect(() => {
    if (!enabled) return;

    const key = `${accountId ?? ''}:${scope}:${baseId}`;
    if (hydratedKeyRef.current === key) return;
    hydratedKeyRef.current = key;
    skipNextAutosaveRef.current = true;

    if (!accountId || skipRestore) {
      setProfile(baseProfile);
      setDraftRestored(false);
      return;
    }

    const draft = loadProfileDraft(accountId, scope);
    if (draft) {
      setProfile({
        ...baseProfile,
        ...draft,
        id: baseProfile.id,
        // Prefer server photos when present; drafts omit photos to save quota.
        photos: baseProfile.photos?.length ? baseProfile.photos : [],
      });
      setDraftRestored(true);
      return;
    }

    setProfile(baseProfile);
    setDraftRestored(false);
    // Intentionally depend on identity fields, not the whole baseProfile object.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once per scope/baseId
  }, [accountId, scope, baseId, enabled, skipRestore]);

  useEffect(() => {
    if (!enabled || !accountId) return;
    if (skipNextAutosaveRef.current) {
      skipNextAutosaveRef.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      saveProfileDraft(accountId, scope, profile);
    }, AUTOSAVE_MS);

    return () => window.clearTimeout(timer);
  }, [accountId, scope, profile, enabled]);

  const clearDraft = () => {
    if (accountId) clearProfileDraft(accountId, scope);
    setDraftRestored(false);
  };

  return { profile, setProfile, draftRestored, clearDraft };
}
