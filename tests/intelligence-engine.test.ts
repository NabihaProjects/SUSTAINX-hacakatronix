// SOIL IQ - Milestone 7 Intelligence & What-If Engine Test Suite
// Run using: npx tsx tests/intelligence-engine.test.ts

import { SoilHealthService } from '../lib/domain/soilHealthService';
import { AnomalyDetectionService } from '../lib/domain/anomalyDetectionService';
import { FertilizerEfficiencyService } from '../lib/domain/fertilizerEfficiencyService';
import { ScenarioSimulationService } from '../lib/domain/scenarioSimulationService';
import { ExplanationService, ExplanationFact } from '../lib/domain/explanationService';
import { AssistantService } from '../lib/domain/assistantService';
import prisma from '../lib/db/prisma';

async function runTests() {
  console.log('====================================================');
  console.log('  SOIL IQ - MILESTONE 7 INTELLIGENCE ENGINE TESTS   ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  // ----------------------------------------------------
  // TEST 1: Prototype Soil Health Index Calculation
  // ----------------------------------------------------
  console.log('--- TEST GROUP 1: Soil Health Index & Components ---');
  {
    const breakdown = SoilHealthService.calculateIndex({
      gridCode: 'F01-G001',
      availableNPpm: 45, // exactly optimal
      availablePPpm: 30, // exactly optimal
      availableKPpm: 160, // exactly optimal
      ph: 6.5, // optimal
      organicCarbonPct: 2.0, // excellent
      ecDsm: 0.8, // optimal
      moisturePct: 25.0, // optimal
      excessNKgHa: 0,
      excessPKgHa: 0,
      excessKKgHa: 0,
    });

    assert(breakdown.overallScore >= 90, 'Optimal soil parameters yield >= 90 score');
    assert(breakdown.label === 'EXCELLENT', 'Optimal parameters produce EXCELLENT grade');
    assert(breakdown.components.nutrientBalance.score === 100, 'Exact baseline nutrient balance yields 100%');
    assert(breakdown.components.phCondition.score === 100, 'pH 6.5 yields 100%');
    assert(breakdown.components.excessHistory.score === 100, 'Zero excess yields 100% score');

    // Test degraded soil
    const degraded = SoilHealthService.calculateIndex({
      gridCode: 'F01-G099',
      availableNPpm: 10,
      availablePPpm: 5,
      availableKPpm: 50,
      ph: 4.8, // acidic
      organicCarbonPct: 0.3,
      ecDsm: 3.5, // saline
      moisturePct: 10.0,
      excessNKgHa: 40,
    });

    assert(degraded.overallScore < 50, 'Degraded soil yields < 50 score');
    assert(degraded.label === 'DEGRADED', 'Severe deviations result in DEGRADED label');
  }

  // ----------------------------------------------------
  // TEST 2: Multi-Modal Anomaly Detection & Root Causes
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 2: Anomaly Detection & Root-Cause Hypotheses ---');
  {
    const org = await prisma.organization.findFirst();
    const orgId = org ? org.id : 'test-org';

    const anomalies = await AnomalyDetectionService.detectAnomalies(orgId);
    assert(Array.isArray(anomalies), 'Anomaly detection returns an array of anomalies');
    assert(anomalies.length > 0, 'Flagged simulated/active anomalies in test database');

    const firstAnomaly = anomalies[0];
    assert(!!firstAnomaly.anomalyType, 'Anomaly has a valid anomalyType (e.g. SUDDEN_SPIKE, RATE_OF_CHANGE)');
    assert(!!firstAnomaly.severity, 'Anomaly has severity classification');
    assert(Array.isArray(firstAnomaly.rootCauseHypotheses), 'Anomaly includes ranked root-cause hypotheses');
    assert(firstAnomaly.rootCauseHypotheses.length > 0, 'Includes at least 1 root-cause hypothesis');
    assert(firstAnomaly.rootCauseHypotheses[0].probability > 0, 'Root-cause hypothesis has probabilistic weight');
    assert(!!firstAnomaly.rootCauseHypotheses[0].recommendedVerification, 'Root-cause includes verification action');
  }

  // ----------------------------------------------------
  // TEST 3: Fertilizer Use Efficiency & Savings
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 3: Fertilizer Efficiency & Savings ---');
  {
    const org = await prisma.organization.findFirst();
    const orgId = org ? org.id : 'test-org';

    const efficiency = await FertilizerEfficiencyService.calculateEfficiency(orgId);
    assert(efficiency.overallEfficiencyPct > 0, 'Overall fertilizer efficiency is calculated (>0%)');
    assert(efficiency.adherenceScorePct > 0, 'Application adherence score is calculated (>0%)');
    assert(efficiency.overapplicationAvoidedKg >= 0, 'Avoided overapplication is non-negative');
    assert(efficiency.estimatedSavingsUsd >= 0, 'Cost savings in USD calculated');
  }

  // ----------------------------------------------------
  // TEST 4: What-If Scenario Simulation & Data Isolation
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 4: What-If Scenario Simulation & Isolation ---');
  {
    const baselineBudgetBefore = await prisma.gridNutrientBudget.findFirst();
    const beforeConsumedN = baselineBudgetBefore ? baselineBudgetBefore.consumedN : 0;

    const sim = ScenarioSimulationService.runSimulation({
      scenarioName: 'Test Simulation - Rate Reduction',
      scenarioType: 'LESS_FERTILIZER',
      gridCode: 'F01-G003',
      fieldAreaHa: 2.5,
      baselineProduct: 'NPK 19-19-19',
      baselineFormulation: '19-19-19',
      baselineRateKgHa: 45.0,
      baselineTimingDelayHours: 0,
      baselineRainProbPct: 80,
      scenarioProduct: 'NPK 19-19-19',
      scenarioFormulation: '19-19-19',
      scenarioRateKgHa: 30.0, // 33% reduction
      scenarioTimingDelayHours: 24, // delay past rain
      scenarioRainProbPct: 15,
      costPerKg: 0.70,
      soilN: 35,
      soilP: 25,
      soilK: 140,
      soilPh: 6.5,
      currentBudgetRecommendedN: 100,
      currentBudgetConsumedN: 40,
    });

    assert(sim.deltas.costDeltaAmount < 0, 'Reduced rate produces negative cost delta (financial savings)');
    assert(sim.baseline.environmentalRiskAction === 'BLOCK', 'High baseline rain probability (80%) flags BLOCK');
    assert(sim.scenario.environmentalRiskAction === 'PROCEED', 'Delayed spray window after rain allows PROCEED');
    assert(sim.deltas.rateDeltaKgHa < 0, 'Total applied rate delta is negative');
    assert(sim.scenario.soilHealthIndex >= sim.baseline.soilHealthIndex, 'Reduced rate preserves/improves soil health');

    // Data Isolation Check: Ensure live database budget was NOT altered by running simulation
    const baselineBudgetAfter = await prisma.gridNutrientBudget.findFirst();
    const afterConsumedN = baselineBudgetAfter ? baselineBudgetAfter.consumedN : 0;
    assert(beforeConsumedN === afterConsumedN, 'CRITICAL DATA ISOLATION: Production budget unaltered by simulation');
  }

  // ----------------------------------------------------
  // TEST 5: Structured Explanation Fact Store
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 5: Structured Explanation Fact Store ---');
  {
    const facts: ExplanationFact[] = [
      {
        type: 'HIGH_EXISTING_NUTRIENT',
        nutrient: 'P',
        gridCode: 'F01-G004',
        metricLabel: 'Available Phosphorus',
        measuredValue: '58 ppm',
        benchmarkValue: '30 ppm',
        source: 'SOIL_TEST_LAB',
        confidence: 0.95,
        message: 'Elevated soil phosphorus concentration (58 ppm) detected.',
      },
      {
        type: 'STAGE_DEMAND_PEAK',
        gridCode: 'F01-G004',
        metricLabel: 'V6 Early Vegetative',
        measuredValue: 'V6',
        source: 'PHENOLOGY_MODEL',
        confidence: 0.90,
        message: 'Active V6 stage requires timely nitrogen for leaf development.',
      },
    ];

    const explanation = ExplanationService.generateExplanation(facts, 'Urea 46-0-0', 35);
    assert(!!explanation.observation, 'Generates non-empty observation');
    assert(!!explanation.analysis, 'Generates non-empty analysis');
    assert(!!explanation.impact, 'Generates non-empty impact');
    assert(!!explanation.recommendation, 'Generates non-empty recommendation');
    assert(explanation.confidenceLevel === 'HIGH', 'Derived confidence level is HIGH');
    assert(explanation.confidenceScore >= 0.9, 'Confidence score reflects fact quality');
    assert(explanation.topFactors.length === 2, 'Top factors mapped from fact store');
  }

  // ----------------------------------------------------
  // TEST 6: Grounded AI Farm Assistant Tool Retrieval
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 6: Grounded AI Farm Assistant ---');
  {
    const org = await prisma.organization.findFirst();
    const orgId = org ? org.id : 'test-org';

    // Query 1: Farm Summary
    const summaryRes = await AssistantService.handleQuery(orgId, 'How is Green Valley Farm doing?');
    assert(summaryRes.confidenceScore > 0.8, 'Farm summary response has high confidence');
    assert(summaryRes.retrievedFacts.length > 0, 'Cites retrieved database facts');
    assert(summaryRes.answer.includes('Green Valley Farm') || summaryRes.answer.includes('Soil Health Index'), 'Farm summary contains grounded facts');

    // Query 2: Which grids need attention?
    const attentionRes = await AssistantService.handleQuery(orgId, 'Which grids need attention?');
    assert(attentionRes.responseType === 'ALERT_SUMMARY', 'Classified correctly as ALERT_SUMMARY');
    assert(attentionRes.retrievedFacts.length > 0, 'Attention grids cite actual grid records');

    // Query 3: Why was sprayer stopped?
    const stopRes = await AssistantService.handleQuery(orgId, 'Why did SOIL IQ stop the sprayer in G047?');
    assert(stopRes.responseType === 'EXPLANATION', 'Classified correctly as EXPLANATION');
    assert(stopRes.answer.includes('STOP') || stopRes.answer.includes('riparian') || stopRes.answer.includes('safety'), 'Accurately references safety lock or riparian boundary');

    // Query 4: Unhallucinated Out-Of-Domain Query
    const randomRes = await AssistantService.handleQuery(orgId, 'Who won the 1998 World Cup?');
    assert(randomRes.confidenceLevel === 'LOW', 'Out of domain query flagged as LOW confidence');
    assert(randomRes.answer.includes('SOIL IQ does not have sufficient structured data'), 'Strict refusal to hallucinate out of domain facts');
  }

  console.log('\n====================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Fatal test runner error:', e);
  process.exit(1);
});
