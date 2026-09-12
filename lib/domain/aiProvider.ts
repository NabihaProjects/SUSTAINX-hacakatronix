// SOIL IQ - AI Provider Abstraction Layer
// Defines vendor-neutral intelligence interfaces with deterministic fallback.
// Enforces that deterministic logic remains active even if no external LLM is configured.

import { ExplanationFact, ExplanationService, StructuredExplanation } from './explanationService';

export interface FarmSummaryContext {
  farmName: string;
  totalGrids: number;
  optimalGridsCount: number;
  cautionGridsCount: number;
  excessGridsCount: number;
  blockedGridsCount: number;
  activeSprayersCount: number;
  averageSoilHealth: number;
  topAnomaliesCount: number;
  weatherLockoutsCount: number;
}

export interface AnomalyContext {
  gridCode: string;
  metricName: string;
  metricLabel?: string;
  expectedValue: number;
  actualValue: number;
  deviationPct: number;
  severity: string;
  recentHistory: number[];
}

export interface ScenarioComparisonContext {
  baselineName: string;
  scenarioName: string;
  productBaseline: string;
  productScenario: string;
  rateBaselineKgHa: number;
  rateScenarioKgHa: number;
  costDeltaPct: number;
  soilHealthDelta: number;
  riskBaseline: string;
  riskScenario: string;
}

export interface AIProvider {
  generateExplanation(facts: ExplanationFact[], product?: string, rate?: number): Promise<StructuredExplanation>;
  summarizeFarm(ctx: FarmSummaryContext): Promise<string>;
  explainAnomaly(ctx: AnomalyContext): Promise<{ explanation: string; hypotheses: string[]; recommendedAction: string }>;
  explainScenario(ctx: ScenarioComparisonContext): Promise<string>;
}

/**
 * Deterministic AI Provider
 * High-performance, zero-latency, 100% deterministic rule/template engine.
 * Never hallucinates and never requires an external API key.
 */
export class DeterministicAIProvider implements AIProvider {
  async generateExplanation(facts: ExplanationFact[], product?: string, rate?: number): Promise<StructuredExplanation> {
    return ExplanationService.generateExplanation(facts, product, rate);
  }

  async summarizeFarm(ctx: FarmSummaryContext): Promise<string> {
    const compliancePct = Math.round((ctx.optimalGridsCount / Math.max(1, ctx.totalGrids)) * 100);
    const healthDesc =
      ctx.averageSoilHealth >= 80 ? 'Robust' : ctx.averageSoilHealth >= 65 ? 'Moderate' : 'Stressed';

    let summary = `${ctx.farmName} comprises ${ctx.totalGrids} spatial management grids with ${compliancePct}% currently operating within optimal nutrient budget ceilings. `;

    if (ctx.cautionGridsCount > 0 || ctx.excessGridsCount > 0) {
      summary += `Caution or excess nutrient accumulation is present in ${ctx.cautionGridsCount + ctx.excessGridsCount} grids, primarily driven by legacy nitrogen or phosphorus loading. `;
    }

    if (ctx.weatherLockoutsCount > 0) {
      summary += `Weather conditions enforce active spray lockouts across ${ctx.weatherLockoutsCount} field sectors. `;
    }

    summary += `Farm soil health is rated as ${healthDesc} (${ctx.averageSoilHealth}/100) with ${ctx.topAnomaliesCount} operational anomalies under active monitoring.`;
    return summary;
  }

  async explainAnomaly(ctx: AnomalyContext): Promise<{ explanation: string; hypotheses: string[]; recommendedAction: string }> {
    const dir = ctx.actualValue > ctx.expectedValue ? 'increase' : 'decrease';
    const explanation = `Observed a ${Math.abs(ctx.deviationPct)}% sudden ${dir} in ${ctx.metricLabel || ctx.metricName} on grid ${ctx.gridCode} (Measured: ${ctx.actualValue} vs Expected: ${ctx.expectedValue}).`;

    const hypotheses: string[] = [];
    let action = 'Verify field sensor telemetry and inspect soil condition.';

    if (ctx.metricName.includes('moisture')) {
      hypotheses.push('Localized heavy precipitation event in topsoil layer');
      hypotheses.push('Subsurface irrigation drip line pooling or leakage');
      hypotheses.push('Sensor probe capacitive contact anomaly or soil cavitation');
      action = 'Cross-reference micro-weather station rainfall logs before modifying irrigation schedules.';
    } else if (ctx.metricName.includes('p') || ctx.metricName.includes('phosphorus')) {
      hypotheses.push('Recent DAP/NPK application contribution in top 15cm');
      hypotheses.push('Legacy phosphorus solubilization from localized pH shift');
      action = 'Select low-phosphorus or zero-P top-dress formulations for upcoming passes.';
    } else if (ctx.metricName.includes('flow') || ctx.metricName.includes('rate')) {
      hypotheses.push('Nozzle manifold pressure surge or solenoid valve PWM drift');
      hypotheses.push('Ground speed sensor wheel slip causing rate calculation mismatch');
      action = 'Inspect sprayer flow control valve calibration and wheel speed radar.';
    } else {
      hypotheses.push('Sensor calibration drift or telemetry packet timing jitter');
      hypotheses.push('Localized soil heterogeneity or micro-topographical variance');
    }

    return { explanation, hypotheses, recommendedAction: action };
  }

  async explainScenario(ctx: ScenarioComparisonContext): Promise<string> {
    const costText =
      ctx.costDeltaPct < 0
        ? `saving approximately ${Math.abs(ctx.costDeltaPct)}% in input expenditure`
        : `increasing fertilizer expenditure by ${ctx.costDeltaPct}%`;

    const healthText =
      ctx.soilHealthDelta > 0
        ? `elevates the projected 3-year soil health trajectory by +${ctx.soilHealthDelta} points`
        : `reduces soil health index by ${Math.abs(ctx.soilHealthDelta)} points due to elevated chemical loading`;

    return `Shifting from baseline (${ctx.productBaseline} @ ${ctx.rateBaselineKgHa} kg/ha) to scenario (${ctx.productScenario} @ ${ctx.rateScenarioKgHa} kg/ha) ${costText}. This adjustment ${healthText} while altering environmental risk from ${ctx.riskBaseline} to ${ctx.riskScenario}.`;
  }
}

/**
 * Optional LLM Provider with automatic fallback to DeterministicAIProvider.
 */
export class OptionalLLMProvider implements AIProvider {
  private fallback = new DeterministicAIProvider();
  private hasApiKey = false;

  constructor() {
    this.hasApiKey = Boolean(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);
  }

  async generateExplanation(facts: ExplanationFact[], product?: string, rate?: number): Promise<StructuredExplanation> {
    // LLM augmentation can polish wording, but the deterministic facts remain canonical
    return this.fallback.generateExplanation(facts, product, rate);
  }

  async summarizeFarm(ctx: FarmSummaryContext): Promise<string> {
    return this.fallback.summarizeFarm(ctx);
  }

  async explainAnomaly(ctx: AnomalyContext): Promise<{ explanation: string; hypotheses: string[]; recommendedAction: string }> {
    return this.fallback.explainAnomaly(ctx);
  }

  async explainScenario(ctx: ScenarioComparisonContext): Promise<string> {
    return this.fallback.explainScenario(ctx);
  }
}

// Global AI Provider singleton (Deterministic by design)
export const aiProvider: AIProvider = new OptionalLLMProvider();
