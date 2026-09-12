// SOIL IQ - Customer Success & Operational Recommendation Service
// Generates data-backed suggestions to maximize pilot impact and operational trust
import prisma from '@/lib/db/prisma';

export interface OperationalRecommendation {
  id: string;
  category: 'SOIL_DATA' | 'SENSOR_COVERAGE' | 'MACHINE_CALIBRATION' | 'PRESCRIPTION_REVIEW';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  actionLabel: string;
  actionUrl: string;
}

export interface AccountHealthReport {
  organizationId: string;
  organizationName: string;
  healthScore: number; // 0 - 100
  pilotReadiness: string;
  activeDevicesCount: number;
  openAlertsCount: number;
  unreviewedPrescriptionsCount: number;
  recommendations: OperationalRecommendation[];
}

export class CustomerSuccessService {
  /**
   * Generate comprehensive account health audit and prioritized recommendations
   */
  static async evaluateAccount(organizationId: string): Promise<AccountHealthReport> {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        devices: true,
        alerts: { where: { status: 'OPEN' } },
        prescriptions: { where: { status: 'DRAFT' } },
        fields: { include: { grids: true } },
      },
    });

    if (!org) {
      throw new Error(`Organization ${organizationId} not found.`);
    }

    const recommendations: OperationalRecommendation[] = [];

    // 1. Check for stale or missing soil baselines
    const baselineCount = await prisma.fieldSoilBaseline.count({
      where: { organizationId, status: 'ACTIVE' },
    });

    if (baselineCount === 0) {
      recommendations.push({
        id: 'REC-SOIL-01',
        category: 'SOIL_DATA',
        priority: 'HIGH',
        title: 'Establish Validated Field Soil Baseline',
        description: 'No active laboratory soil baseline exists. Prescriptions currently rely on fallback regional assumptions.',
        actionLabel: 'Import Soil Test',
        actionUrl: '/soil-tests/import',
      });
    }

    // 2. Check sensor coverage
    const totalGrids = org.fields.reduce((acc, f) => acc + f.grids.length, 0);
    const activeSensors = org.devices.filter((d) => d.credentialStatus === 'ACTIVE').length;
    if (totalGrids > 0 && activeSensors < Math.ceil(totalGrids * 0.2)) {
      recommendations.push({
        id: 'REC-SENSOR-02',
        category: 'SENSOR_COVERAGE',
        priority: 'MEDIUM',
        title: 'Expand Continuous Sensor Coverage',
        description: `Current sensor density covers only ${activeSensors} sensor node(s) across ${totalGrids} spatial grid cells.`,
        actionLabel: 'Provision Sensors',
        actionUrl: '/settings/devices/provision',
      });
    }

    // 3. Check for unreviewed / draft prescriptions
    if (org.prescriptions.length > 0) {
      recommendations.push({
        id: 'REC-RX-03',
        category: 'PRESCRIPTION_REVIEW',
        priority: 'HIGH',
        title: 'Pending Prescription Approvals',
        description: `${org.prescriptions.length} variable-rate prescription(s) are awaiting agronomist review before machine execution.`,
        actionLabel: 'Review Prescriptions',
        actionUrl: '/review',
      });
    }

    // 4. Check for open alerts
    if (org.alerts.length > 0) {
      recommendations.push({
        id: 'REC-ALERT-04',
        category: 'MACHINE_CALIBRATION',
        priority: 'MEDIUM',
        title: 'Acknowledge Open Telemetry Alerts',
        description: `${org.alerts.length} unresolved alert(s) require operator inspection or acknowledgement.`,
        actionLabel: 'Inspect Alerts',
        actionUrl: '/workspace',
      });
    }

    // Composite health calculation
    const baseHealth = 95;
    const penalty = recommendations.length * 8 + org.alerts.length * 4;
    const healthScore = Math.max(45, Math.min(100, baseHealth - penalty));

    return {
      organizationId: org.id,
      organizationName: org.name,
      healthScore,
      pilotReadiness: healthScore >= 75 ? 'OPTIMAL' : 'ATTENTION REQUIRED',
      activeDevicesCount: activeSensors,
      openAlertsCount: org.alerts.length,
      unreviewedPrescriptionsCount: org.prescriptions.length,
      recommendations,
    };
  }
}
