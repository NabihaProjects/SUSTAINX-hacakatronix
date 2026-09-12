// SOIL IQ - What-If Scenario Simulation Engine
// Compares BASELINE application plan against alternative SCENARIOS:
// Product choice, application rate, timing delay (e.g. wait 24h), and weather risk.
// STRICTLY ISOLATED: Simulations never mutate production nutrient ledgers or active prescriptions.

import { FertilizerCalculationService } from './fertilizerCalculationService';
import { SoilHealthService } from './soilHealthService';

export interface ScenarioSimulationInputs {
  scenarioName: string;
  scenarioType:
    | 'MORE_FERTILIZER'
    | 'LESS_FERTILIZER'
    | 'WAIT_BEFORE_APPLICATION'
    | 'CHANGE_FERTILIZER'
    | 'SPLIT_APPLICATION'
    | 'APPLY_NOW'
    | 'DEFER_APPLICATION'
    | 'HIGH_RAINFALL'
    | 'LOW_RAINFALL'
    | 'DIFFERENT_TARGET_RATE';

  gridCode: string;
  fieldAreaHa: number;

  // Baseline plan
  baselineProduct: string;
  baselineFormulation: string; // e.g. "19-19-19"
  baselineRateKgHa: number;
  baselineTimingDelayHours: number;
  baselineRainProbPct: number;

  // Scenario plan
  scenarioProduct: string;
  scenarioFormulation: string;
  scenarioRateKgHa: number;
  scenarioTimingDelayHours: number;
  scenarioRainProbPct: number;

  // Economic unit cost assumption (e.g. $0.65 / kg fertilizer)
  costPerKg?: number;

  // Existing soil metrics
  soilN: number;
  soilP: number;
  soilK: number;
  soilPh: number;
  currentBudgetRecommendedN: number;
  currentBudgetConsumedN: number;
}

export interface ScenarioPlanOutput {
  product: string;
  formulation: string;
  rateKgHa: number;
  totalQuantityKg: number;
  pureElementalN: number;
  pureElementalP: number;
  pureElementalK: number;
  budgetUtilizationPct: number;
  excessRiskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  environmentalRiskAction: 'PROCEED' | 'CAUTION' | 'DEFER' | 'BLOCK';
  environmentalRiskReason: string;
  estimatedCost: number;
  soilHealthIndex: number;
  tag: 'BASELINE' | 'SCENARIO';
}

export interface ScenarioComparisonResult {
  scenarioName: string;
  scenarioType: string;
  gridCode: string;
  isSimulation: true; // Strict simulation tag
  baseline: ScenarioPlanOutput;
  scenario: ScenarioPlanOutput;
  deltas: {
    rateDeltaKgHa: number;
    rateDeltaPct: number;
    costDeltaAmount: number;
    costDeltaPct: number;
    pureNDeltaKg: number;
    purePDeltaKg: number;
    budgetUtilizationDeltaPct: number;
    soilHealthDelta: number;
  };
  recommendationSummary: string;
}

