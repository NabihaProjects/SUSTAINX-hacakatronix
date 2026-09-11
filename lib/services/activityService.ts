// SOIL IQ - Farm Activity Service

import prisma from '@/lib/db/prisma';

export interface ActivityEntry {
  organizationId: string;
  farmId?: string;
  actorName: string;
  action: string;
  entityType: string;
  entityName: string;
  description: string;
}

export class ActivityService {
  static async record(entry: ActivityEntry) {
    try {
      return await prisma.farmActivity.create({
        data: {
          organizationId: entry.organizationId,
          farmId: entry.farmId,
          actorName: entry.actorName,
          action: entry.action,
          entityType: entry.entityType,
          entityName: entry.entityName,
          description: entry.description,
        },
      });
    } catch (err) {
      console.error('Failed to record farm activity:', err);
    }
  }

  static async getActivities(organizationId: string, farmId?: string, limit = 50) {
    return prisma.farmActivity.findMany({
      where: {
        organizationId,
        ...(farmId ? { farmId } : {}),
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }
}
