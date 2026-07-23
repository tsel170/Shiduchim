import { apiRequest } from './apiClient';
import { PlaceImage } from '../utils/citiesStore';

let pigeonCache: PlaceImage[] | null = null;
let pigeonPromise: Promise<PlaceImage[]> | null = null;

const LOCAL_PIGEONS: PlaceImage[] = [1, 2, 3, 4, 5, 6].map((n) => ({
  id: `local-pigeon-${n}`,
  url: `/pigeons/${n}.svg`,
  thumbUrl: `/pigeons/${n}.svg`,
  alt: 'יונה',
}));

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pickFrom(images: PlaceImage[], seed?: string | null): PlaceImage | null {
  if (!images.length) return null;
  if (!seed) {
    return images[Math.floor(Math.random() * images.length)] ?? null;
  }
  return images[hashSeed(seed) % images.length] ?? null;
}

export const imagesApi = {
  async listPigeons(count = 20): Promise<PlaceImage[]> {
    if (pigeonCache?.length) return pigeonCache.slice(0, count);
    if (pigeonPromise) {
      const images = await pigeonPromise;
      return images.slice(0, count);
    }

    pigeonPromise = apiRequest<PlaceImage[]>(
      `/images/pigeons?count=${count}`,
      {},
      { skipAuth: true }
    )
      .then((images) => {
        pigeonCache = images?.length ? images : LOCAL_PIGEONS;
        return pigeonCache;
      })
      .catch(() => {
        pigeonCache = LOCAL_PIGEONS;
        return pigeonCache;
      })
      .finally(() => {
        pigeonPromise = null;
      });

    const images = await pigeonPromise;
    return images.slice(0, count);
  },

  async pigeonFor(seed?: string | null): Promise<PlaceImage | null> {
    try {
      const images = await this.listPigeons();
      return pickFrom(images.length ? images : LOCAL_PIGEONS, seed);
    } catch {
      return pickFrom(LOCAL_PIGEONS, seed);
    }
  },

  async randomPigeon(): Promise<PlaceImage | null> {
    return this.pigeonFor(null);
  },

  getCached(): PlaceImage[] {
    return pigeonCache ?? LOCAL_PIGEONS;
  },
};