export class ScenarioSimulationService {
  /**
   * Simulates and compares an alternative scenario against the baseline plan.
   */
  static runSimulation(inputs: ScenarioSimulationInputs): ScenarioComparisonResult {
    const costPerKg = inputs.costPerKg || 0.65;
    const area = Math.max(0.1, inputs.fieldAreaHa);

    // 1. Evaluate Baseline Plan
    const baseNutrients = this.computeElementalNutrients(inputs.baselineFormulation, inputs.baselineRateKgHa);
    const baseTotalQty = Number((inputs.baselineRateKgHa * area).toFixed(1));
    const baseCost = Number((baseTotalQty * costPerKg).toFixed(2));

    const baseConsumedN = inputs.currentBudgetConsumedN + baseNutrients.pureN;
    const baseBudgetPct =
      inputs.currentBudgetRecommendedN > 0
        ? Math.round((baseConsumedN / inputs.currentBudgetRecommendedN) * 100)
        : 85;

    const baseExcessRisk = baseBudgetPct > 100 ? 'HIGH' : baseBudgetPct > 85 ? 'MEDIUM' : 'LOW';

    const baseEnv = this.evaluateEnvironmentalRisk(inputs.baselineRainProbPct, inputs.baselineTimingDelayHours);

    const baseSoilHealth = SoilHealthService.calculateIndex({
      gridCode: inputs.gridCode,
      availableNPpm: inputs.soilN + baseNutrients.pureN * 0.4,
      availablePPpm: inputs.soilP + baseNutrients.pureP * 0.4,
      availableKPpm: inputs.soilK + baseNutrients.pureK * 0.4,
      ph: inputs.soilPh,
      organicCarbonPct: 1.3,
      ecDsm: 0.8,
      moisturePct: 24.0,
      excessNKgHa: Math.max(0, baseConsumedN - inputs.currentBudgetRecommendedN),
    }).overallScore;

    const baselineOutput: ScenarioPlanOutput = {
      product: inputs.baselineProduct,
      formulation: inputs.baselineFormulation,
      rateKgHa: inputs.baselineRateKgHa,
      totalQuantityKg: baseTotalQty,
      pureElementalN: baseNutrients.pureN,
      pureElementalP: baseNutrients.pureP,
      pureElementalK: baseNutrients.pureK,
      budgetUtilizationPct: baseBudgetPct,
      excessRiskLevel: baseExcessRisk,
      environmentalRiskAction: baseEnv.action,
      environmentalRiskReason: baseEnv.reason,
      estimatedCost: baseCost,
      soilHealthIndex: baseSoilHealth,
      tag: 'BASELINE',
    };

    // 2. Evaluate Scenario Plan
    const scenNutrients = this.computeElementalNutrients(inputs.scenarioFormulation, inputs.scenarioRateKgHa);
    const scenTotalQty = Number((inputs.scenarioRateKgHa * area).toFixed(1));
    const scenCost = Number((scenTotalQty * costPerKg).toFixed(2));

    const scenConsumedN = inputs.currentBudgetConsumedN + scenNutrients.pureN;
    const scenBudgetPct =
      inputs.currentBudgetRecommendedN > 0
        ? Math.round((scenConsumedN / inputs.currentBudgetRecommendedN) * 100)
        : 70;

    const scenExcessRisk = scenBudgetPct > 100 ? 'HIGH' : scenBudgetPct > 85 ? 'MEDIUM' : 'LOW';

    const scenEnv = this.evaluateEnvironmentalRisk(inputs.scenarioRainProbPct, inputs.scenarioTimingDelayHours);

    const scenSoilHealth = SoilHealthService.calculateIndex({
      gridCode: inputs.gridCode,
      availableNPpm: inputs.soilN + scenNutrients.pureN * 0.4,
      availablePPpm: inputs.soilP + scenNutrients.pureP * 0.4,
      availableKPpm: inputs.soilK + scenNutrients.pureK * 0.4,
      ph: inputs.soilPh,
      organicCarbonPct: 1.35,
      ecDsm: 0.78,
      moisturePct: 24.0,
      excessNKgHa: Math.max(0, scenConsumedN - inputs.currentBudgetRecommendedN),
    }).overallScore;

    const scenarioOutput: ScenarioPlanOutput = {
      product: inputs.scenarioProduct,
      formulation: inputs.scenarioFormulation,
      rateKgHa: inputs.scenarioRateKgHa,
      totalQuantityKg: scenTotalQty,
      pureElementalN: scenNutrients.pureN,
      pureElementalP: scenNutrients.pureP,
      pureElementalK: scenNutrients.pureK,
      budgetUtilizationPct: scenBudgetPct,
      excessRiskLevel: scenExcessRisk,
      environmentalRiskAction: scenEnv.action,
      environmentalRiskReason: scenEnv.reason,
      estimatedCost: scenCost,
      soilHealthIndex: scenSoilHealth,
      tag: 'SCENARIO',
    };

    // 3. Deltas & Comparisons
    const rateDelta = Number((inputs.scenarioRateKgHa - inputs.baselineRateKgHa).toFixed(1));
    const rateDeltaPct =
      inputs.baselineRateKgHa > 0
        ? Number(((rateDelta / inputs.baselineRateKgHa) * 100).toFixed(1))
        : 0;

    const costDelta = Number((scenCost - baseCost).toFixed(2));
    const costDeltaPct =
      baseCost > 0 ? Number(((costDelta / baseCost) * 100).toFixed(1)) : 0;

    const pDelta = Number((scenNutrients.pureP - baseNutrients.pureP).toFixed(2));
    const nDelta = Number((scenNutrients.pureN - baseNutrients.pureN).toFixed(2));

    const budgetDelta = scenBudgetPct - baseBudgetPct;
    const soilHealthDelta = scenSoilHealth - baseSoilHealth;

    // Recommendation summary
    let summary = `Scenario reduces application rate by ${Math.abs(rateDelta)} kg/ha (${rateDeltaPct}%), saving $${Math.abs(costDelta)} in input cost. `;
    if (scenEnv.action === 'PROCEED' && baseEnv.action !== 'PROCEED') {
      summary += `Waiting ${inputs.scenarioTimingDelayHours}h successfully clears the rain event, shifting environmental action from ${baseEnv.action} to PROCEED. `;
    }
    if (pDelta < 0) {
      summary += `Reduces phosphorus loading by ${Math.abs(pDelta)} kg/ha, mitigating grid nutrient imbalance. `;
    }
    summary += `Projected Soil Health Index changes from ${baseSoilHealth} to ${scenSoilHealth} (+${soilHealthDelta} pts).`;

    return {
      scenarioName: inputs.scenarioName,
      scenarioType: inputs.scenarioType,
      gridCode: inputs.gridCode,
      isSimulation: true,
      baseline: baselineOutput,
      scenario: scenarioOutput,
      deltas: {
        rateDeltaKgHa: rateDelta,
        rateDeltaPct,
        costDeltaAmount: costDelta,
        costDeltaPct: costDeltaPct,
        pureNDeltaKg: nDelta,
        purePDeltaKg: pDelta,
        budgetUtilizationDeltaPct: budgetDelta,
        soilHealthDelta,
      },
      recommendationSummary: summary,
    };
  }

