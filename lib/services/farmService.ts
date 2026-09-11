// SOIL IQ - Farm Domain Service

import prisma from '@/lib/db/prisma';
import { AuditService } from './auditService';
import { ActivityService } from './activityService';

export interface CreateFarmDto {
  organizationId: string;
  name: string;
  description?: string;
  declaredArea: number;
  areaUnit: 'acre' | 'hectare';
  latitude: number;
  longitude: number;
  locationLabel?: string;
}

export class FarmService {
  static async getFarms(organizationId: string, search?: string) {
    const where: any = { organizationId };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { locationLabel: { contains: search } },
      ];
    }

    const farms = await prisma.farm.findMany({
      where,
      include: {
        fields: {
          include: {
            crop: true,
            grids: {
              select: { id: true, status: true, calculatedArea: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return farms.map((farm) => {
      let totalGrids = 0;
      let calculatedArea = 0;
      farm.fields.forEach((f) => {
        totalGrids += f.grids.length;
        calculatedArea += f.calculatedArea;
      });

      return {
        ...farm,
        fieldCount: farm.fields.length,
        gridCount: totalGrids,
        calculatedAreaDerived: Number(calculatedArea.toFixed(2)),
      };
    });
  }

  static async getFarmById(farmId: string, organizationId: string) {
    const farm = await prisma.farm.findFirst({
      where: { id: farmId, organizationId },
      include: {
        fields: {
          include: {
            crop: true,
            grids: {
              include: {
                nutrientBudget: true,
              },
            },
          },
        },
        applications: {
          take: 10,
          orderBy: { applicationDate: 'desc' },
          include: { fertilizer: true, grid: true },
        },
      },
    });

    if (!farm) return null;

    // Aggregate statistics
    let totalGrids = 0;
    let optimalCount = 0;
    let cautionCount = 0;
    let excessCount = 0;
    let blockedCount = 0;
    let totalCalculatedAreaHa = 0;
    const cropsMap = new Map<string, number>();

    farm.fields.forEach((f) => {
      totalCalculatedAreaHa += f.calculatedArea;
      if (f.crop) {
        cropsMap.set(f.crop.name, (cropsMap.get(f.crop.name) || 0) + 1);
      }
      f.grids.forEach((g) => {
        totalGrids++;
        if (g.status === 'OPTIMAL') optimalCount++;
        else if (g.status === 'CAUTION') cautionCount++;
        else if (g.status === 'EXCESS_RISK') excessCount++;
        else if (g.status === 'BLOCKED') blockedCount++;
      });
    });

    return {
      ...farm,
      calculatedArea: Number(totalCalculatedAreaHa.toFixed(2)),
      totalGrids,
      statusBreakdown: {
        optimal: optimalCount,
        caution: cautionCount,
        excessRisk: excessCount,
        blocked: blockedCount,
      },
      cropsDistribution: Array.from(cropsMap.entries()).map(([name, count]) => ({
        name,
        count,
      })),
    };
  }

  static async createFarm(dto: CreateFarmDto, actorName: string, userId?: string) {
    const farm = await prisma.farm.create({
      data: {
        organizationId: dto.organizationId,
        name: dto.name,
        description: dto.description,
        declaredArea: dto.declaredArea,
        areaUnit: dto.areaUnit,
        latitude: dto.latitude,
        longitude: dto.longitude,
        locationLabel: dto.locationLabel,
      },
    });

    await AuditService.log({
      organizationId: dto.organizationId,
      userId,
      action: 'FARM_CREATED',
      entityType: 'FARM',
      entityId: farm.id,
      metadata: { name: farm.name, area: farm.declaredArea, unit: farm.areaUnit },
    });

    await ActivityService.record({
      organizationId: dto.organizationId,
      farmId: farm.id,
      actorName,
      action: 'CREATED',
      entityType: 'FARM',
      entityName: farm.name,
      description: `New farm "${farm.name}" registered with declared area of ${farm.declaredArea} ${farm.areaUnit}.`,
    });

    return farm;
  }
}
