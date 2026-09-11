// SOIL IQ - Fertilizer Application Service
// Records manual fertilizer applications against grids, converts formulations to elemental N-P-K,
// transactionally updates nutrient budgets and grid status, and emits activity/audit events.

import prisma from '@/lib/db/prisma';
import { FertilizerCalculationService } from '@/lib/domain/fertilizerCalculationService';
import { GridStatusService } from '@/lib/domain/gridStatusService';
import { AuditService } from './auditService';
import { ActivityService } from './activityService';

export interface RecordApplicationDto {
  organizationId: string;
  gridId: string;
  fertilizerId: string;
  quantity: number;
  unit?: string;
  applicationMethod?: 'SPRAY' | 'BROADCAST' | 'FERTIGATION' | 'SIDE_DRESS' | 'OTHER';
  notes?: string;
  appliedByUserId?: string;
  actorName?: string;
}

export class ApplicationService {
  static async recordApplication(dto: RecordApplicationDto) {
    const {
      organizationId,
      gridId,
      fertilizerId,
      quantity,
      unit = 'kg',
      applicationMethod = 'SPRAY',
      notes,
      appliedByUserId,
      actorName = 'Field Operator',
    } = dto;

    if (quantity <= 0) {
      throw new Error('Application quantity must be greater than zero.');
    }

    // 1. Fetch grid, field, and fertilizer
    const grid = await prisma.grid.findFirst({
      where: { id: gridId, organizationId },
      include: {
        field: { include: { farm: true } },
        nutrientBudget: true,
      },
    });

    if (!grid) throw new Error('Target grid not found.');

    const fertilizer = await prisma.fertilizer.findFirst({
      where: { id: fertilizerId },
    });

    if (!fertilizer) throw new Error('Specified fertilizer product not found.');

    // 2. Calculate pure elemental nutrient contribution
    const contribution = FertilizerCalculationService.calculateNutrientContribution(
      fertilizer,
      quantity,
      unit
    );

    // Normalize per-hectare contribution for the grid's budget
    const gridAreaHa = Math.max(0.001, grid.calculatedArea);
    const addedNPerHa = contribution.contributedN / gridAreaHa;
    const addedPPerHa = contribution.contributedP / gridAreaHa;
    const addedKPerHa = contribution.contributedK / gridAreaHa;

    // 3. Perform database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the application log
      const appRecord = await tx.fertilizerApplication.create({
        data: {
          organizationId,
          farmId: grid.field.farmId,
          fieldId: grid.fieldId,
          gridId: grid.id,
          fertilizerId: fertilizer.id,
          appliedByUserId,
          applicationMethod,
          quantity,
          unit,
          quantityKg: contribution.quantityKg,
          contributedN: contribution.contributedN,
          contributedP: contribution.contributedP,
          contributedK: contribution.contributedK,
          notes,
        },
      });

      // Update or create nutrient budget
      let budget = grid.nutrientBudget;
      if (!budget) {
        budget = await tx.gridNutrientBudget.create({
          data: {
            gridId: grid.id,
            recommendedN: 110.0,
            recommendedP: 45.0,
            recommendedK: 75.0,
            remainingN: 110.0,
            remainingP: 45.0,
            remainingK: 75.0,
          },
        });
      }

      const newConsumedN = Number((budget.consumedN + addedNPerHa).toFixed(2));
      const newConsumedP = Number((budget.consumedP + addedPPerHa).toFixed(2));
      const newConsumedK = Number((budget.consumedK + addedKPerHa).toFixed(2));

      const newRemainingN = Math.max(0, Number((budget.recommendedN - newConsumedN).toFixed(2)));
      const newRemainingP = Math.max(0, Number((budget.recommendedP - newConsumedP).toFixed(2)));
      const newRemainingK = Math.max(0, Number((budget.recommendedK - newConsumedK).toFixed(2)));

      const newExcessN = Math.max(0, Number((newConsumedN - budget.recommendedN).toFixed(2)));
      const newExcessP = Math.max(0, Number((newConsumedP - budget.recommendedP).toFixed(2)));
      const newExcessK = Math.max(0, Number((newConsumedK - budget.recommendedK).toFixed(2)));

      const updatedBudget = await tx.gridNutrientBudget.update({
        where: { id: budget.id },
        data: {
          consumedN: newConsumedN,
          consumedP: newConsumedP,
          consumedK: newConsumedK,
          remainingN: newRemainingN,
          remainingP: newRemainingP,
          remainingK: newRemainingK,
          excessN: newExcessN,
          excessP: newExcessP,
          excessK: newExcessK,
          lastCalculatedAt: new Date(),
        },
      });

      // Evaluate new grid status
      const statusEval = GridStatusService.evaluateGridStatus({
        isBlocked: grid.isBlocked,
        blockReason: grid.blockReason,
        recommendedN: updatedBudget.recommendedN,
        recommendedP: updatedBudget.recommendedP,
        recommendedK: updatedBudget.recommendedK,
        consumedN: updatedBudget.consumedN,
        consumedP: updatedBudget.consumedP,
        consumedK: updatedBudget.consumedK,
        excessN: updatedBudget.excessN,
        excessP: updatedBudget.excessP,
        excessK: updatedBudget.excessK,
      });

      await tx.grid.update({
        where: { id: grid.id },
        data: {
          status: statusEval.status,
        },
      });

      return { appRecord, updatedBudget, newStatus: statusEval.status };
    });

    // 4. Record audit and farm activity outside transaction
    await AuditService.log({
      organizationId,
      userId: appliedByUserId,
      action: 'FERTILIZER_APPLIED',
      entityType: 'GRID',
      entityId: grid.id,
      metadata: {
        gridCode: grid.gridCode,
        fertilizer: fertilizer.name,
        quantity,
        contributedPureNutrients: {
          N: contribution.contributedN,
          P: contribution.contributedP,
          K: contribution.contributedK,
        },
      },
    });

    await ActivityService.record({
      organizationId,
      farmId: grid.field.farmId,
      actorName,
      action: 'APPLICATION',
      entityType: 'GRID',
      entityName: grid.gridCode,
      description: `Applied ${quantity} ${unit} of ${fertilizer.name} on ${grid.gridCode} (${applicationMethod}). Delivered +${contribution.contributedN}kg N, +${contribution.contributedP}kg P, +${contribution.contributedK}kg K. Status: ${result.newStatus}.`,
    });

    return result;
  }
}
