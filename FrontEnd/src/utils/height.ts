export function formatHeightCm(heightCm: number): string {
  return `${heightCm} ס"מ`;
}

export function formatHeightMeters(heightCm: number): string {
  return `${(heightCm / 100).toFixed(2)} מ'`;
}

export function formatHeightFeetInches(heightCm: number): string {
  const totalInches = heightCm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet} רגל ${inches} אינץ'`;
}

export function formatHeightAll(heightCm: number): string {
  return `${formatHeightCm(heightCm)} · ${formatHeightMeters(heightCm)}`;
}
