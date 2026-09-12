// SOIL IQ - Prescription & Intelligence Engine
// Converts Soil State + Crop + Stage + History + Formulation + Weather into:
// 1. Estimated requirement
// 2. Remaining requirement
// 3. Recommended product & range (min-target-max)
// 4. Grid nutrient budget
// 5. Prescription status (READY, APPROVED, ACTIVE)
// 6. Explainable reasons
// 7. Confidence score
// 8. Full calculation trace

import prisma from '@/lib/db/prisma';
import { AgronomicRequirementService } from '@/lib/domain/agronomicRequirementService';
import { SoilAdjustmentService } from '@/lib/domain/soilAdjustmentService';
import { ApplicationHistoryService } from '@/lib/domain/applicationHistoryService';
import { NutrientBalanceService } from '@/lib/domain/nutrientBalanceService';
import { FertilizerRecommendationService } from '@/lib/domain/fertilizerRecommendationService';
import { WeatherModifierService, EnvironmentalCondition } from '@/lib/domain/weatherModifierService';
import { ConfidenceService } from '@/lib/domain/confidenceService';
import { AuditService } from './auditService';
import { ActivityService } from './activityService';

export interface GeneratePrescriptionInput {
  organizationId: string;
  gridId: string;
  growthStageName?: string;
  targetYieldTonsHa?: number;
  environmentalConditions?: EnvironmentalCondition;
  isSimulation?: boolean;
  actorName?: string;
  userId?: string;
}

