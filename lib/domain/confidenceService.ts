// SOIL IQ - Confidence Scoring Engine
// Evaluates overall confidence level (LOW, MEDIUM, HIGH) based on data completeness and freshness.

export interface ConfidenceFactors {
  hasSoilTest: boolean;
  soilSampleAgeDays: number;
  soilMeasurementSource: 'SOIL_TEST' | 'SENSOR' | 'ESTIMATED';
  hasCropGrowthStage: boolean;
  hasApplicationHistory: boolean;
  environmentalRisk: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ConfidenceScoreResult {
  score: number; // 0.0 - 1.0
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  reasons: string[];
}

export class ConfidenceService {
  static evaluateConfidence(factors: ConfidenceFactors): ConfidenceScoreResult {
    let score = 0.5; // Baseline
    const reasons: string[] = [];

    // Soil test evaluation
    if (factors.hasSoilTest) {
      if (factors.soilMeasurementSource === 'SOIL_TEST') {
        if (factors.soilSampleAgeDays < 90) {
          score += 0.25;
          reasons.push('Recent laboratory soil test available (< 90 days).');
        } else if (factors.soilSampleAgeDays < 180) {
          score += 0.15;
          reasons.push('Laboratory soil test available (3-6 months old).');
        } else {
          score += 0.05;
          reasons.push('Soil test is older than 6 months.');
        }
      } else if (factors.soilMeasurementSource === 'SENSOR') {
        score += 0.15;
        reasons.push('In-situ soil sensor measurements available.');
      }
    } else {
      score -= 0.2;
      reasons.push('No empirical soil sample on record; relying on regional baseline.');
    }

    // Crop stage evaluation
    if (factors.hasCropGrowthStage) {
      score += 0.15;
      reasons.push('Specific crop growth stage accurately mapped.');
    } else {
      score -= 0.1;
      reasons.push('Crop growth stage unspecified; assuming vegetative median.');
    }

    // Application history evaluation
    if (factors.hasApplicationHistory) {
      score += 0.1;
      reasons.push('Complete cumulative nutrient ledger recorded for this cycle.');
    } else {
      reasons.push('No previous application ledger on record.');
    }

    // Environmental modifier penalty
    if (factors.environmentalRisk === 'HIGH') {
      score -= 0.15;
      reasons.push('High environmental volatility reduces field application predictability.');
    }

    const finalScore = Math.max(0.1, Math.min(0.99, Number(score.toFixed(2))));
    const level: 'LOW' | 'MEDIUM' | 'HIGH' =
      finalScore >= 0.8 ? 'HIGH' : finalScore >= 0.55 ? 'MEDIUM' : 'LOW';

    return {
      score: finalScore,
      level,
      reasons,
    };
  }
}
