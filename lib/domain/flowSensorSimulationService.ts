// SOIL IQ - Flow Sensor & Fertilizer Application Physics Service
// Converts sprayer speed, boom width, and valve state into actual fertilizer flow and application rate.
// Maintains clear separation between Gross Fertilizer Mass and Pure Elemental Nutrients (N, P, K).

export interface FlowPhysicsInputs {
  targetRateKgHa: number;       // Prescribed target rate (kg fertilizer / ha)
  currentSpeedKmh: number;      // Ground speed from RTK-GNSS / wheel radar (km/h)
  swathWidthMeters: number;     // Effective spray boom width (meters), default 12m
  valveDutyCyclePct: number;    // Valve throttle duty cycle (0 - 100%), default 100%
  pumpOperating: boolean;       // Master pump state
  densityKgPerL?: number;       // Fluid density if liquid (kg/L), default 1.0
  addNoise?: boolean;           // Realistic small sensor noise (+/- 1.5%)
}

export interface FlowPhysicsOutput {
  actualFlowRateKgMin: number;  // Mass flow rate (kg/min)
  actualFlowRateLpm: number;    // Volumetric flow rate (L/min)
  actualApplicationRateKgHa: number; // Fertilizer quantity applied per hectare
  targetFlowRateKgMin: number;
  variancePct: number;          // % deviation from prescribed target
  applicationAccuracy: number;  // 0.0 - 1.0 prototype accuracy index
}

export class FlowSensorSimulationService {
  /**
   * Fundamental Agricultural Spraying Equation:
   *
   *   Application Rate (kg/ha) = [ Flow Rate (kg/min) * 600 ] / [ Speed (km/h) * Swath Width (m) ]
   *
   * Conversely:
   *   Flow Rate (kg/min) = [ Target Rate (kg/ha) * Speed (km/h) * Swath Width (m) ] / 600
   *
   * Note: The constant 600 derives from:
   *   (10,000 m²/ha) / [ (1,000 m/km) * (1 hr / 60 min) ] = 600
   */
  static calculateFlowAndApplication(inputs: FlowPhysicsInputs): FlowPhysicsOutput {
    const speed = Math.max(0, inputs.currentSpeedKmh);
    const swath = Math.max(1, inputs.swathWidthMeters);
    const density = Math.max(0.1, inputs.densityKgPerL || 1.0);

    // If speed is zero or pump is OFF, no product can be applied
    if (speed <= 0.1 || !inputs.pumpOperating || inputs.valveDutyCyclePct <= 0) {
      return {
        actualFlowRateKgMin: 0,
        actualFlowRateLpm: 0,
        actualApplicationRateKgHa: 0,
        targetFlowRateKgMin: 0,
        variancePct: inputs.targetRateKgHa > 0 ? -100 : 0,
        applicationAccuracy: inputs.targetRateKgHa === 0 ? 1.0 : 0.0,
      };
    }

    // Nominal target flow rate needed to deliver target application rate
    const targetFlowRateKgMin = (inputs.targetRateKgHa * speed * swath) / 600;

    // Apply valve modulation (PWM duty cycle 0.0 - 1.0)
    const dutyMultiplier = Math.min(1.0, Math.max(0.0, inputs.valveDutyCyclePct / 100));
    let modulatedFlow = targetFlowRateKgMin * dutyMultiplier;

    // Introduce realistic slight measurement noise (+/- 1.5%) if requested
    if (inputs.addNoise && modulatedFlow > 0) {
      const noiseFactor = 1.0 + (Math.sin(Date.now() / 1000) * 0.015);
      modulatedFlow *= noiseFactor;
    }

    // Resulting application rate based on delivered flow
    const actualApplicationRateKgHa = (modulatedFlow * 600) / (speed * swath);
    const actualFlowRateLpm = modulatedFlow / density;

    // Deviation & accuracy calculations
    const variancePct =
      inputs.targetRateKgHa > 0
        ? Number((((actualApplicationRateKgHa - inputs.targetRateKgHa) / inputs.targetRateKgHa) * 100).toFixed(1))
        : 0;

    // Prototype Accuracy Metric: 1 - abs(actual - target) / target (clamped between 0 and 1)
    const accuracy =
      inputs.targetRateKgHa > 0
        ? Math.max(0, Math.min(1.0, 1.0 - Math.abs(actualApplicationRateKgHa - inputs.targetRateKgHa) / inputs.targetRateKgHa))
        : 1.0;

    return {
      actualFlowRateKgMin: Number(modulatedFlow.toFixed(3)),
      actualFlowRateLpm: Number(actualFlowRateLpm.toFixed(2)),
      actualApplicationRateKgHa: Number(actualApplicationRateKgHa.toFixed(1)),
      targetFlowRateKgMin: Number(targetFlowRateKgMin.toFixed(3)),
      variancePct,
      applicationAccuracy: Number(accuracy.toFixed(3)),
    };
  }

  /**
   * Calculates mass applied over a discrete time slice (e.g. 1 second tick)
   */
  static calculateIntervalMass(flowRateKgMin: number, durationSeconds: number): number {
    if (flowRateKgMin <= 0 || durationSeconds <= 0) return 0;
    return Number(((flowRateKgMin * durationSeconds) / 60).toFixed(4));
  }

  /**
   * Converts gross applied fertilizer mass into pure elemental N, P, and K.
   */
  static calculateNutrientContribution(
    quantityKg: number,
    nPercent: number,
    pPercent: number,
    kPercent: number
  ) {
    return {
      pureN: Number(((quantityKg * nPercent) / 100).toFixed(4)),
      pureP: Number(((quantityKg * pPercent) / 100).toFixed(4)),
      pureK: Number(((quantityKg * kPercent) / 100).toFixed(4)),
    };
  }

  /**
   * Simulates remaining tank level after application.
   */
  static calculateNewTankLevel(
    currentTankLiters: number,
    flowRateLpm: number,
    durationSeconds: number
  ): { newLevelL: number; tankPct: number; isLow: boolean; isEmpty: boolean } {
    const consumedL = (flowRateLpm * durationSeconds) / 60;
    const newLevelL = Math.max(0, currentTankLiters - consumedL);
    const tankPct = Number(((newLevelL / 4500) * 100).toFixed(1)); // based on nominal 4500L tank

    return {
      newLevelL: Number(newLevelL.toFixed(1)),
      tankPct,
      isLow: tankPct <= 20.0,
      isEmpty: newLevelL <= 0.1,
    };
  }
}
