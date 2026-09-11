// SOIL IQ - Grid Status Engine
// Computes spatial grid status based on nutrient consumption percentage, block flags, and budget ceilings.

export const CAUTION_THRESHOLD_PERCENT = 80.0;
export const EXCESS_THRESHOLD_PERCENT = 100.0;

export type GridStatusType = 'OPTIMAL' | 'CAUTION' | 'EXCESS_RISK' | 'BLOCKED' | 'UNKNOWN';

export interface GridStatusEvaluationInput {
  isBlocked?: boolean;
  blockReason?: string | null;
  recommendedN: number;
  recommendedP: number;
  recommendedK: number;
  consumedN: number;
  consumedP: number;
  consumedK: number;
  excessN?: number;
  excessP?: number;
  excessK?: number;
}

export interface GridStatusResult {
  status: GridStatusType;
  primaryReason: string;
  maxConsumptionPct: number;
  limitingNutrient: 'N' | 'P' | 'K' | 'NONE';
  pctN: number;
  pctP: number;
  pctK: number;
}

export class GridStatusService {
  static evaluateGridStatus(input: GridStatusEvaluationInput): GridStatusResult {
    // 1. Explicitly blocked grid
    if (input.isBlocked) {
      return {
        status: 'BLOCKED',
        primaryReason: input.blockReason || 'Grid is manually locked or has active environmental restriction.',
        maxConsumptionPct: 0,
        limitingNutrient: 'NONE',
        pctN: 0,
        pctP: 0,
        pctK: 0,
      };
    }

    // 2. Unknown status if budgets are not configured
    if (input.recommendedN <= 0 && input.recommendedP <= 0 && input.recommendedK <= 0) {
      return {
        status: 'UNKNOWN',
        primaryReason: 'No nutrient budget established for this grid.',
        maxConsumptionPct: 0,
        limitingNutrient: 'NONE',
        pctN: 0,
        pctP: 0,
        pctK: 0,
      };
    }

    const pctN = input.recommendedN > 0 ? (input.consumedN / input.recommendedN) * 100 : 0;
    const pctP = input.recommendedP > 0 ? (input.consumedP / input.recommendedP) * 100 : 0;
    const pctK = input.recommendedK > 0 ? (input.consumedK / input.recommendedK) * 100 : 0;

    let maxPct = Math.max(pctN, pctP, pctK);
    let limiting: 'N' | 'P' | 'K' = pctN === maxPct ? 'N' : pctP === maxPct ? 'P' : 'K';

    // 3. Excess Risk: Any nutrient exceeds budget or excess > 0
    if (maxPct >= EXCESS_THRESHOLD_PERCENT || (input.excessN && input.excessN > 0) || (input.excessP && input.excessP > 0) || (input.excessK && input.excessK > 0)) {
      return {
        status: 'EXCESS_RISK',
        primaryReason: `${limiting} consumption (${maxPct.toFixed(1)}%) exceeds recommended budget ceiling. Application halted.`,
        maxConsumptionPct: Number(maxPct.toFixed(1)),
        limitingNutrient: limiting,
        pctN: Number(pctN.toFixed(1)),
        pctP: Number(pctP.toFixed(1)),
        pctK: Number(pctK.toFixed(1)),
      };
    }

    // 4. Caution: Consumed >= 80%
    if (maxPct >= CAUTION_THRESHOLD_PERCENT) {
      return {
        status: 'CAUTION',
        primaryReason: `${limiting} consumption is at ${maxPct.toFixed(1)}% of recommended allowance. Approaching seasonal ceiling.`,
        maxConsumptionPct: Number(maxPct.toFixed(1)),
        limitingNutrient: limiting,
        pctN: Number(pctN.toFixed(1)),
        pctP: Number(pctP.toFixed(1)),
        pctK: Number(pctK.toFixed(1)),
      };
    }

    // 5. Optimal
    return {
      status: 'OPTIMAL',
      primaryReason: `Nutrient balances are within healthy operating range (max utilization ${maxPct.toFixed(1)}%).`,
      maxConsumptionPct: Number(maxPct.toFixed(1)),
      limitingNutrient: limiting,
      pctN: Number(pctN.toFixed(1)),
      pctP: Number(pctP.toFixed(1)),
      pctK: Number(pctK.toFixed(1)),
    };
  }
}
