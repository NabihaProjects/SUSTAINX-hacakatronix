// SOIL IQ - Environmental Modifier Service
// Evaluates environmental and meteorological conditions to prevent fertilizer runoff,
// volatilization, leaching, or machine compaction.

export interface EnvironmentalCondition {
  rainProbabilityPct: number; // 0 - 100%
  expectedRainfallMm?: number;
  windSpeedKmh: number;
  temperatureC: number;
  soilMoisturePct: number;
}

export interface EnvironmentalEvaluation {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PROCEED' | 'CAUTION' | 'DEFER' | 'BLOCK';
  reason: string;
  recommendedAction: string;
  isFavorableForSpraying: boolean;
}

export class WeatherModifierService {
  static evaluateConditions(env: EnvironmentalCondition | null | undefined): EnvironmentalEvaluation {
    if (!env) {
      return {
        riskLevel: 'LOW',
        status: 'PROCEED',
        reason: 'No environmental constraints reported. Standard operational parameters apply.',
        recommendedAction: 'Proceed with scheduled application at calibrated nozzle pressure.',
        isFavorableForSpraying: true,
      };
    }

    // 1. High Rain Risk: Surface runoff and rapid leaching
    if (env.rainProbabilityPct > 70 || (env.expectedRainfallMm && env.expectedRainfallMm > 15)) {
      return {
        riskLevel: 'HIGH',
        status: 'DEFER',
        reason: `High precipitation forecast (${env.rainProbabilityPct}% chance, ${env.expectedRainfallMm ?? 0}mm). Surface runoff risk.`,
        recommendedAction: 'DEFER application until at least 24 hours after heavy precipitation.',
        isFavorableForSpraying: false,
      };
    }

    // 2. High Wind Risk: Spray drift to non-target areas
    if (env.windSpeedKmh > 25) {
      return {
        riskLevel: 'HIGH',
        status: 'BLOCK',
        reason: `Excessive wind speed (${env.windSpeedKmh} km/h exceeds 25 km/h limit). High spray drift hazard.`,
        recommendedAction: 'BLOCK spraying operations immediately to protect adjacent buffer zones and waterways.',
        isFavorableForSpraying: false,
      };
    }

    // 3. Saturated Soil: Rutting and anaerobic denitrification
    if (env.soilMoisturePct > 85) {
      return {
        riskLevel: 'HIGH',
        status: 'DEFER',
        reason: `Soil moisture is at saturation (${env.soilMoisturePct}%). Machine trafficking will cause severe soil compaction.`,
        recommendedAction: 'DEFER field entry until soil dries below field capacity (<= 75%).',
        isFavorableForSpraying: false,
      };
    }

    // 4. Moderate Rain / Wind: Caution
    if (env.rainProbabilityPct >= 40 || env.windSpeedKmh >= 18 || env.temperatureC > 35) {
      const issues: string[] = [];
      if (env.rainProbabilityPct >= 40) issues.push(`moderate rain risk (${env.rainProbabilityPct}%)`);
      if (env.windSpeedKmh >= 18) issues.push(`moderate wind (${env.windSpeedKmh} km/h)`);
      if (env.temperatureC > 35) issues.push(`high heat (${env.temperatureC}°C, foliar scorch risk)`);

      return {
        riskLevel: 'MEDIUM',
        status: 'CAUTION',
        reason: `Sub-optimal atmospheric conditions: ${issues.join(', ')}.`,
        recommendedAction: 'Operate with low-drift coarse nozzles at minimum boom height.',
        isFavorableForSpraying: true,
      };
    }

    return {
      riskLevel: 'LOW',
      status: 'PROCEED',
      reason: 'Atmospheric and soil conditions are optimal (low wind, stable moisture, no imminent rain).',
      recommendedAction: 'Proceed with prescription target application rate.',
      isFavorableForSpraying: true,
    };
  }
}
