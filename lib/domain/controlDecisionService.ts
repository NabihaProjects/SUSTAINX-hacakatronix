// SOIL IQ - Closed-Loop Control Decision Engine
// SENSE -> LOCATE -> CALCULATE -> APPLY -> MEASURE -> COMPARE -> CONTROL -> LEARN
// Compares actual sprayer telemetry against grid prescription budget and produces actionable control decisions.

export interface ControlEvaluationContext {
  sprayerId: string;
  gridId: string;
  gridCode: string;
  gridStatus: 'OPTIMAL' | 'CAUTION' | 'EXCESS_RISK' | 'BLOCKED' | 'UNKNOWN';
  targetRateLpha: number;
  maxRateLpha: number;
  actualRateLpha: number;
  remainingNutrientKgHa: number;
  consumedNutrientPct: number;
  speedKmh: number;
}

export interface ControlDecisionOutput {
  decision: 'CONTINUE' | 'REDUCE' | 'STOP' | 'MANUAL_OVERRIDE';
  reason: string;
  targetRate: number;
  actualRate: number;
  variancePct: number;
  suggestedFlowRateAdjustmentPct: number;
  isAutomatic: boolean;
  severity: 'NORMAL' | 'WARNING' | 'CRITICAL';
}

export class ControlDecisionService {
  static evaluateTelemetry(ctx: ControlEvaluationContext): ControlDecisionOutput {
    const variancePct =
      ctx.targetRateLpha > 0
        ? Number((((ctx.actualRateLpha - ctx.targetRateLpha) / ctx.targetRateLpha) * 100).toFixed(1))
        : 0;

    // 1. Critical Hard Stop: Grid is locked/blocked
    if (ctx.gridStatus === 'BLOCKED') {
      return {
        decision: 'STOP',
        reason: `Grid ${ctx.gridCode} has an active BLOCK restriction. Solenoid valves instructed to SHUT OFF immediately.`,
        targetRate: ctx.targetRateLpha,
        actualRate: ctx.actualRateLpha,
        variancePct,
        suggestedFlowRateAdjustmentPct: -100,
        isAutomatic: true,
        severity: 'CRITICAL',
      };
    }

    // 2. Critical Hard Stop: Grid has already hit or exceeded its nutrient ceiling
    if (ctx.gridStatus === 'EXCESS_RISK' || ctx.consumedNutrientPct >= 100 || ctx.remainingNutrientKgHa <= 0) {
      return {
        decision: 'STOP',
        reason: `Grid ${ctx.gridCode} nutrient budget is fully exhausted (${ctx.consumedNutrientPct}% consumed). Cease further application.`,
        targetRate: ctx.targetRateLpha,
        actualRate: ctx.actualRateLpha,
        variancePct,
        suggestedFlowRateAdjustmentPct: -100,
        isAutomatic: true,
        severity: 'CRITICAL',
      };
    }

    // 3. Excessive application rate: Flow meter indicates significant over-dosing (> 15% above target)
    if (ctx.actualRateLpha > ctx.maxRateLpha || variancePct > 15.0) {
      const reductionNeeded = Math.min(60, Math.round(variancePct));
      return {
        decision: 'REDUCE',
        reason: `Current application rate (${ctx.actualRateLpha} L/ha) exceeds prescription target (${ctx.targetRateLpha} L/ha) by ${variancePct}%. Reduce PWM duty cycle.`,
        targetRate: ctx.targetRateLpha,
        actualRate: ctx.actualRateLpha,
        variancePct,
        suggestedFlowRateAdjustmentPct: -reductionNeeded,
        isAutomatic: true,
        severity: 'WARNING',
      };
    }

    // 4. Caution: Approaching budget limit (> 80% consumed)
    if (ctx.consumedNutrientPct >= 80.0 && variancePct > 5.0) {
      return {
        decision: 'REDUCE',
        reason: `Grid ${ctx.gridCode} is in CAUTION state (${ctx.consumedNutrientPct}% budget used). Throttling flow rate to avoid overshooting.`,
        targetRate: ctx.targetRateLpha,
        actualRate: ctx.actualRateLpha,
        variancePct,
        suggestedFlowRateAdjustmentPct: -15,
        isAutomatic: true,
        severity: 'WARNING',
      };
    }

    // 5. Normal operation within nominal tolerance
    return {
      decision: 'CONTINUE',
      reason: `Application rate (${ctx.actualRateLpha} L/ha) matches prescription target (${ctx.targetRateLpha} L/ha) within +/- 10% tolerance.`,
      targetRate: ctx.targetRateLpha,
      actualRate: ctx.actualRateLpha,
      variancePct,
      suggestedFlowRateAdjustmentPct: 0,
      isAutomatic: true,
      severity: 'NORMAL',
    };
  }
}
