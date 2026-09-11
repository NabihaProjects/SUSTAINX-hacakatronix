// SOIL IQ - Nutrient Balance & Ledger Engine
// Balances crop demand, soil credits, and previous applications to determine true remaining requirement.
// Guarantees excess overages are never discarded.

export interface NutrientBalanceInput {
  baseReqPerHa: { N: number; P: number; K: number };
  soilAvailablePerHa: { N: number; P: number; K: number };
  previousAppliedPerHa: { N: number; P: number; K: number };
  areaHectares: number;
}

export interface NutrientBalanceResult {
  // Targets / Recommended budgets (kg/ha)
  recommendedN: number;
  recommendedP: number;
  recommendedK: number;

  // Consumed to date (kg/ha)
  consumedN: number;
  consumedP: number;
  consumedK: number;

  // Remaining requirement to reach target (kg/ha, min 0)
  remainingN: number;
  remainingP: number;
  remainingK: number;

  // Excess overages (kg/ha, 0 if within budget)
  excessN: number;
  excessP: number;
  excessK: number;

  // Percentage consumed of recommended budget (0 - 100+%)
  percentConsumedN: number;
  percentConsumedP: number;
  percentConsumedK: number;

  calculationVersion: string;
  confidence: number;
}

export class NutrientBalanceService {
  /**
   * Calculates net remaining nutrient requirements:
   * recommended budget = max(0, base crop requirement - soil available credits)
   * remaining = max(0, recommended - previous applied)
   * excess = max(0, previous applied - recommended)
   */
  static calculateNutrientBalance(input: NutrientBalanceInput): NutrientBalanceResult {
    // 1. Calculate recommended net fertilizer budget (accounting for available soil credits)
    const recN = Math.max(0, Number((input.baseReqPerHa.N - input.soilAvailablePerHa.N * 0.5).toFixed(2)));
    const recP = Math.max(0, Number((input.baseReqPerHa.P - input.soilAvailablePerHa.P * 0.4).toFixed(2)));
    const recK = Math.max(0, Number((input.baseReqPerHa.K - input.soilAvailablePerHa.K * 0.4).toFixed(2)));

    // 2. Consumed is historical applied per hectare
    const conN = Number(input.previousAppliedPerHa.N.toFixed(2));
    const conP = Number(input.previousAppliedPerHa.P.toFixed(2));
    const conK = Number(input.previousAppliedPerHa.K.toFixed(2));

    // 3. Remaining is budget minus consumed, bounded at 0
    const remN = Math.max(0, Number((recN - conN).toFixed(2)));
    const remP = Math.max(0, Number((recP - conP).toFixed(2)));
    const remK = Math.max(0, Number((recK - conK).toFixed(2)));

    // 4. Excess captures any overage
    const excN = Math.max(0, Number((conN - recN).toFixed(2)));
    const excP = Math.max(0, Number((conP - recP).toFixed(2)));
    const excK = Math.max(0, Number((conK - recK).toFixed(2)));

    const pctN = recN > 0 ? Number(((conN / recN) * 100.0).toFixed(1)) : 0;
    const pctP = recP > 0 ? Number(((conP / recP) * 100.0).toFixed(1)) : 0;
    const pctK = recK > 0 ? Number(((conK / recK) * 100.0).toFixed(1)) : 0;

    return {
      recommendedN: recN,
      recommendedP: recP,
      recommendedK: recK,
      consumedN: conN,
      consumedP: conP,
      consumedK: conK,
      remainingN: remN,
      remainingP: remP,
      remainingK: remK,
      excessN: excN,
      excessP: excP,
      excessK: excK,
      percentConsumedN: pctN,
      percentConsumedP: pctP,
      percentConsumedK: pctK,
      calculationVersion: 'v1.0-prototype',
      confidence: 0.85,
    };
  }
}
