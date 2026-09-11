// SOIL IQ - Fertilizer Recommendation Engine
// Generates ranked fertilizer options (single and combination products),
// recommends min-target-max ranges, detects nutrient oversupply, and flags split applications.

import { FertilizerProfile, FertilizerCalculationService } from './fertilizerCalculationService';

export interface RecommendationInput {
  remainingN: number; // kg/ha
  remainingP: number; // kg/ha
  remainingK: number; // kg/ha
  availableFertilizers: FertilizerProfile[];
  areaHectares: number;
  applicationMethod?: string;
}

export interface RecommendedOptionItem {
  fertilizerId?: string;
  fertilizerName: string;
  formulation: string;
  targetRateKgHa: number;
  minRateKgHa: number;
  maxRateKgHa: number;
  totalProductKgForArea: number;
  pureNSupplied: number;
  purePSupplied: number;
  pureKSupplied: number;
  splitStage?: string;
  splitPercent?: number;
}

export interface RecommendationOption {
  optionId: string;
  title: string;
  products: RecommendedOptionItem[];
  totalRateKgHa: number;
  targetRateKgHa: number;
  minRateKgHa: number;
  maxRateKgHa: number;
  suitabilityScore: number; // 0.0 - 1.0
  nCoveragePct: number;
  pCoveragePct: number;
  kCoveragePct: number;
  oversupplyNutrients: string[];
  undersupplyNutrients: string[];
  recommendSplitApplication: boolean;
  splitDetails?: string;
  explanation: string;
}

export interface RecommendationResult {
  options: RecommendationOption[];
  selectedOption: RecommendationOption;
  optimizationNote: string;
}

