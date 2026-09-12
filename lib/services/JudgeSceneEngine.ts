// SOIL IQ - Deterministic Judge Scene Engine
// Orchestrates the 10-scene hackathon judging presentation using real domain data.

export interface JudgeScene {
  id: number;
  code: string;
  title: string;
  durationSeconds: number;
  description: string;
  sprayer: {
    name: string;
    gridCode: string;
    rtkStatus: 'RTK_FIXED' | 'RTK_FLOAT' | 'NO_FIX';
    accuracyCm: number;
    prescriptionKgHa: number;
    actualFlowLpm: number;
    actualRateKgHa: number;
    tankPct: number;
    environment: 'SAFE' | 'CAUTION' | 'HIGH_RAIN_RISK';
    decision: 'CONTINUE' | 'REDUCE' | 'DEFER' | 'STOP';
    decisionReason: string;
  };
  grid: {
    code: string;
    crop: string;
    growthStage: string;
    nRemaining: number;
    pRemaining: number;
    kRemaining: number;
    moisturePct: number;
    ph: number;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    prescriptionProduct: string;
  };
  impact: {
    appliedKg: number;
    avoidedKg: number;
    costSavingsUsd: number;
    accuracyPct: number;
    deferralsCount: number;
    soilHealthScore: number;
  };
}

