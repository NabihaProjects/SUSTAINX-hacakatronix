// SOIL IQ - Soil Test Import, Column Mapping & CSV Batch Service
import prisma from '@/lib/db/prisma';
import { RawSoilDataRow, SoilValidationService } from './soilValidationService';

export const STANDARD_COLUMN_ALIASES: Record<string, string[]> = {
  sampleCode: ['sample', 'sample_code', 'samplecode', 'sample_id', 'sampleid', 'lab_id'],
  gridCode: ['grid', 'grid_code', 'gridcode', 'cell', 'zone'],
  reportNumber: ['report', 'report_number', 'report_no', 'reportnum', 'lab_report'],
  laboratoryName: ['laboratory', 'lab', 'lab_name', 'laboratory_name', 'testing_lab'],
  collectionDate: ['date', 'collection_date', 'sampled_date', 'sample_date', 'sampling_date'],
  depthCm: ['depth', 'depth_cm', 'sampling_depth', 'depth_inches'],
  pH: ['ph', 'soil_ph', 'ph_h2o', 'reaction'],
  ec: ['ec', 'soil_ec', 'conductivity', 'electrical_conductivity'],
  organicCarbon: ['oc', 'organic_carbon', 'organic_matter', 'om', 'som'],
  nitrogen: ['n', 'nitrogen', 'available_n', 'soil_n', 'total_n'],
  phosphorus: ['p', 'phosphorus', 'available_p', 'soil_p', 'bray_p', 'olsen_p'],
  potassium: ['k', 'potassium', 'available_k', 'soil_k', 'exchangeable_k'],
};

export class SoilImportService {
  /**
   * Generates a standard sample CSV template string
   */
  static generateCsvTemplate(): string {
    return [
      'sample_code,report_number,laboratory,collection_date,grid_code,depth_cm,ph,ec,organic_carbon,nitrogen,phosphorus,potassium',
      'SMP-G041-01,SR-2026-00412,National Ag Labs,2026-08-28,G041,15,6.4,1.1,0.82,185,42,210',
      'SMP-G042-01,SR-2026-00412,National Ag Labs,2026-08-28,G042,15,6.5,1.2,0.85,190,44,215',
      'SMP-G047-01,SR-2026-00412,National Ag Labs,2026-08-28,G047,15,6.4,1.2,0.85,188,44,212',
    ].join('\n');
  }

  /**
   * Resolve CSV header name to canonical model field name
   */
  /**
   * Resolve CSV header name to canonical model field name
   */
  static resolveColumnName(rawHeader: string): string | null {
    const raw = rawHeader.trim().toLowerCase();
    // remove text in parentheses like (bray) or (h2o)
    const withoutParens = raw.replace(/\([^)]*\)/g, '').trim();
    const cleanWithUnderscore = withoutParens.replace(/[\s-]+/g, '_').replace(/[^a-z0-9_]/g, '');
    const cleanNoUnderscore = withoutParens.replace(/[^a-z0-9]/g, '');