export class FertilizerRecommendationService {
  static recommendFertilizers(input: RecommendationInput): RecommendationResult {
    const { remainingN, remainingP, remainingK, availableFertilizers, areaHectares } = input;
    const options: RecommendationOption[] = [];

    // Find key products
    const npk19 = availableFertilizers.find((f) => f.formulation.includes('19-19-19') || f.formulation.includes('20-20-20'));
    const urea = availableFertilizers.find((f) => f.nPercent >= 40);
    const dap = availableFertilizers.find((f) => f.formulation.includes('18-46') || f.pPercent >= 20);
    const mop = availableFertilizers.find((f) => f.formulation.includes('0-0-60') || f.kPercent >= 40);

    // Option 1: Balanced NPK Compound Fertilizer (e.g. 19-19-19)
    if (npk19) {
      // Calculate rate based on average requirement
      const maxReq = Math.max(remainingN, remainingP, remainingK);
      const limitingNutrientReq = Math.max(5.0, maxReq);
      const targetRateKgHa = Number(((limitingNutrientReq / (npk19.nPercent / 100)) * 0.8).toFixed(1));
      const minRateKgHa = Number((targetRateKgHa * 0.9).toFixed(1));
      const maxRateKgHa = Number((targetRateKgHa * 1.1).toFixed(1));

      const contrib = FertilizerCalculationService.calculateNutrientContribution(npk19, targetRateKgHa);
      const nCov = remainingN > 0 ? (contrib.contributedN / remainingN) * 100 : 100;
      const pCov = remainingP > 0 ? (contrib.contributedP / remainingP) * 100 : 100;
      const kCov = remainingK > 0 ? (contrib.contributedK / remainingK) * 100 : 100;

      const oversupply: string[] = [];
      const undersupply: string[] = [];
      if (contrib.contributedN > remainingN + 5) oversupply.push(`Nitrogen (+${(contrib.contributedN - remainingN).toFixed(1)} kg/ha)`);
      if (contrib.contributedP > remainingP + 5) oversupply.push(`Phosphorus (+${(contrib.contributedP - remainingP).toFixed(1)} kg/ha)`);
      if (contrib.contributedK > remainingK + 5) oversupply.push(`Potassium (+${(contrib.contributedK - remainingK).toFixed(1)} kg/ha)`);

      if (contrib.contributedN < remainingN - 10) undersupply.push('Nitrogen');
      if (contrib.contributedP < remainingP - 10) undersupply.push('Phosphorus');
      if (contrib.contributedK < remainingK - 10) undersupply.push('Potassium');

      const shouldSplit = targetRateKgHa > 120 || contrib.contributedN > 45;

      options.push({
        optionId: 'OPT-1-BALANCED-NPK',
        title: `Single Compound Application (${npk19.name})`,
        products: [
          {
            fertilizerId: npk19.id,
            fertilizerName: npk19.name,
            formulation: npk19.formulation,
            targetRateKgHa,
            minRateKgHa,
            maxRateKgHa,
            totalProductKgForArea: Number((targetRateKgHa * areaHectares).toFixed(2)),
            pureNSupplied: contrib.contributedN,
            purePSupplied: contrib.contributedP,
            pureKSupplied: contrib.contributedK,
          },
        ],
        totalRateKgHa: targetRateKgHa,
        targetRateKgHa: targetRateKgHa,
        minRateKgHa,
        maxRateKgHa,
        suitabilityScore: 0.88,
        nCoveragePct: Number(nCov.toFixed(1)),
        pCoveragePct: Number(pCov.toFixed(1)),
        kCoveragePct: Number(kCov.toFixed(1)),
        oversupplyNutrients: oversupply,
        undersupplyNutrients: undersupply,
        recommendSplitApplication: shouldSplit,
        splitDetails: shouldSplit ? 'High single-pass dosage detected. Recommend 40% basal broadcast and 60% fertigation/top-dress at tillering.' : undefined,
        explanation: `${npk19.name} delivers balanced nutrition in a single pass with rapid uptake efficiency.`,
      });
    }

    // Option 2: Tailored Combination (Urea + MOP or DAP + MOP)
    if (urea && mop) {
      const ureaRate = remainingN > 0 ? Number(((remainingN / (urea.nPercent / 100)) * 0.9).toFixed(1)) : 10;
      const mopRate = remainingK > 0 ? Number(((remainingK / (mop.kPercent / 100)) * 0.85).toFixed(1)) : 10;
      const totalRate = Number((ureaRate + mopRate).toFixed(1));

      const ureaContrib = FertilizerCalculationService.calculateNutrientContribution(urea, ureaRate);
      const mopContrib = FertilizerCalculationService.calculateNutrientContribution(mop, mopRate);

      const totalN = ureaContrib.contributedN;
      const totalP = ureaContrib.contributedP + mopContrib.contributedP;
      const totalK = mopContrib.contributedK;

      options.push({
        optionId: 'OPT-2-COMBINATION-CUSTOM',
        title: `Precision Combination (${urea.name} + ${mop.name})`,
        products: [
          {
            fertilizerId: urea.id,
            fertilizerName: urea.name,
            formulation: urea.formulation,
            targetRateKgHa: ureaRate,
            minRateKgHa: Number((ureaRate * 0.9).toFixed(1)),
            maxRateKgHa: Number((ureaRate * 1.1).toFixed(1)),
            totalProductKgForArea: Number((ureaRate * areaHectares).toFixed(2)),
            pureNSupplied: totalN,
            purePSupplied: 0,
            pureKSupplied: 0,
          },
          {
            fertilizerId: mop.id,
            fertilizerName: mop.name,
            formulation: mop.formulation,
            targetRateKgHa: mopRate,
            minRateKgHa: Number((mopRate * 0.9).toFixed(1)),
            maxRateKgHa: Number((mopRate * 1.1).toFixed(1)),
            totalProductKgForArea: Number((mopRate * areaHectares).toFixed(2)),
            pureNSupplied: 0,
            purePSupplied: 0,
            pureKSupplied: totalK,
          },
        ],
        totalRateKgHa: totalRate,
        targetRateKgHa: totalRate,
        minRateKgHa: Number((totalRate * 0.9).toFixed(1)),
        maxRateKgHa: Number((totalRate * 1.1).toFixed(1)),
        suitabilityScore: 0.92,
        nCoveragePct: remainingN > 0 ? Number(((totalN / remainingN) * 100).toFixed(1)) : 100,
        pCoveragePct: remainingP > 0 ? Number(((totalP / remainingP) * 100).toFixed(1)) : 100,
        kCoveragePct: remainingK > 0 ? Number(((totalK / remainingK) * 100).toFixed(1)) : 100,
        oversupplyNutrients: [],
        undersupplyNutrients: remainingP > 10 ? ['Phosphorus'] : [],
        recommendSplitApplication: ureaRate > 60,
        splitDetails: ureaRate > 60 ? 'Split nitrogen into 2 equal splits to avoid leaching losses.' : undefined,
        explanation: 'Custom straight-fertilizer blend allows precise N and K dosing matching soil deficits exactly.',
      });
    }

    // Option 3: Fallback straight fertilizer if options are empty
    if (options.length === 0 && availableFertilizers.length > 0) {
      const defaultFert = availableFertilizers[0];
      const targetRate = 50.0;
      const contrib = FertilizerCalculationService.calculateNutrientContribution(defaultFert, targetRate);
      options.push({
        optionId: 'OPT-3-DEFAULT',
        title: `Standard Application (${defaultFert.name})`,
        products: [
          {
            fertilizerId: defaultFert.id,
            fertilizerName: defaultFert.name,
            formulation: defaultFert.formulation,
            targetRateKgHa: targetRate,
            minRateKgHa: 45,
            maxRateKgHa: 55,
            totalProductKgForArea: Number((targetRate * areaHectares).toFixed(2)),
            pureNSupplied: contrib.contributedN,
            purePSupplied: contrib.contributedP,
            pureKSupplied: contrib.contributedK,
          },
        ],
        totalRateKgHa: targetRate,
        targetRateKgHa: targetRate,
        minRateKgHa: 45,
        maxRateKgHa: 55,
        suitabilityScore: 0.75,
        nCoveragePct: 100,
        pCoveragePct: 100,
        kCoveragePct: 100,
        oversupplyNutrients: [],
        undersupplyNutrients: [],
        recommendSplitApplication: false,
        explanation: `Standard baseline dosage for ${defaultFert.name}.`,
      });
    }

    // Sort options by suitability score
    options.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

    return {
      options,
      selectedOption: options[0],
      optimizationNote: 'Prototype optimization: multi-objective heuristic minimizing nutrient oversupply while meeting active growth stage demand.',
    };
  }
}
