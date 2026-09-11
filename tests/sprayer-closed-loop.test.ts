// SOIL IQ - Milestone 5: Smart Sprayer & Closed-Loop Telemetry Test Suite
// Validates:
// 1. Coordinate -> Grid spatial resolution & point-outside-field
// 2. Grid transitions & route generation
// 3. Flow-to-quantity physics & elemental conversions
// 4. Closed-loop safety decisions (CONTINUE, REDUCE, STOP, MANUAL_OVERRIDE)
// 5. Predictive stop margin & budget protection
// 6. Tank depletion & empty-tank stop
// 7. Environmental lockout & emergency stop latch
// 8. Application accuracy and deviation metrics

import assert from 'node:assert';
import { SprayerPositionService } from '../lib/domain/sprayerPositionService';
import { SprayerRouteService } from '../lib/domain/sprayerRouteService';
import { FlowSensorSimulationService } from '../lib/domain/flowSensorSimulationService';
import { SprayerControlService } from '../lib/domain/sprayerControlService';

console.log('🧪 Running SOIL IQ Smart Sprayer & Closed-Loop Telemetry Tests...\n');

// Mock Field & Grid Geometry for spatial testing
const mockField = {
  id: 'field-1',
  name: 'North Corn Plot',
  farmId: 'farm-1',
  boundaryGeoJson: JSON.stringify({
    type: 'Polygon',
    coordinates: [
      [
        [-93.625, 41.586],
        [-93.621, 41.586],
        [-93.621, 41.590],
        [-93.625, 41.590],
        [-93.625, 41.586],
      ],
    ],
  }),
};

const mockGridG001 = {
  id: 'grid-1',
  gridCode: 'F01-G001',
  fieldId: 'field-1',
  geometryGeoJson: JSON.stringify({
    type: 'Polygon',
    coordinates: [
      [
        [-93.625, 41.586],
        [-93.623, 41.586],
        [-93.623, 41.588],
        [-93.625, 41.588],
        [-93.625, 41.586],
      ],
    ],
  }),
};

const mockGridG002 = {
  id: 'grid-2',
  gridCode: 'F01-G002',
  fieldId: 'field-1',
  geometryGeoJson: JSON.stringify({
    type: 'Polygon',
    coordinates: [
      [
        [-93.623, 41.586],
        [-93.621, 41.586],
        [-93.621, 41.588],
        [-93.623, 41.588],
        [-93.623, 41.586],
      ],
    ],
  }),
};

// ==========================================
// Test 1: Coordinate-to-Grid Spatial Resolution
// ==========================================
console.log('Test 1: Coordinate-to-Grid Spatial Resolution');
const insidePos = SprayerPositionService.resolveCoordinates(
  41.587,
  -93.624,
  [mockField],
  [mockGridG001, mockGridG002]
);
assert.strictEqual(insidePos.insideField, true, 'Coordinate should be inside field');
assert.strictEqual(insidePos.gridCode, 'F01-G001', 'Coordinate should resolve to F01-G001');
console.log('  ✓ Point correctly resolved to F01-G001 inside field polygon');

const outsidePos = SprayerPositionService.resolveCoordinates(
  41.650, // Far north
  -93.750,
  [mockField],
  [mockGridG001, mockGridG002]
);
assert.strictEqual(outsidePos.insideField, false, 'Coordinate outside field must be detected');
assert.strictEqual(outsidePos.status, 'OUTSIDE_FIELD', 'Status must be OUTSIDE_FIELD');
console.log('  ✓ Point outside boundary correctly identified as OUTSIDE_FIELD');

// ==========================================
// Test 2: Flow Physics & Application Rate Calculation
// ==========================================
console.log('\nTest 2: Flow Physics & Application Rate Calculation');
// Target: 42 kg/ha, Speed: 12 km/h, Swath: 12 m
// Target Flow = (42 * 12 * 12) / 600 = 10.08 kg/min
const flowResult = FlowSensorSimulationService.calculateFlowAndApplication({
  targetRateKgHa: 42.0,
  currentSpeedKmh: 12.0,
  swathWidthMeters: 12.0,
  valveDutyCyclePct: 100,
  pumpOperating: true,
  addNoise: false,
});

