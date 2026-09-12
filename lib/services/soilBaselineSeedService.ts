// SOIL IQ - Soil Baseline, Nutrient Registry & Demo Seed Service
import prisma from '@/lib/db/prisma';

export const STANDARD_NUTRIENTS = [
  { code: 'N', name: 'Available Nitrogen', symbol: 'N', standardUnit: 'kg/ha', category: 'MACRO' },
  { code: 'P', name: 'Available Phosphorus (Bray-1)', symbol: 'P', standardUnit: 'ppm', category: 'MACRO' },
  { code: 'K', name: 'Available Potassium', symbol: 'K', standardUnit: 'ppm', category: 'MACRO' },
  { code: 'S', name: 'Available Sulfur', symbol: 'S', standardUnit: 'ppm', category: 'SECONDARY' },
  { code: 'Zn', name: 'Zinc (DTPA-extractable)', symbol: 'Zn', standardUnit: 'ppm', category: 'MICRO' },
  { code: 'Fe', name: 'Iron (DTPA-extractable)', symbol: 'Fe', standardUnit: 'ppm', category: 'MICRO' },
  { code: 'Mn', name: 'Manganese', symbol: 'Mn', standardUnit: 'ppm', category: 'MICRO' },
  { code: 'B', name: 'Hot Water Soluble Boron', symbol: 'B', standardUnit: 'ppm', category: 'MICRO' },
  { code: 'pH', name: 'Soil Reaction (1:2.5 H2O)', symbol: 'pH', standardUnit: 'pH', category: 'CHEMICAL' },
  { code: 'EC', name: 'Electrical Conductivity', symbol: 'EC', standardUnit: 'dS/m', category: 'PHYSICAL' },
  { code: 'OC', name: 'Organic Carbon (Walkley-Black)', symbol: 'OC', standardUnit: '%', category: 'CHEMICAL' },
];

export class SoilBaselineSeedService {
  static async seedNutrientDefinitions() {
    for (const nut of STANDARD_NUTRIENTS) {
      await prisma.nutrientDefinition.upsert({
        where: { code: nut.code },
        update: {
          name: nut.name,
          symbol: nut.symbol,
          standardUnit: nut.standardUnit,
          category: nut.category,
          active: true,
        },
        create: {
          code: nut.code,
          name: nut.name,
          symbol: nut.symbol,
          standardUnit: nut.standardUnit,
          category: nut.category,
          active: true,
        },
      });
    }
  }