export class PrescriptionService {
  static async generatePrescription(input: GeneratePrescriptionInput) {
    const {
      organizationId,
      gridId,
      growthStageName,
      targetYieldTonsHa,
      environmentalConditions,
      isSimulation = false,
      actorName = 'Agronomist',
      userId,
    } = input;

    // 1. Fetch grid with field, farm, crop, soil profile, and applications
    const grid = await prisma.grid.findFirst({
      where: { id: gridId, organizationId },
      include: {
        field: {
          include: {
            farm: true,
            crop: {
              include: { growthStages: true },
            },
          },
        },
        soilProfiles: {
          orderBy: { sampleDate: 'desc' },
          take: 1,
        },
        applications: {
          include: { fertilizer: true },
        },
      },
    });

    if (!grid) throw new Error('Grid not found');

    const cropName = grid.field.crop?.name || 'Rice';
    const activeStage = growthStageName || grid.field.growthStage || 'Vegetative';
    const areaHa = grid.calculatedArea || 0.05;

    // Step A: Base Agronomic Crop Requirement
    const agronomicReq = AgronomicRequirementService.getBaseNutrientRequirement({
      cropName,
      growthStageName: activeStage,
      targetYieldTonsHa: targetYieldTonsHa || grid.field.crop?.targetYieldTonsHa,
      areaHectares: areaHa,
    });

    // Step B: Soil Nutrient Availability Adjustment (Prioritize Milestone 14 Validated Baseline)
    const activeBaseline = await prisma.fieldSoilBaseline.findFirst({
      where: {
        OR: [{ gridId: grid.id }, { fieldId: grid.fieldId, gridId: null }],
        status: 'ACTIVE',
      },
      orderBy: { effectiveDate: 'desc' },
    });

    const latestSoil = grid.soilProfiles[0] || null;
    const soilAdj = SoilAdjustmentService.estimateSoilNutrientAvailability(latestSoil as any);

    if (activeBaseline) {
      // Calibrate available nutrients directly from validated baseline
      soilAdj.availableP.kgPerHa = Number((activeBaseline.pValue * 0.45).toFixed(1));
      soilAdj.availableK.kgPerHa = Number((activeBaseline.kValue * 0.35).toFixed(1));
    }

    // Step C: Previous Application History
    const history = ApplicationHistoryService.aggregateGridApplications(
      grid.id,
      areaHa,
      grid.applications as any
    );

    // Step D: Nutrient Balance Engine
    const balance = NutrientBalanceService.calculateNutrientBalance({
      baseReqPerHa: {
        N: agronomicReq.rateNPerHa,
        P: agronomicReq.ratePPerHa,
        K: agronomicReq.rateKPerHa,
      },
      soilAvailablePerHa: {
        N: soilAdj.availableN.kgPerHa,
        P: soilAdj.availableP.kgPerHa,
        K: soilAdj.availableK.kgPerHa,
      },
      previousAppliedPerHa: {
        N: history.appliedNPerHa,
        P: history.appliedPPerHa,
        K: history.appliedKPerHa,
      },
      areaHectares: areaHa,
    });

    // Step E: Fetch Available Fertilizer Products
    const fertilizers = await prisma.fertilizer.findMany({
      where: {
        OR: [{ organizationId }, { organizationId: null }],
        isActive: true,
      },
    });

    // Step F: Fertilizer Recommendation Engine
    const recResult = FertilizerRecommendationService.recommendFertilizers({
      remainingN: balance.remainingN,
      remainingP: balance.remainingP,
      remainingK: balance.remainingK,
      availableFertilizers: fertilizers,
      areaHectares: areaHa,
    });

    const selectedOption = recResult.selectedOption;

    // Step G: Environmental Modifier Evaluation
    const envEval = WeatherModifierService.evaluateConditions(environmentalConditions);

    // Step H: Confidence Evaluation
    const confidence = ConfidenceService.evaluateConfidence({
      hasSoilTest: !!latestSoil,
      soilSampleAgeDays: soilAdj.freshnessDays,
      soilMeasurementSource: soilAdj.measurementSource,
      hasCropGrowthStage: !!grid.field.crop,
      hasApplicationHistory: grid.applications.length > 0,
      environmentalRisk: envEval.riskLevel,
    });

    // Step I: Explainable Reasoning
    const reasons: string[] = [
      `Crop "${cropName}" is in the ${activeStage} growth stage (demands higher ${agronomicReq.rateNPerHa > agronomicReq.ratePPerHa ? 'Nitrogen' : 'Phosphorus'}).`,
      `Soil measurement (${soilAdj.measurementSource}) provides ${soilAdj.availableN.kgPerHa} kg/ha available N credits.`,
      `Previous applications contributed ${history.appliedNPerHa} kg/ha N, ${history.appliedPPerHa} kg/ha P, ${history.appliedKPerHa} kg/ha K.`,
      `Net remaining requirement is ${balance.remainingN} kg N, ${balance.remainingP} kg P, ${balance.remainingK} kg K / ha.`,
      `Recommended product "${selectedOption.products[0]?.fertilizerName}" covers required nutrients with target application rate of ${selectedOption.totalRateKgHa} kg/ha.`,
      `Environmental safety check: ${envEval.status} (${envEval.reason}).`,
    ];

    if (selectedOption.recommendSplitApplication) {
      reasons.push(`Split application advice: ${selectedOption.splitDetails}`);
    }

    // Full Calculation Trace for Transparency
    const calculationTrace = {
      step1_agronomicBaseDemand: {
        crop: cropName,
        stage: activeStage,
        rateNPerHa: agronomicReq.rateNPerHa,
        ratePPerHa: agronomicReq.ratePPerHa,
        rateKPerHa: agronomicReq.rateKPerHa,
      },
      step2_soilAdjustment: {
        source: soilAdj.measurementSource,
        availableNkgHa: soilAdj.availableN.kgPerHa,
        availablePkgHa: soilAdj.availableP.kgPerHa,
        availableKkgHa: soilAdj.availableK.kgPerHa,
      },
      step3_applicationHistory: {
        applicationsCount: history.totalApplications,
        appliedNPerHa: history.appliedNPerHa,
        appliedPPerHa: history.appliedPPerHa,
        appliedKPerHa: history.appliedKPerHa,
      },
      step4_nutrientBalance: {
        recommendedN: balance.recommendedN,
        recommendedP: balance.recommendedP,
        recommendedK: balance.recommendedK,
        remainingN: balance.remainingN,
        remainingP: balance.remainingP,
        remainingK: balance.remainingK,
        excessN: balance.excessN,
      },
      step5_fertilizerSelection: {
        option: selectedOption.title,
        products: selectedOption.products,
        targetRateKgHa: selectedOption.totalRateKgHa,
        range: `${selectedOption.minRateKgHa} - ${selectedOption.maxRateKgHa} kg/ha`,
      },
      step6_environmentalModifier: envEval,
      step7_confidenceScore: confidence,
    };

    const code = `RX-${new Date().getFullYear()}-${grid.gridCode}`;
    const status = envEval.status === 'BLOCK' || envEval.status === 'DEFER' ? 'BLOCKED' : 'READY';

    // If running in SIMULATION MODE, do not overwrite database
    if (isSimulation) {
      return {
        id: 'SIMULATION_ONLY',
        code: `${code}-SIM`,
        versionNumber: 1,
        status,
        confidenceLevel: confidence.level,
        confidenceScore: confidence.score,
        isSimulation: true,
        estimatedReqN: balance.remainingN,
        estimatedReqP: balance.remainingP,
        estimatedReqK: balance.remainingK,
        targetRateKgHa: selectedOption.totalRateKgHa,
        minRateKgHa: selectedOption.minRateKgHa,
        maxRateKgHa: selectedOption.maxRateKgHa,
        explanationText: reasons.join('\n• '),
        reasonsJson: JSON.stringify(reasons),
        calculationTraceJson: JSON.stringify(calculationTrace),
        environmentalRisk: envEval.riskLevel,
        environmentalAction: envEval.status,
        environmentalReason: envEval.reason,
        selectedOption,
        options: recResult.options,
        trace: calculationTrace,
      };
    }

    // Save or version prescription in database
    const existingPrescription = await prisma.prescription.findFirst({
      where: { gridId, organizationId },
      orderBy: { versionNumber: 'desc' },
    });

    const versionNumber = existingPrescription ? existingPrescription.versionNumber + 1 : 1;

    const prescription = await prisma.$transaction(async (tx) => {
      // If previous version exists, mark it SUPERSEDED
      if (existingPrescription) {
        await tx.prescription.update({
          where: { id: existingPrescription.id },
          data: { status: 'SUPERSEDED' },
        });
      }

      const created = await tx.prescription.create({
        data: {
          organizationId,
          fieldId: grid.fieldId,
          gridId: grid.id,
          code: `${code}-V${versionNumber}`,
          versionNumber,
          status,
          confidenceLevel: confidence.level,
          confidenceScore: confidence.score,
          isSimulation: false,
          estimatedReqN: balance.remainingN,
          estimatedReqP: balance.remainingP,
          estimatedReqK: balance.remainingK,
          targetRateKgHa: selectedOption.totalRateKgHa,
          minRateKgHa: selectedOption.minRateKgHa,
          maxRateKgHa: selectedOption.maxRateKgHa,
          explanationText: activeBaseline
            ? `• Validated lab soil test baseline (${activeBaseline.version}) from ${new Date(
                activeBaseline.effectiveDate
              ).toLocaleDateString()} incorporated (P = ${activeBaseline.pValue} ppm, N = ${
                activeBaseline.nValue
              } kg/ha).\n• ` + reasons.join('\n• ')
            : reasons.join('\n• '),
          reasonsJson: JSON.stringify(
            activeBaseline
              ? [
                  `Validated lab soil test baseline (${activeBaseline.version}) from ${new Date(
                    activeBaseline.effectiveDate
                  ).toLocaleDateString()} incorporated (P = ${activeBaseline.pValue} ppm, N = ${
                    activeBaseline.nValue
                  } kg/ha).`,
                  ...reasons,
                ]
              : reasons
          ),
          calculationTraceJson: JSON.stringify(calculationTrace),
          environmentalRisk: envEval.riskLevel,
          environmentalAction: envEval.status,
          environmentalReason: envEval.reason,
          soilBaselineId: activeBaseline?.id,
          soilBaselineVersion: activeBaseline?.version,
          soilDataQuality: activeBaseline?.quality || 'HIGH',
          soilSourceTypes: activeBaseline?.source || 'LAB_SOIL_TEST',
          items: {
            create: selectedOption.products.map((p, idx) => ({
              fertilizerId: p.fertilizerId || fertilizers[0].id,
              recommendedRateKgHa: p.targetRateKgHa,
              sequenceOrder: idx + 1,
              splitPercent: p.splitPercent || 100.0,
            })),
          },
          versions: {
            create: {
              versionNumber,
              status,
              targetRateKgHa: selectedOption.totalRateKgHa,
              minRateKgHa: selectedOption.minRateKgHa,
              maxRateKgHa: selectedOption.maxRateKgHa,
              confidenceScore: confidence.score,
              changeReason: existingPrescription
                ? 'Regenerated with updated soil measurements and application ledger.'
                : 'Initial baseline prescription generated.',
              snapshotJson: JSON.stringify(calculationTrace),
            },
          },
        },
        include: {
          items: { include: { fertilizer: true } },
          versions: true,
        },
      });

      return created;
    });

    await AuditService.log({
      organizationId,
      userId,
      action: 'PRESCRIPTION_GENERATED',
      entityType: 'PRESCRIPTION',
      entityId: prescription.id,
      metadata: {
        gridCode: grid.gridCode,
        version: versionNumber,
        targetRate: selectedOption.totalRateKgHa,
        confidence: confidence.level,
      },
    });

    await ActivityService.record({
      organizationId,
      farmId: grid.field.farmId,
      actorName,
      action: 'PRESCRIPTION_GENERATED',
      entityType: 'GRID',
      entityName: grid.gridCode,
      description: `Generated Prescription ${prescription.code} for ${grid.gridCode}: ${selectedOption.totalRateKgHa} kg/ha (${selectedOption.products[0]?.fertilizerName}). Confidence: ${confidence.level}.`,
    });

    return prescription;
  }

