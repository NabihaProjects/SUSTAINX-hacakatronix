// SOIL IQ - Soil Data Validation Engine
// Validates raw imported lab measurements, manual entries, and CSV data rows

export interface RawSoilDataRow {
  sampleCode: string;
  reportNumber?: string;
  fieldId?: string;
  gridCode?: string;
  collectionDate: string;
  depthCm?: number | string;
  pH?: number | string;
  ec?: number | string;
  organicCarbon?: number | string;
  nitrogen?: number | string;
  phosphorus?: number | string;
  potassium?: number | string;
  nUnit?: string;
  pUnit?: string;
  kUnit?: string;
  source?: string;
  laboratoryName?: string;
}

export interface RowValidationResult {
  isValid: boolean;
  hasWarnings: boolean;
  status: 'VALID' | 'WARNING' | 'INVALID';
  errors: string[];
  warnings: string[];
  cleanData?: {
    sampleCode: string;
    reportNumber: string;
    gridCode: string;
    collectionDate: Date;
    depthCm: number;
    pH: number;
    ec: number;
    organicCarbon: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
}

export class SoilValidationService {
  /**
   * Validate a single row of soil test data
   */
  static validateRow(
    row: RawSoilDataRow,
    existingSampleCodes: Set<string> = new Set()
  ): RowValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Required fields
    if (!row.sampleCode || row.sampleCode.trim() === '') {
      errors.push('Sample Code is required.');
    } else if (existingSampleCodes.has(row.sampleCode.trim())) {
      errors.push(`Duplicate Sample Code '${row.sampleCode}' detected.`);
    }

    if (!row.gridCode || row.gridCode.trim() === '') {
      warnings.push('No spatial Grid Code assigned; sample will be field-level only.');
    }

    // 2. Collection Date
    let parsedDate: Date | null = null;
    if (!row.collectionDate) {
      errors.push('Collection Date is required.');
    } else {
      parsedDate = new Date(row.collectionDate);
      if (isNaN(parsedDate.getTime())) {
        errors.push('Invalid Collection Date format.');
      } else if (parsedDate > new Date()) {
        errors.push('Collection Date cannot be in the future.');
      } else {
        const daysOld = Math.floor((Date.now() - parsedDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysOld > 365) {
          warnings.push(`Sample is ${daysOld} days old (> 1 year); data may be agronomically stale.`);
        }
      }
    }

    // 3. pH Validation (Strict physical bounds: 3.5 - 9.8)
    const phVal = Number(row.pH);
    if (isNaN(phVal)) {
      errors.push('Soil pH must be a valid number.');
    } else if (phVal < 3.5 || phVal > 9.8) {
      errors.push(`Physically impossible pH value: ${phVal} (pH out of realistic agricultural range 3.5 - 9.8).`);
    } else if (phVal < 5.0 || phVal > 8.5) {
      warnings.push(`Extreme pH detected (${phVal}); liming or gypsum amendment may be necessary.`);
    }

    // 4. Electrical Conductivity (EC) Validation (0.0 - 15.0 dS/m)
    const ecVal = Number(row.ec ?? 1.0);
    if (isNaN(ecVal) || ecVal < 0) {
      errors.push('Electrical Conductivity (EC) must be a non-negative number.');
    } else if (ecVal > 15.0) {
      errors.push(`Impossible EC value: ${ecVal} dS/m (toxic saline threshold exceeded).`);
    } else if (ecVal > 4.0) {
      warnings.push(`High salinity detected (EC = ${ecVal} dS/m).`);
    }

    // 5. Nitrogen (N) Validation
    const nVal = Number(row.nitrogen);
    if (isNaN(nVal) || nVal < 0) {
      errors.push('Nitrogen (N) must be a non-negative number.');
    } else if (nVal > 800) {
      warnings.push(`Unusually high Nitrogen level (${nVal} kg/ha). Verify lab extraction units.`);
    }

    // 6. Phosphorus (P) Validation
    const pVal = Number(row.phosphorus);
    if (isNaN(pVal) || pVal < 0) {
      errors.push('Phosphorus (P) must be a non-negative number.');
    } else if (pVal > 300) {
      warnings.push(`Very high Phosphorus reading (${pVal} ppm). Check for excessive past manure/phosphate application.`);
    }

    // 7. Potassium (K) Validation
    const kVal = Number(row.potassium);
    if (isNaN(kVal) || kVal < 0) {
      errors.push('Potassium (K) must be a non-negative number.');
    } else if (kVal > 800) {
      warnings.push(`High Potassium reading (${kVal} ppm).`);
    }

    // 8. Organic Carbon (OC) Validation (0.0% - 10.0%)
    const ocVal = Number(row.organicCarbon ?? 0.8);
    if (isNaN(ocVal) || ocVal < 0) {
      errors.push('Organic Carbon (OC) must be non-negative.');
    } else if (ocVal > 12.0) {
      warnings.push(`Extremely high Organic Carbon (${ocVal}%); verify sample is mineral soil and not peat/organic compost.`);
    }

    const depth = Number(row.depthCm ?? 15);

    const isValid = errors.length === 0;
    const hasWarnings = warnings.length > 0;
    const status = !isValid ? 'INVALID' : hasWarnings ? 'WARNING' : 'VALID';

    return {
      isValid,
      hasWarnings,
      status,
      errors,
      warnings,
      cleanData: isValid
        ? {
            sampleCode: row.sampleCode.trim(),
            reportNumber: (row.reportNumber || 'IMPORT-' + Date.now()).trim(),
            gridCode: (row.gridCode || '').trim(),
            collectionDate: parsedDate || new Date(),
            depthCm: isNaN(depth) ? 15 : depth,
            pH: Number(phVal.toFixed(2)),
            ec: Number(ecVal.toFixed(2)),
            organicCarbon: Number(ocVal.toFixed(2)),
            nitrogen: Number(nVal.toFixed(1)),
            phosphorus: Number(pVal.toFixed(1)),
            potassium: Number(kVal.toFixed(1)),
          }
        : undefined,
    };
  }

  /**
   * Batch validate a dataset of CSV rows
   */
  static validateBatch(rows: RawSoilDataRow[]) {
    const existingSamples = new Set<string>();
    const results: RowValidationResult[] = [];
    let validCount = 0;
    let warningCount = 0;
    let invalidCount = 0;

    for (const r of rows) {
      const res = this.validateRow(r, existingSamples);
      if (res.isValid && res.cleanData) {
        existingSamples.add(res.cleanData.sampleCode);
        validCount++;
        if (res.hasWarnings) warningCount++;
      } else {
        invalidCount++;
      }
      results.push(res);
    }

    return {
      totalRows: rows.length,
      validCount,
      warningCount,
      invalidCount,
      results,
    };
  }
}
