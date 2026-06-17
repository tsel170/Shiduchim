export function formatAccountName(
  firstName?: string | null,
  lastName?: string | null,
  fallback = ''
): string {
  const name = [firstName?.trim(), lastName?.trim()].filter(Boolean).join(' ');
  return name || fallback;
}

export function getShadchanDisplayName(shadchan: {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}): string {
  const fullName = formatAccountName(shadchan.firstName, shadchan.lastName);
  if (fullName) return fullName;

  const email = shadchan.email?.trim();
  if (!email) return 'שדכן/ית';

  const localPart = email.includes('@') ? email.split('@')[0]?.trim() : email;
  return localPart || 'שדכן/ית';
}

export function getShadchanInitial(shadchan: {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}): string {
  const displayName = getShadchanDisplayName(shadchan);
  if (displayName && displayName !== 'שדכן/ית') {
    return displayName.charAt(0).toUpperCase();
  }
  return 'ש';
}

export function getShadchanContactMeta(phone?: string | null): string | null {
  const trimmed = phone?.trim();
  return trimmed ? `טלפון: ${trimmed}` : null;
}

export function getAccountInitial(firstName?: string | null, fallback = '?'): string {
  const trimmed = firstName?.trim();
  if (trimmed) return trimmed.charAt(0).toUpperCase();
  return fallback.charAt(0).toUpperCase();
}
