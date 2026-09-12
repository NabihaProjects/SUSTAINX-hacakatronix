// SOIL IQ - Soil Spatial Estimator & Interpolation Service
// Transparent nearest-neighbor & inverse-distance weighted estimation for unsampled grids

export interface ValidatedSamplePoint {
  sampleCode: string;
  latitude: number;
  longitude: number;
  nValue: number;
  pValue: number;
  kValue: number;
  phValue: number;
  ecValue: number;
  measuredAt: Date;
  quality: string;
}

export interface SpatialEstimationOutput {
  classification: 'DIRECT' | 'ESTIMATED' | 'NO_DATA';
  source: 'LAB_SOIL_TEST' | 'ESTIMATED' | 'SIMULATION';
  confidenceScore: number; // 0.0 - 1.0
  nValue: number;
  pValue: number;
  kValue: number;
  phValue: number;
  ecValue: number;
  nearestSampleDistanceMeters: number;
  nearestSampleCode?: string;
  rationale: string;
}

export class SoilSpatialEstimatorService {
  /**
   * Approximate Euclidean distance in meters on Earth for localized agricultural parcels
   */
  static distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const dLat = (lat2 - lat1) * 111139;
    const dLon = (lon2 - lon1) * 111139 * Math.cos(((lat1 + lat2) / 2) * (Math.PI / 180));
    return Math.sqrt(dLat * dLat + dLon * dLon);
  }

  /**
   * Estimate nutrient state for target coordinates based on available validated samples
   */
  static estimateGridNutrients(
    targetLat: number,
    targetLon: number,
    availableSamples: ValidatedSamplePoint[],
    maxEstimationRadiusMeters = 350
  ): SpatialEstimationOutput {
    if (!availableSamples || availableSamples.length === 0) {
      return {
        classification: 'NO_DATA',
        source: 'ESTIMATED',
        confidenceScore: 0.3,
        nValue: 180.0, // Default regional baseline fallback
        pValue: 35.0,
        kValue: 200.0,
        phValue: 6.5,
        ecValue: 1.0,
        nearestSampleDistanceMeters: Infinity,
        rationale: 'No validated soil samples found for this parcel. Regional baseline estimate applied.',
      };
    }

    // Find nearest validated sample
    let nearestSample = availableSamples[0];
    let minDistance = this.distanceMeters(targetLat, targetLon, nearestSample.latitude, nearestSample.longitude);

    for (let i = 1; i < availableSamples.length; i++) {
      const dist = this.distanceMeters(targetLat, targetLon, availableSamples[i].latitude, availableSamples[i].longitude);
      if (dist < minDistance) {
        minDistance = dist;
        nearestSample = availableSamples[i];
      }
    }

    // Direct sample check: within 15 meters considered direct sample for the grid cell center
    if (minDistance <= 15.0) {
      return {
        classification: 'DIRECT',
        source: 'LAB_SOIL_TEST',
        confidenceScore: 0.95,
        nValue: nearestSample.nValue,
        pValue: nearestSample.pValue,
        kValue: nearestSample.kValue,
        phValue: nearestSample.phValue,
        ecValue: nearestSample.ecValue,
        nearestSampleDistanceMeters: Number(minDistance.toFixed(1)),
        nearestSampleCode: nearestSample.sampleCode,
        rationale: `Direct laboratory core sample ${nearestSample.sampleCode} located within grid cell (${minDistance.toFixed(1)}m).`,
      };
    }

    // If beyond maximum search radius, flag NO_DATA
    if (minDistance > maxEstimationRadiusMeters) {
      return {
        classification: 'NO_DATA',
        source: 'ESTIMATED',
        confidenceScore: 0.4,
        nValue: nearestSample.nValue,
        pValue: nearestSample.pValue,
        kValue: nearestSample.kValue,
        phValue: nearestSample.phValue,
        ecValue: nearestSample.ecValue,
        nearestSampleDistanceMeters: Number(minDistance.toFixed(1)),
        nearestSampleCode: nearestSample.sampleCode,
        rationale: `Nearest sample (${nearestSample.sampleCode}) is ${minDistance.toFixed(0)}m away, exceeding reliable correlation radius (${maxEstimationRadiusMeters}m). Fresh sampling required.`,
      };
    }

    // Inverse Distance Weighting across top 3 neighbors within radius
    const neighbors = availableSamples
      .map((s) => ({
        ...s,
        dist: this.distanceMeters(targetLat, targetLon, s.latitude, s.longitude),
      }))
      .filter((s) => s.dist <= maxEstimationRadiusMeters)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 3);

    let totalWeight = 0;
    let weightedN = 0;
    let weightedP = 0;
    let weightedK = 0;
    let weightedPh = 0;
    let weightedEc = 0;

    for (const nb of neighbors) {
      const weight = 1 / Math.max(1, nb.dist);
      totalWeight += weight;
      weightedN += nb.nValue * weight;
      weightedP += nb.pValue * weight;
      weightedK += nb.kValue * weight;
      weightedPh += nb.phValue * weight;
      weightedEc += nb.ecValue * weight;
    }

    // Confidence drops with distance: 0.85 at 20m down to 0.55 at 350m
    const distancePenalty = (minDistance / maxEstimationRadiusMeters) * 0.35;
    const confidenceScore = Number((0.9 - distancePenalty).toFixed(2));

    return {
      classification: 'ESTIMATED',
      source: 'ESTIMATED',
      confidenceScore,
      nValue: Number((weightedN / totalWeight).toFixed(1)),
      pValue: Number((weightedP / totalWeight).toFixed(1)),
      kValue: Number((weightedK / totalWeight).toFixed(1)),
      phValue: Number((weightedPh / totalWeight).toFixed(2)),
      ecValue: Number((weightedEc / totalWeight).toFixed(2)),
      nearestSampleDistanceMeters: Number(minDistance.toFixed(1)),
      nearestSampleCode: nearestSample.sampleCode,
      rationale: `Estimated via inverse-distance weighting from ${neighbors.length} adjacent validated samples. Nearest: ${nearestSample.sampleCode} (${minDistance.toFixed(0)}m).`,
    };
  }
}
