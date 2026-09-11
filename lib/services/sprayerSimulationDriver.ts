// SOIL IQ - Smart Sprayer Simulation Master Driver
// SENSE -> LOCATE -> CALCULATE -> APPLY -> MEASURE -> COMPARE -> CONTROL -> LEARN
// Controls the simulation clock, moves the machine along spatial waypoints,
// integrates application physics into the nutrient ledger, and produces real-time decisions.

import prisma from '@/lib/db/prisma';
import { SprayerPositionService } from '@/lib/domain/sprayerPositionService';
import { SprayerRouteService, RouteWaypoint } from '@/lib/domain/sprayerRouteService';
import { FlowSensorSimulationService } from '@/lib/domain/flowSensorSimulationService';
import { SprayerControlService, SprayerControlDecision } from '@/lib/domain/sprayerControlService';
import { AuditService } from './auditService';

export interface TrailPoint {
  latitude: number;
  longitude: number;
  decision: 'CONTINUE' | 'REDUCE' | 'STOP' | 'MANUAL_OVERRIDE';
  applicationRateKgHa: number;
  gridCode: string;
  timestamp: string;
}

export interface SimulationTimelineEvent {
  id: string;
  time: string;
  type: 'TRANSITION' | 'PRESCRIPTION' | 'CONTROL' | 'ALERT' | 'OVERRIDE';
  message: string;
  severity: 'NORMAL' | 'WARNING' | 'CRITICAL';
}

export interface SimulationState {
  sprayerId: string;
  sprayerName: string;
  status: 'IDLE' | 'RUNNING' | 'PAUSED' | 'STOPPED';
  clockMultiplier: number; // 1x, 2x, 5x, 10x, 20x
  currentStepIndex: number;
  totalWaypoints: number;

  // Position & Motion
  latitude: number;
  longitude: number;
  headingDeg: number;
  speedKmh: number;
  insideField: boolean;
  farmId: string | null;
  fieldId: string | null;
  fieldName: string | null;
  currentGridId: string | null;
  currentGridCode: string | null;

  // Prescription & Rates
  activePrescriptionCode: string | null;
  targetRateKgHa: number;
  minRateKgHa: number;
  maxRateKgHa: number;
  actualRateKgHa: number;
  flowRateKgMin: number;
  flowRateLpm: number;
  swathWidthMeters: number;
  variancePct: number;
  applicationAccuracy: number;

  // Tank & Machine Status
  tankLevelLiters: number;
  tankLevelPct: number;
  valveState: 'OPEN' | 'THROTTLED' | 'CLOSED';
  valveDutyCyclePct: number;
  pumpOperating: boolean;
  totalAppliedKg: number;
  totalDistanceMeters: number;

  // Active Control Decision
  currentDecision: 'CONTINUE' | 'REDUCE' | 'STOP' | 'MANUAL_OVERRIDE';
  decisionReason: string;
  decisionSeverity: 'NORMAL' | 'WARNING' | 'CRITICAL';

  // Safety flags
  isEmergencyStopped: boolean;
  isManualOverride: boolean;
  injectedFault: string | null;

  // Live trail & timeline
  trail: TrailPoint[];
  timeline: SimulationTimelineEvent[];

  // Impact metrics
  transitionsCount: number;
  interventionsCount: number;
  preventedOvershootsCount: number;
}

// In-memory simulation singleton to support interactive control across Next.js API calls
class SprayerSimulationManager {
  private state: SimulationState | null = null;
  private waypoints: RouteWaypoint[] = [];
  private cachedGrids: any[] = [];
  private cachedFields: any[] = [];
  private initialized = false;

