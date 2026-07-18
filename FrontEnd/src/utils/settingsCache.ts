import { DisplayPreferences, FilterConfiguration } from '../types/profile';
import { readLocalCache, writeLocalCache } from './localStore';

const CACHE_VERSION = 1;

type SettingsCache = {
  filters: FilterConfiguration;
  displayPreferences: DisplayPreferences;
};

function settingsKey(accountId: string): string {
  return `shiduchim.settings.v1:${accountId}`;
}

export function loadSettingsCache(accountId: string): SettingsCache | null {
  return readLocalCache<SettingsCache>(settingsKey(accountId), CACHE_VERSION);
}

export function saveSettingsCache(
  accountId: string,
  filters: FilterConfiguration,
  displayPreferences: DisplayPreferences
): void {
  writeLocalCache(settingsKey(accountId), CACHE_VERSION, { filters, displayPreferences });
}
