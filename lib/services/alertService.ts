// SOIL IQ - Enterprise Alert Lifecycle & Deduplication Service
import prisma from '@/lib/db/prisma';

export interface CreateAlertInput {
  organizationId: string;
  farmId?: string;
  fieldId?: string;
  gridId?: string;
  sprayerId?: string;
  deviceId?: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  category: 'HARDWARE' | 'ENVIRONMENT' | 'PRESCRIPTION' | 'BUDGET' | 'SAFETY';
  title: string;
  message: string;
  dedupKey?: string;
}

export class AlertService {
  private static readonly DEDUP_COOLDOWN_MINUTES = 15;

  /**
   * Create an alert with deduplication and cooldown window.
   */
  static async triggerAlert(input: CreateAlertInput) {
    const dedupKey =
      input.dedupKey ||
      `${input.organizationId}_${input.category}_${input.deviceId || input.sprayerId || input.gridId || 'sys'}_${input.title}`;

    const cooldownThreshold = new Date(
      Date.now() - this.DEDUP_COOLDOWN_MINUTES * 60 * 1000
    );

    // Look for active existing alert with same key within cooldown
    const existing = await prisma.alert.findFirst({
      where: {
        organizationId: input.organizationId,
        dedupKey,
        status: { in: ['OPEN', 'ACKNOWLEDGED'] },
        lastTriggeredAt: { gte: cooldownThreshold },
      },
    });

    if (existing) {
      // Increment occurrence count rather than flooding notifications
      return prisma.alert.update({
        where: { id: existing.id },
        data: {
          occurrenceCount: { increment: 1 },
          lastTriggeredAt: new Date(),
          message: input.message, // update with latest details
        },
      });
    }

    // Create fresh alert
    const alert = await prisma.alert.create({
      data: {
        organizationId: input.organizationId,
        farmId: input.farmId,
        fieldId: input.fieldId,
        gridId: input.gridId,
        sprayerId: input.sprayerId,
        deviceId: input.deviceId,
        severity: input.severity,
        category: input.category,
        title: input.title,
        message: input.message,
        status: 'OPEN',
        dedupKey,
        occurrenceCount: 1,
      },
    });

    // Also dispatch in-app notification if CRITICAL or WARNING
    if (input.severity === 'CRITICAL' || input.severity === 'WARNING') {
      await prisma.notification.create({
        data: {
          organizationId: input.organizationId,
          title: input.title,
          message: input.message,
          type: 'ALERT',
          link: `/alerts`,
        },
      });
    }

    return alert;
  }

  static async acknowledgeAlert(alertId: string, userId?: string) {
    return prisma.alert.update({
      where: { id: alertId },
      data: {
        status: 'ACKNOWLEDGED',
        resolvedByUserId: userId,
      },
    });
  }

  static async resolveAlert(alertId: string, userId?: string, notes?: string) {
    return prisma.alert.update({
      where: { id: alertId },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        resolvedByUserId: userId,
        resolutionNotes: notes,
      },
    });
  }

  static async getActiveAlerts(organizationId: string) {
    return prisma.alert.findMany({
      where: {
        organizationId,
        status: { in: ['OPEN', 'ACKNOWLEDGED'] },
      },
      orderBy: [
        { severity: 'asc' }, // CRITICAL sorts top if mapped or order explicitly
        { lastTriggeredAt: 'desc' },
      ],
    });
  }
}