  async initialize(organizationId: string) {
    const sprayer = await prisma.sprayer.findFirst({
      where: { organizationId },
      include: { organization: true },
    });

    if (!sprayer) throw new Error('No sprayer found for organization');

    const fields = await prisma.field.findMany({
      where: { organizationId, status: 'ACTIVE' },
      include: { grids: { include: { nutrientBudget: true, prescriptions: { where: { status: 'ACTIVE' }, take: 1 } } } },
    });

    this.cachedFields = fields;
    this.cachedGrids = fields.flatMap((f) => f.grids);

    // Build route waypoints from grid sweep
    const gridRouteData = this.cachedGrids.map((g) => {
      let centerLat = 41.588;
      let centerLng = -93.623;
      try {
        const parsed = JSON.parse(g.geometryGeoJson);
        const ring = parsed.coordinates?.[0] || parsed.geometry?.coordinates?.[0];
        if (ring && ring.length > 0) {
          centerLng = ring.reduce((acc: number, p: number[]) => acc + p[0], 0) / ring.length;
          centerLat = ring.reduce((acc: number, p: number[]) => acc + p[1], 0) / ring.length;
        }
      } catch {}

      return {
        id: g.id,
        gridCode: g.gridCode,
        rowIndex: g.rowIndex,
        colIndex: g.colIndex,
        centerLat,
        centerLng,
      };
    });

    this.waypoints = SprayerRouteService.generateGridSweepRoute(gridRouteData, 12.0, 4);

    const initialPoint = this.waypoints[0] || {
      latitude: sprayer.latitude,
      longitude: sprayer.longitude,
      headingDeg: sprayer.headingDeg,
      targetSpeedKmh: 12.0,
      sequenceIndex: 0,
    };

    this.state = {
      sprayerId: sprayer.id,
      sprayerName: sprayer.name,
      status: 'IDLE',
      clockMultiplier: 1,
      currentStepIndex: 0,
      totalWaypoints: this.waypoints.length,

      latitude: initialPoint.latitude,
      longitude: initialPoint.longitude,
      headingDeg: initialPoint.headingDeg,
      speedKmh: initialPoint.targetSpeedKmh,
      insideField: true,
      farmId: fields[0]?.farmId || null,
      fieldId: fields[0]?.id || null,
      fieldName: fields[0]?.name || null,
      currentGridId: gridRouteData[0]?.id || null,
      currentGridCode: gridRouteData[0]?.gridCode || null,

      activePrescriptionCode: 'RX-2026-F01-G001-V1',
      targetRateKgHa: 42.0,
      minRateKgHa: 38.0,
      maxRateKgHa: 46.0,
      actualRateKgHa: 41.5,
      flowRateKgMin: 1.0,
      flowRateLpm: 1.0,
      swathWidthMeters: 12.0,
      variancePct: -1.2,
      applicationAccuracy: 0.98,

      tankLevelLiters: sprayer.currentTankLevelL || 3800.0,
      tankLevelPct: 84.4,
      valveState: 'OPEN',
      valveDutyCyclePct: 100,
      pumpOperating: true,
      totalAppliedKg: sprayer.totalApplied || 0.0,
      totalDistanceMeters: 0,

      currentDecision: 'CONTINUE',
      decisionReason: 'Sprayer operating normally within nominal prescription range.',
      decisionSeverity: 'NORMAL',

      isEmergencyStopped: false,
      isManualOverride: false,
      injectedFault: null,

      trail: [],
      timeline: [
        {
          id: 'init-1',
          time: new Date().toLocaleTimeString(),
          type: 'TRANSITION',
          message: `Simulation initialized. Sprayer staged at grid ${gridRouteData[0]?.gridCode || 'G001'}.`,
          severity: 'NORMAL',
        },
      ],

      transitionsCount: 0,
      interventionsCount: 0,
      preventedOvershootsCount: 0,
    };

    this.initialized = true;
    return this.state;
  }

  getState(): SimulationState | null {
    return this.state;
  }

  setClockMultiplier(multiplier: number) {
    if (this.state) {
      this.state.clockMultiplier = multiplier;
    }
  }

  setRunning(running: boolean) {
    if (this.state) {
      this.state.status = running ? 'RUNNING' : 'PAUSED';
    }
  }

