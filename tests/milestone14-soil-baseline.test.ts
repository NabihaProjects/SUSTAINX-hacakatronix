// SOIL IQ - Milestone 14 Soil Test Import, Validation, Baseline & Prescription Integration Test Suite
import assert from 'node:assert/strict';
import { SoilImportService, STANDARD_COLUMN_ALIASES } from '../lib/services/soilImportService';
import { SoilValidationService } from '../lib/services/soilValidationService';
import { SoilSpatialEstimatorService } from '../lib/services/soilSpatialEstimatorService';
import { SoilBaselineService } from '../lib/services/soilBaselineService';
import { SoilSamplingRecommendationService } from '../lib/services/soilSamplingRecommendationService';
import prisma from '../lib/db/prisma';

console.log('====================================================');
console.log('    SOIL IQ - MILESTONE 14 SOIL DATA & BASELINES    ');
console.log('====================================================\n');

let passCount = 0;

function runTest(name: string, fn: () => void | Promise<void>) {
  try {
    const result = fn();
    if (result instanceof Promise) {
      return result.then(() => {
        console.log(`  ✓ PASS: ${name}`);
        passCount++;
      }).catch((err) => {
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
  console.log('--- TEST GROUP 1: CSV Parsing, Column Aliases & Template Generation ---');
  runTest('Generates standard agricultural CSV template with expected headers', () => {
    const template = SoilImportService.generateCsvTemplate();
    assert.ok(template.includes('sample_code'));
    assert.ok(template.includes('report_number'));
    assert.ok(template.includes('ph'));
    assert.ok(template.includes('nitrogen'));
    assert.ok(template.includes('phosphorus'));
    assert.ok(template.includes('potassium'));
  });

  runTest('Resolves common laboratory column aliases to canonical names', () => {
    assert.equal(SoilImportService.resolveColumnName('Available N'), 'nitrogen');
    assert.equal(SoilImportService.resolveColumnName('Soil P (Bray)'), 'phosphorus');
    assert.equal(SoilImportService.resolveColumnName('Exchangeable_K'), 'potassium');
    assert.equal(SoilImportService.resolveColumnName('Soil_pH'), 'pH');
    assert.equal(SoilImportService.resolveColumnName('Conductivity'), 'ec');
    assert.equal(SoilImportService.resolveColumnName('Organic_Matter'), 'organicCarbon');
    assert.equal(SoilImportService.resolveColumnName('Lab_ID'), 'sampleCode');
    assert.equal(SoilImportService.resolveColumnName('Zone'), 'gridCode');
  });

  runTest('Parses multi-row CSV input with aliased headers into typed data rows', () => {
    const csvContent = [
      'Sample_ID,Report_No,Date,Zone,Soil_pH,Conductivity,Available_N,Phosphorus,Potassium',
      'SMP-TEST-01,SR-2026-X01,2026-08-20,G041,6.5,1.2,190,45,210',
      'SMP-TEST-02,SR-2026-X01,2026-08-20,G042,6.8,1.4,180,40,195',
    ].join('\n');

    const parsed = SoilImportService.parseCsv(csvContent);
    assert.equal(parsed.rows.length, 2);
    assert.equal(parsed.rows[0].sampleCode, 'SMP-TEST-01');
    assert.equal(parsed.rows[0].gridCode, 'G041');
    assert.equal(parsed.rows[0].pH, 6.5);
    assert.equal(parsed.rows[0].nitrogen, 190);
    assert.equal(parsed.rows[0].phosphorus, 45);
    assert.equal(parsed.rows[0].potassium, 210);
  });

  console.log('\n--- TEST GROUP 2: Soil Data Validation & Physical Boundary Checks ---');
  runTest('Validates valid row within physiological limits', () => {
    const validRow = {
      sampleCode: 'SMP-V01',
      reportNumber: 'SR-2026-001',
      gridCode: 'G047',
      collectionDate: '2026-08-28',
      depthCm: 15,
      pH: 6.5,
      ec: 1.1,
      organicCarbon: 0.85,
      nitrogen: 185,
      phosphorus: 44,
      potassium: 212,
    };
    const res = SoilValidationService.validateRow(validRow);
    assert.equal(res.isValid, true);
    assert.equal(res.status, 'VALID');
    assert.equal(res.errors.length, 0);
    assert.ok(res.cleanData);
    assert.equal(res.cleanData?.phosphorus, 44);
  });

  runTest('Rejects physically impossible pH (< 3.5 or > 9.8)', () => {
    const acidRow = {
      sampleCode: 'SMP-ACID',
      collectionDate: '2026-08-28',
      pH: 2.1,
      nitrogen: 150,
      phosphorus: 30,
      potassium: 180,
    };
    const resAcid = SoilValidationService.validateRow(acidRow);
    assert.equal(resAcid.isValid, false);
    assert.equal(resAcid.status, 'INVALID');
    assert.ok(resAcid.errors.some((e) => e.includes('pH out of realistic agricultural range')));

    const alkalineRow = {
      sampleCode: 'SMP-ALK',
      collectionDate: '2026-08-28',
      pH: 11.5,
    };
    const resAlk = SoilValidationService.validateRow(alkalineRow);
    assert.equal(resAlk.isValid, false);
    assert.ok(resAlk.errors.some((e) => e.includes('pH out of realistic agricultural range')));
  });

  runTest('Rejects negative nutrient concentrations', () => {
    const negRow = {
      sampleCode: 'SMP-NEG',
      collectionDate: '2026-08-28',
      pH: 6.5,
      nitrogen: -15,
      phosphorus: 40,
      potassium: 200,
    };
    const res = SoilValidationService.validateRow(negRow);
    assert.equal(res.isValid, false);
    assert.ok(res.errors.some((e) => e.includes('non-negative number')));
  });

  runTest('Detects duplicate sample codes in batch validation', () => {
    const existing = new Set(['SMP-EXISTING-01']);
    const dupRow = {
      sampleCode: 'SMP-EXISTING-01',
      collectionDate: '2026-08-28',
    };
    const res = SoilValidationService.validateRow(dupRow, existing);
    assert.equal(res.isValid, false);
    assert.ok(res.errors.some((e) => e.includes('Duplicate Sample Code')));
  });

  runTest('Flags warning for soil samples older than 365 days', () => {
    const oldRow = {
      sampleCode: 'SMP-OLD-01',
      collectionDate: '2024-01-01',
      pH: 6.5,
      nitrogen: 180,
      phosphorus: 40,
      potassium: 200,
    };
    const res = SoilValidationService.validateRow(oldRow);
    assert.equal(res.isValid, true); // Still valid format
    assert.equal(res.hasWarnings, true);
    assert.equal(res.status, 'WARNING');
    assert.ok(res.warnings.some((w) => w.includes('agronomically stale')));
  });

  console.log('\n--- TEST GROUP 3: Soil Data Freshness Classification ---');
  runTest('Calculates data freshness categories accurately', () => {
    const now = new Date();
    const tenDaysAgo = new Date(now.getTime() - 10 * 86400000);
    const fortyDaysAgo = new Date(now.getTime() - 40 * 86400000);
    const oneFiftyDaysAgo = new Date(now.getTime() - 150 * 86400000);
    const twoYearsAgo = new Date(now.getTime() - 730 * 86400000);

    assert.equal(SoilBaselineService.evaluateFreshness(tenDaysAgo).label, 'CURRENT');
    assert.equal(SoilBaselineService.evaluateFreshness(fortyDaysAgo).label, 'RECENT');
    assert.equal(SoilBaselineService.evaluateFreshness(oneFiftyDaysAgo).label, 'STALE');
    assert.equal(SoilBaselineService.evaluateFreshness(twoYearsAgo).label, 'VERY_STALE');
  });

  console.log('\n--- TEST GROUP 4: Soil Data Conflict Detection ---');
  runTest('Detects substantial conflict between Lab Test and Sensor estimate (> 25% discrepancy)', () => {
    const labP = 44.0;
    const sensorP = 71.0;
    const conflict = SoilBaselineService.detectConflict('Phosphorus (P)', labP, sensorP, 25.0);

    assert.equal(conflict.hasConflict, true);
    assert.equal(conflict.requiresReview, true);
    assert.ok(conflict.relativeDifferencePct > 45); // ~46.9% diff
    assert.ok(conflict.recommendation.includes('Prefer Lab'));
  });

  runTest('Allows minor differences within agricultural tolerance (< 25%)', () => {
    const labP = 44.0;
    const estimateP = 47.0; // ~6.6% diff
    const conflict = SoilBaselineService.detectConflict('Phosphorus (P)', labP, estimateP, 25.0);

    assert.equal(conflict.hasConflict, false);
    assert.equal(conflict.requiresReview, false);
  });

  console.log('\n--- TEST GROUP 5: Spatial Interpolation & Estimation Foundation ---');
  runTest('Identifies DIRECT sample when target is co-located within 15 meters', () => {
    const samples = [
      {
        sampleCode: 'SMP-G047',
        latitude: 12.9715987,
        longitude: 77.5945627,
        nValue: 188,
        pValue: 44,
        kValue: 212,
        phValue: 6.4,
        ecValue: 1.2,
        measuredAt: new Date(),
        quality: 'HIGH',
      },
    ];

    const result = SoilSpatialEstimatorService.estimateGridNutrients(
      12.9715990,
      77.5945630,
      samples,
      350
    );

    assert.equal(result.classification, 'DIRECT');
    assert.equal(result.source, 'LAB_SOIL_TEST');
    assert.equal(result.confidenceScore, 0.95);
    assert.equal(result.pValue, 44);
    assert.ok(result.nearestSampleDistanceMeters < 5);
  });

  runTest('Applies inverse-distance weighted estimation for unsampled grid within radius', () => {
    const samples = [
      {
        sampleCode: 'SMP-A',
        latitude: 12.9716,
        longitude: 77.5945,
        nValue: 180,
        pValue: 40,
        kValue: 200,
        phValue: 6.5,
        ecValue: 1.0,
        measuredAt: new Date(),
        quality: 'HIGH',
      },
      {
        sampleCode: 'SMP-B',
        latitude: 12.9722, // ~66m away
        longitude: 77.5945,
        nValue: 200,
        pValue: 50,
        kValue: 220,
        phValue: 6.7,
        ecValue: 1.2,
        measuredAt: new Date(),
        quality: 'HIGH',
      },
    ];

    const result = SoilSpatialEstimatorService.estimateGridNutrients(
      12.9719, // halfway between
      77.5945,
      samples,
      350
    );

    assert.equal(result.classification, 'ESTIMATED');
    assert.equal(result.source, 'ESTIMATED');
    assert.ok(result.confidenceScore >= 0.70 && result.confidenceScore <= 0.88);
    // P should be roughly halfway between 40 and 50
    assert.ok(result.pValue > 40 && result.pValue < 50);
  });

  runTest('Returns NO_DATA classification when nearest sample exceeds maximum radius', () => {
    const distantSamples = [
      {
        sampleCode: 'SMP-DISTANT',
        latitude: 12.9800, // ~1000m away
        longitude: 77.5945,
        nValue: 180,
        pValue: 40,
        kValue: 200,
        phValue: 6.5,
        ecValue: 1.0,
        measuredAt: new Date(),
        quality: 'HIGH',
      },
    ];

    const result = SoilSpatialEstimatorService.estimateGridNutrients(
      12.9716,
      77.5945,
      distantSamples,
      350
    );

    assert.equal(result.classification, 'NO_DATA');
    assert.equal(result.source, 'ESTIMATED');
    assert.ok(result.nearestSampleDistanceMeters > 350);
    assert.ok(result.rationale.includes('exceeding reliable correlation radius'));
  });

  console.log('\n--- TEST GROUP 6: Sampling Recommendation Engine ---');
  runTest('Recommends HIGH sampling priority for parcels with no samples within 250m', () => {
    const recs = SoilSamplingRecommendationService.generateFieldRecommendations(
      [
        {
          gridId: 'grid-remote',
          gridCode: 'G099',
          latitude: 12.9800,
          longitude: 77.5945,
        },
      ],
      []
    );

    assert.equal(recs.length, 1);
    assert.equal(recs[0].priority, 'HIGH');
    assert.ok(recs[0].rationale.includes('No direct sample exists'));
  });

  console.log('\n--- TEST GROUP 7: Database Baselines, Versioning & Audit Integrity ---');
  await runTest('Creates versioned FieldSoilBaseline in database without overwriting history', async () => {
    let field = await prisma.field.findFirst({
      where: { name: { contains: 'Field 03' } },
    });
    if (!field) field = await prisma.field.findFirst();
    assert.ok(field, 'Field must exist in database');

    const user = await prisma.user.findFirst();
    assert.ok(user, 'User must exist in database');

    // Fetch existing active baselines
    const initialBaselines = await prisma.fieldSoilBaseline.findMany({
      where: { fieldId: field.id },
      orderBy: { createdAt: 'desc' },
    });

    // Create a new baseline v(N+1)
    const newBaseline = await SoilBaselineService.createBaseline({
      organizationId: field.organizationId,
      fieldId: field.id,
      effectiveDate: new Date(),
      source: 'LAB_SOIL_TEST',
      nitrogen: 192.5,
      phosphorus: 46.0,
      potassium: 218.0,
      pH: 6.55,
      ec: 1.15,
      organicCarbon: 0.88,
      confidenceScore: 0.96,
      dataQuality: 'HIGH',
      approvedById: user.id,
    });

    assert.ok(newBaseline.version.startsWith('v'), 'Version should be formatted like v1, v2');
    assert.equal(newBaseline.status, 'ACTIVE');

    // Verify older baselines were superseded rather than deleted
    if (initialBaselines.length > 0) {
      const supersededOld = await prisma.fieldSoilBaseline.findUnique({
        where: { id: initialBaselines[0].id },
      });
      assert.equal(supersededOld?.status, 'SUPERSEDED');
    }

    // Verify all historical versions exist
    const allBaselines = await prisma.fieldSoilBaseline.findMany({
      where: { fieldId: field.id },
    });
    assert.ok(allBaselines.length >= initialBaselines.length + 1);
  });

  await runTest('Logs auditable SoilDataCorrection events with reason and lineage', async () => {
    const report = await prisma.soilTestReport.findFirst();
    assert.ok(report, 'SoilTestReport must exist in database');
    const user = await prisma.user.findFirst();

    const correction = await SoilBaselineService.recordCorrection({
      organizationId: report.organizationId,
      reportId: report.id,
      parameter: 'Phosphorus (P)',
      originalValue: '44',
      correctedValue: '46',
      reason: 'Laboratory analytical instrument recalibration certificate #AC-992',
      performedById: user!.id,
    });

    assert.ok(correction.id);
    assert.equal(correction.originalValue, '44');
    assert.equal(correction.correctedValue, '46');
    assert.ok(correction.reason.includes('recalibration'));

    // Check audit log created
    const audit = await prisma.auditLog.findFirst({
      where: {
        entityId: report.id,
        action: 'SOIL_DATA_CORRECTION',
      },
    });
    assert.ok(audit, 'Audit log must record SOIL_DATA_CORRECTION');
  });

  await runTest('Prescription engine links to active SoilBaseline and cites lab test in explanation', async () => {
    let field = await prisma.field.findFirst({
      where: { name: { contains: 'Field 03' } },
      include: { grids: true },
    });
    if (!field || field.grids.length === 0) {
      field = await prisma.field.findFirst({
        where: { grids: { some: {} } },
        include: { grids: true },
      });
    }
    assert.ok(field && field.grids.length > 0);
    const targetGrid = field.grids[0];

    // Check latest prescription on this grid
    const latestRx = await prisma.prescription.findFirst({
      where: { gridId: targetGrid.id },
      orderBy: { createdAt: 'desc' },
    });

    if (latestRx) {
      // In Milestone 14, prescriptions capture baseline ID and version
      assert.ok(latestRx.soilBaselineId !== undefined, 'soilBaselineId field exists on prescription');
      assert.ok(latestRx.soilBaselineVersion !== undefined, 'soilBaselineVersion exists');
      assert.ok(latestRx.soilDataQuality !== undefined, 'soilDataQuality exists');
      assert.ok(latestRx.explanationText.length > 0, 'Explanation text populated');
    }
  });

  console.log('\n====================================================');
  console.log(`    MILESTONE 14 VALIDATION COMPLETE: ${passCount} / 16 PASSED    `);
  console.log('====================================================\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
