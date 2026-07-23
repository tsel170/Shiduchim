export interface CityDto {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface DistanceFilterInput {
  origin: Coordinates;
  maxDistanceKm: number;
}

export interface PlaceImageDto {
  id: string;
  url: string;
  thumbUrl: string;
  photographer?: string;
  photographerUrl?: string;
  alt: string;
}
