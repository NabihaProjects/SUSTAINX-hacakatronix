// SOIL IQ - Agronomic Requirement Service
// Determines baseline crop nutrient demand based on crop species, growth stage, target yield, and area.
// Values are clearly labeled as PROTOTYPE references.

export interface AgronomicInput {
  cropId?: string;
  cropName: string;
  growthStageName?: string;
  targetYieldTonsHa?: number;
  areaHectares: number;
}

export interface BaseNutrientRequirement {
  cropName: string;
  growthStageName: string;
  targetYieldTonsHa: number;
  areaHectares: number;
  // Rates per hectare (kg / ha)
  rateNPerHa: number;
  ratePPerHa: number;
  rateKPerHa: number;
  // Total requirements for the given area (kg)
  totalReqN: number;
  totalReqP: number;
  totalReqK: number;
  confidence: number;
  source: 'PROTOTYPE';
  version: string;
}

// Prototype benchmark requirements for full crop cycle (kg pure nutrient / ha per standard yield)
const CROP_BENCHMARKS: Record<string, { baseN: number; baseP: number; baseK: number; defaultYield: number }> = {
  rice: { baseN: 120, baseP: 45, baseK: 80, defaultYield: 5.5 },
  wheat: { baseN: 110, baseP: 40, baseK: 60, defaultYield: 4.5 },
  maize: { baseN: 140, baseP: 55, baseK: 90, defaultYield: 7.0 },
  tomato: { baseN: 130, baseP: 60, baseK: 120, defaultYield: 40.0 },
  potato: { baseN: 125, baseP: 50, baseK: 130, defaultYield: 25.0 },
  cotton: { baseN: 100, baseP: 40, baseK: 75, defaultYield: 2.5 },
  groundnut: { baseN: 30, baseP: 40, baseK: 50, defaultYield: 2.2 }, // Legume, low N requirement due to N fixation
  sugarcane: { baseN: 180, baseP: 70, baseK: 160, defaultYield: 80.0 },
};

// Stage-specific demand fraction
const STAGE_DEMAND_FACTORS: Record<string, { nFactor: number; pFactor: number; kFactor: number }> = {
  nursery: { nFactor: 0.1, pFactor: 0.15, kFactor: 0.1 },
  seedling: { nFactor: 0.1, pFactor: 0.15, kFactor: 0.1 },
  vegetative: { nFactor: 0.35, pFactor: 0.25, kFactor: 0.3 },
  tillering: { nFactor: 0.3, pFactor: 0.25, kFactor: 0.25 },
  'panicle initiation': { nFactor: 0.3, pFactor: 0.2, kFactor: 0.25 },
  flowering: { nFactor: 0.25, pFactor: 0.3, kFactor: 0.35 },
  'fruit development': { nFactor: 0.2, pFactor: 0.25, kFactor: 0.35 },
  'grain filling': { nFactor: 0.15, pFactor: 0.15, kFactor: 0.2 },
  maturity: { nFactor: 0.05, pFactor: 0.05, kFactor: 0.05 },
};

export class AgronomicRequirementService {
  static getBaseNutrientRequirement(input: AgronomicInput): BaseNutrientRequirement {
    const cropKey = (input.cropName || 'rice').toLowerCase().trim();
    const benchmark = CROP_BENCHMARKS[cropKey] || CROP_BENCHMARKS.rice;

    const yieldFactor = input.targetYieldTonsHa
      ? Math.max(0.5, Math.min(2.0, input.targetYieldTonsHa / benchmark.defaultYield))
      : 1.0;

    const stageKey = (input.growthStageName || 'vegetative').toLowerCase().trim();
    const stageFactors = STAGE_DEMAND_FACTORS[stageKey] || { nFactor: 0.3, pFactor: 0.25, kFactor: 0.3 };

    // Calculate stage rate per hectare
    const rateNPerHa = Number((benchmark.baseN * yieldFactor * stageFactors.nFactor).toFixed(2));
    const ratePPerHa = Number((benchmark.baseP * yieldFactor * stageFactors.pFactor).toFixed(2));
    const rateKPerHa = Number((benchmark.baseK * yieldFactor * stageFactors.kFactor).toFixed(2));

    const area = Math.max(0.001, input.areaHectares);
    const totalReqN = Number((rateNPerHa * area).toFixed(2));
    const totalReqP = Number((ratePPerHa * area).toFixed(2));
    const totalReqK = Number((rateKPerHa * area).toFixed(2));

    return {
      cropName: input.cropName,
      growthStageName: input.growthStageName || 'Vegetative',
      targetYieldTonsHa: input.targetYieldTonsHa || benchmark.defaultYield,
      areaHectares: area,
      rateNPerHa,
      ratePPerHa,
      rateKPerHa,
      totalReqN,
      totalReqP,
      totalReqK,
      confidence: 0.85,
      source: 'PROTOTYPE',
      version: 'v1.0-prototype',
    };
  }
}