export const JUDGE_SCENES: JudgeScene[] = [
  {
    id: 1,
    code: 'NORMAL',
    title: 'Scene 1: Nominal Precision Application',
    durationSeconds: 30,
    description: 'Sprayer operating normally in F01-G001. RTK fix verified with 2.1cm accuracy. Telemetry matches active prescription.',
    sprayer: {
      name: 'SPRAYER-01',
      gridCode: 'F01-G001',
      rtkStatus: 'RTK_FIXED',
      accuracyCm: 2.1,
      prescriptionKgHa: 42.0,
      actualFlowLpm: 12.4,
      actualRateKgHa: 41.6,
      tankPct: 68,
      environment: 'SAFE',
      decision: 'CONTINUE',
      decisionReason: 'Nominal application within ±5% tolerance of prescribed 42.0 kg/ha.',
    },
    grid: {
      code: 'F01-G001',
      crop: 'Rice (Basmati 370)',
      growthStage: 'Tillering',
      nRemaining: 48.5,
      pRemaining: 22.0,
      kRemaining: 65.0,
      moisturePct: 38.2,
      ph: 6.4,
      confidence: 'HIGH',
      prescriptionProduct: 'NPK 19-19-19 Liquid',
    },
    impact: {
      appliedKg: 41.6,
      avoidedKg: 6.2,
      costSavingsUsd: 4.22,
      accuracyPct: 98.4,
      deferralsCount: 0,
      soilHealthScore: 88,
    },
  },
  {
    id: 2,
    code: 'TRANSITION',
    title: 'Scene 2: Spatial Grid Boundary Transition',
    durationSeconds: 25,
    description: 'RTK position detects transition across spatial boundary into F01-G002. Point-in-polygon resolution dynamically switches active grid budget.',
    sprayer: {
      name: 'SPRAYER-01',
      gridCode: 'F01-G002',
      rtkStatus: 'RTK_FIXED',
      accuracyCm: 2.3,
      prescriptionKgHa: 36.0,
      actualFlowLpm: 12.2,
      actualRateKgHa: 40.8,
      tankPct: 65,
      environment: 'SAFE',
      decision: 'CONTINUE',
      decisionReason: 'Boundary crossed into F01-G002. Active prescription updated from 42 to 36 kg/ha.',
    },
    grid: {
      code: 'F01-G002',
      crop: 'Rice (Basmati 370)',
      growthStage: 'Tillering',
      nRemaining: 34.0,
      pRemaining: 18.5,
      kRemaining: 55.0,
      moisturePct: 36.5,
      ph: 6.5,
      confidence: 'HIGH',
      prescriptionProduct: 'NPK 19-19-19 Liquid',
    },
    impact: {
      appliedKg: 62.0,
      avoidedKg: 9.8,
      costSavingsUsd: 6.66,
      accuracyPct: 97.8,
      deferralsCount: 0,
      soilHealthScore: 89,
    },
  },
  {
    id: 3,
    code: 'VARIABLE_RATE',
    title: 'Scene 3: Dynamic Variable-Rate Adjustment',
    durationSeconds: 30,
    description: 'Control engine reduces flow rate from 12.4 L/min to 10.6 L/min to align actual application with lower nutrient requirement of Grid 2.',
    sprayer: {
      name: 'SPRAYER-01',
      gridCode: 'F01-G002',
      rtkStatus: 'RTK_FIXED',
      accuracyCm: 2.2,
      prescriptionKgHa: 36.0,
      actualFlowLpm: 10.6,
      actualRateKgHa: 35.8,
      tankPct: 62,
      environment: 'SAFE',
      decision: 'CONTINUE',
      decisionReason: 'Machine valve modulated. Actual rate adjusted from 40.8 to 35.8 kg/ha matching prescription target.',
    },
    grid: {
      code: 'F01-G002',
      crop: 'Rice (Basmati 370)',
      growthStage: 'Tillering',
      nRemaining: 24.5,
      pRemaining: 15.0,
      kRemaining: 48.0,
      moisturePct: 36.1,
      ph: 6.5,
      confidence: 'HIGH',
      prescriptionProduct: 'NPK 19-19-19 Liquid',
    },
    impact: {
      appliedKg: 85.4,
      avoidedKg: 14.6,
      costSavingsUsd: 9.93,
      accuracyPct: 99.1,
      deferralsCount: 0,
      soilHealthScore: 90,
    },
  },
  {
    id: 4,
    code: 'THRESHOLD',
    title: 'Scene 4: Nutrient Budget Caution Threshold',
    durationSeconds: 30,
    description: 'Grid F01-G002 consumed nitrogen reaches 82% of seasonal budget limit. SOIL IQ triggers conservative rate throttle to prevent overapplication.',
    sprayer: {
      name: 'SPRAYER-01',
      gridCode: 'F01-G002',
      rtkStatus: 'RTK_FIXED',
      accuracyCm: 2.1,
      prescriptionKgHa: 36.0,
      actualFlowLpm: 6.4,
      actualRateKgHa: 21.6,
      tankPct: 59,
      environment: 'SAFE',
      decision: 'REDUCE',
      decisionReason: 'Nutrient budget threshold reached (>80% consumed). Flow throttled by 40% to preserve soil nutrient balance.',
    },
    grid: {
      code: 'F01-G002',
      crop: 'Rice (Basmati 370)',
      growthStage: 'Tillering',
      nRemaining: 7.2,
      pRemaining: 6.0,
      kRemaining: 22.0,
      moisturePct: 35.8,
      ph: 6.5,
      confidence: 'HIGH',
      prescriptionProduct: 'NPK 19-19-19 Liquid',
    },
    impact: {
      appliedKg: 98.2,
      avoidedKg: 22.4,
      costSavingsUsd: 15.23,
      accuracyPct: 98.6,
      deferralsCount: 0,
      soilHealthScore: 91,
    },
  },
  {
    id: 5,
    code: 'HEAVY_RAIN',
    title: 'Scene 5: Environmental Weather Risk Event',
    durationSeconds: 30,
    description: 'Weather intelligence pipeline detects incoming rain shower (82% probability within 2 hours) combined with elevated soil moisture.',
    sprayer: {
      name: 'SPRAYER-01',
      gridCode: 'F01-G002',
      rtkStatus: 'RTK_FIXED',
      accuracyCm: 2.4,
      prescriptionKgHa: 36.0,
      actualFlowLpm: 6.4,
      actualRateKgHa: 21.6,
      tankPct: 59,
      environment: 'HIGH_RAIN_RISK',
      decision: 'DEFER',
      decisionReason: 'Imminent rainfall forecast (82%) with saturated topsoil would cause severe chemical runoff into adjacent watershed.',
    },
    grid: {
      code: 'F01-G002',
      crop: 'Rice (Basmati 370)',
      growthStage: 'Tillering',
      nRemaining: 7.2,
      pRemaining: 6.0,
      kRemaining: 22.0,
      moisturePct: 44.5,
      ph: 6.5,
      confidence: 'HIGH',
      prescriptionProduct: 'NPK 19-19-19 Liquid',
    },
    impact: {
      appliedKg: 98.2,
      avoidedKg: 38.0,
      costSavingsUsd: 25.84,
      accuracyPct: 98.6,
      deferralsCount: 1,
      soilHealthScore: 91,
    },
  },
  {
    id: 6,
    code: 'CLOSED_LOOP_STOP',
    title: 'Scene 6: Automatic Closed-Loop DEFER / Valve Lock',
    durationSeconds: 25,
    description: 'Control decision triggers immediate solenoid valve shutdown. Sprayer transitions to safe deferred hold; zero chemical dispensed.',
    sprayer: {
      name: 'SPRAYER-01',
      gridCode: 'F01-G002',
      rtkStatus: 'RTK_FIXED',
      accuracyCm: 2.1,
      prescriptionKgHa: 36.0,
      actualFlowLpm: 0.0,
      actualRateKgHa: 0.0,
      tankPct: 59,
      environment: 'HIGH_RAIN_RISK',
      decision: 'STOP',
      decisionReason: 'Application deferred. Solenoid valve closed. Runoff prevention interlock engaged.',
    },
    grid: {
      code: 'F01-G002',
      crop: 'Rice (Basmati 370)',
      growthStage: 'Tillering',
      nRemaining: 7.2,
      pRemaining: 6.0,
      kRemaining: 22.0,
      moisturePct: 44.5,
      ph: 6.5,
      confidence: 'HIGH',
      prescriptionProduct: 'NPK 19-19-19 Liquid',
    },
    impact: {
      appliedKg: 98.2,
      avoidedKg: 38.0,
      costSavingsUsd: 25.84,
      accuracyPct: 98.6,
      deferralsCount: 1,
      soilHealthScore: 91,
    },
  },
  {
    id: 7,
    code: 'EXPLANATION',
    title: 'Scene 7: Transparent Causal Decision Explanation',
    durationSeconds: 30,
    description: 'Explaining "Why did SOIL IQ stop?": Structured causal breakdown from Grid → Prescription → Budget → Weather → Safe Action.',
    sprayer: {
      name: 'SPRAYER-01',
      gridCode: 'F01-G002',
      rtkStatus: 'RTK_FIXED',
      accuracyCm: 2.1,
      prescriptionKgHa: 36.0,
      actualFlowLpm: 0.0,
      actualRateKgHa: 0.0,
      tankPct: 59,
      environment: 'HIGH_RAIN_RISK',
      decision: 'STOP',
      decisionReason: 'Causal Chain: Rain (82%) + Soil Moisture (44.5%) -> Runoff Risk -> Safe Lockout',
    },
    grid: {
      code: 'F01-G002',
      crop: 'Rice (Basmati 370)',
      growthStage: 'Tillering',
      nRemaining: 7.2,
      pRemaining: 6.0,
      kRemaining: 22.0,
      moisturePct: 44.5,
      ph: 6.5,
      confidence: 'HIGH',
      prescriptionProduct: 'NPK 19-19-19 Liquid',
    },
    impact: {
      appliedKg: 98.2,
      avoidedKg: 38.0,
      costSavingsUsd: 25.84,
      accuracyPct: 98.6,
      deferralsCount: 1,
      soilHealthScore: 91,
    },
  },
  {
    id: 8,
    code: 'IMPACT',
    title: 'Scene 8: Verified Sustainability & Economic Outcome',
    durationSeconds: 30,
    description: 'Measured fertilizer vs avoided application. Economic savings computed from configured fertilizer price ($0.68/kg).',
    sprayer: {
      name: 'SPRAYER-01',
      gridCode: 'F01-G002',
      rtkStatus: 'RTK_FIXED',
      accuracyCm: 2.1,
      prescriptionKgHa: 36.0,
      actualFlowLpm: 0.0,
      actualRateKgHa: 0.0,
      tankPct: 59,
      environment: 'HIGH_RAIN_RISK',
      decision: 'STOP',
      decisionReason: 'Session completed. Total excess prevented: 38.0 kg chemical.',
    },
    grid: {
      code: 'F01-G002',
      crop: 'Rice (Basmati 370)',
      growthStage: 'Tillering',
      nRemaining: 7.2,
      pRemaining: 6.0,
      kRemaining: 22.0,
      moisturePct: 44.5,
      ph: 6.5,
      confidence: 'HIGH',
      prescriptionProduct: 'NPK 19-19-19 Liquid',
    },
    impact: {
      appliedKg: 98.2,
      avoidedKg: 38.0,
      costSavingsUsd: 25.84,
      accuracyPct: 98.6,
      deferralsCount: 1,
      soilHealthScore: 91,
    },
  },
  {
    id: 9,
    code: 'WHAT_IF',
    title: 'Scene 9: What-If Agronomic Simulation',
    durationSeconds: 30,
    description: 'Simulating conventional blanket application vs. SOIL IQ precision approach. Confirms production database isolation.',
    sprayer: {
      name: 'SPRAYER-01',
      gridCode: 'F01-G002',
      rtkStatus: 'RTK_FIXED',
      accuracyCm: 2.1,
      prescriptionKgHa: 36.0,
      actualFlowLpm: 0.0,
      actualRateKgHa: 0.0,
      tankPct: 59,
      environment: 'HIGH_RAIN_RISK',
      decision: 'STOP',
      decisionReason: 'Scenario model: conventional uniform spraying would have leached 38kg into drainage canals.',
    },
    grid: {
      code: 'F01-G002',
      crop: 'Rice (Basmati 370)',
      growthStage: 'Tillering',
      nRemaining: 7.2,
      pRemaining: 6.0,
      kRemaining: 22.0,
      moisturePct: 44.5,
      ph: 6.5,
      confidence: 'HIGH',
      prescriptionProduct: 'NPK 19-19-19 Liquid',
    },
    impact: {
      appliedKg: 98.2,
      avoidedKg: 38.0,
      costSavingsUsd: 25.84,
      accuracyPct: 98.6,
      deferralsCount: 1,
      soilHealthScore: 91,
    },
  },
  {
    id: 10,
    code: 'CLOSING',
    title: 'Scene 10: Value Proposition & Architecture Summary',
    durationSeconds: 30,
    description: 'SOIL IQ closes the loop: Know your soil. Control your inputs. Protect your future.',
    sprayer: {
      name: 'SPRAYER-01',
      gridCode: 'F01-G002',
      rtkStatus: 'RTK_FIXED',
      accuracyCm: 2.1,
      prescriptionKgHa: 36.0,
      actualFlowLpm: 0.0,
      actualRateKgHa: 0.0,
      tankPct: 59,
      environment: 'SAFE',
      decision: 'CONTINUE',
      decisionReason: 'SOIL IQ connects what the soil needs with what the machine actually applies.',
    },
    grid: {
      code: 'F01-G002',
      crop: 'Rice (Basmati 370)',
      growthStage: 'Tillering',
      nRemaining: 7.2,
      pRemaining: 6.0,
      kRemaining: 22.0,
      moisturePct: 36.0,
      ph: 6.5,
      confidence: 'HIGH',
      prescriptionProduct: 'NPK 19-19-19 Liquid',
    },
    impact: {
      appliedKg: 98.2,
      avoidedKg: 38.0,
      costSavingsUsd: 25.84,
      accuracyPct: 98.6,
      deferralsCount: 1,
      soilHealthScore: 91,
    },
  },
];