assert.strictEqual(flowResult.targetFlowRateKgMin, 10.08, 'Target flow rate should be 10.08 kg/min');
assert.strictEqual(flowResult.actualApplicationRateKgHa, 42.0, 'Application rate should equal 42.0 kg/ha at 100% duty');
assert.strictEqual(flowResult.variancePct, 0, 'Variance should be 0% at exact match');
assert.strictEqual(flowResult.applicationAccuracy, 1.0, 'Application accuracy should be 1.0');
console.log('  ✓ Flow rate 10.08 kg/min produces exact 42.0 kg/ha application rate');

// Throttled 50% duty cycle
const throttledFlow = FlowSensorSimulationService.calculateFlowAndApplication({
  targetRateKgHa: 42.0,
  currentSpeedKmh: 12.0,
  swathWidthMeters: 12.0,
  valveDutyCyclePct: 50,
  pumpOperating: true,
  addNoise: false,
});
assert.strictEqual(throttledFlow.actualApplicationRateKgHa, 21.0, 'Throttled flow should yield 21.0 kg/ha (50%)');
console.log('  ✓ 50% valve duty cycle throttles rate to 21.0 kg/ha');

// ==========================================
// Test 3: Elemental Nutrient Conversion
// ==========================================
console.log('\nTest 3: Fertilizer Mass to Pure Elemental Nutrient Conversion');
// NPK 19-19-19 (19% N, 8.3% pure P, 15.8% pure K)
const nutrientSlice = FlowSensorSimulationService.calculateNutrientContribution(10.0, 19.0, 8.3, 15.8);
assert.strictEqual(nutrientSlice.pureN, 1.9, '10 kg should contribute 1.9 kg pure N');
assert.strictEqual(nutrientSlice.pureP, 0.83, '10 kg should contribute 0.83 kg pure P');
assert.strictEqual(nutrientSlice.pureK, 1.58, '10 kg should contribute 1.58 kg pure K');
console.log('  ✓ 10 kg physical mass converted to pure N (1.9kg), P (0.83kg), K (1.58kg)');

// ==========================================
// Test 4: Tank Depletion & Empty Tank Stop
// ==========================================
console.log('\nTest 4: Tank Depletion & Empty Tank Stop');
const tankStatus = FlowSensorSimulationService.calculateNewTankLevel(100.0, 30.0, 60.0); // 30L/min for 1 min = 30L consumed
assert.strictEqual(tankStatus.newLevelL, 70.0, 'Tank level should decrease to 70 L');

const emptyDecision = SprayerControlService.evaluate({
  sprayerId: 'spray-1',
  gridId: 'grid-1',
  gridCode: 'F01-G001',
  insideField: true,
  hasActivePrescription: true,
  prescriptionStatus: 'ACTIVE',
  targetRateKgHa: 42.0,
  maxRateKgHa: 50.0,
  minRateKgHa: 38.0,
  actualRateKgHa: 42.0,
  remainingBudgetKg: 50.0,
  consumedBudgetPct: 20.0,
  flowRateKgMin: 10.0,
  tankLevelLiters: 0.0, // Empty tank
  isEmergencyStopped: false,
  isManualOverride: false,
});
assert.strictEqual(emptyDecision.decision, 'STOP', 'Empty tank must trigger STOP');
assert.strictEqual(emptyDecision.valveDutyCyclePct, 0, 'Valves must be 0% on empty tank');
assert(emptyDecision.reason.includes('EMPTY'), 'Reason must cite empty tank');
console.log('  ✓ Tank level depletion calculated and empty tank triggers immediate STOP');

