// SOIL IQ - Deterministic Demo Seed & Atomic Reset Engine
import prisma from '@/lib/db/prisma';
import { FlowTotalizerService } from './flowTotalizerService';
import { JudgeSceneEngine } from './JudgeSceneEngine';

export class DemoResetService {
  /**
   * Reset demo data to canonical pristine starting state.
   */
  static async resetDemoState(): Promise<{ success: boolean; message: string }> {
    // 1. Reset in-memory states
    FlowTotalizerService.resetAll();
    JudgeSceneEngine.reset();

    // 2. Locate default demo organization
    const org = await prisma.organization.findFirst({
      where: { slug: 'green-valley' },
    });

    if (org) {
      // Clear demo operation sessions and telemetry created during presentations
      await prisma.operationEvent.deleteMany({
        where: { organizationId: org.id },
      });

      await prisma.applicationSession.deleteMany({
        where: { organizationId: org.id },
      });

      await prisma.telemetryEvent.deleteMany({
        where: { sprayer: { organizationId: org.id } },
      });

      // Clear alerts created during demo
      await prisma.alert.deleteMany({
        where: { organizationId: org.id },
      });

      // Reset sprayer to nominal starting state
      await prisma.sprayer.updateMany({
        where: { organizationId: org.id },
        data: {
          flowRateLpm: 12.4,
          speedKmh: 8.5,
          currentTankLevelL: 408.0,
          applicationRateLpha: 41.6,
          emergencyStopped: false,
          manualOverrideActive: false,
          telemetryStatus: 'ONLINE',
          status: 'ACTIVE',
        },
      });

      // Reset nutrient budgets for demo grids
      const grids = await prisma.grid.findMany({
        where: { organizationId: org.id },
        include: { nutrientBudget: true },
      });

      for (const g of grids) {
        if (g.nutrientBudget) {
          await prisma.gridNutrientBudget.update({
            where: { id: g.nutrientBudget.id },
            data: {
              consumedN: 0,
              consumedP: 0,
              consumedK: 0,
              remainingN: g.nutrientBudget.recommendedN,
              remainingP: g.nutrientBudget.recommendedP,
              remainingK: g.nutrientBudget.recommendedK,
            },
          });
        }
      }
    }

    return {
      success: true,
      message: 'Canonical demo farm (Green Valley Farm) reset to pristine state.',
    };
  }
}
