// SOIL IQ - Field Domain Service

import prisma from '@/lib/db/prisma';
import { calculatePolygonAreaHectares } from '@/lib/domain/units';
import { GridGenerationService } from '@/lib/domain/gridGenerationService';
import { AuditService } from './auditService';
import { ActivityService } from './activityService';

export interface CreateFieldDto {
  organizationId: string;
  farmId: string;
  name: string;
  boundaryGeoJson: string; // GeoJSON string
  cropId?: string;
  cropVariety?: string;
  growthStage?: string;
  irrigationMethod?: string;
  soilType?: string;
  gridSizeMeters?: number;
  generateGridsNow?: boolean;
}

export class FieldService {
  static async getFieldsByFarm(farmId: string, organizationId: string) {
    return prisma.field.findMany({
      where: { farmId, organizationId },
      include: {
        crop: true,
        grids: {
          include: {
            nutrientBudget: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getFieldById(fieldId: string, organizationId: string) {
    const field = await prisma.field.findFirst({
      where: { id: fieldId, organizationId },
      include: {
        farm: true,
        crop: {
          include: {
            growthStages: true,
          },
        },
        grids: {
          include: {
            nutrientBudget: true,
            soilProfiles: {
              take: 1,
              orderBy: { sampleDate: 'desc' },
            },
            prescriptions: {
              where: { status: 'ACTIVE' },
              take: 1,
            },
            applications: {
              take: 5,
              orderBy: { applicationDate: 'desc' },
              include: { fertilizer: true },
            },
          },
        },
        applications: {
          take: 20,
          orderBy: { applicationDate: 'desc' },
          include: { fertilizer: true, grid: true },
        },
      },
    });

    if (!field) return null;

    // Calculate grid status distributions
    let optimal = 0;
    let caution = 0;
    let excess = 0;
    let blocked = 0;
    let totalNConsumed = 0;
    let totalNBudget = 0;

    field.grids.forEach((g) => {
      if (g.status === 'OPTIMAL') optimal++;
      else if (g.status === 'CAUTION') caution++;
      else if (g.status === 'EXCESS_RISK') excess++;
      else if (g.status === 'BLOCKED') blocked++;

      if (g.nutrientBudget) {
        totalNBudget += g.nutrientBudget.recommendedN;
        totalNConsumed += g.nutrientBudget.consumedN;
      }
    });

    const budgetUtilizationPct =
      totalNBudget > 0 ? Number(((totalNConsumed / totalNBudget) * 100).toFixed(1)) : 0;

    return {
      ...field,
      gridCount: field.grids.length,
      statusBreakdown: {
        optimal,
        caution,
        excessRisk: excess,
        blocked,
      },
      budgetUtilizationPct,
    };
  }

  static async createField(dto: CreateFieldDto, actorName: string, userId?: string) {
    // 1. Calculate canonical area in hectares from boundary
    let polygonCoords: [number, number][] = [];
    try {
      const parsed = JSON.parse(dto.boundaryGeoJson);
      if (parsed.type === 'Polygon' && parsed.coordinates?.[0]) {
        polygonCoords = parsed.coordinates[0];
      } else if (parsed.geometry?.type === 'Polygon' && parsed.geometry.coordinates?.[0]) {
        polygonCoords = parsed.geometry.coordinates[0];
      }
    } catch {
      throw new Error('Invalid GeoJSON boundary polygon provided.');
    }

    const calculatedAreaHa = calculatePolygonAreaHectares(polygonCoords);

    // 2. Create the field record
    const field = await prisma.field.create({
      data: {
        organizationId: dto.organizationId,
        farmId: dto.farmId,
        name: dto.name,
        boundaryGeoJson: dto.boundaryGeoJson,
        declaredArea: Number(calculatedAreaHa.toFixed(2)),
        calculatedArea: Number(calculatedAreaHa.toFixed(4)),
        cropId: dto.cropId,
        cropVariety: dto.cropVariety,
        growthStage: dto.growthStage || 'Vegetative',
        irrigationMethod: dto.irrigationMethod || 'DRIP',
        soilType: dto.soilType || 'LOAM',
      },
    });

    // 3. Generate grids automatically if requested
    if (dto.generateGridsNow !== false && polygonCoords.length >= 3) {
      const generatedGrids = GridGenerationService.generateGridsForField(polygonCoords, {
        fieldCodePrefix: `F${field.id.slice(-2).toUpperCase()}`,
        gridSizeMeters: dto.gridSizeMeters || 30,
      });

      // Insert generated grids and initialize default nutrient budgets
      for (const cell of generatedGrids) {
        const grid = await prisma.grid.create({
          data: {
            organizationId: dto.organizationId,
            fieldId: field.id,
            gridCode: cell.gridCode,
            rowIndex: cell.rowIndex,
            colIndex: cell.colIndex,
            geometryGeoJson: cell.geometryGeoJson,
            calculatedArea: cell.calculatedArea,
            status: 'OPTIMAL',
          },
        });

        // Initialize default baseline nutrient budget
        await prisma.gridNutrientBudget.create({
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
    }

    await AuditService.log({
      organizationId: dto.organizationId,
      userId,
      action: 'FIELD_CREATED',
      entityType: 'FIELD',
      entityId: field.id,
      metadata: { name: field.name, areaHa: calculatedAreaHa },
    });

    await ActivityService.record({
      organizationId: dto.organizationId,
      farmId: dto.farmId,
      actorName,
      action: 'CREATED',
      entityType: 'FIELD',
      entityName: field.name,
      description: `Field "${field.name}" mapped with calculated area of ${calculatedAreaHa} hectares.`,
    });

    return field;
  }
}