  static async seedGreenValleySoilBaselines() {
    await this.seedNutrientDefinitions();

    const farm = await prisma.farm.findFirst({
      where: { name: { contains: 'Green Valley' } },
      include: {
        fields: {
          include: { grids: true },
        },
      },
    });

    if (!farm) return;

    const field3 = farm.fields.find((f) => f.name.includes('Field 3')) || farm.fields[0];
    if (!field3) return;

    // 1. Create or upsert Soil Test Report
    const reportNumber = 'SR-2026-00412';
    const report = await prisma.soilTestReport.upsert({
      where: {
        organizationId_reportNumber: {
          organizationId: farm.organizationId,
          reportNumber,
        },
      },
      update: {
        status: 'VALIDATED',
        laboratoryName: 'National Ag Analytical Laboratories (NABL Accr. #1042)',
      },
      create: {
        organizationId: farm.organizationId,
        farmId: farm.id,
        fieldId: field3.id,
        reportNumber,
        laboratoryName: 'National Ag Analytical Laboratories (NABL Accr. #1042)',
        collectionDate: new Date('2026-08-28T09:30:00Z'),
        testDate: new Date('2026-08-30T14:15:00Z'),
        receivedDate: new Date('2026-08-31T10:00:00Z'),
        source: 'LAB_SOIL_TEST',
        status: 'VALIDATED',
        version: 'v1.0',
        documentReference: 'DOC-LAB-CERT-2026-00412.pdf',
        notes: 'Pre-season composite core samples taken at 0-15cm depth. Analysis via Bray-1 for P and Flame Photometer for K.',
      },
    });

    // 2. Create Samples and Baseline for Field 3 Grids
    for (const grid of field3.grids) {
      const sampleCode = `SMP-${grid.gridCode}-01`;

      const sample = await prisma.soilSample.upsert({
        where: {
          organizationId_sampleCode: {
            organizationId: farm.organizationId,
            sampleCode,
          },
        },
        update: {
          reportId: report.id,
        },
        create: {
          organizationId: farm.organizationId,
          farmId: farm.id,
          fieldId: field3.id,
          gridId: grid.id,
          reportId: report.id,
          sampleCode,
          collectionDate: new Date('2026-08-28T09:30:00Z'),
          depthCm: 15.0,
          samplingMethod: 'CORE_COMPOSITE',
          source: 'LAB_SOIL_TEST',
          notes: `Representative core sample for ${grid.gridCode}.`,
        },
      });

      // Calibrated initial baseline values (P = 44 ppm for G047 initially)
      const pVal = grid.gridCode === 'G047' ? 44.0 : 38.0 + (grid.gridCode.charCodeAt(grid.gridCode.length - 1) % 12);
      const nVal = 180.0 + (grid.gridCode.charCodeAt(grid.gridCode.length - 1) % 30);
      const kVal = 210.0 + (grid.gridCode.charCodeAt(grid.gridCode.length - 1) % 25);

      // Create Lab measurements
      await prisma.soilLabMeasurement.deleteMany({ where: { sampleId: sample.id } });
      await prisma.soilLabMeasurement.createMany({
        data: [
          { sampleId: sample.id, nutrientCode: 'N', value: nVal, unit: 'kg/ha', method: 'Alkaline Permanganate', quality: 'HIGH', confidence: 0.95 },
          { sampleId: sample.id, nutrientCode: 'P', value: pVal, unit: 'ppm', method: 'Bray-1 P', quality: 'HIGH', confidence: 0.95 },
          { sampleId: sample.id, nutrientCode: 'K', value: kVal, unit: 'ppm', method: 'Ammonium Acetate', quality: 'HIGH', confidence: 0.95 },
          { sampleId: sample.id, nutrientCode: 'pH', value: 6.4, unit: 'pH', method: '1:2.5 Suspension', quality: 'HIGH', confidence: 0.98 },
          { sampleId: sample.id, nutrientCode: 'EC', value: 1.2, unit: 'dS/m', method: 'Conductivity Bridge', quality: 'HIGH', confidence: 0.95 },
          { sampleId: sample.id, nutrientCode: 'OC', value: 0.85, unit: '%', method: 'Walkley-Black', quality: 'HIGH', confidence: 0.92 },
        ],
      });

      // Upsert FieldSoilBaseline for grid
      const existingBaseline = await prisma.fieldSoilBaseline.findFirst({
        where: {
          organizationId: farm.organizationId,
          gridId: grid.id,
          status: 'ACTIVE',
        },
      });

      if (!existingBaseline) {
        await prisma.fieldSoilBaseline.create({
          data: {
            organizationId: farm.organizationId,
            farmId: farm.id,
            fieldId: field3.id,
            gridId: grid.id,
            reportId: report.id,
            effectiveDate: new Date('2026-08-30T14:15:00Z'),
            source: 'LAB_SOIL_TEST',
            nValue: nVal,
            pValue: pVal,
            kValue: kVal,
            phValue: 6.4,
            ecValue: 1.2,
            ocValue: 0.85,
            confidenceScore: 0.95,
            quality: 'HIGH',
            version: 'v1.0',
            status: 'ACTIVE',
            approvedAt: new Date('2026-08-30T18:00:00Z'),
            notes: 'Approved baseline derived from NABL lab report SR-2026-00412.',
          },
        });
      }
    }
  }
}
