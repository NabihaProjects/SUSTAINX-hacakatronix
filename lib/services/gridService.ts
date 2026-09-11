// SOIL IQ - Grid Domain Service

import prisma from '@/lib/db/prisma';
import { GridGenerationService, GridGenerationOptions } from '@/lib/domain/gridGenerationService';
import { AuditService } from './auditService';
import { ActivityService } from './activityService';

export class GridService {
  static async getGridById(gridId: string, organizationId: string) {
    const grid = await prisma.grid.findFirst({
      where: { id: gridId, organizationId },
      include: {
        field: {
          include: {
            farm: true,
            crop: {
              include: {
                growthStages: true,
              },
            },
          },
        },
        nutrientBudget: true,
        soilProfiles: {
          orderBy: { sampleDate: 'desc' },
          take: 5,
        },
        applications: {
          orderBy: { applicationDate: 'desc' },
          include: { fertilizer: true, appliedBy: true },
        },
        prescriptions: {
          orderBy: { createdAt: 'desc' },
          include: {
            items: { include: { fertilizer: true } },
            versions: { orderBy: { versionNumber: 'desc' } },
          },
        },
      },
    });

    return grid;
  }

  static async toggleGridBlock(
    gridId: string,
    organizationId: string,
    blockReason?: string,
    actorName: string = 'Operator',
    userId?: string
  ) {
    const grid = await prisma.grid.findFirst({
      where: { id: gridId, organizationId },
      include: { field: true },
    });

    if (!grid) throw new Error('Grid not found');

    const newBlocked = !grid.isBlocked;
    const newStatus = newBlocked ? 'BLOCKED' : 'OPTIMAL';

    const updated = await prisma.grid.update({
      where: { id: gridId },
      data: {
        isBlocked: newBlocked,
        blockReason: newBlocked ? blockReason || 'Manual lock applied by operator' : null,
        status: newStatus,
      },
    });

    await AuditService.log({
      organizationId,
      userId,
      action: newBlocked ? 'GRID_BLOCKED' : 'GRID_UNBLOCKED',
      entityType: 'GRID',
      entityId: gridId,
      metadata: { gridCode: grid.gridCode, reason: blockReason },
    });

    await ActivityService.record({
      organizationId,
      farmId: grid.field.farmId,
      actorName,
      action: newBlocked ? 'BLOCKED' : 'UNBLOCKED',
      entityType: 'GRID',
      entityName: grid.gridCode,
      description: newBlocked
        ? `Grid ${grid.gridCode} locked: ${blockReason || 'Manual operator lockout'}.`
        : `Grid ${grid.gridCode} restriction removed. Status reset to normal.`,
    });

    return updated;
  }

  static async regenerateFieldGrids(
    fieldId: string,
    organizationId: string,
    options: GridGenerationOptions,
    actorName: string = 'Farm Manager',
    userId?: string
  ) {
    const field = await prisma.field.findFirst({
      where: { id: fieldId, organizationId },
    });

    if (!field) throw new Error('Field not found');

    let polygonCoords: [number, number][] = [];
    try {
      const parsed = JSON.parse(field.boundaryGeoJson);
      if (parsed.type === 'Polygon') polygonCoords = parsed.coordinates[0];
      else if (parsed.geometry?.type === 'Polygon') polygonCoords = parsed.geometry.coordinates[0];
    } catch {
      throw new Error('Invalid field boundary polygon');
    }

    const generated = GridGenerationService.generateGridsForField(polygonCoords, {
      ...options,
      fieldCodePrefix: `F${field.id.slice(-2).toUpperCase()}`,
    });

    // Delete existing grids within this field and insert new ones transactionally
    await prisma.$transaction(async (tx) => {
      await tx.grid.deleteMany({
        where: { fieldId },
      });

      for (const cell of generated) {
        const grid = await tx.grid.create({
          data: {
            organizationId,
            fieldId,
            gridCode: cell.gridCode,
            rowIndex: cell.rowIndex,
            colIndex: cell.colIndex,
            geometryGeoJson: cell.geometryGeoJson,
            calculatedArea: cell.calculatedArea,
            status: 'OPTIMAL',
          },
        });

        await tx.gridNutrientBudget.create({
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
    });

    await AuditService.log({
      organizationId,
      userId,
      action: 'GRIDS_REGENERATED',
      entityType: 'FIELD',
      entityId: fieldId,
      metadata: { newGridCount: generated.length, options },
    });

    await ActivityService.record({
      organizationId,
      farmId: field.farmId,
      actorName,
      action: 'REGENERATED_GRIDS',
      entityType: 'FIELD',
      entityName: field.name,
      description: `Regenerated spatial grid for "${field.name}" with ${generated.length} discrete cells.`,
    });

    return generated;
  }
}
