import { resolveKnownCoordinates } from '../constants/knownCityCoordinates';

export interface City {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
}

export interface PlaceImage {
  id: string;
  url: string;
  thumbUrl: string;
  photographer?: string;
  photographerUrl?: string;
  alt: string;
}

let citiesCache: City[] | null = null;
let citiesPromise: Promise<City[]> | null = null;
const cityLabelMap = new Map<string, string>();

function withKnownCoordinates(city: City): City {
  if (city.latitude != null && city.longitude != null) return city;
  const known = resolveKnownCoordinates(city.id);
  if (!known) return city;
  return {
    ...city,
    latitude: known.latitude,
    longitude: known.longitude,
  };
}

export function setCitiesCache(cities: City[]) {
  citiesCache = cities.map(withKnownCoordinates);
  cityLabelMap.clear();
  for (const city of citiesCache) {
    cityLabelMap.set(city.id, city.name);
  }
}

export function getCachedCities(): City[] {
  return citiesCache ?? [];
}

export function getCityLabel(cityId: string): string {
  if (!cityId) return '';
  return cityLabelMap.get(cityId) ?? cityId;
}

export function getCityById(cityId: string): City | undefined {
  const city = citiesCache?.find((entry) => entry.id === cityId);
  if (!city) {
    const known = resolveKnownCoordinates(cityId);
    if (!known) return undefined;
    return {
      id: cityId,
      name: cityLabelMap.get(cityId) ?? cityId,
      latitude: known.latitude,
      longitude: known.longitude,
    };
  }
  return withKnownCoordinates(city);
}

export function getCityCoordinates(
  cityId?: string | null,
  fallback?: { latitude?: number | null; longitude?: number | null } | null
): { latitude: number; longitude: number } | null {
  if (fallback?.latitude != null && fallback?.longitude != null) {
    return { latitude: fallback.latitude, longitude: fallback.longitude };
  }
  if (!cityId) return null;
  const city = getCityById(cityId);
  if (city?.latitude == null || city.longitude == null) return null;
  return { latitude: city.latitude, longitude: city.longitude };
}

/** Haversine distance in km — mirrors backend GeoService. */
export function distanceKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
}

export async function ensureCitiesLoaded(loader: () => Promise<City[]>): Promise<City[]> {
  if (citiesCache) return citiesCache;
  if (citiesPromise) return citiesPromise;
  citiesPromise = loader()
    .then((cities) => {
      setCitiesCache(cities);
      return citiesCache ?? cities;
    })
    .finally(() => {
      citiesPromise = null;
    });
  return citiesPromise;
}
