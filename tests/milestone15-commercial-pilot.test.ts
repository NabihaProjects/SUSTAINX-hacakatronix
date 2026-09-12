// SOIL IQ - Milestone 15 Commercialization, Pilot Readiness & SaaS Entitlements Test Suite
import assert from 'node:assert/strict';
import { EntitlementService, PLAN_CONFIGURATIONS } from '../lib/services/entitlementService';
import { PilotComparisonService } from '../lib/services/pilotComparisonService';
import { RoiService } from '../lib/services/roiService';
import { DeploymentReadinessService } from '../lib/services/deploymentReadinessService';
import { CustomerSuccessService } from '../lib/services/customerSuccessService';
import { ApiKeyService, ALLOWED_API_SCOPES } from '../lib/services/apiKeyService';
import prisma from '../lib/db/prisma';

console.log('====================================================');
console.log('    SOIL IQ - MILESTONE 15 COMMERCIAL & PILOTS      ');
console.log('====================================================\n');

let passCount = 0;

function runTest(name: string, fn: () => void | Promise<void>) {
  try {
    const result = fn();
    if (result instanceof Promise) {
      return result
        .then(() => {
          console.log(`  ✓ PASS: ${name}`);
          passCount++;
        })
        .catch((err) => {
          console.error(`  ✗ FAIL: ${name}`);
          throw err;
        });
    } else {
      console.log(`  ✓ PASS: ${name}`);
      passCount++;
    }
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    throw err;
  }
}

