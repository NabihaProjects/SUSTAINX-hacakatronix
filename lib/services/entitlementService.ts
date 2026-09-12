// SOIL IQ - SaaS Subscription & Feature Entitlements Service
import prisma from '@/lib/db/prisma';

export type SubscriptionTier = 'FREE' | 'PILOT' | 'PRO' | 'ENTERPRISE';

export interface PlanLimits {
  name: SubscriptionTier;
  displayName: string;
  maxFarms: number;
  maxFields: number;
  maxGrids: number;
  maxDevices: number;
  maxSprayers: number;
  maxUsers: number;
  maxMonthlyTelemetry: number;
  features: {
    aiAssistant: boolean;
    whatIfSimulation: boolean;
    advancedAnalytics: boolean;
    pilotProjects: boolean;
    dataExports: boolean;
    apiAccess: boolean;
    hardwareIntegration: boolean;
  };
}

export const PLAN_CONFIGURATIONS: Record<SubscriptionTier, PlanLimits> = {
  FREE: {
    name: 'FREE',
    displayName: 'Community Sandbox',
    maxFarms: 1,
    maxFields: 2,
    maxGrids: 10,
    maxDevices: 1,
    maxSprayers: 0,
    maxUsers: 2,
    maxMonthlyTelemetry: 1000,
    features: {
      aiAssistant: false,
      whatIfSimulation: false,
      advancedAnalytics: false,
      pilotProjects: false,
      dataExports: false,
      apiAccess: false,
      hardwareIntegration: false,
    },
  },
  PILOT: {
    name: 'PILOT',
    displayName: 'Controlled Field Pilot',
    maxFarms: 1,
    maxFields: 5,
    maxGrids: 50,
    maxDevices: 10,
    maxSprayers: 2,
    maxUsers: 5,
    maxMonthlyTelemetry: 50000,
    features: {
      aiAssistant: true,
      whatIfSimulation: true,
      advancedAnalytics: true,
      pilotProjects: true,
      dataExports: true,
      apiAccess: false,
      hardwareIntegration: true,
    },
  },
  PRO: {
    name: 'PRO',
    displayName: 'Commercial Professional',
    maxFarms: 5,
    maxFields: 25,
    maxGrids: 250,
    maxDevices: 30,
    maxSprayers: 5,
    maxUsers: 15,
    maxMonthlyTelemetry: 250000,
    features: {
      aiAssistant: true,
      whatIfSimulation: true,
      advancedAnalytics: true,
      pilotProjects: true,
      dataExports: true,
      apiAccess: true,
      hardwareIntegration: true,
    },
  },
  ENTERPRISE: {
    name: 'ENTERPRISE',
    displayName: 'Agribusiness Enterprise',
    maxFarms: 999,
    maxFields: 9999,
    maxGrids: 99999,
    maxDevices: 999,
    maxSprayers: 99,
    maxUsers: 999,
    maxMonthlyTelemetry: 10000000,
    features: {
      aiAssistant: true,
      whatIfSimulation: true,
      advancedAnalytics: true,
      pilotProjects: true,
      dataExports: true,
      apiAccess: true,
      hardwareIntegration: true,
    },
  },
};

export interface PlanUsageSummary {
  plan: PlanLimits;
  currentCounts: {
    farms: number;
    fields: number;
    grids: number;
    devices: number;
    sprayers: number;
    users: number;
    activePilots: number;
  };
  utilizationPct: {
    farms: number;
    fields: number;
    grids: number;
    devices: number;
    sprayers: number;
  };
  allowedFeatures: PlanLimits['features'];
}

export class EntitlementService {
  /**
   * Get plan limits for a subscription tier
   */
  static getPlanLimits(tierString?: string): PlanLimits {
    const key = (tierString?.toUpperCase() || 'ENTERPRISE') as SubscriptionTier;
    return PLAN_CONFIGURATIONS[key] || PLAN_CONFIGURATIONS.ENTERPRISE;
  }

  /**
   * Check if organization is entitled to a specific feature flag
   */
  static async checkFeatureEntitlement(
    organizationId: string,
    featureKey: keyof PlanLimits['features']
  ): Promise<{ allowed: boolean; reason?: string; currentPlan: string }> {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { plan: true },
    });

    const tier = (org?.plan?.toUpperCase() || 'ENTERPRISE') as SubscriptionTier;
    const plan = PLAN_CONFIGURATIONS[tier] || PLAN_CONFIGURATIONS.ENTERPRISE;

    const allowed = plan.features[featureKey];
    return {
      allowed,
      currentPlan: plan.displayName,
      reason: allowed
        ? undefined
        : `Feature '${String(featureKey)}' requires an upgrade from ${plan.displayName}.`,
    };
  }

  /**
   * Compute live resource usage against tier quotas
   */
  static async getOrganizationUsage(organizationId: string): Promise<PlanUsageSummary> {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        plan: true,
        _count: {
          select: {
            farms: true,
            fields: true,
            devices: true,
            sprayers: true,
            members: true,
            pilotProjects: true,
          },
        },
      },
    });

    const gridCount = await prisma.grid.count({
      where: { field: { farm: { organizationId } } },
    });

    const tier = (org?.plan?.toUpperCase() || 'ENTERPRISE') as SubscriptionTier;
    const plan = PLAN_CONFIGURATIONS[tier] || PLAN_CONFIGURATIONS.ENTERPRISE;

    const currentCounts = {
      farms: org?._count.farms || 0,
      fields: org?._count.fields || 0,
      grids: gridCount,
      devices: org?._count.devices || 0,
      sprayers: org?._count.sprayers || 0,
      users: org?._count.members || 0,
      activePilots: org?._count.pilotProjects || 0,
    };

    const calcPct = (used: number, max: number) =>
      Math.min(100, Math.round((used / Math.max(1, max)) * 100));

    return {
      plan,
      currentCounts,
      utilizationPct: {
        farms: calcPct(currentCounts.farms, plan.maxFarms),
        fields: calcPct(currentCounts.fields, plan.maxFields),
        grids: calcPct(currentCounts.grids, plan.maxGrids),
        devices: calcPct(currentCounts.devices, plan.maxDevices),
        sprayers: calcPct(currentCounts.sprayers, plan.maxSprayers),
      },
      allowedFeatures: plan.features,
    };
  }
}
