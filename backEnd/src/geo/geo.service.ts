import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Coordinates } from '../common/types/integrations.types';

const GEOCODE_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const EARTH_RADIUS_KM = 6371;

@Injectable()
export class GeoService {
  private readonly logger = new Logger(GeoService.name);
  private readonly geocodeCache = new Map<string, Coordinates | null>();
  private readonly geocodeFetchedAt = new Map<string, number>();

  constructor(private readonly configService: ConfigService) {}

  /** Great-circle distance in kilometers (Haversine). */
  distanceKm(a: Coordinates, b: Coordinates): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(b.latitude - a.latitude);
    const dLng = toRad(b.longitude - a.longitude);
    const lat1 = toRad(a.latitude);
    const lat2 = toRad(b.latitude);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  isWithinDistance(
    origin: Coordinates,
    target: Coordinates,
    maxDistanceKm: number,
  ): boolean {
    if (maxDistanceKm <= 0) return true;
    return this.distanceKm(origin, target) <= maxDistanceKm;
  }

  filterByMaxDistance<T>(
    items: T[],
    getCoordinates: (item: T) => Coordinates | null | undefined,
    origin: Coordinates,
    maxDistanceKm: number,
  ): T[] {
    if (!Number.isFinite(maxDistanceKm) || maxDistanceKm <= 0) return items;
    return items.filter((item) => {
      const coords = getCoordinates(item);
      if (!coords) return false;
      return this.isWithinDistance(origin, coords, maxDistanceKm);
    });
  }

  /**
   * Geocode a place name. Prefers Google when keyed; falls back to Nominatim (OSM).
   */
  async geocodePlace(query: string): Promise<Coordinates | null> {
    const key = query.trim();
    if (!key) return null;

    const cachedAt = this.geocodeFetchedAt.get(key) ?? 0;
    if (this.geocodeCache.has(key) && Date.now() - cachedAt < GEOCODE_CACHE_TTL_MS) {
      return this.geocodeCache.get(key) ?? null;
    }

    const fromGoogle = await this.geocodeWithGoogle(key);
    if (fromGoogle) {
      this.geocodeCache.set(key, fromGoogle);
      this.geocodeFetchedAt.set(key, Date.now());
      return fromGoogle;
    }

    const fromNominatim = await this.geocodeWithNominatim(key);
    this.geocodeCache.set(key, fromNominatim);
    this.geocodeFetchedAt.set(key, Date.now());
    return fromNominatim;
  }

  private async geocodeWithGoogle(key: string): Promise<Coordinates | null> {
    const apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY')?.trim();
    if (!apiKey) return null;

    try {
      const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
      url.searchParams.set('address', key);
      url.searchParams.set('language', 'he');
      url.searchParams.set('region', 'il');
      url.searchParams.set('key', apiKey);

      const response = await fetch(url.toString());
      if (!response.ok) return null;

      const payload = (await response.json()) as {
        status: string;
        results?: Array<{ geometry?: { location?: { lat: number; lng: number } } }>;
      };

      if (payload.status !== 'OK' || !payload.results?.[0]?.geometry?.location) {
        return null;
      }

      const { lat, lng } = payload.results[0].geometry.location;
      return { latitude: lat, longitude: lng };
    } catch (error) {
      this.logger.warn(`Google geocode failed for "${key}"`, error as Error);
      return null;
    }
  }

  /** Free fallback so distance filter works without a Google key. */
  private async geocodeWithNominatim(key: string): Promise<Coordinates | null> {
    try {
      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.searchParams.set('q', key.includes('ישראל') ? key : `${key}, ישראל`);
      url.searchParams.set('format', 'json');
      url.searchParams.set('limit', '1');
      url.searchParams.set('countrycodes', 'il');

      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'Shiduchim/1.0 (local distance filter)',
          'Accept-Language': 'he',
        },
      });
      if (!response.ok) return null;

      const payload = (await response.json()) as Array<{ lat?: string; lon?: string }>;
      const hit = payload[0];
      if (!hit?.lat || !hit?.lon) return null;

      return {
        latitude: Number(hit.lat),
        longitude: Number(hit.lon),
      };
    } catch (error) {
      this.logger.warn(`Nominatim geocode failed for "${key}"`, error as Error);
      return null;
    }
  }

  /**
   * Future-ready hook for Google Distance Matrix (driving distance).
   * Currently returns Haversine when Matrix is unavailable.
   */
  async getDrivingDistanceKm(
    origin: Coordinates,
    destination: Coordinates,
  ): Promise<number | null> {
    const apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY')?.trim();
    if (!apiKey) {
      return this.distanceKm(origin, destination);
    }

    try {
      const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
      url.searchParams.set(
        'origins',
        `${origin.latitude},${origin.longitude}`,
      );
      url.searchParams.set(
        'destinations',
        `${destination.latitude},${destination.longitude}`,
      );
      url.searchParams.set('mode', 'driving');
      url.searchParams.set('language', 'he');
      url.searchParams.set('key', apiKey);

      const response = await fetch(url.toString());
      if (!response.ok) return this.distanceKm(origin, destination);

      const payload = (await response.json()) as {
        rows?: Array<{
          elements?: Array<{ status?: string; distance?: { value: number } }>;
        }>;
      };
      const meters = payload.rows?.[0]?.elements?.[0]?.distance?.value;
      if (meters == null) return this.distanceKm(origin, destination);
      return meters / 1000;
    } catch (error) {
      this.logger.error('Distance Matrix failed', error as Error);
      return this.distanceKm(origin, destination);
    }
  }
}
