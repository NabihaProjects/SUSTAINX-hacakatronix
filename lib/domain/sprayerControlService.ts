// SOIL IQ - Smart Sprayer Real-Time Safety & Control Engine
// SENSE -> LOCATE -> CALCULATE -> APPLY -> MEASURE -> COMPARE -> CONTROL -> LEARN
// Transparent rule-based safety state machine determining: CONTINUE, REDUCE, STOP, or MANUAL_OVERRIDE.

export interface SprayerControlInputs {
  sprayerId: string;
  gridId: string | null;
  gridCode: string | null;
  insideField: boolean;
  gridStatus?: 'OPTIMAL' | 'CAUTION' | 'EXCESS_RISK' | 'BLOCKED' | 'UNKNOWN';
  hasActivePrescription: boolean;
  prescriptionStatus?: string;
  targetRateKgHa: number;
  maxRateKgHa: number;
  minRateKgHa: number;
  actualRateKgHa: number;
  remainingBudgetKg: number;
  consumedBudgetPct: number;
  flowRateKgMin: number;
  tankLevelLiters: number;
  isEmergencyStopped: boolean;
  isManualOverride: boolean;
  environmentalRiskAction?: 'PROCEED' | 'CAUTION' | 'DEFER' | 'BLOCK';
  environmentalReason?: string;
  controlIntervalSeconds?: number;
}

export interface SprayerControlDecision {
  decision: 'CONTINUE' | 'REDUCE' | 'STOP' | 'MANUAL_OVERRIDE';
  reason: string;
  valveDutyCyclePct: number; // Suggested valve duty cycle (0, 25, 50, 75, 100%)
  targetRateKgHa: number;
  actualRateKgHa: number;
  variancePct: number;
  isAutomatic: boolean;
  severity: 'NORMAL' | 'WARNING' | 'CRITICAL';
  timestamp: Date;
}

