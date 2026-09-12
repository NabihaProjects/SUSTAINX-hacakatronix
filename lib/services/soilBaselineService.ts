// SOIL IQ - Soil Baseline Management, Lifecycle & Conflict Service
import prisma from '@/lib/db/prisma';

export interface SoilFreshnessResult {
  daysOld: number;
  label: 'CURRENT' | 'RECENT' | 'STALE' | 'VERY_STALE';
  formattedText: string;
}

export interface SoilConflictResult {
  hasConflict: boolean;
  parameter?: string;
  sourceA: { name: string; value: number };
  sourceB: { name: string; value: number };
  relativeDifferencePct: number;
  requiresReview: boolean;
  recommendation: string;
}

export class SoilBaselineService {
  /**
   * Calculate data freshness classification from measurement date
   */
  static evaluateFreshness(measurementDate: Date | string): SoilFreshnessResult {
    const d = new Date(measurementDate);
    const daysOld = Math.max(0, Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24)));

    let label: SoilFreshnessResult['label'] = 'CURRENT';
    if (daysOld > 365) {
      label = 'VERY_STALE';
    } else if (daysOld > 120) {
      label = 'STALE';
    } else if (daysOld > 30) {
      label = 'RECENT';
    }

    const formattedText =
      daysOld === 0
        ? 'Measured today'
        : daysOld === 1
        ? 'Measured yesterday'
        : `Measured ${daysOld} days ago`;

    return { daysOld, label, formattedText };
  }

  /**
   * Detect conflicts between differing soil data sources (e.g. Lab Assay vs Sensor Estimate)
   */
  static detectConflict(
    parameterName: string,
    labValue: number,
    estimateValue: number,
    tolerancePct = 25.0
  ): SoilConflictResult {
    if (labValue <= 0 && estimateValue <= 0) {
      return {
        hasConflict: false,
        sourceA: { name: 'Lab Test', value: labValue },
        sourceB: { name: 'Sensor / Estimate', value: estimateValue },
        relativeDifferencePct: 0,
        requiresReview: false,
        recommendation: 'Both values nominal.',
      };
    }

    const avg = (labValue + estimateValue) / 2;
    const diffPct = Number(((Math.abs(labValue - estimateValue) / avg) * 100).toFixed(1));

    if (diffPct > tolerancePct) {
      return {
        hasConflict: true,
        parameter: parameterName,
        sourceA: { name: 'Validated Lab Assay', value: labValue },
        sourceB: { name: 'Continuous Sensor / Estimate', value: estimateValue },
        relativeDifferencePct: diffPct,
        requiresReview: true,
        recommendation: `Discrepancy of ${diffPct}% detected in ${parameterName}. Prefer Lab Assay baseline; agronomist review required.`,
      };
    }

    return {
      hasConflict: false,
      parameter: parameterName,
      sourceA: { name: 'Validated Lab Assay', value: labValue },
      sourceB: { name: 'Continuous Sensor / Estimate', value: estimateValue },
      relativeDifferencePct: diffPct,
      requiresReview: false,
      recommendation: `Values agree within +/- ${tolerancePct}% tolerance.`,
    };
  }

  /**
   * Approve a Draft or Review Baseline and set as ACTIVE (marking previous as SUPERSEDED)
   */
  static async approveBaseline(baselineId: string, approvedByUserId?: string) {
    const target = await prisma.fieldSoilBaseline.findUnique({
      where: { id: baselineId },
    });

    if (!target) throw new Error('Baseline not found.');

    // 1. Mark existing ACTIVE baselines for this grid or field as SUPERSEDED
    await prisma.fieldSoilBaseline.updateMany({
      where: {
        organizationId: target.organizationId,
        gridId: target.gridId,
        fieldId: target.fieldId,
        status: 'ACTIVE',
        id: { not: target.id },
      },
      data: {
        status: 'SUPERSEDED',
      },
    });

    // 2. Activate target baseline
    return prisma.fieldSoilBaseline.update({
      where: { id: baselineId },
      data: {
        status: 'ACTIVE',
        approvedByUserId,
        approvedAt: new Date(),
      },
    });
  }

  /**
   * Create a new versioned FieldSoilBaseline (draft or auto-activated)
   */
  static async createBaseline(params: {
    organizationId: string;
    farmId?: string;
    fieldId?: string;
    gridId?: string;
    effectiveDate: Date;
    source: string;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    pH: number;
    ec?: number;
    organicCarbon?: number;
    confidenceScore: number;
    dataQuality: string;
    approvedById?: string;
  }) {
    const latest = await prisma.fieldSoilBaseline.findFirst({
      where: {
        organizationId: params.organizationId,
        fieldId: params.fieldId,
        gridId: params.gridId,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (params.approvedById) {
      await prisma.fieldSoilBaseline.updateMany({
        where: {
          organizationId: params.organizationId,
          fieldId: params.fieldId,
          gridId: params.gridId,
          status: 'ACTIVE',
        },
        data: {
          status: 'SUPERSEDED',
        },
      });
    }

    let farmId = params.farmId;
    if (!farmId && params.fieldId) {
      const fld = await prisma.field.findUnique({ where: { id: params.fieldId } });
      if (fld) farmId = fld.farmId;
    }
    if (!farmId) {
      const defaultFarm = await prisma.farm.findFirst({ where: { organizationId: params.organizationId } });
      farmId = defaultFarm?.id || 'farm-1';
    }

    let versionStr = 'v1';
    if (latest && latest.version) {
      const vNum = parseInt(latest.version.replace(/[^0-9]/g, '') || '1', 10);
      versionStr = `v${vNum + 1}`;
    }

    const baseline = await prisma.fieldSoilBaseline.create({
      data: {
        organizationId: params.organizationId,
        farmId,
        fieldId: params.fieldId || 'field-1',
        gridId: params.gridId,
        effectiveDate: params.effectiveDate,
        source: params.source,
        nValue: params.nitrogen,
        pValue: params.phosphorus,
        kValue: params.potassium,
        phValue: params.pH,
        ecValue: params.ec ?? 1.1,
        ocValue: params.organicCarbon ?? 0.85,
        confidenceScore: params.confidenceScore,
        quality: params.dataQuality || 'HIGH',
        version: versionStr,
        status: params.approvedById ? 'ACTIVE' : 'DRAFT',
        approvedByUserId: params.approvedById,
        approvedAt: params.approvedById ? new Date() : null,
      },
    });

    return baseline;
  }

  /**
   * Log an auditable soil data correction event
   */
  static async recordCorrection(params: {
    organizationId: string;
    targetType?: 'MEASUREMENT' | 'BASELINE';
    targetId?: string;
    reportId?: string;
    parameter?: string;
    fieldName?: string;
    originalValue: string;
    correctedValue: string;
    reason: string;
    userId?: string;
    performedById?: string;
  }) {
    const targetType = params.targetType || 'MEASUREMENT';
    const targetId = params.targetId || params.reportId || 'unknown';
    const fieldName = params.parameter || params.fieldName || 'SoilParameter';
    const userId = params.userId || params.performedById;

    const correction = await prisma.soilDataCorrection.create({
      data: {
        organizationId: params.organizationId,
        targetType,
        targetId,
        fieldName,
        originalValue: params.originalValue,
        correctedValue: params.correctedValue,
        reason: params.reason,
        userId,
      },
    });

    // Audit log integration
    await prisma.auditLog.create({
      data: {
        organizationId: params.organizationId,
        userId: userId || 'system',
        action: 'SOIL_DATA_CORRECTION',
        entityType: 'SoilDataCorrection',
        entityId: targetId,
        metadataJson: JSON.stringify({
          fieldName,
          originalValue: params.originalValue,
          correctedValue: params.correctedValue,
          reason: params.reason,
        }),
      },
    });

    return correction;
  }

  /**
   * Calculate overall Soil Data Quality Score (0 - 100)
   */
  static calculateDataQualityScore(params: {
    directSampleCount: number;
    totalGrids: number;
    avgDaysOld: number;
    hasLabReport: boolean;
    conflictsCount: number;
  }) {
    // 1. Freshness Score (100 if <30 days, drops to 40 if >365 days)
    const freshness = Math.max(30, Math.min(100, Math.round(100 - (params.avgDaysOld / 365) * 60)));

    // 2. Spatial Coverage Score
    const coverage = params.totalGrids > 0
      ? Math.round((params.directSampleCount / params.totalGrids) * 100)
      : 50;

    // 3. Source Quality Score
    const sourceQuality = params.hasLabReport ? 95 : 60;

    // 4. Consistency Score
    const consistency = Math.max(40, 100 - params.conflictsCount * 20);

    // Weighted composite
    const overall = Math.round(freshness * 0.3 + coverage * 0.25 + sourceQuality * 0.25 + consistency * 0.2);

    return {
      overall,
      freshness,
      coverage,
      sourceQuality,
      consistency,
    };
  }
}
