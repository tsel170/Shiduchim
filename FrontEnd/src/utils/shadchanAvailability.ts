import { ShadchanSummary } from '../types/account';
import { FullProfile } from '../types/profile';

export type ShadchanPickerGroupId = 'profile' | 'linked' | 'database';

export interface ShadchanPickerGroup {
  id: ShadchanPickerGroupId;
  title: string;
  shadchanim: ShadchanSummary[];
}

function findShadchanById(
  accountId: string,
  linkedShadchanim: ShadchanSummary[],
  allShadchanim: ShadchanSummary[]
): ShadchanSummary | undefined {
  return (
    allShadchanim.find((shadchan) => shadchan.accountId === accountId) ??
    linkedShadchanim.find((shadchan) => shadchan.accountId === accountId)
  );
}

/** Returns 1–3 visible sections: profile shadchan, user's shadchanim, and always the full database list. */
export function getShadchanPickerGroups(
  profile: FullProfile,
  linkedShadchanim: ShadchanSummary[],
  allShadchanim: ShadchanSummary[]
): ShadchanPickerGroup[] {
  const groups: ShadchanPickerGroup[] = [];

  const addedById = profile.addedByShadchanId?.trim();
  if (addedById) {
    const profileShadchan = findShadchanById(addedById, linkedShadchanim, allShadchanim);
    if (profileShadchan) {
      groups.push({
        id: 'profile',
        title: 'שדכן/ית הפרופיל',
        shadchanim: [profileShadchan],
      });
    }
  }

  if (linkedShadchanim.length > 0) {
    groups.push({
      id: 'linked',
      title: 'השדכנים שלי',
      shadchanim: linkedShadchanim,
    });
  }

  groups.push({
    id: 'database',
    title: 'שדכנים במערכת',
    shadchanim: allShadchanim,
  });

  return groups;
}

export function getDefaultShadchanSelection(groups: ShadchanPickerGroup[]): string {
  const priority: ShadchanPickerGroupId[] = ['profile', 'linked', 'database'];
  for (const groupId of priority) {
    const group = groups.find((entry) => entry.id === groupId);
    const first = group?.shadchanim[0];
    if (first) return first.accountId;
  }
  return '';
}

export function getVisibleShadchanPickerGroups(groups: ShadchanPickerGroup[]): ShadchanPickerGroup[] {
  return groups.filter(
    (group) => group.id === 'database' || group.shadchanim.length > 0
  );
}