  reset() {
    if (!this.state || this.waypoints.length === 0) return;
    const initialPoint = this.waypoints[0];
    this.state.currentStepIndex = 0;
    this.state.latitude = initialPoint.latitude;
    this.state.longitude = initialPoint.longitude;
    this.state.headingDeg = initialPoint.headingDeg;
    this.state.status = 'IDLE';
    this.state.trail = [];
    this.state.isEmergencyStopped = false;
    this.state.isManualOverride = false;
    this.state.injectedFault = null;
    this.state.currentDecision = 'CONTINUE';
    this.state.decisionReason = 'Simulation reset to origin.';
    this.state.decisionSeverity = 'NORMAL';
    this.state.timeline.push({
      id: `reset-${Date.now()}`,
      time: new Date().toLocaleTimeString(),
      type: 'CONTROL',
      message: 'Simulation clock reset to step 0.',
      severity: 'NORMAL',
    });
  }

  setEmergencyStop(latched: boolean) {
    if (!this.state) return;
    this.state.isEmergencyStopped = latched;
    if (latched) {
      this.state.valveState = 'CLOSED';
      this.state.valveDutyCyclePct = 0;
      this.state.pumpOperating = false;
      this.state.currentDecision = 'STOP';
      this.state.decisionReason = 'EMERGENCY STOP latched by operator. Solenoids closed.';
      this.state.decisionSeverity = 'CRITICAL';
      this.state.timeline.push({
        id: `estop-${Date.now()}`,
        time: new Date().toLocaleTimeString(),
        type: 'ALERT',
        message: 'EMERGENCY STOP latched. All spray valves shut off.',
        severity: 'CRITICAL',
      });
    } else {
      this.state.timeline.push({
        id: `estop-rel-${Date.now()}`,
        time: new Date().toLocaleTimeString(),
        type: 'CONTROL',
        message: 'Emergency stop reset. Resuming automatic mode.',
        severity: 'NORMAL',
      });
    }
  }

  setManualOverride(active: boolean, forcedRateKgHa?: number) {
    if (!this.state) return;
    this.state.isManualOverride = active;
    if (active) {
      this.state.currentDecision = 'MANUAL_OVERRIDE';
      this.state.decisionReason = 'Manual operator control active. Auto-prescription bypassed.';
      this.state.decisionSeverity = 'WARNING';
      if (forcedRateKgHa !== undefined) {
        this.state.actualRateKgHa = forcedRateKgHa;
      }
      this.state.timeline.push({
        id: `override-${Date.now()}`,
        time: new Date().toLocaleTimeString(),
        type: 'OVERRIDE',
        message: 'Manual override engaged by operator.',
        severity: 'WARNING',
      });
    } else {
      this.state.timeline.push({
        id: `override-rel-${Date.now()}`,
        time: new Date().toLocaleTimeString(),
        type: 'CONTROL',
        message: 'Manual override disengaged. Resuming closed-loop automatic mode.',
        severity: 'NORMAL',
      });
    }
  }

  injectFault(faultType: string) {
    if (!this.state) return;
    this.state.injectedFault = faultType;

    switch (faultType) {
      case 'empty_tank':
        this.state.tankLevelLiters = 0;
        this.state.tankLevelPct = 0;
        this.state.timeline.push({
          id: `fault-${Date.now()}`,
          time: new Date().toLocaleTimeString(),
          type: 'ALERT',
          message: 'FAULT INJECTED: Fertilizer tank depleted to 0 L.',
          severity: 'CRITICAL',
        });
        break;
      case 'outside_field':
        this.state.latitude = 41.650; // Far outside farm boundaries
        this.state.longitude = -93.750;
        this.state.insideField = false;
        this.state.timeline.push({
          id: `fault-${Date.now()}`,
          time: new Date().toLocaleTimeString(),
          type: 'ALERT',
          message: 'FAULT INJECTED: Sprayer drifted outside field boundary.',
          severity: 'CRITICAL',
        });
        break;
      case 'no_prescription':
        this.state.activePrescriptionCode = null;
        this.state.targetRateKgHa = 0;
        this.state.timeline.push({
          id: `fault-${Date.now()}`,
          time: new Date().toLocaleTimeString(),
          type: 'ALERT',
          message: 'FAULT INJECTED: Active prescription removed from current grid.',
          severity: 'CRITICAL',
        });
        break;
      case 'rain_lockout':
        this.state.timeline.push({
          id: `fault-${Date.now()}`,
          time: new Date().toLocaleTimeString(),
          type: 'ALERT',
          message: 'FAULT INJECTED: Severe rain storm detected (>85% probability).',
          severity: 'CRITICAL',
        });
        break;
    }
  }

