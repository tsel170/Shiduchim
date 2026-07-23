import { Injectable, Logger } from '@nestjs/common';
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

/**
 * Browser-friendly Commons URLs (Special:FilePath) when Unsplash key is missing.
 * Local frontend also has /pigeons/*.svg as a final fallback.
 */
const FALLBACK_PIGEON_IMAGES: PlaceImageDto[] = [
  {
    id: 'wm-rock-doves-flight',
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Rock_doves_in_flight.jpg?width=960',
    thumbUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Rock_doves_in_flight.jpg?width=640',
    photographer: 'Charles J. Sharp',
    photographerUrl: 'https://commons.wikimedia.org/wiki/File:Rock_doves_in_flight.jpg',
    alt: 'יונים בתעופה',
  },
  {
    id: 'wm-rock-pigeon',
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Rock_Pigeon_Columba_livia.jpg?width=960',
    thumbUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Rock_Pigeon_Columba_livia.jpg?width=640',
    photographer: 'Muhammad Mahdi Karim',
    photographerUrl: 'https://commons.wikimedia.org/wiki/File:Rock_Pigeon_Columba_livia.jpg',
    alt: 'יונת סלע',
  },
  {
    id: 'wm-common-pigeon',
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Rock_pigeon_or_common_pigeon_(Columba_livia).jpg?width=960',
    thumbUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Rock_pigeon_or_common_pigeon_(Columba_livia).jpg?width=640',
    photographer: 'Wikimedia Commons',
    photographerUrl:
      'https://commons.wikimedia.org/wiki/File:Rock_pigeon_or_common_pigeon_(Columba_livia).jpg',
    alt: 'יונה מצויה',
  },
  {
    id: 'wm-mourning-dove',
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mourning_dove_perched_(61179).jpg?width=960',
    thumbUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Mourning_dove_perched_(61179).jpg?width=640',
    photographer: 'Rhododendrites',
    photographerUrl:
      'https://commons.wikimedia.org/wiki/File:Mourning_dove_perched_(61179).jpg',
    alt: 'תור',
  },
];

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
    if (images.length) {
      this.logger.log(`Loaded ${images.length} pigeon/dove images from Unsplash`);
      return images;
    }

    this.logger.warn(
      'Using Commons pigeon fallbacks (set UNSPLASH_ACCESS_KEY for Unsplash photos)',
    );
    return FALLBACK_PIGEON_IMAGES;
  }

  private async searchUnsplash(query: string): Promise<PlaceImageDto[]> {
    const accessKey = this.configService.get<string>('UNSPLASH_ACCESS_KEY')?.trim();
    if (!accessKey) {
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