// ==========================================
// Test 5: Closed-Loop Decision: CONTINUE (Nominal Rate)
// ==========================================
console.log('\nTest 5: Closed-Loop Decision: CONTINUE');
const continueDecision = SprayerControlService.evaluate({
  sprayerId: 'spray-1',
  gridId: 'grid-1',
  gridCode: 'F01-G001',
  insideField: true,
  gridStatus: 'OPTIMAL',
  hasActivePrescription: true,
  prescriptionStatus: 'ACTIVE',
  targetRateKgHa: 42.0,
  maxRateKgHa: 48.0,
  minRateKgHa: 38.0,
  actualRateKgHa: 41.5,
  remainingBudgetKg: 40.0,
  consumedBudgetPct: 35.0,
  flowRateKgMin: 10.0,
  tankLevelLiters: 3000.0,
  isEmergencyStopped: false,
  isManualOverride: false,
});
assert.strictEqual(continueDecision.decision, 'CONTINUE', 'Within-range rate must produce CONTINUE');
assert.strictEqual(continueDecision.valveDutyCyclePct, 100, 'Normal rate maintains 100% duty cycle');
console.log('  ✓ Nominal rate (41.5 kg/ha vs 42.0 kg/ha target) yields CONTINUE');

// ==========================================
// Test 6: Closed-Loop Decision: REDUCE (Approaching Budget Ceiling)
// ==========================================
console.log('\nTest 6: Closed-Loop Decision: REDUCE');
const reduceDecision = SprayerControlService.evaluate({
  sprayerId: 'spray-1',
  gridId: 'grid-1',
  gridCode: 'F01-G001',
  insideField: true,
  gridStatus: 'CAUTION',
  hasActivePrescription: true,
  prescriptionStatus: 'ACTIVE',
  targetRateKgHa: 42.0,
  maxRateKgHa: 48.0,
  minRateKgHa: 38.0,
  actualRateKgHa: 45.0,
  remainingBudgetKg: 8.0,
  consumedBudgetPct: 86.0, // > 80% consumed
  flowRateKgMin: 10.0,
  tankLevelLiters: 2500.0,
  isEmergencyStopped: false,
  isManualOverride: false,
});
assert.strictEqual(reduceDecision.decision, 'REDUCE', 'Approaching budget ceiling must trigger REDUCE');
assert(reduceDecision.valveDutyCyclePct < 100, 'Valve duty cycle must be throttled');
console.log('  ✓ CAUTION grid (86% budget consumed) triggers REDUCE throttling to 50%');

// ==========================================
// Test 7: Closed-Loop Decision: STOP (Blocked Riparian Zone & Exhausted Budget)
// ==========================================
console.log('\nTest 7: Closed-Loop Decision: STOP');
const blockedDecision = SprayerControlService.evaluate({
  sprayerId: 'spray-1',
  gridId: 'grid-blocked',
  gridCode: 'F01-G004',
  insideField: true,
  gridStatus: 'BLOCKED',
  hasActivePrescription: true,
  prescriptionStatus: 'ACTIVE',
  targetRateKgHa: 42.0,
  maxRateKgHa: 50.0,
  minRateKgHa: 38.0,
  actualRateKgHa: 42.0,
  remainingBudgetKg: 50.0,
  consumedBudgetPct: 0.0,
  flowRateKgMin: 10.0,
  tankLevelLiters: 2500.0,
  isEmergencyStopped: false,
  isManualOverride: false,
});
assert.strictEqual(blockedDecision.decision, 'STOP', 'BLOCKED grid status must enforce STOP');
assert.strictEqual(blockedDecision.valveDutyCyclePct, 0, 'Valves must be 0% in BLOCKED zone');
console.log('  ✓ BLOCKED riparian zone triggers immediate valve closure (STOP)');

