import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MemoryCache } from '../common/utils/memory-cache';
import { CityDto } from '../common/types/integrations.types';
import { GeoService } from '../geo/geo.service';
import { resolveKnownCoordinates } from './known-city-coordinates';

const DATA_GOV_BASE = 'https://data.gov.il/api/3/action/datastore_search';
/** Official CBS / Population Authority localities list (סמל + שם). */
const DEFAULT_RESOURCE_ID = '5c78e9fa-c2e2-4771-93ff-7f400a12f7ba';
const PAGE_SIZE = 1000;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface DataGovRecord {
  _id?: number;
  סמל_ישוב?: number | string;
  שם_ישוב?: string;
  [key: string]: unknown;
}

@Injectable()
export class CitiesService {
  private readonly logger = new Logger(CitiesService.name);
  private readonly cache = new MemoryCache<CityDto[]>(CACHE_TTL_MS);
  private inflight: Promise<CityDto[]> | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly geoService: GeoService,
  ) {}

  async getCities(): Promise<CityDto[]> {
    const cached = this.cache.get();
    if (cached) return cached;

    if (this.inflight) return this.inflight;

    this.inflight = this.fetchAndNormalize()
      .then((cities) => this.cache.set(cities))
      .finally(() => {
        this.inflight = null;
      });

    return this.inflight;
  }

  async getCityById(id: string): Promise<CityDto | null> {
    const cities = await this.getCities();
    return cities.find((city) => city.id === id) ?? null;
  }

  async searchCities(query: string, limit = 30): Promise<CityDto[]> {
    const q = query.trim();
    const cities = await this.getCities();
    if (!q) return cities.slice(0, limit);
    const lower = q.toLowerCase();
    return cities
      .filter((city) => city.name.includes(q) || city.name.toLowerCase().includes(lower) || city.id === q)
      .slice(0, limit);
  }

  async resolveCoordinates(cityId: string): Promise<CityDto | null> {
    const id = String(cityId ?? '').trim();
    if (!id) return null;

    const known = resolveKnownCoordinates(id);
    const city = await this.getCityById(id);

    if (!city) {
      if (known) {
        return {
          id,
          name: id,
          latitude: known.latitude,
          longitude: known.longitude,
        };
      }
      return null;
    }

    if (city.latitude != null && city.longitude != null) return city;

    if (known) {
      city.latitude = known.latitude;
      city.longitude = known.longitude;
      return city;
    }

    const geocoded = await this.geoService.geocodePlace(`${city.name}, ישראל`);
    if (!geocoded) return city;

    city.latitude = geocoded.latitude;
    city.longitude = geocoded.longitude;
    return city;
  }

  private async fetchAndNormalize(): Promise<CityDto[]> {
    const resourceId =
      this.configService.get<string>('ISRAEL_CITIES_RESOURCE_ID')?.trim() ||
      DEFAULT_RESOURCE_ID;

    try {
      const records = await this.fetchAllRecords(resourceId);
      const byId = new Map<string, CityDto>();

      for (const record of records) {
        const id = String(record.סמל_ישוב ?? '').trim();
        const name = String(record.שם_ישוב ?? '')
          .replace(/\s+/g, ' ')
          .trim();
        if (!id || !name || name === 'לא יישום') continue;

        if (!byId.has(id)) {
          const known = resolveKnownCoordinates(id);
          byId.set(id, {
            id,
            name,
            latitude: known?.latitude ?? null,
            longitude: known?.longitude ?? null,
          });
        }
      }

      const cities = Array.from(byId.values()).sort((a, b) =>
        a.name.localeCompare(b.name, 'he'),
      );

      if (cities.length === 0) {
        throw new ServiceUnavailableException('רשימת היישובים ריקה');
      }

      this.logger.log(`Loaded ${cities.length} Israeli localities`);
      return cities;
    } catch (error) {
      this.logger.error('Failed to load cities from data.gov.il', error as Error);
      const stale = this.cache.get();
      if (stale) return stale;
      throw new ServiceUnavailableException('לא ניתן לטעון את רשימת היישובים כרגע');
    }
  }

  private async fetchAllRecords(resourceId: string): Promise<DataGovRecord[]> {
    const all: DataGovRecord[] = [];
    let offset = 0;

    for (;;) {
      const url = new URL(DATA_GOV_BASE);
      url.searchParams.set('resource_id', resourceId);
      url.searchParams.set('limit', String(PAGE_SIZE));
      url.searchParams.set('offset', String(offset));

      const response = await fetch(url.toString(), {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`data.gov.il HTTP ${response.status}`);
      }

      const payload = (await response.json()) as {
        success?: boolean;
        result?: { records?: DataGovRecord[]; total?: number };
      };

      if (!payload.success || !payload.result?.records) {
        throw new Error('data.gov.il returned an unsuccessful payload');
      }

      all.push(...payload.result.records);
      offset += payload.result.records.length;

      const total = payload.result.total ?? all.length;
      if (offset >= total || payload.result.records.length === 0) break;
    }

    return all;
  }
}
