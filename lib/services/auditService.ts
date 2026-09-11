// SOIL IQ - Centralized Audit Logging Service

import prisma from '@/lib/db/prisma';

export interface AuditLogEntry {
  organizationId: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

export class AuditService {
  static async log(entry: AuditLogEntry): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          organizationId: entry.organizationId,
          userId: entry.userId,
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId,
          metadataJson: entry.metadata ? JSON.stringify(entry.metadata) : null,
          ipAddress: entry.ipAddress || '127.0.0.1',
        },
      });
    } catch (err) {
      console.error('Failed to write audit log:', err);
    }
  }

  static async getLogs(organizationId: string, limit = 50) {
    return prisma.auditLog.findMany({
      where: { organizationId },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }
}
