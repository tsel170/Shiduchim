import { apiRequest } from './apiClient';
import { PlaceImage } from '../utils/citiesStore';

let pigeonCache: PlaceImage[] | null = null;
let pigeonPromise: Promise<PlaceImage[]> | null = null;

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
        pigeonCache = images;
        return images;
      })
      .finally(() => {
        pigeonPromise = null;
      });

    const images = await pigeonPromise;
    return images.slice(0, count);
  },

  async randomPigeon(): Promise<PlaceImage | null> {
    const images = await this.listPigeons();
    if (!images.length) return null;
    return images[Math.floor(Math.random() * images.length)] ?? null;
  },

  getCached(): PlaceImage[] {
    return pigeonCache ?? [];
  },
};