    for (const [canonical, aliases] of Object.entries(STANDARD_COLUMN_ALIASES)) {
      if (
        canonical.toLowerCase() === cleanWithUnderscore ||
        canonical.toLowerCase() === cleanNoUnderscore ||
        aliases.includes(cleanWithUnderscore) ||
        aliases.includes(cleanNoUnderscore)
      ) {
        return canonical;
      }
    }
    return null;
  }

  /**
   * Parse a raw CSV text string into mapped RawSoilDataRow objects
   */
  static parseCsv(csvText: string): { rows: RawSoilDataRow[]; columnMappings: Record<string, string> } {
    const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length < 2) {
      throw new Error('CSV file must contain a header line and at least one data row.');
    }

    const rawHeaders = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
    const columnMappings: Record<string, string> = {};

    rawHeaders.forEach((header, idx) => {
      const canonical = this.resolveColumnName(header);
      if (canonical) {
        columnMappings[idx] = canonical;
      }
    });

    const rows: RawSoilDataRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));
      const rowObj: any = {
        sampleCode: `SMP-ROW-${i}`,
        collectionDate: new Date().toISOString().slice(0, 10),
      };

      const numericFields = new Set(['pH', 'ec', 'organicCarbon', 'nitrogen', 'phosphorus', 'potassium', 'depthCm']);
      values.forEach((val, idx) => {
        const canonical = columnMappings[idx];
        if (canonical) {
          if (numericFields.has(canonical) && val !== '' && !isNaN(Number(val))) {
            rowObj[canonical] = Number(val);
          } else {
            rowObj[canonical] = val;
          }
        }
      });

      rows.push(rowObj);
    }

    return { rows, columnMappings };
  }

  /**
   * Commit validated soil test rows to the database
   */
  static async commitImport(params: {
    organizationId: string;
    farmId: string;
    fieldId: string;
    filename: string;
    rows: RawSoilDataRow[];
    userId?: string;
  }) {
    // 1. Validate rows
    const validation = SoilValidationService.validateBatch(params.rows);
    if (validation.validCount === 0) {
      throw new Error('Cannot import: Zero valid rows detected.');
    }

    // 2. Create Import Batch Record
    const batch = await prisma.soilImportBatch.create({
      data: {
        organizationId: params.organizationId,
        filename: params.filename,
        source: 'LAB_CSV_UPLOAD',
        status: validation.invalidCount > 0 ? 'IMPORTED_WITH_ERRORS' : 'IMPORTED',
        rowsDetected: validation.totalRows,
        validRows: validation.validCount,
        invalidRows: validation.invalidCount,
        warningsCount: validation.warningCount,
        uploadedByUserId: params.userId,
      },
    });

    // 3. Group by Report Number
    const sampleResults = [];

    for (const res of validation.results) {
      if (!res.isValid || !res.cleanData) continue;
      const data = res.cleanData;

      // Upsert report
      const report = await prisma.soilTestReport.upsert({
        where: {
          organizationId_reportNumber: {
            organizationId: params.organizationId,
            reportNumber: data.reportNumber,
          },
        },
        update: { status: 'VALIDATED' },
        create: {
          organizationId: params.organizationId,
          farmId: params.farmId,
          fieldId: params.fieldId,
          reportNumber: data.reportNumber,
          laboratoryName: 'Analytical Ag Laboratory',
          collectionDate: data.collectionDate,
          testDate: data.collectionDate,
          source: 'LAB_SOIL_TEST',
          status: 'VALIDATED',
          version: 'v1.0',
        },
      });

      // Find matching grid by gridCode
      const grid = await prisma.grid.findFirst({
        where: {
          fieldId: params.fieldId,
          gridCode: data.gridCode,
        },
      });

      // Create Soil Sample
      const sample = await prisma.soilSample.upsert({
        where: {
          organizationId_sampleCode: {
            organizationId: params.organizationId,
            sampleCode: data.sampleCode,
          },
        },
        update: {
          reportId: report.id,
          gridId: grid?.id,
        },
        create: {
          organizationId: params.organizationId,
          farmId: params.farmId,
          fieldId: params.fieldId,
          gridId: grid?.id,
          reportId: report.id,
          sampleCode: data.sampleCode,
          collectionDate: data.collectionDate,
          depthCm: data.depthCm,
          samplingMethod: 'CORE_COMPOSITE',
          source: 'LAB_SOIL_TEST',
        },
      });

      // Delete old and insert fresh measurements
      await prisma.soilLabMeasurement.deleteMany({ where: { sampleId: sample.id } });
      await prisma.soilLabMeasurement.createMany({
        data: [
          { sampleId: sample.id, nutrientCode: 'N', value: data.nitrogen, unit: 'kg/ha', source: 'LAB_SOIL_TEST', quality: 'HIGH' },
          { sampleId: sample.id, nutrientCode: 'P', value: data.phosphorus, unit: 'ppm', source: 'LAB_SOIL_TEST', quality: 'HIGH' },
          { sampleId: sample.id, nutrientCode: 'K', value: data.potassium, unit: 'ppm', source: 'LAB_SOIL_TEST', quality: 'HIGH' },
          { sampleId: sample.id, nutrientCode: 'pH', value: data.pH, unit: 'pH', source: 'LAB_SOIL_TEST', quality: 'HIGH' },
          { sampleId: sample.id, nutrientCode: 'EC', value: data.ec, unit: 'dS/m', source: 'LAB_SOIL_TEST', quality: 'HIGH' },
          { sampleId: sample.id, nutrientCode: 'OC', value: data.organicCarbon, unit: '%', source: 'LAB_SOIL_TEST', quality: 'HIGH' },
        ],
      });

      // If tied to a grid, update/create active baseline
      if (grid) {
        // Mark old active as superseded
        await prisma.fieldSoilBaseline.updateMany({
          where: { gridId: grid.id, status: 'ACTIVE' },
          data: { status: 'SUPERSEDED' },
        });

        await prisma.fieldSoilBaseline.create({
          data: {
            organizationId: params.organizationId,
            farmId: params.farmId,
            fieldId: params.fieldId,
            gridId: grid.id,
            reportId: report.id,
            effectiveDate: data.collectionDate,
            source: 'LAB_SOIL_TEST',
            nValue: data.nitrogen,
            pValue: data.phosphorus,
            kValue: data.potassium,
            phValue: data.pH,
            ecValue: data.ec,
            ocValue: data.organicCarbon,
            confidenceScore: 0.95,
            quality: 'HIGH',
            version: 'v1.0',
            status: 'ACTIVE',
            approvedAt: new Date(),
          },
        });
      }

      sampleResults.push(sample.id);
    }

    return {
      batchId: batch.id,
      importedSamplesCount: sampleResults.length,
      validRows: validation.validCount,
      invalidRows: validation.invalidCount,
      warningsCount: validation.warningCount,
    };
  }
}
