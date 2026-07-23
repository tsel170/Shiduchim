/** Shared known coordinates for major Israeli localities (CBS id). */
export const KNOWN_CITY_COORDINATES: Record<
  string,
  { latitude: number; longitude: number }
> = {
  '3000': { latitude: 31.7683, longitude: 35.2137 },
  '5000': { latitude: 32.0853, longitude: 34.7818 },
  '4000': { latitude: 32.794, longitude: 34.9896 },
  '9000': { latitude: 31.2518, longitude: 34.7913 },
  '7100': { latitude: 31.6688, longitude: 34.5743 },
  '70': { latitude: 31.8044, longitude: 34.6553 },
  '2600': { latitude: 29.5577, longitude: 34.9519 },
  '8000': { latitude: 32.9646, longitude: 35.496 },
  '7400': { latitude: 32.3215, longitude: 34.8532 },
  '7900': { latitude: 32.084, longitude: 34.8878 },
  '8300': { latitude: 31.9642, longitude: 34.8044 },
  '6100': { latitude: 32.0807, longitude: 34.8338 },
  '6600': { latitude: 32.0114, longitude: 34.7748 },
  '6200': { latitude: 32.0171, longitude: 34.7455 },
  '8600': { latitude: 32.0823, longitude: 34.8107 },
  '6400': { latitude: 32.1624, longitude: 34.8447 },
  '8700': { latitude: 32.1848, longitude: 34.8713 },
  '8400': { latitude: 31.8928, longitude: 34.8113 },
  '6700': { latitude: 32.7922, longitude: 35.5312 },
  '7600': { latitude: 32.9275, longitude: 35.0818 },
  '2610': { latitude: 31.7514, longitude: 34.9881 },
  '3794': { latitude: 31.897, longitude: 35.0104 },
};

export function resolveKnownCoordinates(cityId: string): {
  latitude: number;
  longitude: number;
} | null {
  return KNOWN_CITY_COORDINATES[String(cityId).trim()] ?? null;
}
