// SOIL IQ - Unified Operation Event Service
import prisma from '@/lib/db/prisma';

export interface LogOperationEventInput {
  organizationId: string;
  sessionId?: string;
  farmId?: string;
  fieldId?: string;
  gridId?: string;
  sprayerId?: string;
  eventType:
    | 'SESSION_STARTED'
    | 'SESSION_PAUSED'
    | 'SESSION_RESUMED'
    | 'GRID_ENTERED'
    | 'GRID_EXITED'
    | 'PRESCRIPTION_LOADED'
    | 'APPLICATION_STARTED'
    | 'APPLICATION_RATE_CHANGED'
    | 'APPLICATION_STOPPED'
    | 'APPLICATION_DEFERRED'
    | 'ENVIRONMENT_CHANGED'
    | 'CONTROL_DECISION'
    | 'ALERT_CREATED'
    | 'ALERT_RESOLVED'
    | 'MANUAL_OVERRIDE'
    | 'EMERGENCY_STOP'
    | 'SESSION_COMPLETED';
  source?: string;
  severity?: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  metadata?: Record<string, unknown>;
}

export class OperationEventService {
  static async logEvent(input: LogOperationEventInput) {
    return prisma.operationEvent.create({
      data: {
        organizationId: input.organizationId,
        sessionId: input.sessionId,
        farmId: input.farmId,
        fieldId: input.fieldId,
        gridId: input.gridId,
        sprayerId: input.sprayerId,
        eventType: input.eventType,
        source: input.source || 'SIMULATION',
        severity: input.severity || 'INFO',
        message: input.message,
        metadataJson: input.metadata ? JSON.stringify(input.metadata) : null,
      },
    });
  }

  static async getEventsForSession(sessionId: string) {
    return prisma.operationEvent.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'desc' },
    });
  }

  static async getRecentEvents(organizationId: string, limit = 50) {
    return prisma.operationEvent.findMany({
      where: { organizationId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }
}
