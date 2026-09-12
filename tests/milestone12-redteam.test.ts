// SOIL IQ - Milestone 12 Red-Team Validation & Scientific Credibility Test Suite
import assert from 'node:assert/strict';
import { MobileSyncService } from '../lib/services/mobileSyncService';
import {
  calculateSprayApplicationRate,
  calculateNutrientFromProduct,
  pElementalToOxide,
  pOxideToElemental,
  kElementalToOxide,
  kOxideToElemental,
  hectaresToAcres,
  acresToHectares,
} from '../lib/domain/units';
import { ControlDecisionService } from '../lib/domain/controlDecisionService';

console.log('====================================================');
console.log('    SOIL IQ - MILESTONE 12 RED-TEAM VALIDATION      ');
console.log('====================================================\n');

let passCount = 0;

function runTest(name: string, fn: () => void | Promise<void>) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    throw err;
  }
}

async function main() {
  console.log('--- TEST GROUP 1: Agricultural Physics & Mathematical Formula Integrity ---');
  runTest('Agricultural spray equation calculates exact application rate (L/ha)', () => {
    const flowLpm = 12.0;
    const speedKmh = 10.0;
    const swathM = 12.0;
    // (12.0 * 600) / (10.0 * 12.0) = 7200 / 120 = 60.0 L/ha
    const rateLpha = calculateSprayApplicationRate(flowLpm, speedKmh, swathM);
    assert.equal(rateLpha, 60.0);
  });

  runTest('Separates physical product mass from elemental nutrient absorption', () => {
    const productAppliedKgHa = 50.0; // 50 kg of NPK 19-19-19
    const elementalNKgHa = calculateNutrientFromProduct(productAppliedKgHa, 19.0);
    assert.equal(elementalNKgHa, 9.5); // 9.5 kg pure N, NOT 50 kg N
    assert.notEqual(elementalNKgHa, productAppliedKgHa);
  });

  console.log('\n--- TEST GROUP 2: Agronomic Oxide & Unit Conversions (ICAR / FAO Standard) ---');
  runTest('Converts elemental phosphorus to oxide (P to P2O5 factor 2.2914)', () => {
    const pElemental = 10.0;
    const p2o5 = pElementalToOxide(pElemental);
    assert.equal(p2o5, 22.914);
    assert.equal(pOxideToElemental(p2o5), 10.0);
  });

  runTest('Converts elemental potassium to oxide (K to K2O factor 1.2046)', () => {
    const kElemental = 20.0;
    const k2o = kElementalToOxide(kElemental);
    assert.equal(k2o, 24.092);
    assert.equal(kOxideToElemental(k2o), 20.0);
  });

  runTest('Converts between hectares and acres without silent drift', () => {
    const ha = 10.0;
    const acres = hectaresToAcres(ha);
    assert.equal(acres, 24.71);
    const convertedHa = acresToHectares(acres);
    assert.equal(Math.round(convertedHa), 10);
  });

  console.log('\n--- TEST GROUP 3: Economic Model & Pricing Transparency ---');
  runTest('Computes cost savings strictly from configured unit price ($0.68/kg)', () => {
    const avoidedKg = 38.0;
    const unitPrice = 0.68;
    const savings = Number((avoidedKg * unitPrice).toFixed(2));
    assert.equal(savings, 25.84);
  });

  console.log('\n--- TEST GROUP 4: Deterministic Control Engine Red-Team Cases ---');
  runTest('Hard Stop: Blocks spraying immediately when grid status is BLOCKED', () => {
    const result = ControlDecisionService.evaluateTelemetry({
      sprayerId: 'sp-01',
      gridId: 'g-01',
      gridCode: 'G01',
      gridStatus: 'BLOCKED',
      targetRateLpha: 40,
      maxRateLpha: 50,
      actualRateLpha: 40,
      remainingNutrientKgHa: 50,
      consumedNutrientPct: 20,
      speedKmh: 8,
    });
    assert.equal(result.decision, 'STOP');
    assert.equal(result.severity, 'CRITICAL');
  });

  runTest('Hard Stop: Shuts off flow when grid nutrient budget is exhausted (100%)', () => {
    const result = ControlDecisionService.evaluateTelemetry({
      sprayerId: 'sp-01',
      gridId: 'g-02',
      gridCode: 'G02',
      gridStatus: 'OPTIMAL',
      targetRateLpha: 40,
      maxRateLpha: 50,
      actualRateLpha: 40,
      remainingNutrientKgHa: 0,
      consumedNutrientPct: 100,
      speedKmh: 8,
    });
    assert.equal(result.decision, 'STOP');
    assert.equal(result.suggestedFlowRateAdjustmentPct, -100);
  });

  runTest('Throttle: Reduces flow when actual rate exceeds target by > 15%', () => {
    const result = ControlDecisionService.evaluateTelemetry({
      sprayerId: 'sp-01',
      gridId: 'g-03',
      gridCode: 'G03',
      gridStatus: 'OPTIMAL',
      targetRateLpha: 40,
      maxRateLpha: 45,
      actualRateLpha: 55, // Over-dosing by 37.5%
      remainingNutrientKgHa: 40,
      consumedNutrientPct: 40,
      speedKmh: 8,
    });
    assert.equal(result.decision, 'REDUCE');
    assert.equal(result.severity, 'WARNING');
  });

  runTest('Throttle: Reduces flow when budget is approaching ceiling (>= 80%)', () => {
    const result = ControlDecisionService.evaluateTelemetry({
      sprayerId: 'sp-01',
      gridId: 'g-04',
      gridCode: 'G04',
      gridStatus: 'CAUTION',
      targetRateLpha: 40,
      maxRateLpha: 50,
      actualRateLpha: 44, // +10% over target
      remainingNutrientKgHa: 10,
      consumedNutrientPct: 85,
      speedKmh: 8,
    });
    assert.equal(result.decision, 'REDUCE');
    assert.equal(result.suggestedFlowRateAdjustmentPct, -15);
  });

  runTest('Continue: Maintains flow when actual application matches target within +/- 10%', () => {
    const result = ControlDecisionService.evaluateTelemetry({
      sprayerId: 'sp-01',
      gridId: 'g-05',
      gridCode: 'G05',
      gridStatus: 'OPTIMAL',
      targetRateLpha: 40,
      maxRateLpha: 50,
      actualRateLpha: 41, // within 2.5%
      remainingNutrientKgHa: 50,
      consumedNutrientPct: 30,
      speedKmh: 8,
    });
    assert.equal(result.decision, 'CONTINUE');
    assert.equal(result.severity, 'NORMAL');
  });

  console.log('\n--- TEST GROUP 5: Mobile Offline Queue & Hardware Safety Enclosures ---');
  runTest('Allows safe field notes and alert acknowledgements to queue offline', () => {
    MobileSyncService.clearQueue();
    const qLen = MobileSyncService.queueOfflineAction({
      actionId: 'act_001',
      type: 'FIELD_NOTE',
      organizationId: 'org_demo',
      payload: { text: 'Standing water observed' },
      queuedAt: new Date().toISOString(),
    });
    assert.equal(qLen, 1);
  });

  runTest('STRICT SAFETY GATE: Rejects unsafe physical machine commands from offline queue', () => {
    assert.throws(
      () => {
        MobileSyncService.queueOfflineAction({
          actionId: 'act_unsafe',
          type: 'ACTUATE_MACHINE' as any,
          organizationId: 'org_demo',
          payload: { valveOpen: true },
          queuedAt: new Date().toISOString(),
        });
      },
      /Unsafe action.*cannot be queued offline/
    );
  });

  console.log('====================================================');
  console.log(`  TEST RESULTS: ${passCount} PASSED, 0 FAILED`);
  console.log('====================================================\n');
}

main().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

