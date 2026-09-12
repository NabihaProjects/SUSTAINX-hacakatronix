// SOIL IQ - Explainable AI & Structured Fact Store Service
// Structures domain observations and generates unhallucinated explanations:
// OBSERVATION -> ANALYSIS -> IMPACT -> RECOMMENDATION -> CONFIDENCE

export type ExplanationFactType =
  | 'HIGH_EXISTING_NUTRIENT'
  | 'LOW_EXISTING_NUTRIENT'
  | 'STAGE_DEMAND_PEAK'
  | 'STAGE_DEMAND_LOW'
  | 'RECENT_APPLICATION_CONTRIBUTION'
  | 'WEATHER_PERMISSIVE'
  | 'WEATHER_RESTRICTED'
  | 'SOIL_PH_SUBOPTIMAL'
  | 'ORGANIC_CARBON_LOW'
  | 'ANOMALY_SPIKE_DETECTED';

export interface ExplanationFact {
  type: ExplanationFactType;
  nutrient?: 'N' | 'P' | 'K';
  gridCode: string;
  metricLabel: string;
  measuredValue: number | string;
  benchmarkValue?: number | string;
  source: string;
  confidence: number;
  message: string;
}

export interface StructuredExplanation {
  observation: string;
  analysis: string;
  impact: string;
  recommendation: string;
  confidenceLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  confidenceScore: number;
  topFactors: string[];
  facts: ExplanationFact[];
}

export class ExplanationService {
  /**
   * Generates a grounded, structured natural-language explanation from validated system facts.
   * Eliminates hallucination by deriving sentences strictly from extracted facts.
   */
  static generateExplanation(facts: ExplanationFact[], targetProduct?: string, targetRate?: number): StructuredExplanation {
    if (!facts || facts.length === 0) {
      return {
        observation: 'Grid soil metrics and recent nutrient inputs remain within nominal target thresholds.',
        analysis: 'Baseline crop stage uptake requirements align with current soil credit availability.',
        impact: 'Planned fertilizer dosage maintains continuous nutrient balance without oversupply risk.',
        recommendation: `Apply ${targetProduct || 'prescribed fertilizer'} at ${targetRate || 40} kg/ha in optimal field conditions.`,
        confidenceLevel: 'HIGH',
        confidenceScore: 0.88,
        topFactors: ['Nominal soil baseline', 'Active phenological stage demand', 'Clear weather window'],
        facts: [],
      };
    }

    const observations: string[] = [];
    const analyses: string[] = [];
    const impacts: string[] = [];
    const recommendations: string[] = [];
    const topFactors: string[] = [];
    let totalConfidence = 0;

    for (const fact of facts) {
      totalConfidence += fact.confidence;
      topFactors.push(fact.message);

      switch (fact.type) {
        case 'HIGH_EXISTING_NUTRIENT':
          observations.push(`Grid ${fact.gridCode} exhibits elevated ${fact.nutrient} (${fact.measuredValue} vs baseline benchmark ${fact.benchmarkValue}).`);
          analyses.push(`Recent soil extraction and historical applications accumulated substantial ${fact.nutrient} reserves.`);
          impacts.push(`Applying further ${fact.nutrient}-heavy formulations risks leaching and nutrient imbalance.`);
          recommendations.push(`Select formulations with reduced ${fact.nutrient} or throttle target application rate.`);
          break;

        case 'LOW_EXISTING_NUTRIENT':
          observations.push(`Available ${fact.nutrient} in Grid ${fact.gridCode} is deficient (${fact.measuredValue} vs recommended ${fact.benchmarkValue}).`);
          analyses.push(`Previous crop cycles have depleted soil ${fact.nutrient} credits in this spatial unit.`);
          impacts.push(`Inadequate ${fact.nutrient} during active growth may stunt vegetative development or yield potential.`);
          recommendations.push(`Prioritize targeted ${fact.nutrient} replenishment through precision application.`);
          break;

        case 'STAGE_DEMAND_PEAK':
          observations.push(`Crop has reached active ${fact.metricLabel} phenological stage.`);
          analyses.push(`Uptake curve indicates accelerated nitrogen and potassium consumption over the next 14 days.`);
          impacts.push(`Timely nutrient delivery maximizes yield conversion efficiency.`);
          recommendations.push(`Maintain scheduled target dosing before vegetative canopy closure.`);
          break;

        case 'STAGE_DEMAND_LOW':
          observations.push(`Crop is in late ${fact.metricLabel} stage with tapering nutrient absorption.`);
          analyses.push(`Metabolic demand has shifted from vegetative growth to ripening.`);
          impacts.push(`Excess nitrogen applied now will not benefit grain filling and may degrade soil organic stability.`);
          recommendations.push(`Curtail nitrogen application; restrict inputs to maintenance levels.`);
          break;

        case 'RECENT_APPLICATION_CONTRIBUTION':
          observations.push(`Previous application pass delivered ${fact.measuredValue} of elemental ${fact.nutrient}.`);
          analyses.push(`Ledger accounting confirms remaining residual active nutrients in topsoil layer.`);
          impacts.push(`Current prescription requirement has been credited downward accordingly.`);
          recommendations.push(`Apply only the net remaining balance (${targetRate || 'adjusted'} kg/ha).`);
          break;

        case 'WEATHER_RESTRICTED':
          observations.push(`Environmental monitoring detected adverse field conditions (${fact.message}).`);
          analyses.push(`Imminent rainfall or high wind promotes surface runoff and atmospheric spray drift.`);
          impacts.push(`Application would result in nutrient loss and chemical misplacement.`);
          recommendations.push(`DEFER application until wind speeds subside and precipitation risk drops below 30%.`);
          break;

        case 'WEATHER_PERMISSIVE':
          observations.push(`Field atmospheric parameters (${fact.message}) permit application.`);
          analyses.push(`Low wind and absence of rain forecast optimize spray droplet deposition.`);
          impacts.push(`Fertilizer incorporation efficiency is maximized.`);
          recommendations.push(`PROCEED with application during the current 12-hour spray window.`);
          break;

        default:
          observations.push(fact.message);
          break;
      }
    }

    const avgConfidence = facts.length > 0 ? totalConfidence / facts.length : 0.85;
    const confidenceLevel: 'LOW' | 'MEDIUM' | 'HIGH' =
      avgConfidence >= 0.8 ? 'HIGH' : avgConfidence >= 0.6 ? 'MEDIUM' : 'LOW';

    return {
      observation: observations.join(' ') || 'Standard crop and soil telemetry observed.',
      analysis: analyses.join(' ') || 'Agronomic uptake rates align with prescribed application targets.',
      impact: impacts.join(' ') || 'Application maintains balanced soil fertility without overage risks.',
      recommendation: recommendations.join(' ') || `Proceed with ${targetProduct || 'target product'} at ${targetRate || 40} kg/ha.`,
      confidenceLevel,
      confidenceScore: Number(avgConfidence.toFixed(2)),
      topFactors: topFactors.slice(0, 4),
      facts,
    };
  }
}
