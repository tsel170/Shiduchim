import { apiRequest } from './apiClient';
import {
  City,
  ensureCitiesLoaded,
  getCachedCities,
  setCitiesCache,
} from '../utils/citiesStore';

export const citiesApi = {
  async list(params?: { q?: string; limit?: number }): Promise<City[]> {
    if (!params?.q) {
      return ensureCitiesLoaded(async () => {
        const cities = await apiRequest<City[]>('/cities', {}, { skipAuth: true });
        setCitiesCache(cities);
        return cities;
      });
    }

    const query = new URLSearchParams();
    query.set('q', params.q);
    if (params.limit) query.set('limit', String(params.limit));
    return apiRequest<City[]>(`/cities?${query.toString()}`, {}, { skipAuth: true });
  },

  getCached(): City[] {
    return getCachedCities();
  },
};
