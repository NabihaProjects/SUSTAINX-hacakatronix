// SOIL IQ - Soil Sampling Recommendation Service
// Identifies field zones where soil sampling produces maximum agronomic return

export interface SamplingCandidate {
  gridCode: string;
  fieldId: string;
  fieldName: string;
  crop: string;
  currentStatus: 'DIRECT' | 'ESTIMATED' | 'NO_DATA';
  dataAgeDays: number;
  confidenceScore: number;
  nearestSampleDistanceMeters: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedAction: string;
  recommendedDepthCm: string;
  rationale: string;
}

export class SoilSamplingRecommendationService {
  /**
   * Evaluate a grid for sampling priority
   */
  static evaluateGrid(params: {
    gridCode: string;
    fieldId: string;
    fieldName: string;
    crop: string;
    hasDirectSample: boolean;
    dataAgeDays: number;
    confidenceScore: number;
    distanceToNearestSampleMeters: number;
  }): SamplingCandidate {
    let priority: SamplingCandidate['priority'] = 'LOW';
    let rationale = 'Soil data confidence and spatial coverage are adequate.';
    let recommendedAction = 'Routine seasonal monitoring.';
    const recommendedDepthCm = '0–15 cm (Topsoil root zone)';

    if (!params.hasDirectSample && params.distanceToNearestSampleMeters > 250) {
      priority = 'HIGH';
      rationale = `No direct sample exists, and nearest validated assay is ${Math.round(params.distanceToNearestSampleMeters)}m away (> 250m threshold). High spatial uncertainty.`;
      recommendedAction = 'Collect 5-core composite soil sample before next fertilizer pass.';
    } else if (params.dataAgeDays > 365) {
      priority = 'HIGH';
      rationale = `Existing soil assay is ${params.dataAgeDays} days old (> 1 year). Mineralization and residual nutrient depletion require re-calibration.`;
      recommendedAction = 'Collect fresh post-harvest core sample for full NPK + OC testing.';
    } else if (!params.hasDirectSample || params.confidenceScore < 0.75) {
      priority = 'MEDIUM';
      rationale = `Currently relying on spatial interpolation (confidence ${Math.round(params.confidenceScore * 100)}%). Direct testing will improve prescription precision.`;
      recommendedAction = 'Schedule targeted soil core during next routine field scouting.';
    }

    return {
      gridCode: params.gridCode,
      fieldId: params.fieldId,
      fieldName: params.fieldName,
      crop: params.crop,
      currentStatus: params.hasDirectSample ? 'DIRECT' : params.distanceToNearestSampleMeters < 350 ? 'ESTIMATED' : 'NO_DATA',
      dataAgeDays: params.dataAgeDays,
      confidenceScore: params.confidenceScore,
      nearestSampleDistanceMeters: Math.round(params.distanceToNearestSampleMeters),
      priority,
      recommendedAction,
      recommendedDepthCm,
      rationale,
    };
  }

  /**
   * Generate recommendations across a collection of field grids
   */
  static generateFieldRecommendations(
    grids: Array<{ gridId?: string; gridCode: string; latitude: number; longitude: number; fieldId?: string; fieldName?: string; crop?: string }>,
    samples: Array<{ latitude: number; longitude: number; measuredAt?: Date }>
  ): SamplingCandidate[] {
    const candidates = grids.map((grid) => {
      let minDistance = Infinity;
      let oldestSampleDays = 0;
      for (const s of samples) {
        const dist = Math.sqrt(
          Math.pow((grid.latitude - s.latitude) * 111139, 2) +
          Math.pow((grid.longitude - s.longitude) * 111139 * Math.cos(grid.latitude * (Math.PI / 180)), 2)
        );
        if (dist < minDistance) {
          minDistance = dist;
          if (s.measuredAt) {
            oldestSampleDays = Math.floor((Date.now() - new Date(s.measuredAt).getTime()) / 86400000);
          }
        }
      }

      return this.evaluateGrid({
        gridCode: grid.gridCode,
        fieldId: grid.fieldId || 'field-1',
        fieldName: grid.fieldName || 'Field',
        crop: grid.crop || 'Corn',
        hasDirectSample: minDistance <= 15,
        dataAgeDays: oldestSampleDays,
        confidenceScore: minDistance <= 15 ? 0.95 : minDistance <= 250 ? 0.75 : 0.4,
        distanceToNearestSampleMeters: minDistance === Infinity ? 999 : minDistance,
      });
    });

    return this.rankCandidates(candidates);
  }

  /**
   * Rank all grid candidates by sampling urgency
   */
  static rankCandidates(candidates: SamplingCandidate[]): SamplingCandidate[] {
    const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    return [...candidates].sort((a, b) => {
      const pDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (pDiff !== 0) return pDiff;
      return b.nearestSampleDistanceMeters - a.nearestSampleDistanceMeters;
    });
  }
}