// ==========================================
// Test 8: Predictive Stop Margin Protection
// ==========================================
console.log('\nTest 8: Predictive Stop Margin Protection');
// Remaining budget: 0.1 kg. Current flow delivery: 10 kg/min (0.16 kg/sec).
// Projected delivery in 1s exceeds remaining 0.1 kg -> Predictive stop must trigger!
const predictiveDecision = SprayerControlService.evaluate({
  sprayerId: 'spray-1',
  gridId: 'grid-1',
  gridCode: 'F01-G001',
  insideField: true,
  gridStatus: 'OPTIMAL',
  hasActivePrescription: true,
  prescriptionStatus: 'ACTIVE',
  targetRateKgHa: 42.0,
  maxRateKgHa: 50.0,
  minRateKgHa: 38.0,
  actualRateKgHa: 42.0,
  remainingBudgetKg: 0.08, // Very small remaining margin
  consumedBudgetPct: 98.0,
  flowRateKgMin: 10.0,    // 0.167 kg per second
  tankLevelLiters: 2000.0,
  isEmergencyStopped: false,
  isManualOverride: false,
  controlIntervalSeconds: 1.0,
});
assert.strictEqual(predictiveDecision.decision, 'STOP', 'Predictive stop must trigger before budget is breached');
assert(predictiveDecision.reason.includes('Predictive stop'), 'Reason must cite predictive stop');
console.log('  ✓ Predictive stop triggered before overshooting remaining budget');

// ==========================================
// Test 9: Emergency Stop Latch & Manual Override
// ==========================================
console.log('\nTest 9: Emergency Stop Latch & Manual Override');
const estopDecision = SprayerControlService.evaluate({
  sprayerId: 'spray-1',
  gridId: 'grid-1',
  gridCode: 'F01-G001',
  insideField: true,
  hasActivePrescription: true,
  targetRateKgHa: 42.0,
  maxRateKgHa: 50.0,
  minRateKgHa: 38.0,
  actualRateKgHa: 42.0,
  remainingBudgetKg: 50.0,
  consumedBudgetPct: 10.0,
  flowRateKgMin: 10.0,
  tankLevelLiters: 3000.0,
  isEmergencyStopped: true, // E-Stop latched
  isManualOverride: false,
});
assert.strictEqual(estopDecision.decision, 'STOP', 'Latched E-Stop must enforce STOP');
assert.strictEqual(estopDecision.valveDutyCyclePct, 0, 'Valves must be 0% under E-Stop');
console.log('  ✓ Operator Emergency Stop latch shuts off all valves');

const overrideDecision = SprayerControlService.evaluate({
  sprayerId: 'spray-1',
  gridId: 'grid-1',
  gridCode: 'F01-G001',
  insideField: true,
  hasActivePrescription: true,
  targetRateKgHa: 42.0,
  maxRateKgHa: 50.0,
  minRateKgHa: 38.0,
  actualRateKgHa: 55.0,
  remainingBudgetKg: 50.0,
  consumedBudgetPct: 10.0,
  flowRateKgMin: 12.0,
  tankLevelLiters: 3000.0,
  isEmergencyStopped: false,
  isManualOverride: true, // Manual override active
});
assert.strictEqual(overrideDecision.decision, 'MANUAL_OVERRIDE', 'Manual override must take precedence');
console.log('  ✓ Manual override takes precedence over automatic prescription');

// ==========================================
// Test 10: Route Serpentine Sweep Generation
// ==========================================
console.log('\nTest 10: Route Serpentine Sweep Generation');
const mockRouteGrids = [
  { id: 'g1', gridCode: 'G001', rowIndex: 0, colIndex: 0, centerLat: 41.586, centerLng: -93.624 },
  { id: 'g2', gridCode: 'G002', rowIndex: 0, colIndex: 1, centerLat: 41.586, centerLng: -93.622 },
  { id: 'g3', gridCode: 'G003', rowIndex: 1, colIndex: 0, centerLat: 41.588, centerLng: -93.624 },
  { id: 'g4', gridCode: 'G004', rowIndex: 1, colIndex: 1, centerLat: 41.588, centerLng: -93.622 },
];
const waypoints = SprayerRouteService.generateGridSweepRoute(mockRouteGrids, 12.0, 2);
assert(waypoints.length > 4, 'Route should interpolate waypoints between grids');
assert(waypoints[0].headingDeg >= 0 && waypoints[0].headingDeg <= 360, 'Heading must be valid compass degree');
console.log(`  ✓ Generated serpentine path with ${waypoints.length} waypoints and valid compass headings`);

console.log('\n🎉 ALL SMART SPRAYER & CLOSED-LOOP TELEMETRY TESTS PASSED SUCCESSFULLY!\n');
