// SOIL IQ - Unit Standardization & Geospatial Utilities
// Internal canonical units:
// Area: Hectares (ha)
// Nutrient rates: kg nutrient / hectare (kg/ha)
// Fertilizer rates: kg product / hectare (kg/ha)

export const HECTARE_TO_ACRE = 2.4710538;
export const ACRE_TO_HECTARE = 0.40468564;
export const SQ_METERS_PER_HECTARE = 10000;

export function hectaresToAcres(hectares: number): number {
  return Number((hectares * HECTARE_TO_ACRE).toFixed(2));
}

export function acresToHectares(acres: number): number {
  return Number((acres * ACRE_TO_HECTARE).toFixed(4));
}

export function formatArea(hectares: number, displayUnit: 'acre' | 'hectare' = 'acre'): string {
  if (displayUnit === 'acre') {
    return `${hectaresToAcres(hectares)} ac`;
  }
  return `${hectares.toFixed(2)} ha`;
}

/**
 * Calculates approximate area in hectares of a polygon defined by [longitude, latitude] coordinates
 * using spherical excess on Earth (WGS84 radius ~ 6378137m).
 */
export function calculatePolygonAreaHectares(coordinates: [number, number][]): number {
  if (!coordinates || coordinates.length < 3) return 0;

  const R = 6378137; // Earth radius in meters
  let total = 0;

  for (let i = 0; i < coordinates.length; i++) {
    const p1 = coordinates[i];
    const p2 = coordinates[(i + 1) % coordinates.length];

    const lon1 = (p1[0] * Math.PI) / 180;
    const lat1 = (p1[1] * Math.PI) / 180;
    const lon2 = (p2[0] * Math.PI) / 180;
    const lat2 = (p2[1] * Math.PI) / 180;

    total += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  const areaSqMeters = Math.abs((total * R * R) / 2.0);
  const hectares = areaSqMeters / SQ_METERS_PER_HECTARE;
  return Number(hectares.toFixed(4));
}

/**
 * Point-in-polygon algorithm (Ray casting)
 * point: [longitude, latitude]
 * vs: array of [longitude, latitude]
 */
export function isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  const x = point[0];
  const y = point[1];
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0],
      yi = polygon[i][1];
    const xj = polygon[j][0],
      yj = polygon[j][1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Standard Agricultural Spray Application Formula:
 * Application Rate (L/ha) = (Flow Rate (L/min) * 600) / (Speed (km/h) * Swath Width (m))
 */
export function calculateSprayApplicationRate(
  flowRateLpm: number,
  speedKmh: number,
  swathWidthM: number
): number {
  if (speedKmh <= 0 || swathWidthM <= 0) return 0;
  return Number(((flowRateLpm * 600) / (speedKmh * swathWidthM)).toFixed(2));
}

/**
 * Calculate pure elemental nutrient contribution from formulated product mass.
 * Example: 50 kg of NPK 19-19-19 contains 9.5 kg pure N.
 */
export function calculateNutrientFromProduct(
  productKg: number,
  percentage: number
): number {
  return Number(((productKg * percentage) / 100).toFixed(2));
}

/**
 * Agronomic Oxide-to-Elemental Conversions (ICAR / FAO Standard):
 * P = P2O5 * 0.4364 (or P2O5 = P * 2.2914)
 * K = K2O * 0.8302 (or K2O = K * 1.2046)
 */
export function pElementalToOxide(pKg: number): number {
  return Number((pKg * 2.2914).toFixed(3));
}

export function pOxideToElemental(p2o5Kg: number): number {
  return Number((p2o5Kg / 2.2914).toFixed(2));
}

export function kElementalToOxide(kKg: number): number {
  return Number((kKg * 1.2046).toFixed(3));
}

export function kOxideToElemental(k2oKg: number): number {
  return Number((k2oKg / 1.2046).toFixed(2));
}

