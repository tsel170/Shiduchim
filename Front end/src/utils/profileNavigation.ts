import { Location, NavigateFunction } from 'react-router-dom';

export interface ProfilePreviewLocationState {
  background: Location;
}

export interface OpenProfilePreviewOptions {
  caseId?: string;
  context?: string;
}

export function openProfilePreview(
  navigate: NavigateFunction,
  location: Location,
  profileId: string,
  options?: OpenProfilePreviewOptions
) {
  const search = new URLSearchParams();
  if (options?.caseId) search.set('caseId', options.caseId);
  if (options?.context) search.set('context', options.context);
  const suffix = search.toString() ? `?${search.toString()}` : '';

  navigate(`/profiles/${profileId}${suffix}`, {
    state: { background: location } satisfies ProfilePreviewLocationState,
  });
}

export function getLayoutPathname(location: Location): string {
  const state = location.state as ProfilePreviewLocationState | null;
  return state?.background?.pathname ?? location.pathname;
}

export function isProfilePreviewOpen(location: Location): boolean {
  const state = location.state as ProfilePreviewLocationState | null;
  return Boolean(state?.background && location.pathname.startsWith('/profiles/'));
}
