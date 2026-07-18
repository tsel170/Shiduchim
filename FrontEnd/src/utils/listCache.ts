import { FavoriteProfile, FilterConfiguration, FullProfile } from '../types/profile';
import { readLocalCache, removeLocalJson, stableStringify, writeLocalCache } from './localStore';

const CACHE_VERSION = 1;

type BrowseCache = {
  profiles: FullProfile[];
};

type FavoritesCache = {
  favorites: FavoriteProfile[];
  profiles: FullProfile[];
};

function browseKey(accountId: string, filters: FilterConfiguration): string {
  return `shiduchim.browse.v1:${accountId}:${stableStringify(filters)}`;
}

function favoritesKey(accountId: string): string {
  return `shiduchim.favorites.v1:${accountId}`;
}

export function loadBrowseCache(
  accountId: string,
  filters: FilterConfiguration
): FullProfile[] | null {
  return readLocalCache<BrowseCache>(browseKey(accountId, filters), CACHE_VERSION)?.profiles ?? null;
}

export function saveBrowseCache(
  accountId: string,
  filters: FilterConfiguration,
  profiles: FullProfile[]
): void {
  writeLocalCache(browseKey(accountId, filters), CACHE_VERSION, { profiles });
}

export function loadFavoritesCache(accountId: string): FavoritesCache | null {
  return readLocalCache<FavoritesCache>(favoritesKey(accountId), CACHE_VERSION);
}

export function saveFavoritesCache(
  accountId: string,
  favorites: FavoriteProfile[],
  profiles: FullProfile[]
): void {
  writeLocalCache(favoritesKey(accountId), CACHE_VERSION, { favorites, profiles });
}

export function clearAccountListCaches(accountId: string): void {
  // Best-effort: clear known favorites key; browse keys vary by filter signature.
  removeLocalJson(favoritesKey(accountId));
}