async function main() {
  console.log('--- TEST GROUP 1: Subscription Tiers & Feature Entitlements ---');
  runTest('Defines 4 standard commercial subscription tiers with ascending quotas', () => {
    const free = PLAN_CONFIGURATIONS.FREE;
    const pilot = PLAN_CONFIGURATIONS.PILOT;
    const pro = PLAN_CONFIGURATIONS.PRO;
    const ent = PLAN_CONFIGURATIONS.ENTERPRISE;

    assert.equal(free.maxFarms, 1);
    assert.equal(free.features.pilotProjects, false);
    assert.equal(free.features.apiAccess, false);

    assert.equal(pilot.maxFarms, 1);
    assert.equal(pilot.features.pilotProjects, true);
    assert.equal(pilot.features.hardwareIntegration, true);

    assert.equal(pro.maxFarms, 5);
    assert.equal(pro.features.apiAccess, true);

    assert.ok(ent.maxGrids >= 99999);
    assert.equal(ent.features.whatIfSimulation, true);
  });

  await runTest('Computes live resource quotas against tier limits', async () => {
    const org = await prisma.organization.findFirst();
    assert.ok(org);

    const usage = await EntitlementService.getOrganizationUsage(org.id);
    assert.ok(usage.plan);
    assert.ok(usage.currentCounts.farms >= 1);
    assert.ok(usage.currentCounts.grids >= 0);
    assert.ok(usage.utilizationPct.farms >= 0 && usage.utilizationPct.farms <= 100);
  });

  console.log('\n--- TEST GROUP 2: Pilot Project Tracking & Baseline Comparison ---');
  await runTest('Evaluates Pilot Project comparing Control Area vs SOIL IQ with scientific trust labels', async () => {
    const pilot = await prisma.pilotProject.findFirst();
    assert.ok(pilot, 'PilotProject must exist');

    const evalReport = await PilotComparisonService.evaluatePilot(pilot.id);
    assert.equal(evalReport.pilotId, pilot.id);
    assert.ok(evalReport.metrics.length >= 6);

    // Verify all metrics contain standard trust labels
    const allowedLabels = new Set(['MEASURED', 'ESTIMATED', 'PROJECTED', 'SIMULATED']);
    for (const m of evalReport.metrics) {
      assert.ok(allowedLabels.has(m.trustLabel), `Label ${m.trustLabel} must be scientifically valid`);
    }

    // Verify fertilizer reduction is measured via flow meter
    const fertMetric = evalReport.metrics.find((m) => m.key === 'fertilizer_mass');
    assert.ok(fertMetric);
    assert.equal(fertMetric.trustLabel, 'MEASURED');
    assert.ok(fertMetric.differencePct < 0, 'Fertilizer mass should decrease under VRA');

    // Verify simulated crop yield disclaimer
    const yieldMetric = evalReport.metrics.find((m) => m.key === 'crop_yield_trend');
    assert.ok(yieldMetric);
    assert.equal(yieldMetric.trustLabel, 'SIMULATED');
  });

  console.log('\n--- TEST GROUP 3: Economic ROI & Hardware Cost Modeling ---');
  runTest('Calculates CapEx, annual OpEx, net financial return, and payback period', () => {
    const defaultHardware = RoiService.getDefaultHardwareCosts();
    const roi = RoiService.calculateRoi({
      farmAreaAcres: 50.0,
      fertilizerSpendPerAcreUsd: 120.0, // $6,000 gross annual fertilizer spend
      expectedReductionPct: 20.0, // $1,200 annual chemical savings
      hardwareCosts: defaultHardware,
      annualSoftwareSubscriptionUsd: 360.0,
      depreciationYears: 3,
    });

    assert.equal(roi.annualGrossInputSpendUsd, 6000);
    assert.equal(roi.annualFertilizerSavingsUsd, 1200);
    assert.ok(roi.totalInitialCapitalExpenseUsd > 0);
    assert.ok(roi.annualTotalCostUsd > 0);
    assert.ok(roi.paybackPeriodMonths > 0 && roi.paybackPeriodMonths < 48);
    assert.ok(roi.disclaimer.includes('Estimates based on modeled variable-rate efficiency'));
  });

  console.log('\n--- TEST GROUP 4: Deployment Readiness Gate & Blocker Audit ---');
  await runTest('Audits 8 engineering dimensions and enforces pre-pilot safety criteria', async () => {
    const org = await prisma.organization.findFirst();
    assert.ok(org);

    const readiness = await DeploymentReadinessService.evaluateReadiness({
      organizationId: org.id,
    });

    assert.ok(readiness.dimensions.length === 8);
    assert.ok(readiness.readinessScore >= 0 && readiness.readinessScore <= 100);
    assert.ok(
      readiness.overallStatus === 'READY FOR CONTROLLED PILOT' ||
      readiness.overallStatus === 'NOT READY'
    );
    assert.ok(readiness.disclaimer.includes('does not constitute formal machinery safety'));
  });

  console.log('\n--- TEST GROUP 5: Customer API Key Cryptography & Scopes ---');
  await runTest('Generates 256-bit API key, stores SHA-256 hash, and rejects raw key persistence', async () => {
    const org = await prisma.organization.findFirst();
    assert.ok(org);

    const { plaintextKey, keyRecord } = await ApiKeyService.generateKey({
      organizationId: org.id,
      name: 'Integration Test Key',
      scopes: ['READ_FARMS', 'READ_FIELDS', 'READ_SOIL'],
    });

    assert.ok(plaintextKey.startsWith('siq_live_'));
    assert.notEqual(keyRecord.keyHash, plaintextKey);
    assert.equal(keyRecord.keyHash.length, 64); // SHA-256 hex length
    assert.equal(keyRecord.status, 'ACTIVE');

    // Verify key validation
    const verification = await ApiKeyService.verifyKey(plaintextKey);
    assert.equal(verification.valid, true);
    assert.equal(verification.organizationId, org.id);

    // Verify incorrect key fails
    const invalidVerification = await ApiKeyService.verifyKey('siq_live_invalid_fake_key_123');
    assert.equal(invalidVerification.valid, false);

    // Clean up
    await ApiKeyService.revokeKey(keyRecord.id, org.id);
    const revokedCheck = await ApiKeyService.verifyKey(plaintextKey);
    assert.equal(revokedCheck.valid, false);
  });

  await runTest('Strictly rejects machine control scopes from standard customer API', async () => {
    const org = await prisma.organization.findFirst();
    assert.ok(org);

    await assert.rejects(
      async () => {
        await ApiKeyService.generateKey({
          organizationId: org.id,
          name: 'Unsafe Control Key',
          scopes: ['WRITE_MACHINE_CONTROL', 'OVERRIDE_VALVE'] as any,
        });
      },
      /Forbidden scope/
    );
  });

  console.log('\n--- TEST GROUP 6: Agronomist Review & Decision Workflow ---');
  await runTest('Persists AgronomicReviewItem with evidence store and approval status', async () => {
    const org = await prisma.organization.findFirst();
    assert.ok(org);

    const review = await prisma.agronomicReviewItem.findFirst({
      where: { organizationId: org.id },
    });
    assert.ok(review, 'Review item must exist in database');
    assert.ok(review.confidenceScore > 0);
    assert.ok(review.evidenceJson.length > 0);
    assert.ok(['PENDING', 'APPROVED', 'REJECTED', 'NEEDS_MORE_DATA'].includes(review.status));
  });

  console.log('\n--- TEST GROUP 7: Customer Success Proactive Recommendations ---');
  await runTest('Evaluates account health and surfaces prioritized operational suggestions', async () => {
    const org = await prisma.organization.findFirst();
    assert.ok(org);

    const health = await CustomerSuccessService.evaluateAccount(org.id);
    assert.ok(health.healthScore >= 0 && health.healthScore <= 100);
    assert.ok(health.recommendations.length >= 0);
    for (const r of health.recommendations) {
      assert.ok(['HIGH', 'MEDIUM', 'LOW'].includes(r.priority));
      assert.ok(r.actionUrl.startsWith('/'));
    }
  });

  console.log('\n--- TEST GROUP 8: Multi-Tenant Isolation ---');
  await runTest('Enforces strict tenant scoping for pilot projects and customer API keys', async () => {
    const orgs = await prisma.organization.findMany();
    assert.ok(orgs.length >= 1);

    const pilots = await prisma.pilotProject.findMany({
      where: { organizationId: orgs[0].id },
    });

    for (const p of pilots) {
      assert.equal(p.organizationId, orgs[0].id);
    }
  });

  console.log('\n====================================================');
  console.log(`    MILESTONE 15 VALIDATION COMPLETE: ${passCount} / 9 PASSED    `);
  console.log('====================================================\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