  static async approvePrescription(
    prescriptionId: string,
    organizationId: string,
    approvedByUserId?: string,
    actorName: string = 'Farm Manager'
  ) {
    const rx = await prisma.prescription.findFirst({
      where: { id: prescriptionId, organizationId },
      include: {
        grid: { include: { field: true } },
        items: true,
      },
    });

    if (!rx) throw new Error('Prescription not found');

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Mark previous active prescriptions for this grid as SUPERSEDED
      await tx.prescription.updateMany({
        where: {
          gridId: rx.gridId,
          id: { not: rx.id },
          status: 'ACTIVE',
        },
        data: { status: 'SUPERSEDED' },
      });

      // 2. Set this prescription to ACTIVE and APPROVED
      const approvedRx = await tx.prescription.update({
        where: { id: rx.id },
        data: {
          status: 'ACTIVE',
          approvedByUserId,
          approvedAt: new Date(),
        },
      });

      // 3. Update the GridNutrientBudget target recommendation rates
      await tx.gridNutrientBudget.upsert({
        where: { gridId: rx.gridId },
        update: {
          minRecommendedRate: rx.minRateKgHa,
          targetRecommendedRate: rx.targetRateKgHa,
          maxRecommendedRate: rx.maxRateKgHa,
        },
        create: {
          gridId: rx.gridId,
          recommendedN: rx.estimatedReqN,
          recommendedP: rx.estimatedReqP,
          recommendedK: rx.estimatedReqK,
          minRecommendedRate: rx.minRateKgHa,
          targetRecommendedRate: rx.targetRateKgHa,
          maxRecommendedRate: rx.maxRateKgHa,
          remainingN: rx.estimatedReqN,
          remainingP: rx.estimatedReqP,
          remainingK: rx.estimatedReqK,
        },
      });

      return approvedRx;
    });

    await AuditService.log({
      organizationId,
      userId: approvedByUserId,
      action: 'PRESCRIPTION_APPROVED',
      entityType: 'PRESCRIPTION',
      entityId: rx.id,
      metadata: { code: rx.code, targetRate: rx.targetRateKgHa },
    });

    await ActivityService.record({
      organizationId,
      farmId: rx.grid.field.farmId,
      actorName,
      action: 'PRESCRIPTION_APPROVED',
      entityType: 'PRESCRIPTION',
      entityName: rx.code,
      description: `Prescription ${rx.code} approved and activated for grid ${rx.grid.gridCode}. Ready for sprayer telemetry.`,
    });

    return updated;
  }
}