export class SprayerControlService {
  /**
   * Evaluates machine and agronomic telemetry to produce a deterministic control decision.
   */
  static evaluate(inputs: SprayerControlInputs): SprayerControlDecision {
    const timestamp = new Date();
    const intervalSec = inputs.controlIntervalSeconds || 1.0;

    const variancePct =
      inputs.targetRateKgHa > 0
        ? Number((((inputs.actualRateKgHa - inputs.targetRateKgHa) / inputs.targetRateKgHa) * 100).toFixed(1))
        : 0;

    // 1. Critical Hard Stop: Emergency Stop Latch active
    if (inputs.isEmergencyStopped) {
      return {
        decision: 'STOP',
        reason: 'EMERGENCY STOP latched by operator. All valves forced CLOSED and pump halted.',
        valveDutyCyclePct: 0,
        targetRateKgHa: 0,
        actualRateKgHa: inputs.actualRateKgHa,
        variancePct: 0,
        isAutomatic: false,
        severity: 'CRITICAL',
        timestamp,
      };
    }

    // 2. Manual Operator Override
    if (inputs.isManualOverride) {
      return {
        decision: 'MANUAL_OVERRIDE',
        reason: 'Manual operator override active. Automatic prescription throttling bypassed.',
        valveDutyCyclePct: 100,
        targetRateKgHa: inputs.targetRateKgHa,
        actualRateKgHa: inputs.actualRateKgHa,
        variancePct,
        isAutomatic: false,
        severity: 'WARNING',
        timestamp,
      };
    }

    // 3. Machine outside field boundary
    if (!inputs.insideField || !inputs.gridId) {
      return {
        decision: 'STOP',
        reason: 'Sprayer position is OUTSIDE defined field boundaries. Shutting off valves.',
        valveDutyCyclePct: 0,
        targetRateKgHa: 0,
        actualRateKgHa: inputs.actualRateKgHa,
        variancePct: 0,
        isAutomatic: true,
        severity: 'CRITICAL',
        timestamp,
      };
    }

    // 4. Tank empty
    if (inputs.tankLevelLiters <= 0.5) {
      return {
        decision: 'STOP',
        reason: 'Fertilizer tank is EMPTY (0 L). Stopping pump and closing valves to prevent pump cavitation.',
        valveDutyCyclePct: 0,
        targetRateKgHa: 0,
        actualRateKgHa: inputs.actualRateKgHa,
        variancePct: 0,
        isAutomatic: true,
        severity: 'CRITICAL',
        timestamp,
      };
    }

    // 5. Environmental Lockout (Weather risk modifier)
    if (inputs.environmentalRiskAction === 'BLOCK' || inputs.environmentalRiskAction === 'DEFER') {
      return {
        decision: 'STOP',
        reason: `Environmental lockout active: ${inputs.environmentalReason || 'Severe weather risk'}. Application halted.`,
        valveDutyCyclePct: 0,
        targetRateKgHa: 0,
        actualRateKgHa: inputs.actualRateKgHa,
        variancePct: 0,
        isAutomatic: true,
        severity: 'CRITICAL',
        timestamp,
      };
    }

    // 6. No Active Prescription for current grid
    if (!inputs.hasActivePrescription || inputs.prescriptionStatus !== 'ACTIVE') {
      return {
        decision: 'STOP',
        reason: `No ACTIVE prescription for grid ${inputs.gridCode || 'unknown'}. Halting application to prevent unprescribed dosing.`,
        valveDutyCyclePct: 0,
        targetRateKgHa: 0,
        actualRateKgHa: inputs.actualRateKgHa,
        variancePct: 0,
        isAutomatic: true,
        severity: 'CRITICAL',
        timestamp,
      };
    }

    // 7. Grid status is BLOCKED (e.g. riparian zone, electrical line, lockout buffer)
    if (inputs.gridStatus === 'BLOCKED') {
      return {
        decision: 'STOP',
        reason: `Grid ${inputs.gridCode} has an active environmental BLOCK restriction. Valves instructed to SHUT OFF immediately.`,
        valveDutyCyclePct: 0,
        targetRateKgHa: 0,
        actualRateKgHa: inputs.actualRateKgHa,
        variancePct: 0,
        isAutomatic: true,
        severity: 'CRITICAL',
        timestamp,
      };
    }

    // 8. Grid budget fully exhausted
    if (inputs.consumedBudgetPct >= 100 || inputs.remainingBudgetKg <= 0 || inputs.gridStatus === 'EXCESS_RISK') {
      return {
        decision: 'STOP',
        reason: `Grid ${inputs.gridCode} nutrient budget is 100% exhausted. Ceasing application.`,
        valveDutyCyclePct: 0,
        targetRateKgHa: 0,
        actualRateKgHa: inputs.actualRateKgHa,
        variancePct: 0,
        isAutomatic: true,
        severity: 'CRITICAL',
        timestamp,
      };
    }

    // 9. Predictive Stop Margin:
    // If projected delivery in next interval would exceed remaining budget
    const projectedNextDeliveryKg = (inputs.flowRateKgMin * intervalSec) / 60;
    if (inputs.remainingBudgetKg > 0 && projectedNextDeliveryKg >= inputs.remainingBudgetKg) {
      return {
        decision: 'STOP',
        reason: `Predictive stop triggered: projected application (${projectedNextDeliveryKg.toFixed(2)} kg) would overshoot remaining budget (${inputs.remainingBudgetKg.toFixed(2)} kg).`,
        valveDutyCyclePct: 0,
        targetRateKgHa: inputs.targetRateKgHa,
        actualRateKgHa: inputs.actualRateKgHa,
        variancePct,
        isAutomatic: true,
        severity: 'WARNING',
        timestamp,
      };
    }

    // 10. Rate exceeds maximum prescribed ceiling (> 15% above target or > maxRate)
    if (inputs.actualRateKgHa > inputs.maxRateKgHa || variancePct > 15.0) {
      return {
        decision: 'REDUCE',
        reason: `Application rate (${inputs.actualRateKgHa} kg/ha) exceeds prescribed limit (${inputs.targetRateKgHa} kg/ha) by ${variancePct}%. Throttling valve duty cycle to 60%.`,
        valveDutyCyclePct: 60,
        targetRateKgHa: inputs.targetRateKgHa,
        actualRateKgHa: inputs.actualRateKgHa,
        variancePct,
        isAutomatic: true,
        severity: 'WARNING',
        timestamp,
      };
    }

    // 11. Approaching nutrient ceiling (> 80% consumed)
    if (inputs.consumedBudgetPct >= 80.0 && variancePct > 5.0) {
      return {
        decision: 'REDUCE',
        reason: `Grid ${inputs.gridCode} budget is in CAUTION state (${inputs.consumedBudgetPct.toFixed(1)}% consumed). Throttling flow to 50% to prevent overshoot.`,
        valveDutyCyclePct: 50,
        targetRateKgHa: inputs.targetRateKgHa,
        actualRateKgHa: inputs.actualRateKgHa,
        variancePct,
        isAutomatic: true,
        severity: 'WARNING',
        timestamp,
      };
    }

    // 12. Normal operation within target range
    return {
      decision: 'CONTINUE',
      reason: `Application rate (${inputs.actualRateKgHa} kg/ha) matches prescription target (${inputs.targetRateKgHa} kg/ha) within nominal tolerance.`,
      valveDutyCyclePct: 100,
      targetRateKgHa: inputs.targetRateKgHa,
      actualRateKgHa: inputs.actualRateKgHa,
      variancePct,
      isAutomatic: true,
      severity: 'NORMAL',
      timestamp,
    };
  }
}
