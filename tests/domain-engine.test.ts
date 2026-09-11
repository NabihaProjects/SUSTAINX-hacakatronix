// SOIL IQ - Core Domain Unit Tests
// Tests Agronomic Demand, Soil Adjustment, Application History, Nutrient Balance Ledger,
// Fertilizer Contribution, Fertilizer Recommendations, Weather Modifiers, Grid Generation, and Edge Cases.

import { FertilizerCalculationService } from '../lib/domain/fertilizerCalculationService';
import { AgronomicRequirementService } from '../lib/domain/agronomicRequirementService';
import { SoilAdjustmentService } from '../lib/domain/soilAdjustmentService';
import { ApplicationHistoryService } from '../lib/domain/applicationHistoryService';
import { NutrientBalanceService } from '../lib/domain/nutrientBalanceService';
import { FertilizerRecommendationService } from '../lib/domain/fertilizerRecommendationService';
import { WeatherModifierService } from '../lib/domain/weatherModifierService';
import { ConfidenceService } from '../lib/domain/confidenceService';
import { GridStatusService } from '../lib/domain/gridStatusService';
import { GridGenerationService } from '../lib/domain/gridGenerationService';
import { ControlDecisionService } from '../lib/domain/controlDecisionService';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ Assertion Failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runTests() {
  console.log('\n🧪 Running SOIL IQ Domain & Intelligence Engine Tests...\n');

  // Test 1: Fertilizer Nutrient Contribution Calculation
  console.log('Test 1: Fertilizer Nutrient Contribution');
  const npk19 = {
    name: 'NPK 19-19-19',
    formulation: '19-19-19',
    nPercent: 19.0,
    pPercent: 8.3,
    kPercent: 15.8,
  };
  const contrib1 = FertilizerCalculationService.calculateNutrientContribution(npk19, 100, 'kg');
  assert(contrib1.contributedN === 19.0, '100 kg of 19% N produces 19.0 kg pure N');
  assert(contrib1.contributedP === 8.3, '100 kg produces 8.3 kg pure P');
  assert(contrib1.contributedK === 15.8, '100 kg produces 15.8 kg pure K');

  // Liquid volume density conversion
  const liquidNpk = { ...npk19, densityKgPerL: 1.25 };
  const liquidContrib = FertilizerCalculationService.calculateNutrientContribution(liquidNpk, 100, 'L');
  assert(liquidContrib.quantityKg === 125, '100L of 1.25 density liquid equals 125 kg mass');
  assert(liquidContrib.contributedN === 23.75, '125kg mass produces 23.75 kg pure N');

  // Edge case: zero quantity
  const zeroContrib = FertilizerCalculationService.calculateNutrientContribution(npk19, 0, 'kg');
  assert(zeroContrib.contributedN === 0, '0 kg produces 0 kg pure N');

  // Test 2: Agronomic Base Requirement
  console.log('\nTest 2: Agronomic Base Requirement');
  const riceReq = AgronomicRequirementService.getBaseNutrientRequirement({
    cropName: 'Rice',
    growthStageName: 'Tillering',
    targetYieldTonsHa: 5.5,
    areaHectares: 1.0,
  });
  assert(riceReq.rateNPerHa > 0, 'Rice tillering stage has positive N requirement');
  assert(riceReq.source === 'PROTOTYPE', 'Prescription source labeled PROTOTYPE');

  // Test 3: Soil Nutrient Availability Adjustment & Freshness
  console.log('\nTest 3: Soil Adjustment & Freshness Penalty');
  const freshSoil = SoilAdjustmentService.estimateSoilNutrientAvailability({
    ph: 6.5,
    organicCarbonPct: 1.2,
    availableNPpm: 40.0,
    availablePPpm: 20.0,
    availableKPpm: 120.0,
    source: 'SOIL_TEST',
    sampleDate: new Date(),
  });
  assert(freshSoil.overallConfidence >= 0.85, 'Fresh soil test has high confidence');
  assert(freshSoil.availableN.kgPerHa > 0, 'Available N credits calculated from ppm');

  const staleSoil = SoilAdjustmentService.estimateSoilNutrientAvailability({
    ph: 6.5,
    availableNPpm: 40.0,
    source: 'SOIL_TEST',
    sampleDate: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000), // 250 days old
  });
  assert(staleSoil.overallConfidence < freshSoil.overallConfidence, 'Stale soil test incurs confidence penalty');

  // Edge case: Missing/null soil data
  const missingSoil = SoilAdjustmentService.estimateSoilNutrientAvailability(null);
  assert(missingSoil.measurementSource === 'ESTIMATED', 'Missing soil returns ESTIMATED baseline');

  // Test 4: Previous Application History Aggregation
  console.log('\nTest 4: Application History Aggregation');
  const history = ApplicationHistoryService.aggregateGridApplications('G001', 0.5, [
    {
      id: 'APP1',
      gridId: 'G001',
      fertilizerId: 'F1',
      fertilizer: npk19,
      quantity: 50,
      unit: 'kg',
      applicationDate: new Date(),
      contributedN: 9.5,
      contributedP: 4.15,
      contributedK: 7.9,
    },
    {
      id: 'APP2',
      gridId: 'G001',
      fertilizerId: 'F2',
      fertilizer: { name: 'Urea', formulation: '46-0-0', nPercent: 46, pPercent: 0, kPercent: 0 },
      quantity: 20,
      unit: 'kg',
      applicationDate: new Date(),
      contributedN: 9.2,
      contributedP: 0,
      contributedK: 0,
    },
  ]);
  assert(history.totalApplications === 2, 'Aggregated 2 applications');
  assert(history.totalPureN === 18.7, 'Total pure N sum is 18.7 kg');
  assert(history.appliedNPerHa === 37.4, 'Per-hectare applied N normalized by area (0.5ha)');

  // Test 5: Nutrient Balance Ledger & Excess Tracking
  console.log('\nTest 5: Nutrient Balance & Excess Tracking');
  // Scenario A: Consumed within budget
  const balanceA = NutrientBalanceService.calculateNutrientBalance({
    baseReqPerHa: { N: 100, P: 40, K: 60 },
    soilAvailablePerHa: { N: 20, P: 10, K: 20 },
    previousAppliedPerHa: { N: 50, P: 20, K: 30 },
    areaHectares: 1.0,
  });
  assert(balanceA.remainingN === 40, 'Remaining N correctly calculated (90 recommended - 50 consumed = 40)');
  assert(balanceA.excessN === 0, 'Excess N is zero when within budget');

  // Scenario B: Over budget application
  const balanceB = NutrientBalanceService.calculateNutrientBalance({
    baseReqPerHa: { N: 100, P: 40, K: 60 },
    soilAvailablePerHa: { N: 0, P: 0, K: 0 },
    previousAppliedPerHa: { N: 108, P: 40, K: 60 },
    areaHectares: 1.0,
  });
  assert(balanceB.remainingN === 0, 'Remaining N is 0 when consumed exceeds budget (no negative remaining)');
  assert(balanceB.excessN === 8, 'Excess N preserves the 8 kg overage without discarding');

  // Test 6: Grid Status Evaluation
  console.log('\nTest 6: Grid Status Rules (OPTIMAL, CAUTION, EXCESS_RISK, BLOCKED)');
  const statusOptimal = GridStatusService.evaluateGridStatus({
    recommendedN: 100,
    recommendedP: 40,
    recommendedK: 60,
    consumedN: 40,
    consumedP: 15,
    consumedK: 20,
  });
  assert(statusOptimal.status === 'OPTIMAL', '40% consumed produces OPTIMAL status');

  const statusCaution = GridStatusService.evaluateGridStatus({
    recommendedN: 100,
    recommendedP: 40,
    recommendedK: 60,
    consumedN: 85,
    consumedP: 20,
    consumedK: 20,
  });
  assert(statusCaution.status === 'CAUTION', '85% consumed produces CAUTION status');

  const statusExcess = GridStatusService.evaluateGridStatus({
    recommendedN: 100,
    recommendedP: 40,
    recommendedK: 60,
    consumedN: 105,
    consumedP: 20,
    consumedK: 20,
    excessN: 5,
  });
  assert(statusExcess.status === 'EXCESS_RISK', 'Excess overage produces EXCESS_RISK status');

  const statusBlocked = GridStatusService.evaluateGridStatus({
    isBlocked: true,
    blockReason: 'Restricted waterway buffer',
    recommendedN: 100,
    recommendedP: 40,
    recommendedK: 60,
    consumedN: 10,
    consumedP: 5,
    consumedK: 5,
  });
  assert(statusBlocked.status === 'BLOCKED', 'Locked grid produces BLOCKED status');

  // Test 7: Weather Modifier Evaluation
  console.log('\nTest 7: Environmental & Weather Modifiers');
  const envOptimal = WeatherModifierService.evaluateConditions({
    rainProbabilityPct: 10,
    windSpeedKmh: 8,
    temperatureC: 22,
    soilMoisturePct: 45,
  });
  assert(envOptimal.status === 'PROCEED', 'Clear calm conditions produce PROCEED');

  const envHighRain = WeatherModifierService.evaluateConditions({
    rainProbabilityPct: 85,
    windSpeedKmh: 10,
    temperatureC: 20,
    soilMoisturePct: 50,
  });
  assert(envHighRain.status === 'DEFER', '85% rain chance triggers DEFER');

  const envHighWind = WeatherModifierService.evaluateConditions({
    rainProbabilityPct: 5,
    windSpeedKmh: 30, // exceeds 25 km/h limit
    temperatureC: 22,
    soilMoisturePct: 40,
  });
  assert(envHighWind.status === 'BLOCK', '30 km/h wind triggers BLOCK');

  // Test 8: Fertilizer Recommendation & Split Application
  console.log('\nTest 8: Fertilizer Recommendation & Split Heuristic');
  const availableFertilizers = [
    { id: '1', name: 'NPK 19-19-19', formulation: '19-19-19', nPercent: 19, pPercent: 8.3, kPercent: 15.8 },
    { id: '2', name: 'Urea (46-0-0)', formulation: '46-0-0', nPercent: 46, pPercent: 0, kPercent: 0 },
    { id: '3', name: 'MOP (0-0-60)', formulation: '0-0-60', nPercent: 0, pPercent: 0, kPercent: 49.8 },
  ];
  const recs = FertilizerRecommendationService.recommendFertilizers({
    remainingN: 45,
    remainingP: 20,
    remainingK: 35,
    availableFertilizers,
    areaHectares: 1.0,
  });
  assert(recs.options.length > 0, 'Generated recommendation options');
  assert(recs.selectedOption.minRateKgHa < recs.selectedOption.targetRateKgHa, 'Recommended range: min < target');
  assert(recs.selectedOption.targetRateKgHa < recs.selectedOption.maxRateKgHa, 'Recommended range: target < max');

  // Test 9: Spatial Grid Generation Engine
  console.log('\nTest 9: Spatial Grid Generation Engine');
  const fieldPolygon: [number, number][] = [
    [-93.625, 41.5868],
    [-93.620, 41.5868],
    [-93.620, 41.5900],
    [-93.625, 41.5900],
    [-93.625, 41.5868],
  ];
  const generatedCells = GridGenerationService.generateGridsForField(fieldPolygon, {
    fieldCodePrefix: 'TEST01',
    gridSizeMeters: 50,
  });
  assert(generatedCells.length >= 4, 'Generated discrete spatial cells within polygon bounds');
  assert(generatedCells[0].gridCode.startsWith('TEST01-G'), 'Grid code conforms to TEST01-Gxxx pattern');

  // Test 10: Closed-Loop Control Decision Engine
  console.log('\nTest 10: Closed-Loop Control Decision Engine');
  const decisionNormal = ControlDecisionService.evaluateTelemetry({
    sprayerId: 'S1',
    gridId: 'G1',
    gridCode: 'F01-G001',
    gridStatus: 'OPTIMAL',
    targetRateLpha: 42.0,
    maxRateLpha: 46.0,
    actualRateLpha: 43.0,
    remainingNutrientKgHa: 60.0,
    consumedNutrientPct: 35.0,
    speedKmh: 14.0,
  });
  assert(decisionNormal.decision === 'CONTINUE', 'Normal rate produces CONTINUE decision');

  const decisionOverRate = ControlDecisionService.evaluateTelemetry({
    sprayerId: 'S1',
    gridId: 'G1',
    gridCode: 'F01-G001',
    gridStatus: 'OPTIMAL',
    targetRateLpha: 42.0,
    maxRateLpha: 46.0,
    actualRateLpha: 54.0, // 28% over target!
    remainingNutrientKgHa: 60.0,
    consumedNutrientPct: 35.0,
    speedKmh: 10.0,
  });
  assert(decisionOverRate.decision === 'REDUCE', 'Significant over-application triggers REDUCE decision');

  const decisionStop = ControlDecisionService.evaluateTelemetry({
    sprayerId: 'S1',
    gridId: 'G1',
    gridCode: 'F01-G001',
    gridStatus: 'EXCESS_RISK',
    targetRateLpha: 42.0,
    maxRateLpha: 46.0,
    actualRateLpha: 42.0,
    remainingNutrientKgHa: 0,
    consumedNutrientPct: 105.0,
    speedKmh: 12.0,
  });
  assert(decisionStop.decision === 'STOP', 'Exhausted budget triggers immediate STOP decision');

  console.log('\n🎉 ALL DOMAIN & INTELLIGENCE TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