  private static computeElementalNutrients(formulation: string, rateKgHa: number) {
    const parts = formulation.split('-').map((p) => parseFloat(p) || 0);
    const nPct = parts[0] || 0;
    const p2o5Pct = parts[1] || 0;
    const k2oPct = parts[2] || 0;

    // Convert commercial oxide label convention to pure elemental:
    // Pure P = P2O5 * 0.4364, Pure K = K2O * 0.8302
    const purePPct = p2o5Pct * 0.4364;
    const pureKPct = k2oPct * 0.8302;

    return {
      pureN: Number(((rateKgHa * nPct) / 100).toFixed(2)),
      pureP: Number(((rateKgHa * purePPct) / 100).toFixed(2)),
      pureK: Number(((rateKgHa * pureKPct) / 100).toFixed(2)),
    };
  }

  private static evaluateEnvironmentalRisk(rainProbPct: number, delayHours: number) {
    if (rainProbPct >= 75) {
      return { action: 'BLOCK' as const, reason: `Rain probability ${rainProbPct}% promotes severe chemical runoff.` };
    }
    if (rainProbPct >= 45) {
      return { action: 'DEFER' as const, reason: `Rain probability ${rainProbPct}% exceeds caution threshold.` };
    }
    if (delayHours > 0) {
      return { action: 'PROCEED' as const, reason: `Application delayed by ${delayHours}h avoids localized weather front.` };
    }
    return { action: 'PROCEED' as const, reason: 'Field conditions within nominal spray parameters.' };
  }
}