  /**
   * Advances the simulation by one discrete time tick.
   */
  async step(): Promise<SimulationState> {
    if (!this.state || this.waypoints.length === 0) {
      throw new Error('Simulation driver not initialized');
    }

    const nextStepIndex = (this.state.currentStepIndex + 1) % this.waypoints.length;
    this.state.currentStepIndex = nextStepIndex;
    const wp = this.waypoints[nextStepIndex];

    // If fault 'outside_field' is active, keep fault coordinates
    if (this.state.injectedFault !== 'outside_field') {
      this.state.latitude = wp.latitude;
      this.state.longitude = wp.longitude;
      this.state.headingDeg = wp.headingDeg;
      this.state.speedKmh = wp.targetSpeedKmh;
    }

    // 1. Resolve Position against Grids & Fields
    const pos = SprayerPositionService.resolveCoordinates(
      this.state.latitude,
      this.state.longitude,
      this.cachedFields.map((f) => ({ id: f.id, name: f.name, farmId: f.farmId, boundaryGeoJson: f.boundaryGeoJson })),
      this.cachedGrids.map((g) => ({ id: g.id, gridCode: g.gridCode, fieldId: g.fieldId, geometryGeoJson: g.geometryGeoJson }))
    );

    this.state.insideField = pos.insideField;
    const prevGridId = this.state.currentGridId;
    this.state.currentGridId = pos.gridId;
    this.state.currentGridCode = pos.gridCode;
    this.state.fieldId = pos.fieldId;
    this.state.fieldName = pos.fieldName;

    // Detect Grid Transition
    if (pos.gridId && pos.gridId !== prevGridId) {
      this.state.transitionsCount++;
      this.state.timeline.push({
        id: `trans-${Date.now()}`,
        time: new Date().toLocaleTimeString(),
        type: 'TRANSITION',
        message: `Entered grid ${pos.gridCode}. Loading prescription & nutrient ledger.`,
        severity: 'NORMAL',
      });
    }

    // 2. Fetch Active Grid Prescription & Nutrient Budget
    const currentGrid = this.cachedGrids.find((g) => g.id === pos.gridId);
    const activeRx = currentGrid?.prescriptions?.[0];
    const budget = currentGrid?.nutrientBudget;

    const hasRx = this.state.injectedFault === 'no_prescription' ? false : !!activeRx;
    if (hasRx && activeRx) {
      this.state.activePrescriptionCode = activeRx.code;
      this.state.targetRateKgHa = activeRx.targetRateKgHa;
      this.state.minRateKgHa = activeRx.minRateKgHa;
      this.state.maxRateKgHa = activeRx.maxRateKgHa;
    } else {
      this.state.activePrescriptionCode = null;
      this.state.targetRateKgHa = 0;
      this.state.minRateKgHa = 0;
      this.state.maxRateKgHa = 0;
    }

    const consumedPct = budget && budget.recommendedN > 0 ? (budget.consumedN / budget.recommendedN) * 100 : 25;
    const remainingBudgetKg = budget?.remainingN ?? 45.0;

    // 3. Evaluate Safety & Control Decision
    const controlDecision: SprayerControlDecision = SprayerControlService.evaluate({
      sprayerId: this.state.sprayerId,
      gridId: pos.gridId,
      gridCode: pos.gridCode,
      insideField: pos.insideField,
      gridStatus: currentGrid?.status,
      hasActivePrescription: hasRx,
      prescriptionStatus: activeRx?.status || 'READY',
      targetRateKgHa: this.state.targetRateKgHa,
      maxRateKgHa: this.state.maxRateKgHa,
      minRateKgHa: this.state.minRateKgHa,
      actualRateKgHa: this.state.actualRateKgHa,
      remainingBudgetKg,
      consumedBudgetPct: consumedPct,
      flowRateKgMin: this.state.flowRateKgMin,
      tankLevelLiters: this.state.tankLevelLiters,
      isEmergencyStopped: this.state.isEmergencyStopped,
      isManualOverride: this.state.isManualOverride,
      environmentalRiskAction: this.state.injectedFault === 'rain_lockout' ? 'BLOCK' : 'PROCEED',
      environmentalReason: this.state.injectedFault === 'rain_lockout' ? 'Severe rain storm (>85%)' : undefined,
    });

    this.state.currentDecision = controlDecision.decision;
    this.state.decisionReason = controlDecision.reason;
    this.state.decisionSeverity = controlDecision.severity;
    this.state.valveDutyCyclePct = controlDecision.valveDutyCyclePct;

    if (controlDecision.decision === 'REDUCE' || controlDecision.decision === 'STOP') {
      this.state.interventionsCount++;
      if (controlDecision.reason.includes('predictive') || controlDecision.reason.includes('budget')) {
        this.state.preventedOvershootsCount++;
      }
    }

    // 4. Calculate Physics Flow & Application Rate
    this.state.valveState =
      controlDecision.valveDutyCyclePct >= 90
        ? 'OPEN'
        : controlDecision.valveDutyCyclePct > 0
        ? 'THROTTLED'
        : 'CLOSED';

    const flowOutput = FlowSensorSimulationService.calculateFlowAndApplication({
      targetRateKgHa: this.state.targetRateKgHa,
      currentSpeedKmh: this.state.speedKmh,
      swathWidthMeters: this.state.swathWidthMeters,
      valveDutyCyclePct: this.state.valveDutyCyclePct,
      pumpOperating: this.state.pumpOperating && !this.state.isEmergencyStopped,
      addNoise: true,
    });

    this.state.actualRateKgHa = flowOutput.actualApplicationRateKgHa;
    this.state.flowRateKgMin = flowOutput.actualFlowRateKgMin;
    this.state.flowRateLpm = flowOutput.actualFlowRateLpm;
    this.state.variancePct = flowOutput.variancePct;
    this.state.applicationAccuracy = flowOutput.applicationAccuracy;

    // 5. Deplete Tank & Integrate Quantity Applied
    if (this.state.flowRateKgMin > 0) {
      const intervalMass = FlowSensorSimulationService.calculateIntervalMass(this.state.flowRateKgMin, 1.0);
      this.state.totalAppliedKg = Number((this.state.totalAppliedKg + intervalMass).toFixed(2));
      const tankRes = FlowSensorSimulationService.calculateNewTankLevel(this.state.tankLevelLiters, this.state.flowRateLpm, 1.0);
      this.state.tankLevelLiters = tankRes.newLevelL;
      this.state.tankLevelPct = tankRes.tankPct;
    }

    this.state.totalDistanceMeters += Math.round((this.state.speedKmh * 1000) / 3600);

    // 6. Record Application Trail
    this.state.trail.push({
      latitude: this.state.latitude,
      longitude: this.state.longitude,
      decision: this.state.currentDecision,
      applicationRateKgHa: this.state.actualRateKgHa,
      gridCode: this.state.currentGridCode || 'OUT',
      timestamp: new Date().toLocaleTimeString(),
    });

    // Keep trail to last 150 points for performance
    if (this.state.trail.length > 150) {
      this.state.trail.shift();
    }

    return this.state;
  }
}

// Global simulation driver singleton
export const simulationDriver = new SprayerSimulationManager();
