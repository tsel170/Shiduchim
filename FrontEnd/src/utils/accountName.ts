export function formatAccountName(
  firstName?: string | null,
  lastName?: string | null,
  fallback = ''
): string {
  const name = [firstName?.trim(), lastName?.trim()].filter(Boolean).join(' ');
  return name || fallback;
}

function formatEmailFallback(email: string, roleFallback: string): string {
  const localPart = email.includes('@')
    ? email.split('@')[0]?.trim()
    : email.trim();
  return localPart || roleFallback;
}

export function getUserDisplayLabel(user: {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  role?: 'person' | 'shadchan' | 'admin';
}): string {
  const fullName = formatAccountName(user.firstName, user.lastName);
  if (fullName) return fullName;

  const email = user.email?.trim();
  if (!email) {
    if (user.role === 'shadchan') return 'שדכן/ית';
    if (user.role === 'admin') return 'מנהל/ת';
    return 'משתמש/ת';
  }

  const roleFallback =
    user.role === 'shadchan' ? 'שדכן/ית' : user.role === 'admin' ? 'מנהל/ת' : 'משודך/ת';
  return formatEmailFallback(email, roleFallback);
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

  return formatEmailFallback(email, 'שדכן/ית');
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

export function getPersonDisplayName(person: {
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}): string {
  if (person.displayName?.trim()) return person.displayName.trim();

  const fullName = formatAccountName(person.firstName, person.lastName);
  if (fullName) return fullName;

  const email = person.email?.trim();
  if (!email) return 'משודך/ת';

  return formatEmailFallback(email, 'משודך/ת');
}

export function getPersonInitial(person: {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}): string {
  const displayName = getPersonDisplayName(person);
  if (displayName && displayName !== 'משודך/ת') {
    return displayName.charAt(0).toUpperCase();
  }
  return 'מ';
}

export function getAccountInitial(firstName?: string | null, fallback = '?'): string {
  const trimmed = firstName?.trim();
  if (trimmed) return trimmed.charAt(0).toUpperCase();
  return fallback.charAt(0).toUpperCase();
}
