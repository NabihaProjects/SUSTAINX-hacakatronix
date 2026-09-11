// SOIL IQ - Sprayer Fleet & Telemetry Ingestion Service

import prisma from '@/lib/db/prisma';
import { ControlDecisionService, ControlDecisionOutput } from '@/lib/domain/controlDecisionService';
import { isPointInPolygon } from '@/lib/domain/units';
import { AuditService } from './auditService';

export interface IngestTelemetryDto {
  sprayerId: string;
  latitude: number;
  longitude: number;
  speedKmh: number;
  flowRateLpm: number;
  tankLevelLiters: number;
  applicationRateLpha: number;
  machineStatus?: string;
}

export class SprayerService {
  static async getSprayers(organizationId: string) {
    return prisma.sprayer.findMany({
      where: { organizationId },
      include: {
        controlDecisions: {
          take: 5,
          orderBy: { timestamp: 'desc' },
          include: { grid: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  static async ingestTelemetry(dto: IngestTelemetryDto) {
    const sprayer = await prisma.sprayer.findUnique({
      where: { id: dto.sprayerId },
      include: { organization: true },
    });

    if (!sprayer) throw new Error('Sprayer not found');

    // 1. Record raw telemetry event
    await prisma.telemetryEvent.create({
      data: {
        sprayerId: sprayer.id,
        latitude: dto.latitude,
        longitude: dto.longitude,
        speedKmh: dto.speedKmh,
        flowRateLpm: dto.flowRateLpm,
        tankLevelL: dto.tankLevelLiters,
        applicationRateLpha: dto.applicationRateLpha,
        machineStatus: dto.machineStatus || sprayer.status,
      },
    });

    // 2. Locate active grid: Find field and grid containing this coordinate
    const grids = await prisma.grid.findMany({
      where: { organizationId: sprayer.organizationId, isActive: true },
      include: {
        nutrientBudget: true,
        prescriptions: { where: { status: 'ACTIVE' }, take: 1 },
      },
    });

    let currentGrid = null;
    for (const g of grids) {
      try {
        const parsed = JSON.parse(g.geometryGeoJson);
        const coords = parsed.coordinates?.[0] || parsed.geometry?.coordinates?.[0];
        if (coords && isPointInPolygon([dto.longitude, dto.latitude], coords)) {
          currentGrid = g;
          break;
        }
      } catch {
        // Continue searching
      }
    }

    // Default fallback to first grid if simulated coordinate is outside
    if (!currentGrid && grids.length > 0) {
      currentGrid = grids[0];
    }

    // 3. Closed-Loop Comparison: Telemetry vs Grid Prescription & Budget
    let controlResult: ControlDecisionOutput = {
      decision: 'CONTINUE',
      reason: 'Sprayer operating normally within nominal boundaries.',
      targetRate: 42.0,
      actualRate: dto.applicationRateLpha,
      variancePct: 0,
      suggestedFlowRateAdjustmentPct: 0,
      isAutomatic: true,
      severity: 'NORMAL',
    };

    if (currentGrid) {
      const activeRx = currentGrid.prescriptions[0];
      const budget = currentGrid.nutrientBudget;

      const targetRate = activeRx?.targetRateKgHa || budget?.targetRecommendedRate || 42.0;
      const maxRate = activeRx?.maxRateKgHa || budget?.maxRecommendedRate || 50.0;
      const consumedPct = budget && budget.recommendedN > 0 ? (budget.consumedN / budget.recommendedN) * 100 : 25;
      const remainingN = budget?.remainingN ?? 50.0;

      controlResult = ControlDecisionService.evaluateTelemetry({
        sprayerId: sprayer.id,
        gridId: currentGrid.id,
        gridCode: currentGrid.gridCode,
        gridStatus: currentGrid.status as any,
        targetRateLpha: targetRate,
        maxRateLpha: maxRate,
        actualRateLpha: dto.applicationRateLpha,
        remainingNutrientKgHa: remainingN,
        consumedNutrientPct: consumedPct,
        speedKmh: dto.speedKmh,
      });

      // Save control decision to database
      await prisma.controlDecision.create({
        data: {
          sprayerId: sprayer.id,
          gridId: currentGrid.id,
          decision: controlResult.decision,
          reason: controlResult.reason,
          targetRate: controlResult.targetRate,
          actualRate: controlResult.actualRate,
          nutrientStateJson: JSON.stringify({
            consumedPct,
            remainingN,
            gridCode: currentGrid.gridCode,
          }),
          isAutomatic: true,
        },
      });

      if (controlResult.severity === 'CRITICAL') {
        await AuditService.log({
          organizationId: sprayer.organizationId,
          action: 'CONTROL_DECISION_STOP_TRIGGERED',
          entityType: 'SPRAYER',
          entityId: sprayer.id,
          metadata: {
            gridCode: currentGrid.gridCode,
            decision: controlResult.decision,
            reason: controlResult.reason,
          },
        });
      }
    }

    // 4. Update sprayer state
    const updatedSprayer = await prisma.sprayer.update({
      where: { id: sprayer.id },
      data: {
        latitude: dto.latitude,
        longitude: dto.longitude,
        speedKmh: dto.speedKmh,
        flowRateLpm: dto.flowRateLpm,
        currentTankLevelL: dto.tankLevelLiters,
        applicationRateLpha: dto.applicationRateLpha,
        currentGridCode: currentGrid?.gridCode || null,
        lastHeartbeat: new Date(),
      },
    });

    return {
      sprayer: updatedSprayer,
      currentGridCode: currentGrid?.gridCode,
      controlDecision: controlResult,
    };
  }
}
