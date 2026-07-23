import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MemoryCache } from '../common/utils/memory-cache';
import { PlaceImageDto } from '../common/types/integrations.types';

const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const DEFAULT_COUNT = 20;

interface UnsplashPhoto {
  id: string;
  alt_description?: string | null;
  urls?: { regular?: string; small?: string };
  user?: { name?: string; links?: { html?: string } };
}

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);
  private readonly cache = new MemoryCache<PlaceImageDto[]>(CACHE_TTL_MS);
  private inflight: Promise<PlaceImageDto[]> | null = null;

  constructor(private readonly configService: ConfigService) {}

  async getPigeonImages(count = DEFAULT_COUNT): Promise<PlaceImageDto[]> {
    const cached = this.cache.get();
    if (cached?.length) {
      return cached.slice(0, count);
    }

    if (this.inflight) {
      const images = await this.inflight;
      return images.slice(0, count);
    }

    this.inflight = this.fetchPigeonOrDove()
      .then((images) => this.cache.set(images))
      .finally(() => {
        this.inflight = null;
      });

    const images = await this.inflight;
    return images.slice(0, count);
  }

  async getRandomPigeonImage(): Promise<PlaceImageDto | null> {
    const images = await this.getPigeonImages();
    if (!images.length) return null;
    const index = Math.floor(Math.random() * images.length);
    return images[index] ?? null;
  }

  private async fetchPigeonOrDove(): Promise<PlaceImageDto[]> {
    let images = await this.searchUnsplash('Pigeon');
    if (!images.length) {
      images = await this.searchUnsplash('Dove');
    }
    if (!images.length) {
      throw new ServiceUnavailableException('לא נמצאו תמונות יונים כרגע');
    }
    return images;
  }

  private async searchUnsplash(query: string): Promise<PlaceImageDto[]> {
    const accessKey = this.configService.get<string>('UNSPLASH_ACCESS_KEY')?.trim();
    if (!accessKey) {
      this.logger.warn('UNSPLASH_ACCESS_KEY is not set — returning empty image list');
      return [];
    }

    try {
      const url = new URL('https://api.unsplash.com/search/photos');
      url.searchParams.set('query', query);
      url.searchParams.set('per_page', String(DEFAULT_COUNT));
      url.searchParams.set('orientation', 'squarish');

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
          'Accept-Version': 'v1',
        },
      });

      if (!response.ok) {
        throw new Error(`Unsplash HTTP ${response.status}`);
      }

      const payload = (await response.json()) as { results?: UnsplashPhoto[] };
      return (payload.results ?? [])
        .filter((photo) => photo.urls?.regular || photo.urls?.small)
        .map((photo) => ({
          id: photo.id,
          url: photo.urls?.regular ?? photo.urls?.small ?? '',
          thumbUrl: photo.urls?.small ?? photo.urls?.regular ?? '',
          photographer: photo.user?.name,
          photographerUrl: photo.user?.links?.html,
          alt: photo.alt_description?.trim() || query,
        }));
    } catch (error) {
      this.logger.error(`Unsplash search failed for "${query}"`, error as Error);
      return [];
    }
  }
}