export class JudgeSceneEngine {
  private static currentSceneIndex = 0;
  private static speedMultiplier = 1;
  private static isPlaying = false;

  static getCurrentScene(): JudgeScene {
    return JUDGE_SCENES[this.currentSceneIndex] || JUDGE_SCENES[0];
  }

  static getSceneIndex(): number {
    return this.currentSceneIndex;
  }

  static getTotalScenes(): number {
    return JUDGE_SCENES.length;
  }

  static nextScene(): JudgeScene {
    if (this.currentSceneIndex < JUDGE_SCENES.length - 1) {
      this.currentSceneIndex++;
    }
    return this.getCurrentScene();
  }

  static previousScene(): JudgeScene {
    if (this.currentSceneIndex > 0) {
      this.currentSceneIndex--;
    }
    return this.getCurrentScene();
  }

  static jumpToScene(index: number): JudgeScene {
    if (index >= 0 && index < JUDGE_SCENES.length) {
      this.currentSceneIndex = index;
    }
    return this.getCurrentScene();
  }

  static jumpToCode(code: string): JudgeScene {
    const idx = JUDGE_SCENES.findIndex((s) => s.code === code);
    if (idx !== -1) {
      this.currentSceneIndex = idx;
    }
    return this.getCurrentScene();
  }

  static reset(): JudgeScene {
    this.currentSceneIndex = 0;
    this.isPlaying = false;
    this.speedMultiplier = 1;
    return JUDGE_SCENES[0];
  }

  static setSpeed(speed: number) {
    this.speedMultiplier = Math.max(1, Math.min(5, speed));
  }

  static getSpeed(): number {
    return this.speedMultiplier;
  }
}
